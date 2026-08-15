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
  });

  it("não usa mais o tremor combinado durante a fala", () => {
    expect(source).toContain('? "teacher-breathe 5s ease-in-out infinite"');
    expect(source).not.toContain('? "teacher-talk 1.2s ease-in-out infinite, head-sway 3s ease-in-out infinite"');
  });
});
