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

/**
 * Retains only a fixed event and a short controlled context. Text supplied by
 * clients, URLs, stacks and messages are discarded before database persistence.
 */
export function sanitizePublicErrorReport(payload: unknown) {
  const source = payload && typeof payload === "object" ? (payload as UnknownRecord) : {};

  return {
    eventType: "client-error",
    context: normalizeContext(readString(source, "context")),
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
