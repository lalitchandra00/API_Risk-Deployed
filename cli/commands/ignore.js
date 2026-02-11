import { ensureGitRepo, getGitRoot } from "../utils/git.js";
import { logError, logInfo, logSuccess, logWarn } from "../utils/logger.js";
import { getEnforcementState, setEnforcementState } from "../core/enforcement.js";

export async function runIgnore({ cwd }) {
  // Controlled bypass: disabling enforcement is explicit and project-scoped.
  ensureGitRepo(cwd);
  const gitRoot = getGitRoot(cwd);

  let current = "enabled";
  try {
    current = getEnforcementState(gitRoot);
  } catch (error) {
    logError(error?.message || "Unable to read codeproof.config.json.");
    process.exit(1);
  }

  if (current === "disabled") {
    logWarn("CodeProof enforcement is already disabled.");
    return;
  }

  try {
    setEnforcementState(gitRoot, "disabled");
  } catch (error) {
    logError(error?.message || "Unable to update codeproof.config.json.");
    process.exit(1);
  }

  logSuccess("CodeProof enforcement disabled.");
  logInfo("Commits will not be blocked until `codeproof apply` is run.");
}
