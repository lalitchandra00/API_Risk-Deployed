import fs from "fs";
import path from "path";
import { ensureGitRepo, getGitRoot, getStagedFiles } from "../utils/git.js";
import { logError, logInfo, logSuccess, logWarn } from "../utils/logger.js";
import { getDefaultExcludes, isBinaryFile, listFilesRecursive } from "../utils/files.js";
import { runRuleEngine } from "../engine/ruleEngine.js";
import { analyze } from "../engine/aiAnalyzer.js";
import { mergeDecisions } from "../engine/decisionMerger.js";
import { buildAiInputs, buildProjectContext } from "../engine/contextBuilder.js";
import { buildReport } from "../reporting/reportBuilder.js";
import { appendReport } from "../reporting/reportWriter.js";
import { sendReportToServer } from "../utils/apiClient.js";
import { resolveFeatureFlags, isVerbose } from "../core/featureFlags.js";
import {
    reportFeatureDisabled,
    warnExperimentalOnce,
    withFailOpenAiEscalation,
    withFailOpenIntegration,
    withFailOpenReporting
} from "../core/safetyGuards.js";

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

function normalizeScopeFiles(files, gitRoot) {
    return files
        .map((filePath) => (path.isAbsolute(filePath) ? filePath : path.join(gitRoot, filePath)))
        .filter((filePath) => {
            try {
                return fs.statSync(filePath).isFile();
            } catch {
                return false;
            }
        });
}

function filterBinaryFiles(files) {
    return files.filter((filePath) => !isBinaryFile(filePath));
}

export async function runCli({ cwd }) {
    // Boundary: CLI orchestration only. Avoid importing this module in lower layers.
    logInfo("CodeProof run started.");

    ensureGitRepo(cwd);
    const gitRoot = getGitRoot(cwd);
    const configPath = path.join(gitRoot, "codeproof.config.json");
    const config = readConfig(configPath);
    const features = resolveFeatureFlags(config);
    const verbose = isVerbose(config);

    if (!config.scanMode) {
        logError("Config missing scanMode. Expected 'staged' or 'full'.");
        process.exit(1);
    }

    const scanMode = String(config.scanMode).toLowerCase();
    let targets = [];

    if (scanMode === "staged") {
        logInfo("Scan mode: staged");
        const staged = getStagedFiles(gitRoot);
        targets = normalizeScopeFiles(staged, gitRoot);
    } else if (scanMode === "full") {
        logInfo("Scan mode: full");
        const excludes = getDefaultExcludes();
        const allFiles = listFilesRecursive(gitRoot, excludes);
        targets = normalizeScopeFiles(allFiles, gitRoot);
    } else {
        logError("Invalid scanMode. Expected 'staged' or 'full'.");
        process.exit(1);
    }

    const filtered = filterBinaryFiles(targets);

    if (filtered.length === 0) {
        logWarn("No relevant files found. Exiting.");
        // Exit code 0 allows the Git commit to continue.
        process.exit(0);
    }

    const { findings, escalations } = runRuleEngine({ files: filtered });
    const projectContext = buildProjectContext({ gitRoot, config });
    let aiInputs = [];
    if (features.aiEscalation) {
        warnExperimentalOnce("Experimental feature enabled: AI escalation.", logWarn);
        aiInputs = buildAiInputs(escalations, projectContext);
        if (aiInputs.length > 0) {
            // Regex-first keeps scans fast; only ambiguous findings go to AI.
            logWarn(`Escalating ${aiInputs.length} findings to AI for contextual analysis`);
        }
    } else {
        reportFeatureDisabled("AI escalation", verbose, logInfo);
    }

    const aiDecisions = aiInputs.length > 0
        ? withFailOpenAiEscalation(features.aiEscalation, () => analyze(aiInputs, projectContext))
        : [];
    const { blockFindings, warnFindings, aiReviewed, exitCode } = mergeDecisions({
        baselineFindings: [...findings, ...escalations],
        aiDecisions
    });

    if (features.reporting) {
        withFailOpenReporting(() => {
            const timestamp = new Date().toISOString();
            const runId = `${Date.now()}-${process.pid}`;
            const report = buildReport({
                projectRoot: gitRoot,
                scanMode,
                filesScannedCount: filtered.length,
                baselineFindings: [...findings, ...escalations],
                aiReviewed,
                runId,
                timestamp
            });
            // Reporting is fail-open: never block commits if logging fails.
            appendReport({ projectRoot: gitRoot, report });

            const integration = config?.integration || {};
            const integrationEnabled = features.integration && Boolean(integration.enabled);
            if (integrationEnabled) {
                withFailOpenIntegration(() => {
                    // Network calls are fail-open; never affect exit codes.
                    sendReportToServer(report, {
                        enabled: true,
                        endpointUrl: integration.endpointUrl
                    });
                });
            } else {
                reportFeatureDisabled("Integration", verbose, logInfo);
            }
        }, () => {
            logWarn("Failed to write CodeProof report. Continuing without blocking.");
        });
    } else {
        reportFeatureDisabled("Reporting", verbose, logInfo);
    }

    if (blockFindings.length > 0) {
        logError(`Baseline rule violations (${blockFindings.length}):`);
        for (const finding of blockFindings) {
            const relative = path.relative(gitRoot, finding.filePath) || finding.filePath;
            logError(
                `${finding.ruleId} [${finding.severity}/${finding.confidence}] ${relative}:${finding.line} ${finding.message}`
            );
            logError(`  ${finding.snippet}`);
        }
    }

    if (warnFindings.length > 0) {
        logWarn(`Baseline warnings (${warnFindings.length}):`);
        for (const finding of warnFindings) {
            const relative = path.relative(gitRoot, finding.filePath) || finding.filePath;
            logWarn(
                `${finding.ruleId} [${finding.severity}/${finding.confidence}] ${relative}:${finding.line} ${finding.message}`
            );
            logWarn(`  ${finding.snippet}`);
        }
    }

    if (aiReviewed.length > 0) {
        logWarn(`AI-reviewed findings (${aiReviewed.length}):`);
        for (const entry of aiReviewed) {
            const { finding, decision } = entry;
            const relative = path.relative(gitRoot, finding.filePath) || finding.filePath;
            logWarn(
                `${finding.ruleId} [${decision.verdict}/${decision.confidence.toFixed(2)}] ${relative}:${finding.line} ${decision.explanation}`
            );
            if (decision.suggestedFix) {
                logWarn(`  Suggested fix: ${decision.suggestedFix}`);
            }
        }
    }

    if (exitCode === 1) {
        // Exit code 1 blocks the Git commit via the pre-commit hook.
        process.exit(1);
    }

    logSuccess("CodeProof run complete.");
    // Exit code 0 allows the Git commit to continue.
    process.exit(0);
}
