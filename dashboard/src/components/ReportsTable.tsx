import Link from "next/link";
import Badge from "./Badge";

type ReportSummary = {
  reportId: string;
  projectId: string;
  timestamp: string | Date;
  summary: {
    findings: number;
    blocks: number;
    warnings: number;
    finalVerdict: string;
  };
};

type ReportsTableProps = {
  reports: ReportSummary[];
};

function formatDate(value: string | Date) {
  const parsed = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function verdictVariant(verdict: string): "allow" | "warn" | "block" | "neutral" {
  const normalized = verdict.toLowerCase();
  if (normalized.includes("block")) {
    return "block";
  }
  if (normalized.includes("warn")) {
    return "warn";
  }
  if (normalized.includes("allow") || normalized.includes("pass")) {
    return "allow";
  }
  return "neutral";
}

export default function ReportsTable({ reports }: ReportsTableProps) {
  if (reports.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
        No reports yet. Reports will appear after the next scan.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
      <div className="grid grid-cols-12 gap-4 border-b border-slate-100 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        <div className="col-span-4">Report ID</div>
        <div className="col-span-4">Date</div>
        <div className="col-span-2">Findings</div>
        <div className="col-span-1">Verdict</div>
        <div className="col-span-1 text-right">View</div>
      </div>
      {reports.map((report) => (
        <div
          key={report.reportId}
          className="grid grid-cols-12 items-center gap-4 border-b border-slate-100 px-6 py-4 text-sm text-slate-700 last:border-b-0"
        >
          <div className="col-span-4 font-mono text-xs text-slate-700">
            {report.reportId}
          </div>
          <div className="col-span-4 text-slate-600">
            {formatDate(report.timestamp)}
          </div>
          <div className="col-span-2 text-slate-600">
            {report.summary.findings}
          </div>
          <div className="col-span-1">
            <Badge
              label={report.summary.finalVerdict}
              variant={verdictVariant(report.summary.finalVerdict)}
            />
          </div>
          <div className="col-span-1 text-right">
            <Link
              href={`/report/${report.reportId}`}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
            >
              View
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
