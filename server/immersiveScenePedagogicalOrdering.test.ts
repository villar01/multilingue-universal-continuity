import { describe, expect, it } from "vitest";
import {
  IMMERSIVE_SCENES,
  PEDAGOGICAL_DIFFICULTY_ORDER,
} from "../client/src/lib/immersiveScenesCatalog";

describe("ordem pedagógica das cenas imersivas", () => {
  it("mantém as 29 cenas e apresenta dificuldade não decrescente", () => {
    expect(IMMERSIVE_SCENES).toHaveLength(29);
    for (let index = 1; index < IMMERSIVE_SCENES.length; index += 1) {
      const previous = IMMERSIVE_SCENES[index - 1];
      const current = IMMERSIVE_SCENES[index];
      expect(PEDAGOGICAL_DIFFICULTY_ORDER[previous.difficulty]).toBeLessThanOrEqual(
        PEDAGOGICAL_DIFFICULTY_ORDER[current.difficulty],
      );
    }
  });
});
