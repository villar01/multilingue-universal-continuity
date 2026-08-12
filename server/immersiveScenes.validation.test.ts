import { describe, expect, it } from "vitest";
import { IMMERSIVE_SCENES } from "../client/src/pages/ImmersiveScene";

const NATIVE_LOCALE_BY_TEACHER: Record<string, string> = {
  Ana: "pt-BR",
  Carlos: "es-ES",
  Emre: "tr-TR",
  Giulia: "it-IT",
  Hans: "de-DE",
  Ivan: "ru-RU",
  James: "en-US",
  Maja: "pl-PL",
  Omar: "ar-SA",
  Priya: "en-GB",
  Sophie: "fr-FR",
  Yuki: "ja-JP",
};

describe("catálogo completo de cenas imersivas", () => {
  it("mantém professor, idioma e voz regional coerentes em toda cena", () => {
    for (const scene of IMMERSIVE_SCENES) {
      const expectedLocale = NATIVE_LOCALE_BY_TEACHER[scene.teacherName];
      expect(expectedLocale, `professor sem locale validado: ${scene.teacherName}`).toBeDefined();
      expect(scene.teacherLang, `${scene.id}: locale do professor`).toBe(expectedLocale);
      expect(scene.langCode, `${scene.id}: idioma-base`).toBe(expectedLocale.split("-")[0]);
    }
  });

  it("mantém hotspots únicos e dentro da área visível em todas as cenas", () => {
    for (const scene of IMMERSIVE_SCENES) {
      const ids = scene.hotspots.map((hotspot) => hotspot.id);
      expect(new Set(ids).size, `${scene.id}: ids repetidos`).toBe(ids.length);
      for (const hotspot of scene.hotspots) {
        expect(hotspot.x, `${scene.id}/${hotspot.id}: x`).toBeGreaterThanOrEqual(0);
        expect(hotspot.x, `${scene.id}/${hotspot.id}: x`).toBeLessThanOrEqual(100);
        expect(hotspot.y, `${scene.id}/${hotspot.id}: y`).toBeGreaterThanOrEqual(0);
        expect(hotspot.y, `${scene.id}/${hotspot.id}: y`).toBeLessThanOrEqual(100);
      }
    }
  });

  it("mantém a praia limitada aos quatro objetos visíveis validados", () => {
    const beach = IMMERSIVE_SCENES.find((scene) => scene.id === "beach");
    expect(beach?.hotspots.map((hotspot) => hotspot.id)).toEqual(["palm", "ocean", "wave", "sand"]);
  });
});
