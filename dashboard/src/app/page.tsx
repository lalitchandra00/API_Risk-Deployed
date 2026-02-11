import type { Metadata } from "next";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import CliDocsSection from "../components/CliDocsSection";
import FeatureCard from "../components/FeatureCard";
import MetricCard from "../components/MetricCard";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "CodeProof | Pre-commit Security Enforcement",
  description:
    "CodeProof is an AI-powered pre-commit security enforcement tool that blocks secrets, generates reports, and surfaces audit-ready insights.",
  openGraph: {
    title: "CodeProof | Pre-commit Security Enforcement",
    description:
      "Prevent secrets and risky patterns before they reach your repository with enforced hooks and audit-ready reporting.",
    type: "website",
    url: "https://codeproof.dev",
  },
};

const features = [
  {
    title: "Git Pre-commit Enforcement",
    description:
      "Hard-stop risky changes before they ever reach a remote repository.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M5 12h14M12 5l7 7-7 7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Regex Baseline + AI Escalation",
    description:
      "Layer deterministic patterns with contextual analysis for higher confidence.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M4 7h16M8 12h12M10 17h10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Persistent Audit Logs",
    description:
      "Every report is preserved for compliance and forensic review.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M7 4h8l4 4v12H7z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Safe Secret Remediation",
    description:
      "Guided actions to rotate, revoke, and verify fixes quickly.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M12 3l7 4v5c0 4.4-3.1 7.9-7 9-3.9-1.1-7-4.6-7-9V7z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Dashboard Analytics",
    description:
      "Understand risk trends, offenders, and remediation velocity.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M5 19V9m7 10V5m7 14v-6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Fail-Open Architecture",
    description:
      "Developer workflows stay online even during degraded AI service states.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M7 12h10M12 7v10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const metrics = [
  { label: "Reports Analyzed", value: "124" },
  { label: "Blocked Commits", value: "18" },
  { label: "Secrets Detected", value: "42" },
  { label: "High-Risk Findings", value: "8" },
];

export default function Home() {
  return (
    <main className="bg-slate-50 text-slate-900">
      <Hero />
      <HowItWorks />
      <CliDocsSection />
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-col gap-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Core features
          </p>
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            Enforcement with context, designed for security teams
          </h2>
          <p className="text-sm text-slate-600 sm:text-base">
            A balance of automation and clarity so developers can fix issues fast.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-sm sm:p-10">
          <div className="flex flex-col gap-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Security philosophy
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              Built to earn trust, not just detect problems
            </h2>
            <p className="text-sm text-slate-600 sm:text-base">
              CodeProof is designed around clear boundaries and minimal exposure.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "clientId is identity, not security",
                description:
                  "Identifiers help routing and reporting, but never replace authentication.",
              },
              {
                title: "Fail-open design",
                description:
                  "Developers keep shipping while the system records degraded states.",
              },
              {
                title: "No secrets stored in frontend",
                description:
                  "Sensitive content never lives inside the dashboard UI layer.",
              },
              {
                title: "Authentication separate from ingestion",
                description:
                  "Event intake and user identity run on isolated control paths.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200/70 bg-slate-50 p-5"
              >
                <h3 className="text-sm font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="flex flex-col gap-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Example metrics
          </p>
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            Visibility that scales across teams
          </h2>
          <p className="text-sm text-slate-600 sm:text-base">
            A snapshot of what CodeProof reports look like in practice.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
