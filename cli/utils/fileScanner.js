import fs from "fs";
import path from "path";
import { filterIgnoredFiles } from "./gitIgnore.js";
import { getDefaultExcludes, isBinaryFile, listFilesRecursive } from "./files.js";

function normalizeScopeFiles(files, gitRoot) {
  return files
    .map((filePath) => (path.isAbsolute(filePath) ? filePath : path.join(gitRoot, filePath)))
    .filter((filePath) => {
      try {
        return fs.statSync(filePath).isFile();
      } catch {
        return false;
      }
    });
}

function isExcludedByDefault(filePath, gitRoot, excludes) {
  const relative = path.relative(gitRoot, filePath);
  const segments = relative.split(path.sep);
  return segments.some((segment) => excludes.has(segment));
}

export function buildScanTargets({ gitRoot, scanMode, stagedFiles }) {
  const excludes = getDefaultExcludes();

  let scopeFiles = [];
  if (scanMode === "staged") {
    const normalized = normalizeScopeFiles(stagedFiles, gitRoot);
    scopeFiles = normalized.filter((filePath) => !isExcludedByDefault(filePath, gitRoot, excludes));
  } else {
    scopeFiles = normalizeScopeFiles(listFilesRecursive(gitRoot, excludes), gitRoot);
  }

  // Respect .gitignore via `git check-ignore` so scans only touch tracked sources.
  const notIgnored = filterIgnoredFiles({ gitRoot, filePaths: scopeFiles });

  // Exclude binary files to avoid false positives and wasted I/O.
  return notIgnored.filter((filePath) => !isBinaryFile(filePath));
}
