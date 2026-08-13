import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export const PIN_HASH_PREFIX = "scrypt$";

export function hashParentPin(pin: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(pin, salt, 32).toString("hex");
  return `${PIN_HASH_PREFIX}${salt}$${derived}`;
}

export function isHashedParentPin(value: string): boolean {
  return value.startsWith(PIN_HASH_PREFIX);
}

export function verifyStoredParentPin(storedPin: string, candidatePin: string): boolean {
  if (isHashedParentPin(storedPin)) {
    const [, salt, expectedHex] = storedPin.split("$");
    if (!salt || !expectedHex) return false;
    const expected = Buffer.from(expectedHex, "hex");
    const actual = scryptSync(candidatePin, salt, 32);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  const legacy = Buffer.from(storedPin.padEnd(4, "\0"));
  const candidate = Buffer.from(candidatePin.padEnd(4, "\0"));
  return legacy.length === candidate.length && timingSafeEqual(legacy, candidate);
}
