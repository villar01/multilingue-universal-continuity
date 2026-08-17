import { describe, expect, it } from "vitest";
import { getSecureSceneSeed, getSecureSceneSeedCatalog } from "./curriculum/secureSceneSeeds";

const CANONICAL_SCENES = [
  "beach", "cafe", "forest", "paris", "newyork", "kitchen", "restaurant", "hotel", "supermarket", "school",
  "mountain", "airport", "park", "hospital", "museum", "port", "medieval", "cinema", "spa", "tokyo",
  "desert", "farm", "gym", "library", "office", "metro", "garden", "family_home", "airport_family",
] as const;

describe("catálogo automático de cobertura das 29 cenas", () => {
  it("mantém exatamente as 29 cenas curriculares esperadas", () => {
    expect(getSecureSceneSeedCatalog().map((item) => item.sceneId).sort()).toEqual([...CANONICAL_SCENES].sort());
  });

  it("garante diálogo, objetos, exemplos e traduções em todas as cenas", () => {
    for (const sceneId of CANONICAL_SCENES) {
      const seed = getSecureSceneSeed(sceneId);
      expect(seed, `${sceneId} precisa ter currículo protegido`).not.toBeNull();
      expect(seed!.dialog.length, `${sceneId} precisa ter diálogo guiado`).toBeGreaterThanOrEqual(6);
      expect(seed!.hotspots.length, `${sceneId} precisa oferecer ao menos quatro objetos de entrada`).toBeGreaterThanOrEqual(4);
      expect(seed!.dialog.some((line) => line.speaker === "teacher"), `${sceneId} precisa ter fala do professor`).toBe(true);
      expect(seed!.dialog.some((line) => line.speaker === "user"), `${sceneId} precisa ter prática do aluno`).toBe(true);
      for (const hotspot of seed!.hotspots) {
        expect(hotspot.label.trim(), `${sceneId}:${hotspot.id} precisa ter palavra`).not.toHaveLength(0);
        expect(hotspot.translation.trim(), `${sceneId}:${hotspot.id} precisa ter tradução`).not.toHaveLength(0);
        expect(hotspot.example.trim(), `${sceneId}:${hotspot.id} precisa ter frase`).not.toHaveLength(0);
        expect(hotspot.examplePt.trim(), `${sceneId}:${hotspot.id} precisa ter tradução da frase`).not.toHaveLength(0);
      }
    }
  });
});
