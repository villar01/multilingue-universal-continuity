import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const termsSource = readFileSync(resolve(process.cwd(), "client/src/pages/TermsOfUse.tsx"), "utf8");

describe("terms collection privacy", () => {
  it("does not collect a selfie or invoke browser camera access", () => {
    expect(termsSource).not.toContain("getUserMedia");
    expect(termsSource).not.toContain("selfieDataUrl");
    expect(termsSource).not.toContain("Tirar Foto");
  });

  it("labels guardian document and contact as optional", () => {
    expect(termsSource).toContain("CPF / Documento (opcional)");
    expect(termsSource).toContain("E-mail do responsável (opcional)");
  });

  it("does not require a photo or claim tracking in the minor warning", () => {
    expect(termsSource).not.toContain("foto de identificação");
    expect(termsSource).not.toContain("autorização e foto");
    expect(termsSource).not.toContain("Dados falsos são rastreados");
    expect(termsSource).toContain("Menor de 18 anos detectado");
  });
});
