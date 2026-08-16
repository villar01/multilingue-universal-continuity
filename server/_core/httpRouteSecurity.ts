type UnknownRecord = Record<string, unknown>;

const ERROR_REPORT_WINDOW_MS = 5 * 60 * 1000;
const ERROR_REPORT_LIMIT = 20;
const errorReportBuckets = new Map<string, { count: number; resetAt: number }>();

function readString(source: UnknownRecord, key: string): string {
  const value = source[key];
  return typeof value === "string" ? value : "";
}

function normalizeContext(value: string): string {
  const normalized = value.trim().replace(/[^a-zA-Z0-9_-]/g, "");
  return normalized.slice(0, 48) || "unknown";
}

function normalizePath(value: string): string {
  if (!value) return "";

  try {
    return new URL(value, "https://telemetry.invalid").pathname.slice(0, 160);
  } catch {
    return "";
  }
}

/**
 * Retains only diagnostic metadata that cannot contain a typed error message,
 * stack trace, query string, token, email or other free-form personal data.
 */
export function sanitizePublicErrorReport(payload: unknown) {
  const source = payload && typeof payload === "object" ? (payload as UnknownRecord) : {};

  return {
    eventType: "client-error",
    context: normalizeContext(readString(source, "context")),
    message: "client-error",
    stack: "",
    url: normalizePath(readString(source, "url")),
  };
}

export function consumePublicErrorReportQuota(clientKey: string, now = Date.now()): boolean {
  const key = clientKey || "unknown";
  const bucket = errorReportBuckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    errorReportBuckets.set(key, { count: 1, resetAt: now + ERROR_REPORT_WINDOW_MS });
    return true;
  }

  if (bucket.count >= ERROR_REPORT_LIMIT) return false;
  bucket.count += 1;
  return true;
}

export function resetPublicErrorReportQuotaForTest() {
  errorReportBuckets.clear();
}
