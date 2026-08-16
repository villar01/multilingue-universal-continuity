import { createHash } from "node:crypto";

export type AbuseSignal = "rate-limit" | "scanner" | "malicious-input" | "repeated-access-denied";

type AbuseRecord = {
  count: number;
  resetAt: number;
  blockedUntil: number;
  lastSignal: AbuseSignal;
};

const ABUSE_WINDOW_MS = 10 * 60 * 1000;
const TEMPORARY_BLOCK_MS = 30 * 60 * 1000;
const TEMPORARY_BLOCK_THRESHOLD = 6;
const records = new Map<string, AbuseRecord>();

function pseudonymousKey(networkAddress: string): string {
  const secret = process.env.JWT_SECRET || "multilingue-abuse-salt";
  return createHash("sha256")
    .update(secret)
    .update(":")
    .update(networkAddress || "unknown")
    .digest("hex")
    .slice(0, 20);
}

/**
 * Stores only a short-lived, one-way key in memory. It is used to contain
 * repeated technical abuse, not to identify a visitor or infer a person.
 */
export function recordAbuseSignal(networkAddress: string, signal: AbuseSignal, now = Date.now()) {
  const key = pseudonymousKey(networkAddress);
  const previous = records.get(key);
  const record = !previous || now >= previous.resetAt
    ? { count: 0, resetAt: now + ABUSE_WINDOW_MS, blockedUntil: 0, lastSignal: signal }
    : previous;

  record.count += 1;
  record.lastSignal = signal;
  if (record.count >= TEMPORARY_BLOCK_THRESHOLD) {
    record.blockedUntil = Math.max(record.blockedUntil, now + TEMPORARY_BLOCK_MS);
  }
  records.set(key, record);

  return {
    temporarilyBlocked: now < record.blockedUntil,
    blockedUntil: record.blockedUntil,
    count: record.count,
    signal: record.lastSignal,
  };
}

export function isTemporarilyAbuseBlocked(networkAddress: string, now = Date.now()): boolean {
  const record = records.get(pseudonymousKey(networkAddress));
  return Boolean(record && now < record.blockedUntil);
}

/** Administrative aggregate only. It never returns a network address or key. */
export function getAbuseProtectionSummary(now = Date.now()) {
  const bySignal: Record<AbuseSignal, number> = {
    "rate-limit": 0,
    scanner: 0,
    "malicious-input": 0,
    "repeated-access-denied": 0,
  };
  let activeBlocks = 0;
  let activeRecords = 0;

  for (const [key, record] of records.entries()) {
    if (now >= record.resetAt && now >= record.blockedUntil) {
      records.delete(key);
      continue;
    }
    activeRecords += 1;
    bySignal[record.lastSignal] += 1;
    if (now < record.blockedUntil) activeBlocks += 1;
  }

  return { activeRecords, activeBlocks, bySignal };
}

export function __resetAbuseProtectionForTests(): void {
  records.clear();
}
