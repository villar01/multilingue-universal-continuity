import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"), "utf8");

describe("resposta imediata de vocabulário na cena", () => {
  it("mantém a explicação local de objeto visível e falada sem depender de uma resposta remota", () => {
    // fallback.immediate é apenas placeholder — não bloqueia mais a IA protegida
    expect(source).toContain("CORREÇÃO: fallback.immediate é apenas placeholder");
    expect(source).toContain("setDlgTutorLoading(false)");
    expect(source).toContain("requestSpeechSafely(immediateReply.replace");
  });

  it("mantém o aviso de voz separado da resposta escrita antes de uma pergunta enviada", () => {
    expect(source).toContain('const [dlgAudioNotice, setDlgAudioNotice] = useState("");');
    expect(source).toContain('setDlgAudioNotice(`Voz de ${teachingScene?.teacherName || "professor"} pronta. Toque em Ouvir ${teachingScene?.teacherName || "professor"} para iniciar.`);');
    expect(source).toContain("{dlgAudioNotice && (");
    expect(source).not.toContain('setDlgFeedback(`Voz de ${teachingScene?.teacherName || "professor"} pronta. Toque em Ouvir ${teachingScene?.teacherName || "professor"} para iniciar.`);');
  });

  it("inicia a fala ao abrir ou avançar após o gesto explícito de diálogo", () => {
    const start = source.slice(source.indexOf("const startDialog"), source.indexOf("useEffect(() => {", source.indexOf("const startDialog")));
    const next = source.slice(source.indexOf("const dlgNext"), source.indexOf("const askImmersiveTutor"));
    expect(start).toContain("setDlgWords(words); setDlgWordIdx(words.length);");
    expect(next).toContain("setDlgWords(words); setDlgWordIdx(words.length);");
    expect(start).toContain("primeDialogAudioFromGesture();");
    expect(start).toContain("requestSpeechSafely(teacherSpeech.text, teacherSpeech.language, teacherSpeech.gender, teacherSpeech.purpose, true);");
    expect(next).toContain("primeDialogAudioFromGesture();");
    expect(next).toContain("requestSpeechSafely(teacherSpeech.text, teacherSpeech.language, teacherSpeech.gender, teacherSpeech.purpose, true);");
    expect(source).toContain("if (dialogAudioSource) {");
    expect(source).toContain("void replayVisibleDialogAudio();");
  });
});
