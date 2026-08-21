import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const routerSource = readFileSync(resolve(process.cwd(), "server/moderation-router.ts"), "utf8");
const dashboardSource = readFileSync(resolve(process.cwd(), "client/src/pages/AdminModeration.tsx"), "utf8");
const pendingAlertsSection = routerSource.slice(
  routerSource.indexOf("getPendingAlerts: protectedProcedure"),
  routerSource.indexOf("getRecentLogs: protectedProcedure"),
);

describe("alertas pendentes de moderação minimizados", () => {
  it("entrega somente o identificador interno e a classificação necessária para revisão", () => {
    expect(pendingAlertsSection).toContain("id: moderationAlerts.id");
    expect(pendingAlertsSection).toContain("violationType: moderationAlerts.violationType");
    expect(pendingAlertsSection).toContain("severity: moderationAlerts.severity");
    expect(pendingAlertsSection).toContain("status: moderationAlerts.status");
    expect(pendingAlertsSection).toContain("actionTaken: moderationAlerts.actionTaken");
    expect(pendingAlertsSection).toContain("createdAt: moderationAlerts.createdAt");
  });

  it("não entrega nem renderiza conteúdo detectado ou identificação do aluno", () => {
    for (const forbiddenField of [
      "userId: moderationAlerts.userId",
      "detectedContent: moderationAlerts.detectedContent",
      "violatedRules: moderationAlerts.violatedRules",
      "reviewNotes: moderationAlerts.reviewNotes",
    ]) {
      expect(pendingAlertsSection).not.toContain(forbiddenField);
    }

    expect(dashboardSource).not.toContain("alert.userId");
    expect(dashboardSource).not.toContain("alert.detectedContent");
    expect(dashboardSource).not.toContain("flaggedContent");
  });
});
