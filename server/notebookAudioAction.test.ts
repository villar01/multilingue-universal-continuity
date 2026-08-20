import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const immersiveSceneSource = readFileSync(
  new URL("../client/src/pages/ImmersiveScene.tsx", import.meta.url),
  "utf8",
);

describe("áudio do Caderno de Anotações", () => {
  it("encaminha o clique explícito para a fala com reprodução imediata", () => {
    expect(immersiveSceneSource).toContain("const speakNotebookEntry = useCallback");
    expect(immersiveSceneSource).toContain('speak(text, language, undefined, undefined, "teacher", true)');
    expect(immersiveSceneSource).toContain("onSpeak={speakNotebookEntry}");
  });
});
