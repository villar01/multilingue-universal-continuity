import { describe, expect, it } from "vitest";
import { hashParentPin, isHashedParentPin, verifyStoredParentPin } from "./parentalPinSecurity";

describe("proteção de PIN parental em repouso", () => {
  it("gera hashes salgados que não expõem o PIN original", () => {
    const first = hashParentPin("4829");
    const second = hashParentPin("4829");
    expect(isHashedParentPin(first)).toBe(true);
    expect(first).toMatch(/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{64}$/);
    expect(first).not.toMatch(/^scrypt\$4829\$/);
    expect(first).not.toBe(second);
  });

  it("aceita somente o PIN correto e mantém compatibilidade de leitura para valor legado", () => {
    const stored = hashParentPin("4829");
    expect(verifyStoredParentPin(stored, "4829")).toBe(true);
    expect(verifyStoredParentPin(stored, "0000")).toBe(false);
    expect(verifyStoredParentPin("1234", "1234")).toBe(true);
    expect(verifyStoredParentPin("1234", "0000")).toBe(false);
  });
});
