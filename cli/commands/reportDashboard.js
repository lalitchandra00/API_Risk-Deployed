import fs from "fs";
import path from "path";
import { ensureGitRepo, getGitRoot } from "../utils/git.js";
import { logError, logInfo, logWarn } from "../utils/logger.js";
import { sendReportToServer } from "../utils/apiClient.js";
import { resolveFeatureFlags, isVerbose } from "../core/featureFlags.js";
import { reportFeatureDisabled, withFailOpenIntegration } from "../core/safetyGuards.js";
import { readLatestReport } from "../reporting/reportReader.js";

function readConfig(configPath) {
  if (!fs.existsSync(configPath)) {
    logError("Missing codeproof.config.json. Run codeproof init first.");
    process.exit(1);
  }

  try {
    const raw = fs.readFileSync(configPath, "utf8");
    return JSON.parse(raw);
  } catch {
    logError("Invalid codeproof.config.json. Please fix the file.");
    process.exit(1);
  }
}

export async function runReportDashboard({ cwd }) {
  // Boundary: CLI orchestration only. Avoid importing this module in lower layers.
  ensureGitRepo(cwd);
  const gitRoot = getGitRoot(cwd);
  const configPath = path.join(gitRoot, "codeproof.config.json");
  const config = readConfig(configPath);
  const features = resolveFeatureFlags(config);
  const verbose = isVerbose(config);

  if (features.reporting) {
    const latestEntry = readLatestReport(gitRoot);
    const latestReport = latestEntry?.report || null;

    if (!latestReport) {
      logWarn("No reports found. Run `codeproof run` first.");
    } else {
      const integration = config?.integration || {};
      // Integrations are fail-open: never throw on network errors.
      withFailOpenIntegration(() => {
        sendReportToServer(latestReport, {
          enabled: true,
          endpointUrl: integration.endpointUrl
        });
      });

      if (latestReport?.projectId) {
        logInfo(`View dashboard: https://dashboard.codeproof.dev/project/${latestReport.projectId}`);
      }
    }
  } else {
    reportFeatureDisabled("Reporting", verbose, logInfo);
  }
}
