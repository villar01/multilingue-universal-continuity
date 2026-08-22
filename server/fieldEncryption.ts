import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";

const ENCRYPTED_PREFIX = "enc:v1";
const ALGORITHM = "aes-256-gcm";
const KEY_INFO = "multilingue-universal:parental-field-encryption:v1";
const KEY_SALT = "multilingue-universal:field-encryption";

export type ParentalFieldName = "guardian_name" | "guardian_document" | "guardian_email";

function deriveFieldEncryptionKey(): Buffer {
  const rootSecret = process.env.FIELD_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!rootSecret || rootSecret.length < 32) {
    throw new Error("Field encryption is unavailable because no sufficiently strong server secret is configured.");
  }

  return Buffer.from(
    hkdfSync(
      "sha256",
      Buffer.from(rootSecret, "utf8"),
      Buffer.from(KEY_SALT, "utf8"),
      Buffer.from(KEY_INFO, "utf8"),
      32,
    ),
  );
}

function getAssociatedData(fieldName: ParentalFieldName): Buffer {
  return Buffer.from(`multilingue-universal:parental-consent:${fieldName}`, "utf8");
}

export function encryptParentalField(value: string, fieldName: ParentalFieldName): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, deriveFieldEncryptionKey(), iv);
  cipher.setAAD(getAssociatedData(fieldName));
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    ENCRYPTED_PREFIX,
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(":");
}

export function decryptParentalField(value: string, fieldName: ParentalFieldName): string {
  const [prefix, version, ivValue, tagValue, ciphertextValue, ...unexpected] = value.split(":");
  if (`${prefix}:${version}` !== ENCRYPTED_PREFIX || !ivValue || !tagValue || !ciphertextValue || unexpected.length > 0) {
    throw new Error("Encrypted parental field has an invalid format.");
  }

  const decipher = createDecipheriv(ALGORITHM, deriveFieldEncryptionKey(), Buffer.from(ivValue, "base64url"));
  decipher.setAAD(getAssociatedData(fieldName));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function isEncryptedParentalField(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(`${ENCRYPTED_PREFIX}:`);
}
