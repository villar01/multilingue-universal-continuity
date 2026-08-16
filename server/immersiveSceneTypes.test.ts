import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("contratos compartilhados de cenas imersivas", () => {
  it("mantém os tipos de hotspot, diálogo e cena fora do componente de interface", () => {
    const typesSource = readFileSync("shared/immersiveSceneTypes.ts", "utf8");
    expect(typesSource).toContain("export interface Hotspot");
    expect(typesSource).toContain("export interface DialogLine");
    expect(typesSource).toContain("export interface Scene");
  });

  it("reutiliza os contratos compartilhados na cena e na lição", () => {
    const sceneSource = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");
    const lessonSource = readFileSync("client/src/components/SceneLesson.tsx", "utf8");
    expect(sceneSource).toContain('import type { DialogLine, Hotspot, Scene } from "@shared/immersiveSceneTypes"');
    expect(lessonSource).toContain("import type { Scene, Hotspot } from '@shared/immersiveSceneTypes'");
  });
});
