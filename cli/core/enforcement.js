import fs from "fs";
import path from "path";

const ENFORCEMENT_ENABLED = "enabled";
const ENFORCEMENT_DISABLED = "disabled";

function getConfigPath(gitRoot) {
  return path.join(gitRoot, "codeproof.config.json");
}

function readConfig(gitRoot) {
  const configPath = getConfigPath(gitRoot);
  if (!fs.existsSync(configPath)) {
    const error = new Error("Missing codeproof.config.json. Run codeproof init first.");
    error.code = "CODEPROOF_CONFIG_MISSING";
    throw error;
  }

  try {
    const raw = fs.readFileSync(configPath, "utf8");
    return JSON.parse(raw);
  } catch {
    const error = new Error("Invalid codeproof.config.json. Please fix the file.");
    error.code = "CODEPROOF_CONFIG_INVALID";
    throw error;
  }
}

function writeConfig(gitRoot, config) {
  const configPath = getConfigPath(gitRoot);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf8");
}

export function getEnforcementState(gitRoot) {
  const config = readConfig(gitRoot);
  const enforcement = String(config.enforcement || ENFORCEMENT_ENABLED).toLowerCase();
  return enforcement === ENFORCEMENT_DISABLED ? ENFORCEMENT_DISABLED : ENFORCEMENT_ENABLED;
}

export function setEnforcementState(gitRoot, nextState) {
  const config = readConfig(gitRoot);
  const normalized = String(nextState || "").toLowerCase();
  const enforcement = normalized === ENFORCEMENT_DISABLED
    ? ENFORCEMENT_DISABLED
    : ENFORCEMENT_ENABLED;

  // Security: explicit state keeps this a reversible bypass, not a silent disable.
  const updated = { ...config, enforcement };
  writeConfig(gitRoot, updated);
  return enforcement;
}
