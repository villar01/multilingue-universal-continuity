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
    expect(source).toContain("audioBase64ToObjectUrl");
    expect(source).toContain("dialogAudioObjectUrlRef");
    expect(source).toContain("const replayVisibleDialogAudio = useCallback");
    expect(source).toContain("▶ Ouvir James");
    expect(source).not.toContain('audio.removeAttribute("src")');
    expect(source).toContain("src={dialogAudioSource || undefined}");
    expect(source).toContain("const dialogAudioElementRef = useRef<HTMLAudioElement | null>(null)");
    expect(source).toContain("const audio = dialogAudioElementRef.current;");
    expect(source).toContain("ref={dialogAudioElementRef}");
    expect(source).not.toContain("document.body.appendChild(audio)");
  });

  it("não usa tremor ou gesto sintético como substituto de animação facial natural", () => {
    expect(source).toContain('animation: "none"');
    expect(source).not.toContain("scene.teacherAnimation\n              ?");
  });

  it("oferece escolha direta da voz do navegador para visitante após o gesto do aluno", () => {
    expect(source).toContain("const playGuestBrowserVoice");
    expect(source).toContain("browser-dialog:");
    expect(source).toContain("Usar voz do navegador");
    expect(source).toContain("playGuestBrowserVoice(teacherSpeech.text");
  });

  it("nunca troca James por voz feminina quando o fallback local não encontra inglês masculino", () => {
    expect(source).toContain("const maleVoicePattern");
    expect(source).toContain("if (gender && !preferredVoice) return false;");
    expect(source).toContain("playLocalDialogFallback(text, language, requestKey, gender)");
  });
});
