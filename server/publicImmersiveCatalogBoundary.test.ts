import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { IMMERSIVE_SCENES } from "../client/src/lib/immersiveScenesCatalog";

const projectRoot = resolve(import.meta.dirname, "..");
const catalogSource = readFileSync(resolve(projectRoot, "client/src/lib/immersiveScenesCatalog.ts"), "utf8");
const immersiveSceneSource = readFileSync(resolve(projectRoot, "client/src/pages/ImmersiveScene.tsx"), "utf8");

describe("fronteira do catálogo público de cenas imersivas", () => {
  it("mantém apenas as 29 prévias visuais e listas pedagógicas vazias no cliente", () => {
    expect(IMMERSIVE_SCENES).toHaveLength(29);
    for (const scene of IMMERSIVE_SCENES) {
      expect(scene.dialog).toEqual([]);
      expect(scene.hotspots).toEqual([]);
    }
  });

  it("não importa sementes ou material curricular do servidor para o pacote do navegador", () => {
    expect(catalogSource).not.toContain("secureSceneSeeds");
    expect(catalogSource).not.toContain("localizedSceneMaterial");
    expect(catalogSource).not.toContain("ptEnglishSceneVocabulary");
  });

  it("não usa os campos pedagógicos vazios da prévia como fallback no fluxo autenticado", () => {
    expect(immersiveSceneSource).not.toContain("selectedScene?.hotspots");
    expect(immersiveSceneSource).not.toContain("selectedScene?.dialog");
    expect(immersiveSceneSource).toContain("activeSceneHotspots");
    expect(immersiveSceneSource).toContain("activeSceneDialog");
  });
});
