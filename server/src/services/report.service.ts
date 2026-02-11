import { ReportModel } from "../models/report.model";
import { FindingModel } from "../models/finding.model";

export type ReportWithFindings = {
  report: {
    reportId: string;
    projectId: string;
    timestamp: Date;
    scanMode: string;
    summary: {
      filesScanned: number;
      findings: number;
      blocks: number;
      warnings: number;
      finalVerdict: string;
    };
    createdAt: Date;
  };
  findings: Array<{
    findingId: string;
    ruleId: string;
    severity: string;
    confidence: string;
    filePath: string;
    lineNumber: number;
    codeSnippet: string;
    explanation: string;
    createdAt: Date;
  }>;
};

/**
 * Fetch a report and its findings without exposing internal IDs or clientId.
 */
export const getReportWithFindings = async (
  reportId: string
): Promise<ReportWithFindings | null> => {
  const report = await ReportModel.findOne({ reportId })
    .select("reportId projectId timestamp scanMode summary createdAt -_id")
    .lean();

  if (!report) {
    return null;
  }

  const findings = await FindingModel.find({ reportId })
    .select(
      "findingId ruleId severity confidence filePath lineNumber codeSnippet explanation createdAt -_id"
    )
    .lean();

  return {
    report: report as ReportWithFindings["report"],
    findings: findings as ReportWithFindings["findings"],
  };
};

export type ProjectReportsPage = {
  projectId: string;
  totalReports: number;
  reports: Array<{
    reportId: string;
    projectId: string;
    timestamp: Date;
    scanMode: string;
    summary: {
      filesScanned: number;
      findings: number;
      blocks: number;
      warnings: number;
      finalVerdict: string;
    };
    createdAt: Date;
  }>;
};

/**
 * Fetch paginated reports for a project, newest first.
 */
export const listProjectReports = async (params: {
  projectId: string;
  limit: number;
  offset: number;
}): Promise<ProjectReportsPage> => {
  const { projectId, limit, offset } = params;

  const [totalReports, reports] = await Promise.all([
    ReportModel.countDocuments({ projectId }),
    ReportModel.find({ projectId })
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .select("reportId projectId timestamp scanMode summary createdAt -_id")
      .lean(),
  ]);

  return {
    projectId,
    totalReports,
    reports: reports as ProjectReportsPage["reports"],
  };
};
