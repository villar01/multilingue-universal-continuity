import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("portão de publicação da Cena Imersiva", () => {
  it("obriga tipagem e regressões completas antes do build de produção", () => {
    const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts["validate:immersive-scene-authenticated"]).toBe("node scripts/verify-immersive-scene-authenticated.mjs");
    expect(packageJson.scripts["validate:immersive-scene-render"]).toBe("vitest run server/immersiveSceneCriticalFlow.test.ts server/immersiveSceneRecoveryBoundary.test.ts");
    expect(packageJson.scripts["validate:immersive-scene-release"]).toBe("pnpm check && pnpm validate:immersive-scene-authenticated && pnpm validate:immersive-scene-render && pnpm test");
    expect(packageJson.scripts.build).toBe("pnpm validate:immersive-scene-release && pnpm build:app");
  });

  it("mantém regressões da cena, do acesso protegido e da recuperação local dentro da suíte obrigatória", () => {
    const criticalFlow = readFileSync(resolve(process.cwd(), "server/immersiveSceneCriticalFlow.test.ts"), "utf8");
    const recovery = readFileSync(resolve(process.cwd(), "server/immersiveSceneRecoveryBoundary.test.ts"), "utf8");
    const auth = readFileSync(resolve(process.cwd(), "server/immersiveUnauthenticatedDialogueBlock.test.ts"), "utf8");

    expect(criticalFlow).toContain("canUseAuthorizedSceneInteractions");
    expect(recovery).toContain("ResilientImmersiveScene");
    expect(auth).toContain("isAuthenticated");
  });
});
