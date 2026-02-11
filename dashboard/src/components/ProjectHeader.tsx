import Link from "next/link";

type ProjectHeaderProps = {
  name: string;
  repoIdentifier?: string | null;
  totalReports: number;
  firstScan?: string | Date | null;
  lastScan?: string | Date | null;
};

function formatDate(value?: string | Date | null) {
  if (!value) {
    return "-";
  }

  const parsed = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ProjectHeader({
  name,
  repoIdentifier,
  totalReports,
  firstScan,
  lastScan,
}: ProjectHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-6">
      <div>
        <Link
          href="/dashboard"
          className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
        >
          Back to dashboard
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">
          {name}
        </h1>
        {repoIdentifier ? (
          <p className="mt-2 text-sm text-slate-600">{repoIdentifier}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-sm text-slate-600">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Total reports
          </div>
          <div className="mt-1 text-lg font-semibold text-slate-900">
            {totalReports}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-sm text-slate-600">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            First scan
          </div>
          <div className="mt-1 text-lg font-semibold text-slate-900">
            {formatDate(firstScan)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-sm text-slate-600">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Last scan
          </div>
          <div className="mt-1 text-lg font-semibold text-slate-900">
            {formatDate(lastScan)}
          </div>
        </div>
      </div>
    </div>
  );
}
