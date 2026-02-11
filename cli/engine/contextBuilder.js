import fs from "fs";
import path from "path";

const TEST_PATH_HINTS = [
  "test",
  "tests",
  "__tests__",
  "spec",
  "example",
  "examples",
  "sample",
  "samples",
  "mock",
  "mocks"
];

function isTestLike(filePath) {
  const normalized = filePath.toLowerCase();
  return TEST_PATH_HINTS.some((hint) => normalized.includes(path.sep + hint));
}

function getFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ext ? ext.slice(1) : "unknown";
}

function getSnippetAroundLine(content, lineNumber, padding = 2, maxChars = 800) {
  const lines = content.split("\n");
  const start = Math.max(0, lineNumber - 1 - padding);
  const end = Math.min(lines.length, lineNumber + padding);
  const snippet = lines.slice(start, end).join("\n");
  return snippet.length > maxChars ? snippet.slice(0, maxChars) + "..." : snippet;
}

export function buildProjectContext({ gitRoot, config }) {
  return {
    projectType: config?.projectType || "Unknown",
    scanMode: config?.scanMode || "staged"
  };
}

export function buildAiInputs(findings, projectContext) {
  return findings.map((finding) => {
    let content = "";
    try {
      content = fs.readFileSync(finding.filePath, "utf8");
    } catch {
      content = "";
    }

    const snippet = content
      ? getSnippetAroundLine(content, finding.line || 1)
      : finding.snippet || "";

    return {
      findingId: finding.findingId,
      ruleId: finding.ruleId,
      filePath: finding.filePath,
      fileType: getFileType(finding.filePath),
      isTestLike: isTestLike(finding.filePath),
      snippet,
      projectContext
    };
  });
}
