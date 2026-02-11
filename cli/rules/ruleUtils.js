// Shared helpers for regex-based rule evaluation.

export function buildLineIndex(content) {
  const starts = [0];
  for (let i = 0; i < content.length; i += 1) {
    if (content[i] === "\n") {
      starts.push(i + 1);
    }
  }
  return starts;
}

function getLineInfo(content, index, lineStarts) {
  let low = 0;
  let high = lineStarts.length - 1;
  let lineNumber = 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (lineStarts[mid] <= index) {
      lineNumber = mid + 1;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const lineStart = lineStarts[lineNumber - 1] ?? 0;
  const lineEnd = content.indexOf("\n", lineStart);
  const rawLine = content.slice(lineStart, lineEnd === -1 ? content.length : lineEnd);
  const snippet = rawLine.trim().slice(0, 160);

  return { lineNumber, snippet };
}

export function extractFindings({ patterns, content, filePath, lineStarts }) {
  const findings = [];

  for (const pattern of patterns) {
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    let match = regex.exec(content);
    while (match) {
      const { lineNumber, snippet } = getLineInfo(content, match.index, lineStarts);
      findings.push({
        ruleId: pattern.id,
        severity: pattern.severity,
        confidence: pattern.confidence,
        message: pattern.message,
        filePath,
        line: lineNumber,
        snippet: snippet || match[0]
      });
      match = regex.exec(content);
    }
  }

  return findings;
}
