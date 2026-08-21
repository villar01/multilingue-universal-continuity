import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const complianceSource = readFileSync(path.join(root, "server/compliance-router.ts"), "utf8");
const termsSource = readFileSync(path.join(root, "client/src/pages/TermsOfUse.tsx"), "utf8");

describe("minimização do aceite de termos", () => {
  it("aceita somente confirmações necessárias sem selfie, IP ou agente de usuário", () => {
    const acceptTermsSource = complianceSource.slice(
      complianceSource.indexOf("acceptTerms:"),
      complianceSource.indexOf("checkAcceptance:")
    );

    expect(acceptTermsSource).toContain("termsVersion");
    expect(acceptTermsSource).toContain("confirmedAgeVerification");
    expect(acceptTermsSource).not.toMatch(/selfieUrl|selfieTakenAt|ipAddress|userAgent/i);
    expect(termsSource).toContain("Não solicitados:");
    expect(termsSource).not.toMatch(/type="file"|FileReader|navigator\.userAgent|ipAddress/i);
  });
});
