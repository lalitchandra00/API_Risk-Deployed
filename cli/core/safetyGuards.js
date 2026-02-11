// Centralized safety controls. These helpers must stay dependency-light.
// They enforce fail-open behavior without coupling to specific subsystems.

let warnedExperimental = false;

export function warnExperimentalOnce(message, logWarn) {
  if (warnedExperimental) {
    return;
  }
  warnedExperimental = true;
  logWarn(message);
}

export function reportFeatureDisabled(name, verbose, logInfo) {
  if (!verbose) {
    return;
  }
  logInfo(`${name} disabled by feature flag.`);
}

export async function withFailOpenReporting(action, onError) {
  try {
    const result = action();
    if (result && typeof result.then === 'function') {
      return await result;
    }
    return result;
  } catch {
    if (onError) {
      onError();
    }
    return null;
  }
}

export async function withFailOpenIntegration(action) {
  try {
    const result = action();
    if (result && typeof result.then === 'function') {
      await result;
    }
  } catch {
    // Integration failures are ignored to avoid affecting commits.
  }
}

export async function withFailOpenAiEscalation(enabled, action) {
  if (!enabled) {
    return [];
  }

  try {
    return await action();
  } catch {
    // AI failures downgrade to warnings by returning no decisions.
    return [];
  }
}
