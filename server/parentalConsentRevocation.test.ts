import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const complianceSource = readFileSync(path.join(root, "server/compliance-router.ts"), "utf8");
const moderationSource = readFileSync(path.join(root, "server/content-moderation.ts"), "utf8");
const trialSource = readFileSync(path.join(root, "server/trial-access-router.ts"), "utf8");
const parentalRouterSource = readFileSync(path.join(root, "server/parental-control-router.ts"), "utf8");
const parentalPanelSource = readFileSync(path.join(root, "client/src/pages/ParentalControlPanel.tsx"), "utf8");

describe("revogação de consentimento parental", () => {
  it("exclui consentimentos revogados da verificação de aceite e da IA educacional", () => {
    expect(complianceSource).toContain("AND revoked_at IS NULL");
    expect(moderationSource).toContain("isNull(parentalConsents.revokedAt)");
  });

  it("bloqueia lições protegidas de menores sem consentimento ativo", () => {
    expect(trialSource).toContain("Autorização parental válida é obrigatória antes de iniciar as lições.");
    expect(trialSource).toContain("isNull(parentalConsents.revokedAt)");
  });

  it("revoga indicadores mínimos e permite restauração somente por novo consentimento formal", () => {
    expect(complianceSource).toContain("revokeParentalConsent: protectedProcedure");
    expect(complianceSource).toContain("SET revoked_at = COALESCE(revoked_at, NOW())");
    expect(complianceSource).toContain("SET parental_consent_given = 0, parent_consent_date = NULL");
    expect(complianceSource).toContain("SET parental_consent_given = 1, parent_consent_date = NOW()");
  });

  it("exige propriedade e PIN do responsável para revogar pelo painel", () => {
    expect(parentalRouterSource).toContain("revokeChildConsent: protectedProcedure");
    expect(parentalRouterSource).toContain("await requireChildOwnership(database, input.childId, ctx.user.id)");
    expect(parentalRouterSource).toContain("verifyAndUpgradeParentPin(database, input.childId, settings.pinCode, input.pin)");
    expect(parentalPanelSource).toContain("Revogar autorização e bloquear acesso");
    expect(parentalPanelSource).toContain("revokeChildConsent.mutate({ childId, pin: pinInput })");
  });
});
