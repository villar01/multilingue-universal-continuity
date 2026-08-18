import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getTrialExpiryDate, hasFullCurriculumAccess, isTrialExpired, TRIAL_DURATION_DAYS } from "./trial-access-policy";

const projectRoot = resolve(import.meta.dirname, "..");

describe("proteção temporal da avaliação", () => {
  it("limita avaliações a quatorze dias sem reduzir o acesso de assinaturas ou administração", () => {
    const startedAt = new Date("2026-08-01T12:00:00.000Z");
    const expiresAt = getTrialExpiryDate(null, startedAt);

    expect(TRIAL_DURATION_DAYS).toBe(14);
    expect(expiresAt.toISOString()).toBe("2026-08-15T12:00:00.000Z");
    expect(isTrialExpired(expiresAt, new Date("2026-08-14T12:00:00.000Z"))).toBe(false);
    expect(isTrialExpired(expiresAt, new Date("2026-08-15T12:00:00.000Z"))).toBe(true);
    expect(hasFullCurriculumAccess({ subscriptionType: "free", role: "user" })).toBe(false);
    expect(hasFullCurriculumAccess({ subscriptionType: "premium", role: "user" })).toBe(true);
    expect(hasFullCurriculumAccess({ subscriptionType: "free", role: "admin" })).toBe(true);
  });

  it("mantém expiração, autorização e currículo limitado no servidor", () => {
    const schema = readFileSync(resolve(projectRoot, "drizzle/schema.ts"), "utf8");
    const router = readFileSync(resolve(projectRoot, "server/trial-access-router.ts"), "utf8");
    const curriculumRouter = readFileSync(resolve(projectRoot, "server/curriculum-router.ts"), "utf8");

    expect(schema).toContain('expiresAt: timestamp("expires_at")');
    expect(router).toContain("O período gratuito de 14 dias foi concluído.");
    expect(router).toContain('status: "expired"');
    expect(curriculumRouter).toContain("entitlement.hasFullCurriculum ? programWords : programWords.slice(0, 10)");
  });
});
