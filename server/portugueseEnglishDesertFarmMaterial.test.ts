import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getSecureSceneSeed, getSecureSceneSeedForLanguage } from "./curriculum/secureSceneSeeds";
import { PT_BR_ENGLISH_REMAINING_VOCABULARY } from "./curriculum/ptEnglishSceneVocabulary";

const sceneSource = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");
const routerSource = readFileSync("server/curriculum-router.ts", "utf8");

describe("material protegido de Deserto e Fazenda para Português–Inglês", () => {
  it.each([
    ["desert", ["Sand", "Caravan", "Sun", "Footprints", "Dune"]],
    ["farm", ["Cow", "Barn", "Wheat", "Tractor", "Chicken", "Sky"]],
    ["library", ["Book", "Shelf", "Reading Table", "Lamp", "Catalog", "Quiet"]],
    ["office", ["Computer", "Desk", "Phone", "Window", "Coffee Machine", "Folder"]],
    ["metro", ["Train", "Platform", "Sign", "Door", "Ticket", "Corridor"]],
    ["hotel", ["Reception", "Chandelier", "Column", "Armchair", "Plant", "Lamp"]],
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
    expect(getSecureSceneSeed("office")?.hotspots[0]?.label).toBe("Компьютер");
    expect(getSecureSceneSeed("metro")?.hotspots[0]?.label).toBe("Train");
    expect(getSecureSceneSeed("hotel")?.hotspots[1]?.label).toBe("Lampadario");
    expect(getSecureSceneSeedForLanguage("desert", "ar-SA", "pt-BR")?.hotspots[0]?.label).toBe("رمل");
    expect(getSecureSceneSeedForLanguage("farm", "pl-PL", "pt-BR")?.hotspots[0]?.label).toBe("Krowa");
    expect(getSecureSceneSeedForLanguage("library", "pl-PL", "pt-BR")?.hotspots[0]?.label).toBe("Książka");
    expect(getSecureSceneSeedForLanguage("office", "ru-RU", "pt-BR")?.hotspots[0]?.label).toBe("Компьютер");
    expect(getSecureSceneSeedForLanguage("metro", "fr-FR", "pt-BR")?.hotspots[1]?.label).toBe("Quai");
    expect(getSecureSceneSeedForLanguage("hotel", "it-IT", "pt-BR")?.hotspots[1]?.label).toBe("Lampadario");
  });

  it("entrega inglês para toda cena remanescente do catálogo PT-BR→EN", () => {
    for (const [sceneId, vocabulary] of Object.entries(PT_BR_ENGLISH_REMAINING_VOCABULARY)) {
      const material = getSecureSceneSeedForLanguage(sceneId, "en-US", "pt-BR");
      expect(material?.hotspots.map((hotspot) => hotspot.label), sceneId).toEqual(vocabulary.terms.map((term) => term.label));
      expect(material?.dialog.every((line) => /^[\x00-\x7F]+$/.test(line.text)), sceneId).toBe(true);
      expect(material?.dialog.every((line) => line.textPt.trim().length > 0), sceneId).toBe(true);
    }
  });

  it("mantém James e Ingrid coerentes com a matriz docente em diálogos localizados", () => {
    expect(getSecureSceneSeedForLanguage("hotel", "en-US", "pt-BR")?.dialog[0]?.text).toContain("I am James");
    expect(getSecureSceneSeedForLanguage("paris", "en-US", "pt-BR")?.dialog[0]?.text).toContain("I am James");
    expect(getSecureSceneSeedForLanguage("garden", "en-US", "pt-BR")?.dialog[0]?.text).toContain("I am Ingrid");
  });

  it("encaminha o par de idiomas pela rota protegida antes de renderizar o material canônico", () => {
    expect(routerSource).toContain("getSecureSceneSeedForLanguage(input.sceneId, input.targetLanguage, input.nativeLanguage)");
    expect(sceneSource).toContain("targetLanguage: targetLang,");
    expect(sceneSource).toContain("nativeLanguage: nativeLang,");
  });
});
