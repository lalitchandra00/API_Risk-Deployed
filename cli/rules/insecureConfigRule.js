import { insecureConfigPatterns } from "./regexPatterns.js";
import { extractFindings } from "./ruleUtils.js";

export function evaluateInsecureConfigRule({ content, filePath, lineStarts }) {
  return extractFindings({
    patterns: insecureConfigPatterns,
    content,
    filePath,
    lineStarts
  });
}
