/**
 * Sanitizes a URL to prevent XSS attacks via dangerous protocols.
 * 🛡️ Sentinel: Defense against Cross-Site Scripting (XSS).
 */
export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return "";

  // Remove control characters and whitespace
  const trimmed = url.replace(/[\u0000-\u001F\u007F-\u009F\s]/g, "");

  // Allow relative paths and fragments
  if (trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith("./") || trimmed.startsWith("../")) {
    return trimmed;
  }

  // Check for dangerous protocols (matches the protocol part before the colon)
  const protocolMatch = trimmed.match(/^([a-z0-9+.-]+):/i);
  if (!protocolMatch) {
    // If there is no protocol, it's likely a relative path (e.g., "page.html")
    return trimmed;
  }

  const protocol = protocolMatch[1].toLowerCase();
  const allowedProtocols = ["http", "https", "mailto", "tel"];

  if (allowedProtocols.includes(protocol)) {
    return trimmed;
  }

  // Allow safe data:image URIs
  if (protocol === "data" && /^data:image\/(png|jpg|jpeg|gif|webp);base64,/i.test(trimmed)) {
    return trimmed;
  }

  // Fallback for dangerous protocols like javascript:, vbscript:, etc.
  return "about:blank";
}
