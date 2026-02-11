import fs from "fs";
import path from "path";
import readline from "readline";
import { ensureGitRepo, getGitRoot } from "../utils/git.js";
import { getDefaultExcludes } from "../utils/files.js";
import { logInfo, logWarn } from "../utils/logger.js";
import { ensureEnvFile, readEnvKeys, appendEnvEntries } from "../utils/envManager.js";
import { backupFileOnce, extractSecretValueFromLine, replaceSecretInFile } from "../utils/fileRewriter.js";
import { resolveFeatureFlags, isVerbose } from "../core/featureFlags.js";
import { reportFeatureDisabled, warnExperimentalOnce } from "../core/safetyGuards.js";

const TEST_PATH_HINTS = [
  "test",
  "tests",
  "__tests__",
  "spec",
  "example",
  "examples",
  "sample",
  "samples",
  "mock",
  "mocks"
];

function isTestLike(filePath) {
  const normalized = filePath.toLowerCase();
  return TEST_PATH_HINTS.some((hint) => normalized.includes(path.sep + hint));
}

function isIgnoredPath(filePath, excludes) {
  const segments = filePath.split(path.sep).map((segment) => segment.toLowerCase());
  for (const segment of segments) {
    if (excludes.has(segment)) {
      return true;
    }
  }
  return false;
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

function confirmProceed(message) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(message, (answer) => {
      rl.close();
      resolve(String(answer).trim().toLowerCase() === "y");
    });
  });
}

export async function runMoveSecret({ cwd }) {
  // Boundary: remediation reads reports only and must not depend on analysis state.
  ensureGitRepo(cwd);
  const gitRoot = getGitRoot(cwd);
  const reportPath = path.join(gitRoot, "codeproof-report.log");
  const configPath = path.join(gitRoot, "codeproof.config.json");
  let config = {};
  try {
    const raw = fs.readFileSync(configPath, "utf8");
    config = JSON.parse(raw);
  } catch {
    config = {};
    logWarn("Unable to read codeproof.config.json. Using safe defaults.");
  }
  const features = resolveFeatureFlags(config);
  const verbose = isVerbose(config);

  if (!features.secretRemediation) {
    reportFeatureDisabled("Secret remediation", verbose, logInfo);
    process.exit(0);
  }

  warnExperimentalOnce("Experimental feature enabled: move-secret.", logWarn);
  const latestReport = readLatestReport(reportPath);

  if (!latestReport || !Array.isArray(latestReport.findings)) {
    logWarn("No reports found. Run 'codeproof run' first.");
    process.exit(0);
  }

  const excludes = getDefaultExcludes();

  const eligible = latestReport.findings.filter((finding) => {
    if (finding.ruleId?.startsWith("secret.") !== true) {
      return false;
    }
    if (finding.severity !== "block" || finding.confidence !== "high") {
      return false;
    }
    if (!finding.filePath || !finding.lineNumber) {
      return false;
    }

    if (!finding.codeSnippet) {
      return false;
    }

    const absolutePath = path.isAbsolute(finding.filePath)
      ? finding.filePath
      : path.join(gitRoot, finding.filePath);

    if (isTestLike(absolutePath)) {
      return false;
    }

    if (isIgnoredPath(absolutePath, excludes)) {
      return false;
    }

    return true;
  });

  if (eligible.length === 0) {
    logInfo("No eligible high-confidence secrets to move.");
    process.exit(0);
  }

  // Safety: secrets are never auto-fixed silently; users must confirm every change.
  logInfo("Eligible secrets preview:");
  for (const finding of eligible) {
    const relative = path.relative(gitRoot, finding.filePath) || finding.filePath;
    logInfo(`- ${relative}:${finding.lineNumber}`);
  }
  logInfo(`Secrets to move: ${eligible.length}`);

  const confirmed = await confirmProceed("Proceed with moving these secrets? (y/N): ");
  if (!confirmed) {
    logInfo("No changes made.");
    process.exit(0);
  }

  const envPath = ensureEnvFile(gitRoot);
  const existingKeys = readEnvKeys(envPath);
  const newEntries = [];
  const backedUp = new Set();
  let secretIndex = 1;
  let secretsMoved = 0;
  const modifiedFiles = new Set();

  for (const finding of eligible) {
    const absolutePath = path.isAbsolute(finding.filePath)
      ? finding.filePath
      : path.join(gitRoot, finding.filePath);

    let lineContent = "";
    try {
      const content = fs.readFileSync(absolutePath, "utf8");
      const lines = content.split(/\r?\n/);
      lineContent = lines[finding.lineNumber - 1] || "";
    } catch {
      logWarn(`Skipped ${finding.filePath}:${finding.lineNumber} (unable to read file).`);
      continue;
    }

    const expectedSecretValue = extractSecretValueFromLine(lineContent);
    if (!expectedSecretValue) {
      logWarn(`Skipped ${finding.filePath}:${finding.lineNumber} (unable to validate secret value).`);
      continue;
    }

    while (existingKeys.has(`CODEPROOF_SECRET_${secretIndex}`)) {
      secretIndex += 1;
    }

    const envKey = `CODEPROOF_SECRET_${secretIndex}`;

    // Safety: keep an original copy before any rewrite.
    backupFileOnce(gitRoot, absolutePath, backedUp);

    const result = replaceSecretInFile({
      filePath: absolutePath,
      lineNumber: finding.lineNumber,
      envKey,
      expectedSnippet: finding.codeSnippet,
      expectedSecretValue
    });

    if (!result.updated) {
      logWarn(`Skipped ${finding.filePath}:${finding.lineNumber} (${result.reason}).`);
      continue;
    }

    newEntries.push({ key: envKey, value: result.secretValue });
    existingKeys.add(envKey);
    secretsMoved += 1;
    secretIndex += 1;
    modifiedFiles.add(absolutePath);

    const relative = path.relative(gitRoot, absolutePath) || absolutePath;
    logInfo(`Updated ${relative}:${finding.lineNumber} → process.env.${envKey}`);
  }

  appendEnvEntries(envPath, newEntries);

  logInfo("Secret move summary:");
  logInfo(`Secrets moved: ${secretsMoved}`);
  logInfo(`Files modified: ${modifiedFiles.size}`);
  logInfo(`Backup location: ${path.join(gitRoot, ".codeproof-backup")}`);
}
