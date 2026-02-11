import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-900/60 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-slate-200">
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-200"
        >
          CodeProof
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          <Link
            href="/#hero"
            className="text-slate-300 transition hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/#how-it-works"
            className="text-slate-300 transition hover:text-white"
          >
            How It Works
          </Link>
          <Link
            href="/#features"
            className="text-slate-300 transition hover:text-white"
          >
            Features
          </Link>
          <Link
            href="https://github.com/Nithin0620/code_proof"
            className="text-slate-300 transition hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </Link>
          <Link
            href="https://www.npmjs.com/package/codeproof"
            className="text-slate-300 transition hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            npm
          </Link>
        </nav>
      </div>
    </header>
  );
}
