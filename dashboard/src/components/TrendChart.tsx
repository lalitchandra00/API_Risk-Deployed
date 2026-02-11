type TrendPoint = {
  dateLabel: string;
  reports: number;
  blocks: number;
};

type TrendChartProps = {
  data: TrendPoint[];
};

function buildLine(points: number[], width: number, height: number): string {
  if (points.length === 0) {
    return "";
  }

  const max = Math.max(...points, 1);
  const stepX = width / Math.max(points.length - 1, 1);

  return points
    .map((value, index) => {
      const x = index * stepX;
      const y = height - (value / max) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

export default function TrendChart({ data }: TrendChartProps) {
  if (data.length < 2) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
        Not enough data to show trends yet.
      </div>
    );
  }

  const width = 420;
  const height = 120;
  const reportsLine = buildLine(
    data.map((point) => point.reports),
    width,
    height,
  );
  const blocksLine = buildLine(
    data.map((point) => point.blocks),
    width,
    height,
  );

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Activity trend
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Reports and blocks over time.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-slate-700" />
            Reports
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Blocks
          </span>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-5 h-32 w-full"
        role="img"
        aria-label="Reports and blocks trend"
      >
        <polyline
          points={reportsLine}
          fill="none"
          stroke="#334155"
          strokeWidth="2"
        />
        <polyline
          points={blocksLine}
          fill="none"
          stroke="#f43f5e"
          strokeWidth="2"
        />
      </svg>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
        {data.slice(-5).map((point) => (
          <div key={point.dateLabel} className="rounded-full bg-slate-100 px-3 py-1">
            {point.dateLabel}: {point.reports} reports
          </div>
        ))}
      </div>
    </div>
  );
}
