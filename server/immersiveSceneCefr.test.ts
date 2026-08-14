import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(import.meta.dirname, "../client/src/pages/ImmersiveScene.tsx"), "utf8");

describe("Cena imersiva com progressão CEFR", () => {
  it("expõe as seis etapas CEFR no filtro de cenas", () => {
    expect(source).toContain('type ImmersiveCEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2"');
    for (const level of ["A1", "A2", "B1", "B2", "C1", "C2"]) {
      expect(source).toContain(`value: "${level}"`);
    }
    expect(source).toContain('sceneCefrLevel(s) !== filter');
  });

  it("mantém hotspots e prática Pareto vinculados ao estágio individual da cena", () => {
    expect(source).toContain('level={sceneCefrLevel(selectedScene)}');
    expect(source).toContain('practiceLevel={selectedScene ? sceneCefrLevel(selectedScene) : "A1"}');
    expect(source).toContain('cefrLabel(sceneCefrLevel(scene))');
  });
});
