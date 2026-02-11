import fs from "fs";
import os from "os";
import path from "path";

export function ensureEnvFile(projectRoot) {
  const envPath = path.join(projectRoot, ".env");
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, "", "utf8");
  }
  return envPath;
}

export function readEnvKeys(envPath) {
  if (!fs.existsSync(envPath)) {
    return new Set();
  }

  const content = fs.readFileSync(envPath, "utf8");
  const keys = new Set();
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) {
      continue;
    }
    const key = trimmed.slice(0, eqIndex).trim();
    if (key) {
      keys.add(key);
    }
  }

  return keys;
}

export function appendEnvEntries(envPath, entries) {
  if (!entries.length) {
    return;
  }
  // Safety: append only to avoid overwriting existing .env entries.
  const lines = entries.map((entry) => `${entry.key}=${entry.value}`);
  const content = lines.join(os.EOL) + os.EOL;
  fs.appendFileSync(envPath, content, "utf8");
}
