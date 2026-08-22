import { describe, expect, it } from "vitest";
import { IMMERSIVE_SCENES } from "../client/src/lib/immersiveScenesCatalog";
import { SECURE_SCENE_SEEDS } from "./curriculum/secureSceneSeeds";
import { verifyImmersiveQuality } from "./immersiveQualityVerifier";

describe("verificação determinística de qualidade imersiva", () => {
  it("confirma as 29 cenas, matrizes docentes e currículo protegido sem expor conteúdo ao catálogo público", () => {
    const report = verifyImmersiveQuality();

    expect(report).toMatchObject({ status: "passed", issueCount: 0 });
    expect(report.verifications).toEqual([
      expect.objectContaining({ kind: "scene_catalog", status: "passed" }),
      expect.objectContaining({ kind: "teacher_media", status: "passed" }),
    ]);
  });

  it("detecta inconsistências sem modificar as cenas, o currículo ou a mídia", () => {
    const invalidScene = { ...IMMERSIVE_SCENES[0], bgImage: "", dialog: [{ exposed: true }] };
    const report = verifyImmersiveQuality([invalidScene], { [invalidScene.id]: SECURE_SCENE_SEEDS[invalidScene.id] });

    expect(report.status).toBe("failed");
    expect(report.issueCount).toBeGreaterThan(0);
    expect(report.summary).toContain("Nenhuma alteração automática");
  });
});
