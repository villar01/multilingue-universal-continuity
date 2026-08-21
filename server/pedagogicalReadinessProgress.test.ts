import { describe, expect, it } from "vitest";
import { derivePedagogicalReadiness } from "./curriculum/learningLevelRoles";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("prontidão pedagógica protegida", () => {
  it("não transforma pontos ou lições em domínio ou passagem curricular", () => {
    const readiness = derivePedagogicalReadiness({ completedLessons: 12, totalPoints: 1080 });
    expect(readiness.observedLessonBand).toBe("intermediate");
    expect(readiness.currentLevel).toBe("initial");
    expect(readiness.averageMastery).toBeNull();
    expect(readiness.masteryStatus).toBe("awaiting_assessed_responses");
    expect(readiness.meetsMasteryThreshold).toBe(false);
    expect(readiness.evidenceStatus).toBe("not_collected");
    expect(readiness.canUnlockCurriculum).toBe(false);
  });

  it("entrega prontidão somente pela rota de progresso protegida", () => {
    const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    expect(routerSource).toContain("pedagogicalReadiness: derivePedagogicalReadiness(progress ?? {})");
    expect(routerSource).toContain("getCourseProgress: protectedProcedure");
  });

  it("apresenta faixa por lições sem tratar essa referência como domínio confirmado", () => {
    const dashboardSource = readFileSync(resolve(process.cwd(), "client/src/pages/DashboardReal.tsx"), "utf8");
    expect(dashboardSource).toContain("Etapa pedagógica confirmada:");
    expect(dashboardSource).toContain("Faixa observada pelas lições:");
    expect(dashboardSource).toContain("respostas avaliadas registrarem as evidências pedagógicas exigidas");
  });
});
