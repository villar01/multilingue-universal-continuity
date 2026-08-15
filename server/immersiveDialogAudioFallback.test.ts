import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const scenePath = path.resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx");
const source = fs.readFileSync(scenePath, "utf8");

describe("áudio e estado visual do diálogo imersivo", () => {
  it("oferece repetição explícita em inglês e fallback local quando a voz neural não responde", () => {
    expect(source).toContain("trpc.sceneDialogueVoice.speak.useMutation()");
    expect(source).toContain("const playPublicSceneDialogue = useCallback");
    expect(source).toContain("function waitForSpeechResult<T>(task: Promise<T>, timeoutMs: number)");
    expect(source).toContain("12_000,");
    expect(source).toContain("scene-dialogue-speech-timeout");
    expect(source).toContain("const playLocalDialogFallback = useCallback");
    expect(source).toContain("window.speechSynthesis.speak(utterance);");
    expect(source).toContain("A voz neural não respondeu. A fala está usando a voz disponível neste navegador");
    expect(source).toContain('"Ouvir inglês"');
    expect(source).toContain('type: "audio/mpeg"');
    expect(source).toContain("document.body.appendChild(audio)");
  });

  it("não usa tremor ou gesto sintético como substituto de animação facial natural", () => {
    expect(source).toContain('animation: "none"');
    expect(source).not.toContain("scene.teacherAnimation\n              ?");
  });
});
