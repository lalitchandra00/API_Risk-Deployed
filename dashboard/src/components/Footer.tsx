import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-16 text-center">
        <h2 className="text-2xl font-semibold">Ship secure commits today</h2>
        <p className="text-sm text-slate-400">
          Install CodeProof and keep sensitive data out of your repositories.
        </p>
        <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-left">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Install
          </div>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-100">
            <code className="font-mono">npm codeproof init</code>
          </pre>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="https://github.com/Nithin0620/code_proof"
            className="rounded-full border border-slate-700 px-6 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </Link>
          <Link
            href="https://www.npmjs.com/package/codeproof"
            className="rounded-full border border-slate-700 px-6 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
            target="_blank"
            rel="noreferrer"
          >
            npm
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-cyan-500 px-6 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
          >
            Login to Dashboard
          </Link>
        </div>
        <p className="text-xs text-slate-500">
          CodeProof keeps enforcement local and reporting controlled.
        </p>
      </div>
    </footer>
  );
}
