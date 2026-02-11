// AI contextual analysis layer. Only low-confidence findings reach this stage.
// Regex-first keeps the fast baseline deterministic; AI is a cautious fallback.

function callModel(payload) {
  void payload;
  // Stubbed: No provider hardcoded. Return null to trigger safe fallback.
  return null;
}

function fallbackDecision(finding) {
  return {
    findingId: finding.findingId,
    verdict: "warn",
    confidence: 0.35,
    explanation: "AI unavailable; defaulting to warn for manual review.",
    suggestedFix: "Review the value and move secrets to environment variables."
  };
}

export function analyze(findings, projectContext) {
  const payload = {
    version: 1,
    projectContext,
    findings: findings.map((finding) => ({
      findingId: finding.findingId,
      ruleId: finding.ruleId,
      filePath: finding.filePath,
      fileType: finding.fileType,
      isTestLike: finding.isTestLike,
      snippet: finding.snippet
    }))
  };

  const response = callModel(payload);

  if (!response || !Array.isArray(response.decisions)) {
    return findings.map(fallbackDecision);
  }

  return response.decisions.map((decision) => ({
    findingId: decision.findingId,
    verdict: decision.verdict || "warn",
    confidence: typeof decision.confidence === "number" ? decision.confidence : 0.5,
    explanation: decision.explanation || "AI decision provided.",
    suggestedFix: decision.suggestedFix
  }));
}




