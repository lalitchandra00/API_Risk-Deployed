import fs from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";

const CONFIG_DIR_NAME = ".codeproof";
const CONFIG_FILE_NAME = "config.json";

function getConfigDir() {
  return path.join(os.homedir(), CONFIG_DIR_NAME);
}

function getConfigPath() {
  return path.join(getConfigDir(), CONFIG_FILE_NAME);
}

function ensureConfigDir() {
  const dir = getConfigDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  }
  try {
    fs.chmodSync(dir, 0o700);
  } catch {
    // Best-effort on platforms that ignore chmod.
  }
}

function writeConfig(config) {
  const filePath = getConfigPath();
  const payload = JSON.stringify(config, null, 2) + "\n";
  fs.writeFileSync(filePath, payload, { encoding: "utf8", mode: 0o600 });
  try {
    fs.chmodSync(filePath, 0o600);
  } catch {
    // Best-effort on platforms that ignore chmod.
  }
}

function readConfig() {
  const filePath = getConfigPath();
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function ensureClientId() {
  ensureConfigDir();

  const existing = readConfig();
  if (existing?.clientId) {
    return existing.clientId;
  }

  const clientId = randomUUID();
  writeConfig({ clientId });
  return clientId;
}

export function getClientId() {
  return ensureClientId();
}

export function readClientId() {
  const existing = readConfig();
  return existing?.clientId ?? null;
}

export function getGlobalConfigPath() {
  return getConfigPath();
}
