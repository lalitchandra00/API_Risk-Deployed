import { ensureGitRepo, getGitRoot } from "../utils/git.js";
import { logError, logInfo, logSuccess, logWarn } from "../utils/logger.js";
import { getEnforcementState, setEnforcementState } from "../core/enforcement.js";

export async function runApply({ cwd }) {
  // Re-enable enforcement explicitly to restore pre-commit blocking.
  ensureGitRepo(cwd);
  const gitRoot = getGitRoot(cwd);

  let current = "enabled";
  try {
    current = getEnforcementState(gitRoot);
  } catch (error) {
    logError(error?.message || "Unable to read codeproof.config.json.");
    process.exit(1);
  }

  if (current === "enabled") {
    logWarn("CodeProof enforcement is already enabled.");
    return;
  }

  try {
    setEnforcementState(gitRoot, "enabled");
  } catch (error) {
    logError(error?.message || "Unable to update codeproof.config.json.");
    process.exit(1);
  }

  logSuccess("CodeProof enforcement re-enabled.");
  logInfo("Pre-commit protection active.");
}
