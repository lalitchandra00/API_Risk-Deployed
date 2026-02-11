import fs from "fs";
import path from "path";

const DEFAULT_EXCLUDES = new Set([".git", "node_modules", ".venv", "dist", "build"]);

export function getDefaultExcludes() {
  return DEFAULT_EXCLUDES;
}

export function isBinaryFile(filePath) {
  // Heuristic: if the first chunk contains a null byte, treat as binary.
  try {
    const fd = fs.openSync(filePath, "r");
    const buffer = Buffer.alloc(8000);
    const bytesRead = fs.readSync(fd, buffer, 0, buffer.length, 0);
    fs.closeSync(fd);
    for (let i = 0; i < bytesRead; i += 1) {
      if (buffer[i] === 0) {
        return true;
      }
    }
    return false;
  } catch {
    return true;
  }
}

export function listFilesRecursive(rootDir, excludes = DEFAULT_EXCLUDES) {
  const results = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (excludes.has(entry.name)) {
        continue;
      }

      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        results.push(fullPath);
      }
    }
  }

  walk(rootDir);
  return results;
}
