#!/usr/bin/env node
import { runInit } from "../commands/init.js";
import { runCli } from "../commands/run.js";
import { runReportDashboard } from "../commands/reportDashboard.js";
import { runMoveSecret } from "../commands/moveSecret.js";
import { runWhoAmI } from "../commands/whoami.js";
import { runIgnore } from "../commands/ignore.js";
import { runApply } from "../commands/apply.js";
import { logError, logInfo } from "../utils/logger.js";

const [, , command, ...args] = process.argv;

async function main() {
  if (!command || command === "-h" || command === "--help") {
    logInfo("Usage: codeproof <command>\n\nCommands:\n  init               Initialize CodeProof in a Git repository\n  run                Run CodeProof checks (stub)\n  report@dashboard   Send latest report and show dashboard link\n  move-secret        Move high-confidence secrets to .env\n  ignore             Temporarily disable commit enforcement\n  apply              Re-enable commit enforcement\n  whoami             Show the local CodeProof client ID");
    process.exit(0);
  }

  if (command === "init") {
    await runInit({ args, cwd: process.cwd() });
    return;
  }

  if (command === "run") {
    await runCli({ args, cwd: process.cwd() });
    return;
  }

  if (command === "report@dashboard") {
    await runReportDashboard({ args, cwd: process.cwd() });
    return;
  }

  if (command === "move-secret") {
    await runMoveSecret({ args, cwd: process.cwd() });
    return;
  }

  if (command === "ignore") {
    await runIgnore({ args, cwd: process.cwd() });
    return;
  }

  if (command === "apply") {
    await runApply({ args, cwd: process.cwd() });
    return;
  }

  if (command === "whoami") {
    await runWhoAmI();
    return;
  }

  logError(`Unknown command: ${command}`);
  process.exit(1);
}

main().catch((error) => {
  logError(error?.message || String(error));
  process.exit(1);
});
