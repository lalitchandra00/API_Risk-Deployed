import fs from "fs";
import path from "path";

function detectLineEnding(content) {
  return content.includes("\r\n") ? "\r\n" : "\n";
}

function ensureBackupDir(projectRoot) {
  const backupRoot = path.join(projectRoot, ".codeproof-backup");
  if (!fs.existsSync(backupRoot)) {
    fs.mkdirSync(backupRoot, { recursive: true });
  }
  return backupRoot;
}

export function backupFileOnce(projectRoot, filePath, backedUp) {
  if (backedUp.has(filePath)) {
    return;
  }

  const backupRoot = ensureBackupDir(projectRoot);
  const relative = path.relative(projectRoot, filePath);
  const backupPath = path.join(backupRoot, relative);
  const backupDir = path.dirname(backupPath);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  fs.copyFileSync(filePath, backupPath);
  backedUp.add(filePath);
}

function findValueSegment(line) {
  const equalsIndex = line.indexOf("=");
  const colonIndex = line.indexOf(":");
  let separatorIndex = -1;
  if (equalsIndex !== -1 && colonIndex !== -1) {
    separatorIndex = Math.min(equalsIndex, colonIndex);
  } else if (equalsIndex !== -1) {
    separatorIndex = equalsIndex;
  } else if (colonIndex !== -1) {
    separatorIndex = colonIndex;
  }

  if (separatorIndex === -1) {
    return null;
  }

  const right = line.slice(separatorIndex + 1);
  const leadingMatch = right.match(/^\s*/);
  const leading = leadingMatch ? leadingMatch[0] : "";
  const startIndex = separatorIndex + 1 + leading.length;

  const quoteChar = right[leading.length];
  if (quoteChar === "'" || quoteChar === '"') {
    const endIndex = right.indexOf(quoteChar, leading.length + 1);
    if (endIndex === -1) {
      return null;
    }
    return {
      separatorIndex,
      valueStart: startIndex,
      valueEnd: separatorIndex + 1 + endIndex + 1,
      secretValue: right.slice(leading.length + 1, endIndex)
    };
  }

  const candidates = [];
  const delimiters = [" ", "\t", ";", ",", ")"];
  for (const delimiter of delimiters) {
    const index = right.indexOf(delimiter, leading.length);
    if (index !== -1) {
      candidates.push(separatorIndex + 1 + index);
    }
  }
  const commentIndex = right.indexOf("//", leading.length);
  if (commentIndex !== -1) {
    candidates.push(separatorIndex + 1 + commentIndex);
  }
  const hashIndex = right.indexOf("#", leading.length);
  if (hashIndex !== -1) {
    candidates.push(separatorIndex + 1 + hashIndex);
  }

  const valueEnd = candidates.length > 0 ? Math.min(...candidates) : line.length;
  const rawValue = line.slice(startIndex, valueEnd).trim();
  if (!rawValue) {
    return null;
  }

  return {
    separatorIndex,
    valueStart: startIndex,
    valueEnd,
    secretValue: rawValue
  };
}

export function extractSecretValueFromLine(line) {
  const segment = findValueSegment(line);
  return segment?.secretValue ? segment.secretValue : null;
}

export function replaceSecretInFile({ filePath, lineNumber, envKey, expectedSnippet, expectedSecretValue }) {
  const content = fs.readFileSync(filePath, "utf8");
  const eol = detectLineEnding(content);
  const lines = content.split(/\r?\n/);
  const index = lineNumber - 1;

  if (index < 0 || index >= lines.length) {
    return { updated: false, reason: "line_out_of_range" };
  }

  const originalLine = lines[index];
  if (originalLine.includes(`process.env.${envKey}`) || originalLine.includes("process.env.CODEPROOF_SECRET_")) {
    return { updated: false, reason: "already_moved" };
  }

  if (expectedSnippet && !String(originalLine).includes(String(expectedSnippet))) {
    return { updated: false, reason: "line_mismatch" };
  }

  // Safety: only rewrite the specific line from the latest report; no regex rescanning.
  const segment = findValueSegment(originalLine);
  if (!segment || !segment.secretValue) {
    return { updated: false, reason: "unable_to_extract" };
  }

  if (expectedSecretValue && segment.secretValue !== expectedSecretValue) {
    return { updated: false, reason: "value_mismatch" };
  }

  const before = originalLine.slice(0, segment.valueStart);
  const after = originalLine.slice(segment.valueEnd);
  const replacement = `process.env.${envKey}`;
  // Preserve original formatting and line endings by replacing only the value segment.
  const updatedLine = `${before}${replacement}${after}`;

  lines[index] = updatedLine;

  const hasTrailingNewline = content.endsWith(eol);
  const newContent = lines.join(eol) + (hasTrailingNewline ? eol : "");
  fs.writeFileSync(filePath, newContent, "utf8");

  return { updated: true, secretValue: segment.secretValue };
}
