import http from "http";
import https from "https";
import { logWarn } from "../utils/logger.js";

// AI contextual analysis layer. Only low-confidence findings reach this stage.
// Regex-first keeps the fast baseline deterministic; AI is a cautious fallback.

const DEFAULT_TIMEOUT_MS = 5000;

function getAiConfig() {
  const apiUrl = process.env.AI_API_URL || "";
  const timeoutMs = Number(process.env.AI_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;
  return { apiUrl, timeoutMs };
}

function fallbackDecision(finding, reason) {
  if (reason) {
    logWarn(`AI escalation failed: ${reason}`);
  }

  return {
    findingId: finding.findingId,
    verdict: "warn",
    confidence: 0.35,
    explanation: "AI unavailable; defaulting to warn for manual review.",
    suggestedFix: "Review the value and move secrets to environment variables."
  };
}

function postJsonWithTimeout({ url, payload, timeoutMs }) {
  return new Promise((resolve, reject) => {
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      reject(new Error("Invalid AI_API_URL"));
      return;
    }

    const data = JSON.stringify(payload);
    const transport = parsedUrl.protocol === "http:" ? http : https;

    const request = transport.request(
      {
        method: "POST",
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === "http:" ? 80 : 443),
        path: `${parsedUrl.pathname}${parsedUrl.search}`,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data)
        },
        timeout: timeoutMs
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`AI API responded with ${res.statusCode}`));
            return;
          }
          try {
            resolve(JSON.parse(body));
          } catch {
            reject(new Error("AI API returned invalid JSON"));
          }
        });
      }
    );

    request.on("timeout", () => {
      request.destroy(new Error("AI request timed out"));
    });

    request.on("error", (err) => {
      reject(err);
    });

    request.write(data);
    request.end();
  });
}

async function callModel(finding) {
  const { apiUrl, timeoutMs } = getAiConfig();

  if (!apiUrl) {
    throw new Error("AI_API_URL is not configured");
  }

  const response = await postJsonWithTimeout({
    url: apiUrl,
    timeoutMs,
    payload: {
      code: finding.snippet || ""
    }
  });

  if (!response || typeof response.found !== "boolean") {
    throw new Error("AI API returned invalid payload");
  }

  const verdict = response.found && response.risk === "Critical" ? "block" : "warn";
  const confidence = response.found ? 0.85 : 0.35;
  const explanation = response.found
    ? `AI detected ${response.risk} risk: ${response.secret || "secret value"}`
    : "AI did not detect risk in this code snippet.";

  return {
    findingId: finding.findingId,
    verdict,
    confidence,
    explanation,
    suggestedFix: response.found ? "Move secrets to environment variables." : undefined
  };
}

export async function analyze(findings, projectContext) {
  void projectContext;

  if (!Array.isArray(findings) || findings.length === 0) {
    return [];
  }

  return Promise.all(
    findings.map(async (finding) => {
      try {
        return await callModel(finding);
      } catch (error) {
        const reason = error instanceof Error ? error.message : "AI call failed";
        return fallbackDecision(finding, reason);
      }
    })
  );
}




