import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const guideSource = readFileSync("client/src/components/LipSyncSetupGuide.tsx", "utf8");
const notificationSource = readFileSync("client/src/components/LocalAINotification.tsx", "utf8");

describe("guia opcional no início de jornada", () => {
  it("abre automaticamente somente na rota inicial e não sobrepõe onboarding ou cenas", () => {
    expect(guideSource).toContain('const START_ROUTES = new Set(["/"]);');
    expect(guideSource).not.toContain('"/onboarding"');
    expect(guideSource).toContain("if (!open || !START_ROUTES.has(location)) return null;");
    expect(guideSource).toContain("setOpen(false);");
  });

  it("mantém o aviso secundário fora de lições e cenas", () => {
    expect(notificationSource).toContain("const isJourneyStartRoute = location === '/';");
    expect(notificationSource).toContain("if (!visible || !isJourneyStartRoute) return null;");
    expect(notificationSource).not.toContain("install automatically");
  });
});
