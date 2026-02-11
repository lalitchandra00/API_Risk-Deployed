import fs from "fs";
import os from "os";
import path from "path";

// Boundary: reporting storage only. Must not import rule logic, AI logic, or integrations.

export function appendReport({ projectRoot, report }) {
  const reportPath = path.join(projectRoot, "codeproof-report.log");
  const line = JSON.stringify(report) + os.EOL;

  // Append-only to preserve an immutable audit trail of every run.
  const fileHandle = fs.openSync(reportPath, "a");
  try {
    fs.writeSync(fileHandle, line, null, "utf8");
    fs.fsyncSync(fileHandle);
  } finally {
    fs.closeSync(fileHandle);
  }
}
