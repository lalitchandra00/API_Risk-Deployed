// Combine baseline results with AI decisions without overriding blocks.

export function mergeDecisions({ baselineFindings, aiDecisions }) {
  const blockFindings = baselineFindings.filter(
    (finding) => finding.severity === "block" && finding.confidence === "high"
  );
  const warnFindings = baselineFindings.filter(
    (finding) => finding.severity === "warn"
  );

  const aiById = new Map(aiDecisions.map((decision) => [decision.findingId, decision]));
  const aiReviewed = baselineFindings
    .filter((finding) => finding.confidence === "low")
    .map((finding) => ({
      finding,
      decision: aiById.get(finding.findingId)
    }))
    .filter((entry) => entry.decision);

  const aiBlocks = aiReviewed.filter((entry) => entry.decision.verdict === "block");

  const exitCode = blockFindings.length > 0 || aiBlocks.length > 0 ? 1 : 0;

  return {
    blockFindings,
    warnFindings,
    aiReviewed,
    exitCode
  };
}
