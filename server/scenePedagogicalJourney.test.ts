import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  IMMERSIVE_SCENES,
  PEDAGOGICAL_DIFFICULTY_ORDER,
  orderScenesForPedagogicalJourney,
} from "../client/src/lib/immersiveScenesCatalog";

describe("jornada pedagógica das cenas imersivas", () => {
  it("mantém a dificuldade em ordem ascendente mesmo quando há idioma alvo", () => {
    const journey = orderScenesForPedagogicalJourney([...IMMERSIVE_SCENES].reverse(), "en-US");
    const ranks = journey.map((scene) => PEDAGOGICAL_DIFFICULTY_ORDER[scene.difficulty]);

    expect(journey).toHaveLength(29);
    expect(ranks.every((rank, index) => index === 0 || rank >= ranks[index - 1])).toBe(true);
    expect(journey[0]?.difficulty).toBe("beginner");
  });

  it("prioriza o idioma alvo somente entre cenas da mesma etapa", () => {
    const journey = orderScenesForPedagogicalJourney(IMMERSIVE_SCENES, "en-US");
    const firstIntermediate = journey.findIndex((scene) => scene.difficulty === "intermediate");

    expect(journey[0]?.teacherLang.startsWith("en")).toBe(true);
    expect(journey.slice(0, firstIntermediate).every((scene) => scene.difficulty === "beginner")).toBe(true);
  });

  it("faz a galeria e o avanço para a próxima cena usarem a proteção de jornada central", () => {
    const source = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");
    expect(source).toContain("orderScenesForPedagogicalJourney");
    expect(source).toContain("const pedagogicalSceneJourney = orderScenesForPedagogicalJourney(IMMERSIVE_SCENES, targetLang);");
    expect(source).toContain("const filteredScenes = pedagogicalSceneJourney.filter");
    expect(source).toContain("const idx = pedagogicalSceneJourney.findIndex");
    expect(source).toContain("const next = pedagogicalSceneJourney[(idx + 1) % pedagogicalSceneJourney.length];");
  });
});
