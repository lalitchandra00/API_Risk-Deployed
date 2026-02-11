import { secretPatterns } from "./regexPatterns.js";
import { extractFindings } from "./ruleUtils.js";

// Regex-first for secrets ensures fast, deterministic detection.
// Low-confidence matches are escalated for future AI context review.
export function evaluateSecretRule({ content, filePath, lineStarts }) {
  const findings = extractFindings({ patterns: secretPatterns, content, filePath, lineStarts });

  const highConfidence = [];
  const lowConfidence = [];

  for (const finding of findings) {
    if (finding.confidence === "high") {
      highConfidence.push(finding);
    } else {
      lowConfidence.push(finding);
    }
  }

  return { findings: highConfidence, escalations: lowConfidence };
}
