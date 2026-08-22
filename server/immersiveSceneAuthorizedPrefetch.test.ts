import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sceneSource = () => readFileSync(
  resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"),
  "utf8",
);

describe("prefetch autorizado da Cena Imersiva", () => {
  it("prepara apenas as três respostas curriculares comuns no cache tRPC", () => {
    const source = sceneSource();
    expect(source).toContain("const curriculumUtils = trpc.useUtils()");
    expect(source).toContain("curriculumUtils.curriculum.localizedSceneDialogue.prefetch");
    expect(source).toContain("curriculumUtils.curriculum.sceneInteractionProgression.prefetch");
    expect(source).toContain("curriculumUtils.curriculum.sceneCanonicalMaterial.prefetch");
  });

  it("inicia o prefetch somente depois que authorizeLesson confirma acesso", () => {
    const source = sceneSource();
    const authorizationIndex = source.indexOf("if (!cancelled && access.allowed)");
    const prefetchIndex = source.indexOf("curriculumUtils.curriculum.localizedSceneDialogue.prefetch");
    expect(authorizationIndex).toBeGreaterThan(-1);
    expect(prefetchIndex).toBeGreaterThan(authorizationIndex);
    expect(source.slice(authorizationIndex, prefetchIndex)).toContain("const authorizedMaterial");
  });

  it("não antecipa síntese de voz, gravação ou tutor de IA", () => {
    const source = sceneSource();
    expect(source).not.toMatch(/tts(?:Google)?\.\w+\.prefetch/);
    expect(source).not.toMatch(/immersiveSceneTutor\.\w+\.prefetch/);
    expect(source).not.toMatch(/voiceTranscription\.\w+\.prefetch/);
  });
});
