import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"), "utf8");
const scenesStart = source.indexOf("export const IMMERSIVE_SCENES: Scene[] = [");
const scenesEnd = source.indexOf("function getInitialScene", scenesStart);
const scenesCatalog = source.slice(scenesStart, scenesEnd);

describe("fluxo compartilhado das cenas imersivas", () => {
  it("mantém o catálogo de 29 cenas em uma única tela com uma única cadeia de pergunta, resposta e voz", () => {
    expect(scenesStart).toBeGreaterThan(-1);
    expect((scenesCatalog.match(/^\s*id:\s*"/gm) || [])).toHaveLength(29);
    expect((source.match(/const askImmersiveTutor = useCallback/g) || [])).toHaveLength(1);
    expect((source.match(/const requestSpeechSafely = useCallback/g) || [])).toHaveLength(1);
    expect((source.match(/const playTeacherAudio = useCallback/g) || [])).toHaveLength(1);
  });

  it("prioriza a faixa Edge direta antes da alternativa remota e não vincula o fluxo comum a James ou à Praia", () => {
    const sharedSpeech = source.slice(source.indexOf("const speak = useCallback"), source.indexOf("const requestSpeechSafely = useCallback"));
    expect(sharedSpeech.indexOf("if (await playEdgeNeural()) return;")).toBeLessThan(sharedSpeech.indexOf("const googleAudio"));
    expect(sharedSpeech).toContain('audioBase64ToDataUrl(edgeAudio.audioBase64, "audio/mpeg")');
    expect(sharedSpeech).not.toContain('selectedScene?.id === "beach"');
  });
});
