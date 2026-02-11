type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  tone?: "default" | "warning" | "danger";
};

const toneStyles = {
  default: "border-slate-200/70 bg-white",
  warning: "border-amber-200/80 bg-amber-50/40",
  danger: "border-rose-200/80 bg-rose-50/40",
} as const;

const indicatorStyles = {
  default: "bg-slate-200",
  warning: "bg-amber-400",
  danger: "bg-rose-500",
} as const;

export default function MetricCard({
  label,
  value,
  helper,
  tone = "default",
}: MetricCardProps) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-2xl border p-6 text-left shadow-sm ${
        toneStyles[tone]
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`h-2 w-2 rounded-full ${indicatorStyles[tone]}`}
          aria-hidden="true"
        />
        <div className="text-2xl font-semibold text-slate-900">{value}</div>
      </div>
      <div className="text-sm text-slate-600">{label}</div>
      {helper ? (
        <div className="text-xs text-slate-500">{helper}</div>
      ) : null}
    </div>
  );
}
