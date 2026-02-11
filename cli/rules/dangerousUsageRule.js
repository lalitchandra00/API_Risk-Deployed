import { dangerousUsagePatterns } from "./regexPatterns.js";
import { extractFindings } from "./ruleUtils.js";

export function evaluateDangerousUsageRule({ content, filePath, lineStarts }) {
  return extractFindings({
    patterns: dangerousUsagePatterns,
    content,
    filePath,
    lineStarts
  });
}
