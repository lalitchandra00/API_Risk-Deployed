function formatPrefix(level) {
  const map = {
    info: "[codeproof]",
    success: "[codeproof]",
    warn: "[codeproof]",
    error: "[codeproof]"
  };
  return map[level] || "[codeproof]";
}

export function logInfo(message) {
  console.log(`${formatPrefix("info")} ${message}`);
}

export function logSuccess(message) {
  console.log(`${formatPrefix("success")} ${message}`);
}

export function logWarn(message) {
  console.warn(`${formatPrefix("warn")} ${message}`);
}

export function logError(message) {
  console.error(`${formatPrefix("error")} ${message}`);
}
