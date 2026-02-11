import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { upsertProject } from "./project.controller";
import { ReportModel } from "../models/report.model";
import { FindingModel } from "../models/finding.model";
import { getReportWithFindings, listProjectReports } from "../services/report.service";
import { logger } from "../utils/logger";

class PayloadError extends Error {
  status = 400;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid = (value: unknown): value is string =>
  typeof value === "string" && UUID_REGEX.test(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const parseDate = (value: unknown): Date | null => {
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return null;
};

const parsePagination = (value: unknown, fallback: number): number => {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new PayloadError("limit and offset must be non-negative integers");
  }

  return parsed;
};

type ReportPayload = {
  projectId: string;
  clientId: string;
  project: {
    name: string;
    repoIdentifier: string;
  };
  report: {
    timestamp: Date;
    scanMode: string;
    summary: {
      filesScanned: number;
      findings: number;
      blocks: number;
      warnings: number;
      finalVerdict: string;
    };
  };
  findings: Array<{
    ruleId: string;
    severity: string;
    confidence: string;
    filePath: string;
    lineNumber: number;
    codeSnippet: string;
    explanation: string;
  }>;
};

/**
 * Strictly validates and normalizes incoming report payload.
 */
const validatePayload = (body: unknown): ReportPayload => {
  if (!body || typeof body !== "object") {
    throw new PayloadError("Payload must be a JSON object");
  }

  const data = body as Record<string, unknown>;

  if (!isUuid(data.projectId)) {
    throw new PayloadError("projectId must be a valid UUID");
  }

  if (!isUuid(data.clientId)) {
    throw new PayloadError("clientId must be a valid UUID");
  }

  const project = data.project as Record<string, unknown> | undefined;
  if (!project || typeof project !== "object") {
    throw new PayloadError("project must be provided");
  }

  if (!isNonEmptyString(project.name)) {
    throw new PayloadError("project.name is required");
  }

  if (!isNonEmptyString(project.repoIdentifier)) {
    throw new PayloadError("project.repoIdentifier is required");
  }

  const report = data.report as Record<string, unknown> | undefined;
  if (!report || typeof report !== "object") {
    throw new PayloadError("report must be provided");
  }

  const timestamp = parseDate(report.timestamp);
  if (!timestamp) {
    throw new PayloadError("report.timestamp must be a valid date");
  }

  if (!isNonEmptyString(report.scanMode)) {
    throw new PayloadError("report.scanMode is required");
  }

  const summary = report.summary as Record<string, unknown> | undefined;
  if (!summary || typeof summary !== "object") {
    throw new PayloadError("report.summary must be provided");
  }

  if (!isNumber(summary.filesScanned)) {
    throw new PayloadError("summary.filesScanned must be a number");
  }

  if (!isNumber(summary.findings)) {
    throw new PayloadError("summary.findings must be a number");
  }

  if (!isNumber(summary.blocks)) {
    throw new PayloadError("summary.blocks must be a number");
  }

  if (!isNumber(summary.warnings)) {
    throw new PayloadError("summary.warnings must be a number");
  }

  if (!isNonEmptyString(summary.finalVerdict)) {
    throw new PayloadError("summary.finalVerdict is required");
  }

  const findings = data.findings as Array<Record<string, unknown>> | undefined;
  if (!Array.isArray(findings)) {
    throw new PayloadError("findings must be an array");
  }

  const normalizedFindings = findings.map((finding, index) => {
    if (!finding || typeof finding !== "object") {
      throw new PayloadError(`findings[${index}] must be an object`);
    }

    if (!isNonEmptyString(finding.ruleId)) {
      throw new PayloadError(`findings[${index}].ruleId is required`);
    }

    if (!isNonEmptyString(finding.severity)) {
      throw new PayloadError(`findings[${index}].severity is required`);
    }

    if (!isNonEmptyString(finding.confidence)) {
      throw new PayloadError(`findings[${index}].confidence is required`);
    }

    if (!isNonEmptyString(finding.filePath)) {
      throw new PayloadError(`findings[${index}].filePath is required`);
    }

    if (!isNumber(finding.lineNumber)) {
      throw new PayloadError(`findings[${index}].lineNumber must be a number`);
    }

    if (!isNonEmptyString(finding.codeSnippet)) {
      throw new PayloadError(`findings[${index}].codeSnippet is required`);
    }

    if (!isNonEmptyString(finding.explanation)) {
      throw new PayloadError(`findings[${index}].explanation is required`);
    }

    return {
      ruleId: finding.ruleId,
      severity: finding.severity,
      confidence: finding.confidence,
      filePath: finding.filePath,
      lineNumber: finding.lineNumber,
      codeSnippet: finding.codeSnippet,
      explanation: finding.explanation,
    };
  });

  return {
    projectId: data.projectId,
    clientId: data.clientId,
    project: {
      name: project.name,
      repoIdentifier: project.repoIdentifier,
    },
    report: {
      timestamp,
      scanMode: report.scanMode as string,
      summary: {
        filesScanned: summary.filesScanned as number,
        findings: summary.findings as number,
        blocks: summary.blocks as number,
        warnings: summary.warnings as number,
        finalVerdict: summary.finalVerdict as string,
      },
    },
    findings: normalizedFindings,
  };
};

/**
 * POST /api/reports
 *
 * Data flow:
 * 1) Validate payload
 * 2) Upsert Project
 * 3) Create Report
 * 4) Create Findings
 */
export const createReportHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = validatePayload(req.body);
    const reportId = uuidv4();

    await upsertProject({
      projectId: payload.projectId,
      clientId: payload.clientId,
      name: payload.project.name,
      repoIdentifier: payload.project.repoIdentifier,
      lastReportAt: payload.report.timestamp,
    });

    await ReportModel.create({
      reportId,
      projectId: payload.projectId,
      clientId: payload.clientId,
      timestamp: payload.report.timestamp,
      scanMode: payload.report.scanMode,
      summary: payload.report.summary,
    });

    if (payload.findings.length > 0) {
      const findingDocs = payload.findings.map((finding) => ({
        findingId: uuidv4(),
        reportId,
        ruleId: finding.ruleId,
        severity: finding.severity,
        confidence: finding.confidence,
        filePath: finding.filePath,
        lineNumber: finding.lineNumber,
        codeSnippet: finding.codeSnippet,
        explanation: finding.explanation,
      }));

      await FindingModel.insertMany(findingDocs);
    }

    logger.info("Report ingested", {
      reportId,
      projectId: payload.projectId,
      findings: payload.findings.length,
    });
    res.status(201).json({ success: true, reportId });
  } catch (err) {
    if (err instanceof PayloadError) {
      logger.warn("Report ingestion rejected", { message: err.message });
      res.status(err.status).json({ success: false, message: err.message });
      return;
    }

    logger.error("Report ingestion failed", { error: String(err) });
    next(err as Error);
  }
};

/**
 * GET /api/reports/:reportId
 * Returns a UI-friendly report with findings.
 */
export const getReportByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reportId = req.params.reportId;
    if (!isUuid(reportId)) {
      res.status(400).json({ success: false, message: "Invalid reportId" });
      return;
    }

    const result = await getReportWithFindings(reportId);
    if (!result) {
      res.status(404).json({ success: false, message: "Report not found" });
      return;
    }

    res.status(200).json({
      success: true,
      report: result.report,
      findings: result.findings,
    });
  } catch (err) {
    next(err as Error);
  }
};

/**
 * GET /api/projects/:projectId/reports
 * Returns paginated report summaries for a project.
 */
export const listProjectReportsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projectId = req.project?.projectId || req.params.projectId;
    if (!req.project && !isUuid(projectId)) {
      res.status(400).json({ success: false, message: "Invalid projectId" });
      return;
    }

    const limit = parsePagination(req.query.limit, 20);
    const offset = parsePagination(req.query.offset, 0);

    const page = await listProjectReports({ projectId, limit, offset });

    res.status(200).json({
      success: true,
      projectId: page.projectId,
      totalReports: page.totalReports,
      reports: page.reports,
    });
  } catch (err) {
    if (err instanceof PayloadError) {
      res.status(err.status).json({ success: false, message: err.message });
      return;
    }

    next(err as Error);
  }
};
