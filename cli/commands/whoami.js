import { readClientId, getGlobalConfigPath } from "../core/identity.js";
import { logError, logInfo } from "../utils/logger.js";

export async function runWhoAmI() {
  const clientId = readClientId();

  if (!clientId) {
    logError("CodeProof not initialized. Run codeproof init first.");
    process.exit(1);
  }

  logInfo("CodeProof Client ID:");
  logInfo(clientId);
  logInfo("");
  logInfo("Use this ID to log in at:");
  logInfo("https://your-dashboard-url.com/login");
  logInfo("");
  logInfo(`Config: ${getGlobalConfigPath()}`);
}
