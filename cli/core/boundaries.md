# CodeProof Internal Boundaries

This is a short internal guide to prevent accidental coupling between subsystems.

## Allowed Dependencies
- Rule engine → May depend on rules and utilities only.
- Reporting → May depend on report input data and file I/O only.
- Integration → May depend on HTTP/HTTPS only.
- Secret remediation → May depend on reports, env helpers, and file I/O only.
- CLI commands → Orchestrate flows and call feature guards.

## Forbidden Dependencies
- Rule engine must never import reporting, integration, or remediation.
- Reporting must never import rule logic or AI logic.
- Integration must never import CLI or rule logic.
- Secret remediation must never import analysis state (only reports).

## Fail-Open Guarantees
- Reporting failures never affect exit codes.
- Integration failures never affect commits.
- AI failures always downgrade to warn and never block.

## Safe Extension Points
- Add new features to core/featureFlags.js with default-off behavior.
- Use core/safetyGuards.js for all fail-open or experimental flows.
- Keep experimental features opt-in and guarded by feature flags.
