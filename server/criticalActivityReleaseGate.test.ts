import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("portão de continuidade das atividades críticas", () => {
  it("mantém o contrato de recuperação, isolamento e restauração manual como etapa obrigatória do build", () => {
    const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf8")) as { scripts: Record<string, string> };
    const releaseScript = packageJson.scripts["validate:immersive-scene-release"];

    expect(releaseScript).toContain("pnpm validate:critical-activity-recovery");
    expect(packageJson.scripts["validate:critical-activity-recovery"]).toContain("criticalRecoveryCoverage.test.ts");
    expect(packageJson.scripts["validate:critical-activity-recovery"]).toContain("disasterRecoveryKit.test.ts");
  });

  it("mantém as fronteiras de recuperação locais sem chamadas de gravação ou restauração de dados", () => {
    const lessonBoundary = readFileSync(resolve(process.cwd(), "client/src/components/LessonRecoveryBoundary.tsx"), "utf8");
    const activityBoundary = readFileSync(resolve(process.cwd(), "client/src/components/ActivityRecoveryBoundary.tsx"), "utf8");

    for (const source of [lessonBoundary, activityBoundary]) {
      expect(source).not.toContain("trpc.");
      expect(source).not.toContain("mutate(");
      expect(source).not.toContain("fetch(");
      expect(source).toContain("autoRecoveryUsed");
      expect(source).toContain("retryKey");
    }
  });
});
