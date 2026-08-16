import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const hookSource = readFileSync(new URL("../client/src/lib/tts-viseme-sync.ts", import.meta.url), "utf8");
const sceneSource = readFileSync(new URL("../client/src/pages/ImmersiveScene.tsx", import.meta.url), "utf8");

describe("estabilidade do sincronizador de visemas", () => {
  it("mantém as operações do sincronizador estáveis entre renderizações", () => {
    expect(hookSource).toContain("const start = React.useCallback");
    expect(hookSource).toContain("const stop = React.useCallback");
    expect(hookSource).toContain("const syncWithAudio = React.useCallback");
    expect(hookSource).toContain("const primeAudioContext = React.useCallback");
    expect(hookSource).toContain("return { start, stop, pause, resume, syncWithAudio, primeAudioContext };");
  });

  it("limpa o áudio do professor somente quando a função estável de parada muda", () => {
    expect(sceneSource).toContain("useEffect(() => () => stopTeacherAudio(), [stopTeacherAudio]);");
    expect(sceneSource).toContain("const { stop: stopVisemeSync, primeAudioContext: primeVisemeAudio } = useTTSVisemeSync(handleAudioViseme);");
    expect(sceneSource).toContain("const audio = dialogAudioElementRef.current;");
  });
});
