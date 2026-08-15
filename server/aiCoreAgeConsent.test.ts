import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { canUseEducationalAI } from "./content-moderation";

const coreSource = fs.readFileSync(path.resolve(process.cwd(), "server/_core/ai.ts"), "utf8");
const moderationSource = fs.readFileSync(path.resolve(process.cwd(), "server/content-moderation.ts"), "utf8");
const routerSource = fs.readFileSync(path.resolve(process.cwd(), "server/routers.ts"), "utf8");

describe("núcleo de IA com contexto etário confirmado", () => {
  it("bloqueia perfil ausente e menores sem consentimento formal, mas mantém adulto e menor autorizado", () => {
    expect(canUseEducationalAI({ hasSafetyProfile: false, ageGroup: "adulto", hasFormalParentalConsent: false })).toBe(false);
    expect(canUseEducationalAI({ hasSafetyProfile: true, ageGroup: "infantil", hasFormalParentalConsent: false })).toBe(false);
    expect(canUseEducationalAI({ hasSafetyProfile: true, ageGroup: "adolescente", hasFormalParentalConsent: true })).toBe(true);
    expect(canUseEducationalAI({ hasSafetyProfile: true, ageGroup: "adulto", hasFormalParentalConsent: false })).toBe(true);
  });

  it("exige perfil conhecido e consentimento formal completo antes de gerar conteúdo para menores", () => {
    expect(moderationSource).toContain("export async function requireVerifiedAISafetyContext");
    expect(moderationSource).toContain("Perfil etário obrigatório antes de usar a IA educacional.");
    expect(moderationSource).toContain("Autorização parental obrigatória antes de usar a IA educacional.");
    expect(moderationSource).toContain("eq(parentalConsents.confirmedParentalControl, true)");
    expect(moderationSource).toContain("eq(parentalConsents.confirmedLegalCompliance, true)");
  });

  it("remove o contexto adulto fixo das explicações e da pronúncia", () => {
    expect(coreSource).toContain("const safetyContext = await requireVerifiedAISafetyContext(context.userId);");
    expect(coreSource).toContain("const safetyContext = await requireVerifiedAISafetyContext(userId);");
    expect(coreSource).not.toContain('ageGroup: "adulto", // TODO: pegar do perfil');
    expect(coreSource).toContain("...safetyContext,");
  });

  it("faz as rotas protegidas responderem com bloqueio explícito, não erro interno", () => {
    expect(routerSource).toContain("import { AISafetyAccessError } from './content-moderation';");
    expect(routerSource).toContain('code: "FORBIDDEN", message: error.message');
  });
});
