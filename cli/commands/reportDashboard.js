import fs from "fs";
import path from "path";
import { ensureGitRepo, getGitRoot } from "../utils/git.js";
import { logError, logInfo, logWarn } from "../utils/logger.js";
import { sendReportToServer } from "../utils/apiClient.js";
import { resolveFeatureFlags, isVerbose } from "../core/featureFlags.js";
import { reportFeatureDisabled, withFailOpenIntegration } from "../core/safetyGuards.js";

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

function readLatestReport(reportPath) {
  if (!fs.existsSync(reportPath)) {
    return null;
  }

  const content = fs.readFileSync(reportPath, "utf8");
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) {
    return null;
  }

  try {
    return JSON.parse(lines[lines.length - 1]);
  } catch {
    return null;
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
    const reportPath = path.join(gitRoot, "codeproof-report.log");
    const latestReport = readLatestReport(reportPath);

    if (!latestReport) {
      logWarn("No reports found. Run 'codeproof run' first.");
    } else {
      const integration = config?.integration || {};
      const integrationEnabled = features.integration && Boolean(integration.enabled);
      if (integrationEnabled) {
        // Integrations are fail-open: skip silently when disabled, never throw on network errors.
        withFailOpenIntegration(() => {
          sendReportToServer(latestReport, {
            enabled: true,
            endpointUrl: integration.endpointUrl
          });
        });
      } else {
        reportFeatureDisabled("Integration", verbose, logInfo);
      }
    }
  } else {
    reportFeatureDisabled("Reporting", verbose, logInfo);
  }

  const projectId = encodeURIComponent(path.basename(gitRoot) || "project");
  logInfo(`Dashboard: https://dashboard.codeproof.dev/project/${projectId}`);
}
