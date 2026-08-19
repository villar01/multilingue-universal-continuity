import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sceneSource = readFileSync(resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"), "utf8");

describe("immersive dialog written question flow", () => {
  it("shows feedback immediately and releases a stalled tutor request", () => {
    expect(sceneSource).toContain("setDlgFeedback(immediateFeedback)");
    expect(sceneSource).toContain("}, 10_000);");
    expect(sceneSource).toContain("setDlgTutorLoading(false);");
  });

  it("clears a submitted question and does not submit a blank or currently loading request", () => {
    expect(sceneSource).toContain("if (!question) return;");
    expect(sceneSource).toContain('setDlgWrittenAnswer("");');
    expect(sceneSource).not.toContain("disabled={dlgTutorLoading}");
    expect(sceneSource).not.toContain("dlgAnswer !== null || dlgTutorLoading");
    expect(sceneSource).not.toContain("dlgIsProcessingSpeech || dlgTutorLoading");
  });

  it("mantém a resposta escrita à vista e aciona um clipe de James para qualquer pergunta explícita na Praia Tropical", () => {
    expect(sceneSource).toContain('const dlgFeedbackRef = useRef<HTMLDivElement | null>(null);');
    expect(sceneSource).toContain('dlgFeedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });');
    expect(sceneSource).toContain('ref={dlgFeedbackRef}');
    expect(sceneSource).toContain('playJamesTropicalClip(objectClipId || "james-tropical-greeting");');
  });

  it("encaminha Perguntar diretamente ao tutor, sem confundir uma dúvida livre com a resposta do exercício", () => {
    expect(sceneSource).toContain("const submitTeacherQuestion = useCallback(() => {");
    expect(sceneSource).toContain("void askImmersiveTutor(question);");
    expect(sceneSource).toContain('onClick={submitTeacherQuestion}');
    expect(sceneSource).toContain('if (event.key === "Enter") submitTeacherQuestion();');
  });

  it("oferece controle explícito que fala exatamente a resposta mostrada e agenda James somente no gesto do aluno", () => {
    expect(sceneSource).toContain('const [dlgTutorSpokenText, setDlgTutorSpokenText] = useState("");');
    expect(sceneSource).toContain("const replayTeacherSpeechFromGesture = useCallback(() => {");
    expect(sceneSource).toContain('onClick={replayTeacherSpeechFromGesture}');
    expect(sceneSource).toContain("🔊 Ouvir resposta de James");
    expect(sceneSource).toContain('const phrase = (dlgTutorSpokenText || activeSpeechText || lineText).trim();');
    expect(sceneSource).toContain('playJamesTropicalClip("james-tropical-greeting");');
  });

  it("inicia a apresentação audível ao abrir ou avançar o diálogo e mantém o botão explícito de repetição", () => {
    const startDialogSource = sceneSource.slice(sceneSource.indexOf("const startDialog = useCallback"), sceneSource.indexOf("useEffect(() => {\n    if (isSpeaking"));
    const nextDialogSource = sceneSource.slice(sceneSource.indexOf("const dlgNext = useCallback"), sceneSource.indexOf("const askImmersiveTutor = useCallback"));
    const speechCall = "requestSpeechSafely(teacherSpeech.text, teacherSpeech.language, teacherSpeech.gender, teacherSpeech.purpose, true);";

    expect(startDialogSource).toContain("primeDialogAudioFromGesture();");
    expect(startDialogSource).toContain(speechCall);
    expect(nextDialogSource).toContain("primeDialogAudioFromGesture();");
    expect(nextDialogSource).toContain(speechCall);
    expect(sceneSource).toContain("if (dialogAudioSource) {");
    expect(sceneSource).toContain("void replayVisibleDialogAudio();");
  });
});
