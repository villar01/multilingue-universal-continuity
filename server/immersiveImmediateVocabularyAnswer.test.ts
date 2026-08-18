import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"), "utf8");

describe("resposta imediata de vocabulário na cena", () => {
  it("mantém a explicação local de objeto visível e falada sem depender de uma resposta remota", () => {
    expect(source).toContain("if (fallback?.immediate) {");
    expect(source).toContain("setDlgTutorLoading(false);");
    expect(source).toContain("requestSpeechSafely(immediateReply.replace");
  });

  it("mantém o aviso de voz separado da resposta escrita antes de uma pergunta enviada", () => {
    expect(source).toContain('const [dlgAudioNotice, setDlgAudioNotice] = useState("");');
    expect(source).toContain('setDlgAudioNotice("Voz de James pronta. Toque em Ouvir James para iniciar.");');
    expect(source).toContain("{dlgAudioNotice && (");
    expect(source).not.toContain('setDlgFeedback("Voz de James pronta. Toque em Ouvir James para iniciar.");');
  });

  it("não inicia fala automática ao abrir ou avançar o diálogo", () => {
    const start = source.slice(source.indexOf("const startDialog"), source.indexOf("useEffect(() => {", source.indexOf("const startDialog")));
    const next = source.slice(source.indexOf("const dlgNext"), source.indexOf("const askImmersiveTutor"));
    expect(start).toContain("setDlgWords(words); setDlgWordIdx(words.length);");
    expect(next).toContain("setDlgWords(words); setDlgWordIdx(words.length);");
    expect(start).not.toContain("requestSpeechSafely(");
    expect(next).not.toContain("requestSpeechSafely(");
  });
});
