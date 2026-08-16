import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("persistência de velocidade da Cena Imersiva", () => {
  const source = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");

  it("aceita somente as velocidades de estudo expostas ao aluno", () => {
    expect(source).toContain('const DIALOG_SPEECH_RATE_STORAGE_KEY = "multilingue_scene_speech_rate"');
    expect(source).toContain("function isDialogSpeechRate");
    expect(source).toContain("DIALOG_SPEECH_RATES.some");
  });

  it("restaura valor válido e mantém fallback seguro quando o armazenamento falha", () => {
    expect(source).toContain("const [dialogSpeechRate, setDialogSpeechRate] = useState<number>(loadDialogSpeechRate)");
    expect(source).toContain("window.localStorage.getItem(DIALOG_SPEECH_RATE_STORAGE_KEY)");
    expect(source).toContain("window.localStorage.setItem(DIALOG_SPEECH_RATE_STORAGE_KEY, String(dialogSpeechRate))");
    expect(source).toContain("A preferência continua válida para a sessão");
  });
});
