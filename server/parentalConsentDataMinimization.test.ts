import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const routerSource = readFileSync(resolve(process.cwd(), "server/compliance-router.ts"), "utf8");
const notificationSource = readFileSync(resolve(process.cwd(), "server/parentalConsentPrivacy.ts"), "utf8");
const consentSection = routerSource.slice(
  routerSource.indexOf("submitParentalConsent: protectedProcedure"),
  routerSource.indexOf("revokeParentalConsent: protectedProcedure"),
);

describe("minimização de dados do consentimento parental", () => {
  it("aceita somente os dados necessários e os contatos explicitamente opcionais", () => {
    expect(consentSection).toContain("guardianName:");
    expect(consentSection).toContain("guardianDocument:");
    expect(consentSection).toContain("guardianEmail:");
    expect(consentSection).toContain("relationship:");
    expect(consentSection).toContain("userAge:");
  });

  it("não recebe nem persiste IP ou agente de usuário no consentimento", () => {
    expect(consentSection).not.toMatch(/ipAddress|userAgent/i);
    expect(consentSection).not.toMatch(/ip_address|user_agent/i);
  });

  it("mantém a notificação ao proprietário sem identidade ou contato do responsável", () => {
    expect(consentSection).toContain("createParentalConsentNotification()");
    expect(notificationSource).not.toMatch(/guardian(Name|Email|Document)|responsável/i);
  });
});
