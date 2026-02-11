const DEFAULT_FEATURES = {
  reporting: true,
  integration: false,
  aiEscalation: false,
  secretRemediation: false
};

// Boundary: feature flags are configuration only and must not import runtime systems.
// Future features should be added here with safe defaults and explicit gating.
export function resolveFeatureFlags(config) {
  const features = config?.features || {};
  return {
    reporting: typeof features.reporting === "boolean" ? features.reporting : DEFAULT_FEATURES.reporting,
    integration: typeof features.integration === "boolean" ? features.integration : DEFAULT_FEATURES.integration,
    aiEscalation: typeof features.aiEscalation === "boolean" ? features.aiEscalation : DEFAULT_FEATURES.aiEscalation,
    secretRemediation:
      typeof features.secretRemediation === "boolean"
        ? features.secretRemediation
        : DEFAULT_FEATURES.secretRemediation
  };
}

export function isVerbose(config) {
  return Boolean(config?.verbose) || process.env.CODEPROOF_VERBOSE === "1";
}
