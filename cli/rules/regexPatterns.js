// Centralized regex patterns for deterministic rules.
// Regex-first keeps scans fast and predictable; AI is used only for ambiguous cases.

export const secretPatterns = [
  {
    id: "secret.aws_access_key",
    regex: /\b(AKIA|ASIA)[0-9A-Z]{16}\b/g,
    severity: "block",
    confidence: "high",
    message: "Possible AWS access key detected."
  },
  {
    id: "secret.generic_api_key",
    regex: /\bapi[_-]?key\s*[:=]\s*['"][A-Za-z0-9\-_]{8,}['"]/gi,
    severity: "block",
    confidence: "low",
    message: "Possible API key detected."
  },
  {
    id: "secret.generic_token",
    regex: /\b(token|password|secret)\s*[:=]\s*['"][^'"\n]{6,}['"]/gi,
    severity: "block",
    confidence: "low",
    message: "Possible secret material detected."
  }
];

export const dangerousUsagePatterns = [
  {
    id: "code.dangerous_eval",
    regex: /\b(eval|exec)\s*\(/g,
    severity: "warn",
    confidence: "high",
    message: "Dangerous function usage detected."
  }
];

export const insecureConfigPatterns = [
  {
    id: "config.debug_true",
    regex: /\bDEBUG\s*=\s*true\b/gi,
    severity: "warn",
    confidence: "high",
    message: "Insecure DEBUG flag enabled."
  },
  {
    id: "config.node_env_development",
    regex: /\bNODE_ENV\s*=\s*development\b/gi,
    severity: "warn",
    confidence: "high",
    message: "NODE_ENV set to development."
  }
];
