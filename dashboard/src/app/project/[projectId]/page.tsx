"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, ApiError } from "../../../lib/api";
import ProjectHeader from "../../../components/ProjectHeader";
import MetricsGrid from "../../../components/MetricsGrid";
import TrendChart from "../../../components/TrendChart";
import ReportsTable from "../../../components/ReportsTable";
import SectionCard from "../../../components/SectionCard";

type ProjectResponse = {
  success: boolean;
  project: {
    projectId: string;
    name: string;
    repoIdentifier: string;
    createdAt: string;
    lastReportAt: string;
  };
};

type ReportSummary = {
  reportId: string;
  projectId: string;
  timestamp: string;
  scanMode: string;
  summary: {
    filesScanned: number;
    findings: number;
    blocks: number;
    warnings: number;
    finalVerdict: string;
  };
  createdAt: string;
};

type ReportsResponse = {
  success: boolean;
  projectId: string;
  totalReports: number;
  reports: ReportSummary[];
};

const PAGE_LIMIT = 50;
const MAX_REPORTS = 200;

export default function ProjectMetricsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;

  const [project, setProject] = useState<ProjectResponse["project"] | null>(
    null,
  );
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [totalReports, setTotalReports] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    let isActive = true;

    const loadProject = async () => {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const projectResponse = await apiFetch<ProjectResponse>(
          `/api/projects/${projectId}`,
        );

        let offset = 0;
        let total = 0;
        const collected: ReportSummary[] = [];

        while (offset < MAX_REPORTS) {
          const reportsPage = await apiFetch<ReportsResponse>(
            `/api/projects/${projectId}/reports?limit=${PAGE_LIMIT}&offset=${offset}`,
          );

          total = reportsPage.totalReports;
          collected.push(...reportsPage.reports);
          offset += PAGE_LIMIT;

          if (offset >= total || reportsPage.reports.length === 0) {
            break;
          }
        }

        if (!isActive) {
          return;
        }

        setProject(projectResponse.project);
        setReports(collected);
        setTotalReports(total);
        setIsTruncated(total > collected.length);
      } catch (err) {
        if (!isActive) {
          return;
        }

        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load project metrics.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadProject();

    return () => {
      isActive = false;
    };
  }, [projectId]);

  const metrics = useMemo(() => {
    const totalFindings = reports.reduce(
      (sum, report) => sum + report.summary.findings,
      0,
    );
    const totalBlocked = reports.reduce(
      (sum, report) => sum + report.summary.blocks,
      0,
    );
    const totalWarnings = reports.reduce(
      (sum, report) => sum + report.summary.warnings,
      0,
    );
    const highRisk = totalBlocked;

    const helperSuffix = isTruncated
      ? `Based on last ${reports.length} reports`
      : undefined;

    return [
      {
        label: "Total Findings",
        value: totalFindings.toString(),
        helper: helperSuffix,
      },
      {
        label: "Total Blocked Commits",
        value: totalBlocked.toString(),
        helper: helperSuffix,
        tone: "danger" as const,
      },
      {
        label: "Total Warnings",
        value: totalWarnings.toString(),
        helper: helperSuffix,
        tone: "warning" as const,
      },
      {
        label: "High-Risk Findings",
        value: highRisk.toString(),
        helper: helperSuffix,
        tone: "danger" as const,
      },
      {
        label: "Secrets Detected",
        value: "0",
        helper: "Requires finding metadata",
      },
      {
        label: "Dangerous Functions Detected",
        value: "0",
        helper: "Requires finding metadata",
      },
    ];
  }, [reports, isTruncated]);

  const trendData = useMemo(() => {
    if (reports.length === 0) {
      return [];
    }

    const grouped = new Map<
      string,
      { reports: number; blocks: number }
    >();

    reports.forEach((report) => {
      const date = new Date(report.timestamp);
      if (Number.isNaN(date.getTime())) {
        return;
      }
      const label = date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      const existing = grouped.get(label) ?? { reports: 0, blocks: 0 };
      grouped.set(label, {
        reports: existing.reports + 1,
        blocks: existing.blocks + report.summary.blocks,
      });
    });

    return Array.from(grouped.entries()).map(([dateLabel, values]) => ({
      dateLabel,
      reports: values.reports,
      blocks: values.blocks,
    }));
  }, [reports]);

  if (notFound) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200/70 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Project not found
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            The requested project is unavailable or you do not have access.
          </p>
          <button
            type="button"
            className="mt-6 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            onClick={() => router.push("/dashboard")}
          >
            Return to dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {project ? (
          <ProjectHeader
            name={project.name}
            repoIdentifier={project.repoIdentifier}
            totalReports={totalReports}
            firstScan={reports[reports.length - 1]?.timestamp ?? project.createdAt}
            lastScan={project.lastReportAt}
          />
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-28 rounded-2xl border border-slate-200/70 bg-slate-100"
              />
            ))}
          </div>
        ) : (
          <MetricsGrid items={metrics} />
        )}

        <SectionCard
          title="Historical trends"
          description="Report volume and block frequency across the most recent scans."
        >
          {isLoading ? (
            <div className="h-40 rounded-2xl border border-slate-200/70 bg-slate-100" />
          ) : (
            <TrendChart data={trendData} />
          )}
        </SectionCard>

        <SectionCard
          title="Reports"
          description="All scans associated with this project."
          actions={
            isTruncated ? (
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Showing {reports.length} of {totalReports}
              </span>
            ) : null
          }
        >
          {isLoading ? (
            <div className="h-40 rounded-2xl border border-slate-200/70 bg-slate-100" />
          ) : (
            <ReportsTable reports={reports} />
          )}
        </SectionCard>
      </div>
    </main>
  );
}
