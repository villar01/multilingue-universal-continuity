import { describe, expect, it } from "vitest";
import { IMMERSIVE_SCENES } from "../client/src/lib/immersiveScenesCatalog";
import {
  resolvePedagogicalLevel,
  resolvePedagogicalLevelContract,
  resolveSceneInteractionProgression,
  type InteractionStage,
} from "./curriculum/sceneInteractionProgression";

const requiredStages: readonly InteractionStage[] = [
  "concept",
  "guided_practice",
  "student_response",
  "feedback",
  "transfer",
];

describe("progressão de interação das cenas", () => {
  it("mantém conceito, prática, resposta, correção e aplicação em todos os níveis", () => {
    for (const difficulty of ["beginner", "intermediate", "advanced"] as const) {
      expect(resolveSceneInteractionProgression(difficulty).stages).toEqual(requiredStages);
      expect(resolveSceneInteractionProgression(difficulty).requiresCompatibleTeacherMedia).toBe(true);
    }
  });

  it("aumenta a autonomia de resposta e a profundidade de correção", () => {
    expect(resolveSceneInteractionProgression("beginner")).toMatchObject({
      responseMode: "choice_or_repeat",
      correctionDepth: "direct",
    });
    expect(resolveSceneInteractionProgression("intermediate")).toMatchObject({
      responseMode: "guided_sentence",
      correctionDepth: "structured",
    });
    expect(resolveSceneInteractionProgression("advanced")).toMatchObject({
      responseMode: "open_scenario",
      correctionDepth: "contextual",
    });
  });

  it("cobre as 29 cenas declaradas sem introduzir texto curricular no catálogo público", () => {
    expect(IMMERSIVE_SCENES).toHaveLength(29);
    for (const scene of IMMERSIVE_SCENES) {
      expect(resolveSceneInteractionProgression(scene.difficulty)).toBeDefined();
      expect(scene.dialog).toEqual([]);
      expect(scene.hotspots).toEqual([]);
    }
  });

  it("formaliza inicial, intermediário, avançado e tecnológico sem fingir unidade tecnológica publicada", () => {
    expect(resolvePedagogicalLevel("beginner")).toBe("initial");
    expect(resolvePedagogicalLevel("intermediate")).toBe("intermediate");
    expect(resolvePedagogicalLevel("advanced")).toBe("advanced");
    expect(resolvePedagogicalLevelContract("technological")).toMatchObject({
      responseExpectation: "solve_authentic_multistep_task",
      requiresApprovedUnit: true,
    });
  });
});
