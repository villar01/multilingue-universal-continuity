import { afterEach, describe, expect, it } from "vitest";
import {
  decryptParentalField,
  encryptParentalField,
  isEncryptedParentalField,
} from "./fieldEncryption";

const originalDedicatedKey = process.env.FIELD_ENCRYPTION_KEY;
const originalSessionKey = process.env.JWT_SECRET;

afterEach(() => {
  if (originalDedicatedKey === undefined) delete process.env.FIELD_ENCRYPTION_KEY;
  else process.env.FIELD_ENCRYPTION_KEY = originalDedicatedKey;
  if (originalSessionKey === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalSessionKey;
});

describe("parental field encryption", () => {
  it("cifra cada campo com integridade e não preserva o valor em claro", () => {
    process.env.FIELD_ENCRYPTION_KEY = "test-only-dedicated-field-key-with-adequate-length-123456";
    const original = "responsavel@example.com";
    const encrypted = encryptParentalField(original, "guardian_email");

    expect(encrypted).toMatch(/^enc:v1:/);
    expect(encrypted).not.toContain(original);
    expect(isEncryptedParentalField(encrypted)).toBe(true);
    expect(decryptParentalField(encrypted, "guardian_email")).toBe(original);
  });

  it("recusa a abertura do campo quando ele é associado ao campo errado", () => {
    process.env.FIELD_ENCRYPTION_KEY = "test-only-dedicated-field-key-with-adequate-length-123456";
    const encrypted = encryptParentalField("Documento opcional", "guardian_document");

    expect(() => decryptParentalField(encrypted, "guardian_name")).toThrow();
  });

  it("usa segredo do servidor fora do código quando a chave dedicada ainda não estiver configurada", () => {
    delete process.env.FIELD_ENCRYPTION_KEY;
    process.env.JWT_SECRET = "test-only-session-root-with-adequate-length-123456789";
    const encrypted = encryptParentalField("Responsável", "guardian_name");

    expect(encrypted).not.toContain("Responsável");
    expect(decryptParentalField(encrypted, "guardian_name")).toBe("Responsável");
  });
});
