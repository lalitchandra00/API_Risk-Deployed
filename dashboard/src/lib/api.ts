import { clearToken } from "./auth";
import { config } from "./config";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Reads the token from cookies in either server or client contexts.
async function getTokenFromCookies(): Promise<string | null> {
  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    return (await cookies()).get(config.authCookieName)?.value ?? null;
  }

  return readCookie(config.authCookieName);
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getTokenFromCookies();
  const headers = new Headers(options.headers);

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = path.startsWith("http")
    ? path
    : new URL(path, config.apiUrl).toString();

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await parseResponse(response);

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      clearToken();
      window.location.href = "/login";
    }
    throw new ApiError("Unauthorized", response.status, data);
  }

  if (!response.ok) {
    throw new ApiError("API request failed", response.status, data);
  }

  return data as T;
}
