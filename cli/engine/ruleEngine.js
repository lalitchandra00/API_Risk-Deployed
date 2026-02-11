import fs from "fs";
import { buildLineIndex } from "../rules/ruleUtils.js";
import { evaluateSecretRule } from "../rules/secretRule.js";
import { evaluateDangerousUsageRule } from "../rules/dangerousUsageRule.js";
import { evaluateInsecureConfigRule } from "../rules/insecureConfigRule.js";

// Boundary: rule engine must never import reporting, integration, or remediation.
// Rationale: regex-first keeps scans fast and deterministic; AI is a cautious fallback.

// The engine aggregates deterministic regex rules and prepares low-confidence items
// for AI escalation. This keeps the baseline fast and predictable.
export function runRuleEngine({ files }) {
  const findings = [];
  const escalations = [];
  let counter = 0;

  for (const filePath of files) {
    let content = "";
    try {
      content = fs.readFileSync(filePath, "utf8");
    } catch {
      continue;
    }

    const lineStarts = buildLineIndex(content);

    const secretResult = evaluateSecretRule({ content, filePath, lineStarts });
    findings.push(...secretResult.findings.map((finding) => ({
      ...finding,
      findingId: `f-${counter++}`
    })));
    escalations.push(...secretResult.escalations.map((finding) => ({
      ...finding,
      findingId: `f-${counter++}`
    })));

    findings.push(
      ...evaluateDangerousUsageRule({ content, filePath, lineStarts }).map((finding) => ({
        ...finding,
        findingId: `f-${counter++}`
      }))
    );
    findings.push(
      ...evaluateInsecureConfigRule({ content, filePath, lineStarts }).map((finding) => ({
        ...finding,
        findingId: `f-${counter++}`
      }))
    );
  }

  return { findings, escalations };
}
