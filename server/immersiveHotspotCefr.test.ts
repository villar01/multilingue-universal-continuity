import { describe, expect, it } from "vitest";
import { IMMERSIVE_SCENES } from "../client/src/pages/ImmersiveScene";
import { PARETO_VOCAB } from "../client/src/lib/vocab-pareto";

function normalize(value: string) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

describe("hotspots imersivos e progressão CEFR", () => {
  it("mantém os objetos das cenas A1 inglesas no núcleo Pareto de alta frequência", () => {
    const highFrequencyEnglish = new Set(
      PARETO_VOCAB
        .filter((word) => word.frequency >= 8)
        .map((word) => normalize(word.enUS)),
    );
    const beginnerEnglishScenes = IMMERSIVE_SCENES.filter(
      (scene) => scene.langCode === "en" && scene.difficulty === "beginner",
    );

    expect(beginnerEnglishScenes.length).toBeGreaterThan(0);
    const missing: string[] = [];
    for (const scene of beginnerEnglishScenes) {
      for (const hotspot of scene.hotspots) {
        if (!highFrequencyEnglish.has(normalize(hotspot.label))) {
          missing.push(`${scene.id}/${hotspot.id}: ${hotspot.label}`);
        }
      }
    }
    expect(missing, "objetos A1 sem entrada Pareto de alta frequência").toEqual([]);
  });

  it("mantém os objetos das cenas inglesas intermediárias no vocabulário Pareto consolidado", () => {
    const consolidatedEnglish = new Set(
      PARETO_VOCAB
        .filter((word) => word.frequency >= 7)
        .map((word) => normalize(word.enUS)),
    );
    const intermediateEnglishScenes = IMMERSIVE_SCENES.filter(
      (scene) => scene.langCode === "en" && scene.difficulty === "intermediate",
    );
    const missing: string[] = [];

    expect(intermediateEnglishScenes.length).toBeGreaterThan(0);
    for (const scene of intermediateEnglishScenes) {
      for (const hotspot of scene.hotspots) {
        if (!consolidatedEnglish.has(normalize(hotspot.label))) {
          missing.push(`${scene.id}/${hotspot.id}: ${hotspot.label}`);
        }
      }
    }
    expect(missing, "objetos intermediários sem entrada Pareto consolidada").toEqual([]);
  });

  it("protege cenas inglesas avançadas futuras com vocabulário Pareto de expansão", () => {
    const advancedEnglish = new Set(
      PARETO_VOCAB
        .filter((word) => word.frequency >= 6)
        .map((word) => normalize(word.enUS)),
    );
    const missing: string[] = [];
    for (const scene of IMMERSIVE_SCENES.filter((item) => item.langCode === "en" && item.difficulty === "advanced")) {
      for (const hotspot of scene.hotspots) {
        if (!advancedEnglish.has(normalize(hotspot.label))) {
          missing.push(`${scene.id}/${hotspot.id}: ${hotspot.label}`);
        }
      }
    }
    expect(missing, "objetos avançados sem entrada Pareto de expansão").toEqual([]);
  });

  it("preserva exemplos curtos e diretos para cenas iniciantes", () => {
    for (const scene of IMMERSIVE_SCENES.filter((item) => item.difficulty === "beginner")) {
      for (const hotspot of scene.hotspots) {
        expect(hotspot.example.trim().length, `${scene.id}/${hotspot.id}: exemplo vazio`).toBeGreaterThan(0);
        expect(hotspot.example.trim().split(/\s+/).length, `${scene.id}/${hotspot.id}: exemplo inicial longo`).toBeLessThanOrEqual(12);
      }
    }
  });

  it("usa cada objeto inglês no respectivo exemplo de hotspot", () => {
    for (const scene of IMMERSIVE_SCENES.filter((item) => item.langCode === "en")) {
      for (const hotspot of scene.hotspots) {
        const labelTokens = normalize(hotspot.label).split(" ").filter(Boolean);
        const example = normalize(hotspot.example);
        expect(
          labelTokens.some((token) => example.includes(token)),
          `${scene.id}/${hotspot.id}: exemplo sem o objeto ensinado`,
        ).toBe(true);
      }
    }
  });
});
