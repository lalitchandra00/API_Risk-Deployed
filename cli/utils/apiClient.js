import http from "http";
import https from "https";

// Boundary: integration layer only. Must not import CLI, rule engine, or reporting.
// Network calls are fail-open to avoid impacting commits or developer flow.

const DEFAULT_ENDPOINT = "https://api.codeproof.dev/report";

export function sendReportToServer(report, options = {}) {
  const enabled = Boolean(options.enabled);
  if (!enabled) {
    return;
  }

  const endpointUrl = typeof options.endpointUrl === "string" && options.endpointUrl.trim()
    ? options.endpointUrl.trim()
    : DEFAULT_ENDPOINT;

  try {
    const url = new URL(endpointUrl);
    const payload = JSON.stringify(report);
    const transport = url.protocol === "http:" ? http : https;

    const request = transport.request(
      {
        method: "POST",
        hostname: url.hostname,
        port: url.port || (url.protocol === "http:" ? 80 : 443),
        path: `${url.pathname}${url.search}`,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload)
        },
        timeout: 2000
      },
      (res) => {
        // UX: fail-open integrations never read or store server responses.
        res.resume();
      }
    );

    request.on("timeout", () => {
      // Integrations are fail-open: timeout should not block or throw.
      request.destroy();
    });

    request.on("error", () => {
      // Integrations are fail-open: network errors are ignored silently.
    });

    request.write(payload);
    request.end();
  } catch {
    // Integrations are fail-open: invalid URLs or serialization issues are ignored silently.
  }
}
