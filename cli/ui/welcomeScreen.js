function padRight(text, width) {
  const safeText = text ?? "";
  const padding = Math.max(0, width - safeText.length);
  return safeText + " ".repeat(padding);
}

function buildBox(lines) {
  const width = Math.max(...lines.map((line) => line.length), 0);
  const top = "─".repeat(width + 4);
  const bottom = "─".repeat(width + 4);
  const body = lines.map((line) => `│ ${padRight(line, width)} │`);
  return [top, ...body, bottom].join("\n");
}

export function buildWelcomeScreen({ projectType, scanMode, configPath }) {
  // UX: use a clean box with minimal symbols so the message is readable and calm in any terminal.
  const lines = [
    "✓ CodeProof initialized successfully.",
    "",
    "What it does: Scans for secrets and risky patterns before you commit.",
    "When it runs: On pre-commit, or when you run it manually.",
    "Commit impact: Blocks commits only on high-confidence blockers.",
    "",
    `Project type: ${projectType}`,
    `Scan mode: ${scanMode}`,
    `Config file: ${configPath}`,
    "",
    "Commands:",
    "→ codeproof run                Manually run checks",
    "→ codeproof status             Show current configuration",
    "→ codeproof report@dashboard   View reports (placeholder)",
    "→ codeproof move-secret        Safely move detected secrets (experimental)"
  ];

  return buildBox(lines);
}

export function showWelcomeScreen(details) {
  // UX: print once after init to reassure users without changing command behavior elsewhere.
  const message = buildWelcomeScreen(details);
  console.log(message);
}
