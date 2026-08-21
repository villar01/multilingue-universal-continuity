import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getSecureSceneSeed, getSecureSceneSeedForLanguage } from "./curriculum/secureSceneSeeds";

const sceneSource = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");
const routerSource = readFileSync("server/curriculum-router.ts", "utf8");

describe("material protegido de Deserto e Fazenda para Português–Inglês", () => {
  it.each([
    ["desert", ["Sand", "Caravan", "Sun", "Footprints", "Dune"]],
    ["farm", ["Cow", "Barn", "Wheat", "Tractor", "Chicken", "Sky"]],
    ["library", ["Book", "Shelf", "Reading Table", "Lamp", "Catalog", "Quiet"]],
  ] as const)("entrega rótulos e diálogo em inglês para %s", (sceneId, expectedLabels) => {
    const material = getSecureSceneSeedForLanguage(sceneId, "en-US", "pt-BR");

    expect(material?.hotspots.map((hotspot) => hotspot.label)).toEqual(expectedLabels);
    expect(material?.dialog.every((line) => /^[\x00-\x7F]+$/.test(line.text))).toBe(true);
    expect(material?.dialog.every((line) => line.textPt.trim().length > 0)).toBe(true);
  });

  it("preserva as sementes originais para seus próprios pares de idioma", () => {
    expect(getSecureSceneSeed("desert")?.hotspots[0]?.label).toBe("رمل");
    expect(getSecureSceneSeed("farm")?.hotspots[0]?.label).toBe("Krowa");
    expect(getSecureSceneSeed("library")?.hotspots[0]?.label).toBe("Książka");
    expect(getSecureSceneSeedForLanguage("desert", "ar-SA", "pt-BR")?.hotspots[0]?.label).toBe("رمل");
    expect(getSecureSceneSeedForLanguage("farm", "pl-PL", "pt-BR")?.hotspots[0]?.label).toBe("Krowa");
    expect(getSecureSceneSeedForLanguage("library", "pl-PL", "pt-BR")?.hotspots[0]?.label).toBe("Książka");
  });

  it("encaminha o par de idiomas pela rota protegida antes de renderizar o material canônico", () => {
    expect(routerSource).toContain("getSecureSceneSeedForLanguage(input.sceneId, input.targetLanguage, input.nativeLanguage)");
    expect(sceneSource).toContain("targetLanguage: targetLang,");
    expect(sceneSource).toContain("nativeLanguage: nativeLang,");
  });
});
