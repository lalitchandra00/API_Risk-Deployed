"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MetricCard from "../../components/MetricCard";
import ProjectsTable from "../../components/ProjectsTable";
import ReportsTable from "../../components/ReportsTable";
import { apiFetch } from "../../lib/api";
import { clearToken } from "../../lib/auth";

type ProjectSummary = {
  projectId: string;
  name: string;
  repoIdentifier: string;
  createdAt: string;
  lastReportAt: string;
};

type ProjectsResponse = {
  success: boolean;
  projects: ProjectSummary[];
};

type ReportSummary = {
  reportId: string;
  projectId: string;
  timestamp: string;
  scanMode: string;
  summary: {
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

type ProjectWithCounts = ProjectSummary & { reportCount: number };

const PROJECT_LIMIT = 6;
const REPORTS_PER_PROJECT = 10;
const RECENT_REPORTS_LIMIT = 6;

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithCounts[]>([]);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [totalReports, setTotalReports] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const projectsResponse = await apiFetch<ProjectsResponse>(
          "/api/projects",
        );
        const projectList = projectsResponse.projects ?? [];
        const limitedProjects = projectList.slice(0, PROJECT_LIMIT);

        const reportPages = await Promise.all(
          limitedProjects.map(async (project) => {
            try {
              return await apiFetch<ReportsResponse>(
                `/api/projects/${project.projectId}/reports?limit=${REPORTS_PER_PROJECT}&offset=0`,
              );
            } catch {
              return null;
            }
          }),
        );

        if (!isActive) {
          return;
        }

        const projectsWithCounts = limitedProjects.map((project, index) => ({
          ...project,
          reportCount: reportPages[index]?.totalReports ?? 0,
        }));

        const reportItems = reportPages.flatMap(
          (page) => page?.reports ?? [],
        );

        reportItems.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );

        const recentReports = reportItems.slice(0, RECENT_REPORTS_LIMIT);
        const totalReportsCount = reportPages.reduce(
          (sum, page) => sum + (page?.totalReports ?? 0),
          0,
        );

        setProjects(projectsWithCounts);
        setReports(recentReports);
        setTotalReports(totalReportsCount);
      } catch (err) {
        if (!isActive) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard data.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const blockedCommits = reports.filter((report) =>
      report.summary.finalVerdict.toLowerCase().includes("block"),
    ).length;

    const highRiskFindings = reports.reduce(
      (sum, report) => sum + report.summary.blocks,
      0,
    );

    return {
      totalProjects: projects.length,
      totalReports,
      blockedCommits,
      highRiskFindings,
    };
  }, [projects.length, reports, totalReports]);

  const handleLogout = () => {
    clearToken();
    router.replace("/");
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 lg:flex-row">
        <aside className="hidden w-full max-w-[220px] shrink-0 rounded-2xl border border-slate-200/70 bg-white p-6 text-sm text-slate-500 shadow-sm lg:block">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Navigation
          </div>
          <div className="mt-4 space-y-3 text-sm font-semibold text-slate-700">
            <div>Overview</div>
            <div className="text-slate-400">Projects</div>
            <div className="text-slate-400">Reports</div>
          </div>
        </aside>

        <section className="flex-1 space-y-10">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Dashboard
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">
                Overview
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                High-level security posture across your connected projects.
              </p>
            </div>
            <button
              type="button"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              onClick={handleLogout}
            >
              Log out
            </button>
          </header>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total Projects"
              value={metrics.totalProjects.toString()}
              helper="Active project scopes"
            />
            <MetricCard
              label="Total Reports"
              value={metrics.totalReports.toString()}
              helper="Reports visible to this account"
            />
            <MetricCard
              label="Blocked Commits"
              value={metrics.blockedCommits.toString()}
              helper={`Based on last ${reports.length} reports`}
              tone="danger"
            />
            <MetricCard
              label="High-Risk Findings"
              value={metrics.highRiskFindings.toString()}
              helper={`Based on last ${reports.length} reports`}
              tone="warning"
            />
          </section>

          <div className="border-t border-slate-200" />

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Projects
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Most active projects connected to your clientId.
              </p>
            </div>
            {isLoading ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
                Loading projects...
              </div>
            ) : (
              <ProjectsTable projects={projects} />
            )}
          </section>

          <div className="border-t border-slate-200" />

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Reports
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Latest security scans across your most active projects.
              </p>
            </div>
            {isLoading ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
                Loading reports...
              </div>
            ) : (
              <ReportsTable reports={reports} />
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
