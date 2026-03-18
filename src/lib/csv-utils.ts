/**
 * Sanitizes a single CSV field to prevent CSV Injection (Formula Injection)
 * and ensures correct CSV escaping.
 *
 * 🛡️ Sentinel: Defense against CSV Injection and malformed CSV.
 */
export function sanitizeCSVField(value: string | number | undefined | null): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  let stringValue = String(value);

  // 1. Prepend a single quote if the value starts with formula characters: =, +, -, @
  // This prevents Excel and Google Sheets from interpreting the cell as a formula.
  // 🛡️ Sentinel: Formula Injection protection.
  if (/^[=+\-@]/.test(stringValue)) {
    stringValue = `'${stringValue}`;
  }

  // 2. Escape double quotes by doubling them
  let escapedValue = stringValue.replace(/"/g, '""');

  // 3. Wrap in double quotes if it contains commas, double quotes, or newlines
  if (/[",\n\r]/.test(stringValue) || stringValue.startsWith("'")) {
    escapedValue = `"${escapedValue}"`;
  }

  return escapedValue;
}

/**
 * Converts an array of rows into a sanitized CSV string.
 * Uses CRLF (\r\n) as specified in RFC 4180.
 */
export function convertToCSV(rows: (string | number | undefined | null)[][]): string {
  return rows
    .map(row => row.map(sanitizeCSVField).join(","))
    .join("\r\n");
}
