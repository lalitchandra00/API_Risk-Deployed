// Centralized runtime configuration with minimal validation.
export const config = (() => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is required");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(apiUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_API_URL must be a valid URL");
  }

  return {
    apiUrl: parsedUrl.toString().replace(/\/$/, ""),
    authCookieName: "codeproof_token",
  } as const;
})();
