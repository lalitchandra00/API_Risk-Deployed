type BadgeProps = {
  label: string;
  variant?: "allow" | "warn" | "block" | "neutral";
};

const variantStyles = {
  allow: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warn: "border-amber-200 bg-amber-50 text-amber-700",
  block: "border-rose-200 bg-rose-50 text-rose-700",
  neutral: "border-slate-200 bg-slate-100 text-slate-700",
} as const;

export default function Badge({ label, variant = "neutral" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
        variantStyles[variant]
      }`}
    >
      {label}
    </span>
  );
}
