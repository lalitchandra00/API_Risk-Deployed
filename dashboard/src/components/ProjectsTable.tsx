import Link from "next/link";

type ProjectRow = {
  projectId: string;
  name: string;
  reportCount: number;
  lastReportAt?: string | Date | null;
};

type ProjectsTableProps = {
  projects: ProjectRow[];
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

export default function ProjectsTable({ projects }: ProjectsTableProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
        No projects yet. Run CodeProof on a repo to start tracking reports.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
      <div className="grid grid-cols-12 gap-4 border-b border-slate-100 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        <div className="col-span-6">Project Name</div>
        <div className="col-span-3">Reports</div>
        <div className="col-span-2">Last Scan</div>
        <div className="col-span-1 text-right">View</div>
      </div>
      {projects.map((project) => (
        <div
          key={project.projectId}
          className="grid grid-cols-12 items-center gap-4 border-b border-slate-100 px-6 py-4 text-sm text-slate-700 last:border-b-0"
        >
          <div className="col-span-6 font-semibold text-slate-900">
            {project.name}
          </div>
          <div className="col-span-3 text-slate-600">{project.reportCount}</div>
          <div className="col-span-2 text-slate-600">
            {formatDate(project.lastReportAt)}
          </div>
          <div className="col-span-1 text-right">
            <Link
              href={`/project/${project.projectId}`}
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
