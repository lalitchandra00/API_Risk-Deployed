export default function CliDocsSection() {
  return (
    <section id="cli-usage" className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex flex-col gap-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          CLI usage guide
        </p>
        <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Command reference for secure, repeatable scans
        </h2>
        <p className="text-sm text-slate-600 sm:text-base">
          Everything needed to install, initialize, run, and troubleshoot CodeProof
          from the command line.
        </p>
      </div>

      <div className="mt-10 grid gap-6">
        <div className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="lg:max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Initialization
              </p>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                Initialize CodeProof inside a Git repository
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Run this once per repository to register the project and install the
                pre-commit hook.
              </p>
              <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
                <code className="font-mono">npx codeproof init</code>
              </pre>
              <ul className="mt-4 grid gap-2 text-sm text-slate-600">
                <li>Must be run inside a Git repository.</li>
                <li>
                  Generates a <span className="font-semibold text-slate-800">projectId</span>
                  {" "}
                  stored in codeproof.config.json.
                </li>
                <li>
                  Generates a <span className="font-semibold text-slate-800">clientId</span>
                  {" "}
                  stored in ~/.codeproof/config.json.
                </li>
                <li>Installs the Git pre-commit hook.</li>
              </ul>
            </div>
            <div className="w-full max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Expected output
              </p>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
                <code className="font-mono">
                  {"\u2714 Git repository detected\n\u2714 CodeProof initialized\n\u2714 Pre-commit hook installed"}
                </code>
              </pre>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Running scans
            </p>
            <h3 className="text-lg font-semibold text-slate-900">
              Run scans manually or let the hook enforce them
            </h3>
            <p className="text-sm text-slate-600">
              CodeProof can be executed on demand, and it also runs automatically
              before every commit.
            </p>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-5">
              <h4 className="text-sm font-semibold text-slate-900">Manual</h4>
              <p className="mt-2 text-sm text-slate-600">
                Run a scan at any time from your repository root.
              </p>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
                <code className="font-mono">npx codeproof run</code>
              </pre>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-5">
              <h4 className="text-sm font-semibold text-slate-900">Automatic</h4>
              <p className="mt-2 text-sm text-slate-600">
                Runs before every commit to block risky changes early.
              </p>
              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Enabled by default after init
              </div>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Sample output
            </p>
            <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
              <code className="font-mono">
                {"Scanning staged files...\n2 high-confidence issues found\nCommit blocked by CodeProof"}
              </code>
            </pre>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Other commands
            </p>
            <h3 className="text-lg font-semibold text-slate-900">
              Reporting and remediation workflows
            </h3>
            <p className="text-sm text-slate-600">
              Use these commands to publish findings, move secrets, or retrieve your
              local identity.
            </p>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-5">
              <h4 className="text-sm font-semibold text-slate-900">
                report@dashboard
              </h4>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
                <code className="font-mono">npx codeproof report@dashboard</code>
              </pre>
              <p className="mt-3 text-sm text-slate-600">
                Sends the latest report to the backend and returns the dashboard
                link.
              </p>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
                <code className="font-mono">
                  {"Report uploaded successfully\nView dashboard:\nhttps://dashboard.codeproof.dev/project/abc123"}
                </code>
              </pre>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-5">
              <h4 className="text-sm font-semibold text-slate-900">move-secret</h4>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
                <code className="font-mono">npx codeproof move-secret</code>
              </pre>
              <p className="mt-3 text-sm text-slate-600">
                Moves high-confidence secrets to .env, rewrites source references,
                and creates a backup.
              </p>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
                <code className="font-mono">
                  {"2 secrets moved to .env\nBackup created in .codeproof-backup/"}
                </code>
              </pre>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-5">
              <h4 className="text-sm font-semibold text-slate-900">whoami</h4>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
                <code className="font-mono">npx codeproof whoami</code>
              </pre>
              <p className="mt-3 text-sm text-slate-600">
                Displays the local clientId used to log in to the dashboard.
              </p>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
                <code className="font-mono">
                  {"CodeProof Client ID:\n8c2a9d9e-xxxx-xxxx-xxxx-xxxxxxxx"}
                </code>
              </pre>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Help command
            </p>
            <h3 className="text-lg font-semibold text-slate-900">
              View all available commands and usage
            </h3>
            <p className="text-sm text-slate-600">
              Use the help flag any time you need the quick reference inline.
            </p>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
              <code className="font-mono">codeproof --help</code>
            </pre>
            <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
              <code className="font-mono">
                {"Usage: codeproof <command>\n\nCommands:\n  init               Initialize CodeProof in a Git repository\n  run                Run CodeProof checks\n  report@dashboard   Send latest report and show dashboard link\n  move-secret        Move high-confidence secrets to .env\n  whoami             Show the local CodeProof client ID"}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
