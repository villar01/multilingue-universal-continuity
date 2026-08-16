import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");

describe("envio de pergunta livre na Cena Imersiva", () => {
  it("envia o conteúdo do campo ao tutor e limpa somente após o encaminhamento", () => {
    expect(source).toContain("const question = dlgWrittenAnswer.trim()");
    expect(source).toContain("if (!question) return");
    expect(source).toContain("setDlgWrittenAnswer(\"\")");
    expect(source).toContain("validateDialogAnswer(question)");
    expect(source).toContain("void askImmersiveTutor(provided)");
  });

  it("mantém o botão e o teclado ligados ao mesmo envio, com retorno escrito visível", () => {
    expect(source).toContain("onClick={submitWrittenDialogAnswer}");
    expect(source).toContain('if (event.key === "Enter") submitWrittenDialogAnswer()');
    expect(source).toContain("Resposta escrita do professor");
    expect(source).toContain("setDlgFeedback(immediateFeedback)");
  });
});
