import type { ReactNode } from "react";

const steps: { title: string; description: string; icon: ReactNode }[] = [
  {
    title: "codeproof init",
    description: "Add CodeProof to your repo and wire the hook.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M4 6h16M4 12h10M4 18h7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Pre-commit hook runs",
    description: "Every commit is scanned automatically.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M7 6l5 5-5 5M13 6h4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Regex + AI analysis",
    description: "Baseline detection with optional escalation.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M5 5h6v6H5zM13 13h6v6h-6z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
  {
    title: "Report generated",
    description: "Findings are logged with clear remediation steps.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M6 4h9l3 3v13H6z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Dashboard visualization",
    description: "Track trends, risks, and team compliance.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M5 19V9m7 10V5m7 14v-7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex flex-col gap-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          How it works
        </p>
        <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Security checks built into every commit
        </h2>
        <p className="text-sm text-slate-600 sm:text-base">
          CodeProof runs before code leaves your machine, producing high-signal
          reports for every team.
        </p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step) => (
          <div
            key={step.title}
            className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 text-left shadow-sm"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              {step.icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
