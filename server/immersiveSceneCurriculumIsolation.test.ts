import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { IMMERSIVE_SCENES } from "../client/src/lib/immersiveScenesCatalog";

const projectFile = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("isolamento curricular da Cena Imersiva", () => {
  it("mantém as 29 prévias públicas sem diálogos ou hotspots curriculares", () => {
    expect(IMMERSIVE_SCENES).toHaveLength(29);
    for (const scene of IMMERSIVE_SCENES) {
      expect(scene.dialog).toEqual([]);
      expect(scene.hotspots).toEqual([]);
    }
  });

  it("impede que o catálogo visual do cliente importe sementes, roteiro ou vocabulário protegido", () => {
    const catalog = projectFile("client/src/lib/immersiveScenesCatalog.ts");
    expect(catalog).not.toMatch(/secureSceneSeeds|scenePedagogicalDelivery|paretoContent|abcBookContent/);
    expect(catalog).toContain("buscados exclusivamente por procedimentos autenticados");
  });

  it("exige autorização de lição antes da entrega de diálogo, roteiro, contraste e material canônico", () => {
    const router = projectFile("server/curriculum-router.ts");
    for (const procedure of [
      "localizedSceneDialogue",
      "sceneInteractionProgression",
      "sceneSemanticContrast",
      "sceneCanonicalMaterial",
    ]) {
      const procedureSource = router.slice(router.indexOf(`${procedure}:`), router.indexOf("\n  },", router.indexOf(`${procedure}:`)));
      expect(procedureSource).toContain("await assertCurriculumDelivery(ctx.user.id, input.lessonKey)");
    }
  });
});
