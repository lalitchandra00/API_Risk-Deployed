import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-slate-950 text-slate-100"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_60%)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center sm:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
          Security enforcement for git
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
          CodeProof
        </h1>
        <p className="mt-4 text-lg text-slate-300 sm:text-xl">
          AI-powered pre-commit security enforcement.
        </p>
        <p className="mt-3 max-w-2xl text-base text-slate-400 sm:text-lg">
          Prevent secrets and risky patterns from ever reaching your repository with
          enforced hooks, precise detection, and audit-ready reporting.
        </p>
        <div className="mt-8 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-left shadow-lg shadow-slate-950/40">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Install
          </div>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-100">
            <code className="font-mono">npm codeproof init</code>
          </pre>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="https://github.com/Nithin0620/code_proof"
            className="rounded-full border border-slate-700 px-6 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            View on GitHub
          </Link>
          <Link
            href="https://www.npmjs.com/package/codeproof"
            className="rounded-full border border-slate-700 px-6 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            View on npm
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-cyan-500 px-6 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
          >
            Open Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
