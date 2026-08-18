import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const readClient = (relativePath: string) => fs.readFileSync(path.join(root, "client/src", relativePath), "utf8");

describe("contrato global de reprodução de voz", () => {
  it("mantém fonte Blob persistente, player único e acionamento explícito nas cenas imersivas", () => {
    const scene = readClient("pages/ImmersiveScene.tsx");
    const audioSource = readClient("lib/audioSource.ts");

    expect(audioSource).toContain("export function audioBase64ToObjectUrl");
    expect(scene).toContain('import { audioBase64ToObjectUrl } from "@/lib/audioSource";');
    expect(scene).toContain('audioBase64ToObjectUrl(edgeAudio.audioBase64, "audio/mpeg")');
    expect(scene).toContain("const playTeacherAudio = useCallback");
    expect(scene).toContain("audio.muted = false;");
    expect(scene).toContain("audio.volume = 1;");
    expect(scene).toContain("primeDialogAudioFromGesture();");
    expect(scene).toContain("requestSpeechSafely(teacherSpeech.text, teacherSpeech.language, teacherSpeech.gender, teacherSpeech.purpose, true);");
  });

  it("mantém reprodução explícita nos percursos Pareto e de pronúncia", () => {
    const pareto = readClient("pages/Pareto1000.tsx");
    const pronunciation = readClient("components/PronunciationExercise.tsx");

    expect(pareto).toContain("const audio = new Audio(url);");
    expect(pareto).toContain("await audio.play();");
    expect(pronunciation).toContain("const generateTTS = trpc.tts.generate.useMutation();");
    expect(pronunciation).toContain("audioElementRef.current.play();");
  });

  it("mantém os acionamentos de professor nas lições de cena e pedagógicas", () => {
    const sceneLesson = readClient("components/SceneLesson.tsx");
    const pedagogicalLesson = readClient("components/PedagogicalLesson.tsx");

    expect(sceneLesson).toContain("speakNaturalVoice(word, languageCode");
    expect(sceneLesson).toContain("🔊 Ouvir");
    expect(pedagogicalLesson).toContain("speakEdgeTTS(text, languageCode)");
    expect(pedagogicalLesson).toContain("onClick={() => speakWord(line.text)}");
  });
});
