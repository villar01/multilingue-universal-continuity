import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../client/src/pages/ImmersiveScene.tsx", import.meta.url), "utf8");

describe("diálogo roteirizado e sessão da cena imersiva", () => {
  it("abre o diálogo com texto visível e inicia a apresentação pelo comando explícito Iniciar Diálogo", () => {
    expect(source).toContain("setDlgOpen(true); setDlgStep(0);");
    expect(source).toContain("setDlgWords(words); setDlgWordIdx(words.length);");
    const startDialog = source.slice(source.indexOf("const startDialog"), source.indexOf("useEffect(() => {", source.indexOf("const startDialog")));
    expect(startDialog).toContain("primeDialogAudioFromGesture();");
    expect(startDialog).toContain("requestSpeechSafely(teacherSpeech.text, teacherSpeech.language, teacherSpeech.gender, teacherSpeech.purpose, true);");
    expect(startDialog).toContain('dialogueScene.id === "beach" && dialogueScene.teacherName === "James"');
    expect(startDialog).toContain("teacherSpeech.text === JAMES_TROPICAL_INTRO_LINE");
    expect(startDialog).toContain('playJamesTropicalClip("james-tropical-greeting")');
    expect(startDialog).toContain("JAMES_TROPICAL_INTRO_FALLBACK_URL");
    expect(startDialog).toContain('"james-tropical-introduction"');
    expect(source).toContain("`🔊 Ouvir apresentação de ${selectedScene.teacherName}`");
    expect(source).toContain("if (dialogAudioSource) {");
    expect(source).toContain("void replayVisibleDialogAudio();");
    expect(source).toContain("const [dialogAudioNeedsGesture, setDialogAudioNeedsGesture] = useState(false);");
    expect(source).toContain("setDialogAudioNeedsGesture(true);");
    expect(source).toContain("Tocar agora");
    expect(source).toContain("if (activeDialogLineRef.current === phrase) setDlgOpen(true);");
    expect(source).toContain('requestSpeechSafely(immediateReply.replace(/^[^:]+:\\s*/, ""), scene.teacherLang, scene.teacherGender, "teacher", true);');
  });

  it("mantém sessão protegida como caminho aprimorado sem esconder o diálogo do visitante", () => {
    expect(source).toContain("if (!isAuthenticated) {");
    expect(source).toContain("const effectiveGender = selectedScene?.teacherName === \"James\"");
    expect(source).toContain("playPublicSceneDialogue(text, language, effectiveGender, requestKey, autoPlay)");
    expect(source).toContain("const playPublicSceneDialogue = useCallback(async (text: string, language: string, gender: 'male' | 'female', requestKey: string, autoPlay = false)");
    expect(source).toContain("O diálogo com voz neural requer uma sessão protegida.");
  });
});
