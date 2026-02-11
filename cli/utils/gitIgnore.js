import path from "path";
import { spawnSync } from "child_process";

function normalizePathForGit(filePath, gitRoot) {
  const relative = path.isAbsolute(filePath)
    ? path.relative(gitRoot, filePath)
    : filePath;

  if (!relative || relative.startsWith("..")) {
    return null;
  }

  return relative.replace(/\\/g, "/");
}

export function filterIgnoredFiles({ gitRoot, filePaths }) {
  if (!Array.isArray(filePaths) || filePaths.length === 0) {
    return [];
  }

  const normalized = new Map();
  for (const filePath of filePaths) {
    const relative = normalizePathForGit(filePath, gitRoot);
    if (relative) {
      normalized.set(relative, filePath);
    }
  }

  if (normalized.size === 0) {
    return [];
  }

  // Use `git check-ignore` to respect .gitignore rules quickly and accurately.
  const input = `${Array.from(normalized.keys()).join("\u0000")}\u0000`;
  const result = spawnSync("git", ["check-ignore", "--stdin", "-z"], {
    cwd: gitRoot,
    input,
    encoding: "utf8"
  });

  if (result.error || (result.status && result.status > 1)) {
    return Array.from(normalized.values());
  }

  const ignored = new Set(
    String(result.stdout)
      .split("\u0000")
      .map((entry) => entry.trim())
      .filter(Boolean)
  );

  return Array.from(normalized.entries())
    .filter(([relative]) => !ignored.has(relative))
    .map(([, original]) => original);
}
