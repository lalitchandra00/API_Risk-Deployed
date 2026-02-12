import path from "path";

// Boundary: reporting only. Must not import rule logic or AI logic.
// Reports are built from provided inputs to keep dependencies one-directional.

function toRelativePath(projectRoot, filePath) {
  if (!filePath) {
    return "";
  }
  const relative = path.relative(projectRoot, filePath);
  return relative || filePath;
}

function trimSnippet(snippet, maxLength = 200) {
  if (!snippet) {
    return "";
  }
  const trimmed = String(snippet).trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return trimmed.slice(0, maxLength) + "...";
}

function redactSecretSnippet(ruleId, snippet) {
  if (!snippet) {
    return "";
  }
  if (String(ruleId || "").startsWith("secret.")) {
    return "***";
  }
  return snippet;
}

function mapDecisionConfidence(value) {
  if (typeof value !== "number") {
    return "low";
  }
  return value >= 0.75 ? "high" : "low";
}

function normalizeSeverity(value) {
  return value === "block" ? "block" : "warn";
}

export function buildReport({
  projectRoot,
  projectId,
  projectName,
  repoIdentifier,
  clientId,
  reportId,
  scanMode,
  filesScannedCount,
  baselineFindings,
  aiReviewed,
  timestamp
}) {
  const aiById = new Map(aiReviewed.map((entry) => [entry.finding.findingId, entry.decision]));

  const findings = baselineFindings.map((finding) => {
    const decision = aiById.get(finding.findingId);
    const severity = normalizeSeverity(decision ? decision.verdict : finding.severity);
    const confidence = decision
      ? mapDecisionConfidence(decision.confidence)
      : finding.confidence === "high"
        ? "high"
        : "low";

    return {
      ruleId: finding.ruleId,
      severity,
      confidence,
      filePath: toRelativePath(projectRoot, finding.filePath),
      lineNumber: finding.line || null,
      codeSnippet: trimSnippet(redactSecretSnippet(finding.ruleId, finding.snippet)),
      explanation: decision?.explanation || finding.message || ""
    };
  });

  const blocksCount = findings.filter((finding) => finding.severity === "block").length;
  const warningsCount = findings.filter((finding) => finding.severity === "warn").length;

  const finalVerdict = blocksCount > 0
    ? "blocked"
    : warningsCount > 0
      ? "allowed_with_warnings"
      : "allowed";

  // Server-compatible format
  return {
    projectId,
    clientId,
    project: {
      name: projectName || "Unknown Project",
      repoIdentifier: repoIdentifier || projectRoot
    },
    report: {
      timestamp,
      scanMode,
      summary: {
        filesScanned: filesScannedCount,
        findings: findings.length,
        blocks: blocksCount,
        warnings: warningsCount,
        finalVerdict
      }
    },
    findings,
    finalVerdict
  };
}
