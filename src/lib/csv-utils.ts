/**
 * Converts a 2D array of strings into a secure CSV string.
 * 🛡️ Sentinel: Protection against CSV Injection (Formula Injection) and RFC 4180 compliance.
 */
export function convertToCSV(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((field) => {
          // 🛡️ Sentinel: Sanitize field to prevent CSV Injection (Formula Injection)
          // Prepend a single quote if the field starts with any of the control characters: =, +, -, @
          let sanitizedField = field || "";
          if (
            sanitizedField.startsWith("=") ||
            sanitizedField.startsWith("+") ||
            sanitizedField.startsWith("-") ||
            sanitizedField.startsWith("@")
          ) {
            sanitizedField = `'${sanitizedField}`;
          }

          // 🛡️ Sentinel: RFC 4180 compliance - escape fields containing quotes, commas, or newlines
          if (
            sanitizedField.includes('"') ||
            sanitizedField.includes(",") ||
            sanitizedField.includes("\n") ||
            sanitizedField.includes("\r")
          ) {
            return `"${sanitizedField.replace(/"/g, '""')}"`;
          }
          return sanitizedField;
        })
        .join(",")
    )
    .join("\r\n"); // RFC 4180 recommends CRLF
}
