import fs from "fs";
import path from "path";

const REPORT_DIR_NAME = "codeproof-reports";
const REPORT_PREFIX = "report-";
const REPORT_SUFFIX = ".json";
const REPORT_PATTERN = /^report-(\d+)\.json$/;

// Boundary: reporting storage only. Must not import rule logic, AI logic, or integrations.

function getReportDir(projectRoot) {
  return path.join(projectRoot, REPORT_DIR_NAME);
}

function ensureReportDir(reportDir) {
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
}

function getNextReportNumber(reportDir) {
  let files = [];
  try {
    files = fs.readdirSync(reportDir);
  } catch {
    return 1;
  }

  const numbers = files
    .map((file) => {
      const match = REPORT_PATTERN.exec(file);
      return match ? Number.parseInt(match[1], 10) : null;
    })
    .filter((value) => Number.isInteger(value));

  if (numbers.length === 0) {
    return 1;
  }

  return Math.max(...numbers) + 1;
}

export function writeReport({ projectRoot, report }) {
  const reportDir = getReportDir(projectRoot);
  console.log("[Report Writer] projectRoot:", projectRoot);
  console.log("[Report Writer] reportDir:", reportDir);
  
  try {
    ensureReportDir(reportDir);
    console.log("[Report Writer] Directory ensured:", reportDir);
  } catch (err) {
    console.error("[Report Writer] Failed to create directory:", err.message);
    throw err;
  }

  // Cleanup old temp files before creating new ones
  try {
    const files = fs.readdirSync(reportDir);
    for (const file of files) {
      if (file.startsWith('.tmp-')) {
        try {
          fs.unlinkSync(path.join(reportDir, file));
        } catch {
          // Ignore errors on cleanup
        }
      }
    }
  } catch {
    // Ignore cleanup errors
  }

  // Per-run JSON keeps every audit entry immutable and easy to archive.
  let reportNumber = getNextReportNumber(reportDir);
  let reportPath = path.join(reportDir, `${REPORT_PREFIX}${reportNumber}${REPORT_SUFFIX}`);
  while (fs.existsSync(reportPath)) {
    reportNumber += 1;
    reportPath = path.join(reportDir, `${REPORT_PREFIX}${reportNumber}${REPORT_SUFFIX}`);
  }

  // Use numeric sequencing over timestamps to avoid collisions in fast CI runs.
  const tempPath = path.join(reportDir, `.tmp-${process.pid}-${Date.now()}.json`);
  const payload = JSON.stringify(report, null, 2) + "\n";
  
  console.log("[Report Writer] Writing to:", reportPath);
  
  try {
    fs.writeFileSync(tempPath, payload, "utf8");
    fs.renameSync(tempPath, reportPath);
    console.log("[Report Writer] Report successfully written:", reportPath);
  } catch (err) {
    console.error("[Report Writer] Write failed:", err.message);
    // Cleanup temp file on error
    try {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    } catch {
      // Ignore cleanup errors
    }
    throw err;
  }

  return reportPath;
}
