import fs from "fs";
import path from "path";

const REPORT_DIR_NAME = "codeproof-reports";
const REPORT_PATTERN = /^report-(\d+)\.json$/;

function getReportDir(projectRoot) {
  return path.join(projectRoot, REPORT_DIR_NAME);
}

function getReportNumbers(files) {
  return files
    .map((file) => {
      const match = REPORT_PATTERN.exec(file);
      return match ? Number.parseInt(match[1], 10) : null;
    })
    .filter((value) => Number.isInteger(value));
}

export function readLatestReport(projectRoot) {
  const reportDir = getReportDir(projectRoot);
  if (!fs.existsSync(reportDir)) {
    return null;
  }

  let files = [];
  try {
    files = fs.readdirSync(reportDir);
  } catch {
    return null;
  }

  const numbers = getReportNumbers(files).sort((a, b) => b - a);
  if (numbers.length === 0) {
    return null;
  }

  for (const number of numbers) {
    const reportPath = path.join(reportDir, `report-${number}.json`);
    try {
      const raw = fs.readFileSync(reportPath, "utf8");
      return { report: JSON.parse(raw), reportPath };
    } catch {
      // Skip unreadable or invalid JSON reports instead of crashing.
    }
  }

  return null;
}
