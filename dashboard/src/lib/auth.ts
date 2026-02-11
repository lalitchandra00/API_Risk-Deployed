import { config } from "./config";

export type JwtPayload = Record<string, unknown> & { exp?: number };

// Client-side helpers for managing the auth token cookie.
export function setToken(token: string, options?: { expires?: Date }): void {
  if (typeof document === "undefined") {
    return;
  }

  const parts = [
    `${config.authCookieName}=${encodeURIComponent(token)}`,
    "Path=/",
    "SameSite=Strict",
  ];

  if (options?.expires) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }

  if (window.location.protocol === "https:") {
    parts.push("Secure");
  }

  document.cookie = parts.join("; ");
}

export function getToken(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${config.authCookieName}=`));

  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
}

export function clearToken(): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${config.authCookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  const [, payload] = token.split(".");
  if (!payload) {
    return null;
  }

  try {
    const json = base64UrlDecode(payload);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");

  if (typeof window === "undefined" && typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf-8");
  }

  return atob(padded);
}
