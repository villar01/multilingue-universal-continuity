import { describe, expect, it } from "vitest";
import { derivePedagogicalReadiness } from "./curriculum/learningLevelRoles";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("prontidão pedagógica protegida", () => {
  it("deriva domínio somente de progresso real e não libera currículo por XP", () => {
    const readiness = derivePedagogicalReadiness({ completedLessons: 12, totalPoints: 1080 });
    expect(readiness.currentLevel).toBe("intermediate");
    expect(readiness.averageMastery).toBe(0.9);
    expect(readiness.meetsMasteryThreshold).toBe(true);
    expect(readiness.evidenceStatus).toBe("pending_verification");
    expect(readiness.canUnlockCurriculum).toBe(false);
  });

  it("entrega prontidão somente pela rota de progresso protegida", () => {
    const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    expect(routerSource).toContain("pedagogicalReadiness: derivePedagogicalReadiness(progress ?? {})");
    expect(routerSource).toContain("getCourseProgress: protectedProcedure");
  });
});
