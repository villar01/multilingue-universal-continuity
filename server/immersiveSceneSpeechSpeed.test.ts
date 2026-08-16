import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");

describe("controle de compreensão auditiva da Cena Imersiva", () => {
  it("oferece velocidades lentas e normal para a fala e a ajuda nativa", () => {
    expect(source).toContain('const DIALOG_SPEECH_RATES = [');
    expect(source).toContain('{ value: 0.7, label: "Lento" }');
    expect(source).toContain('{ value: 0.85, label: "Estudo" }');
    expect(source).toContain('{ value: 1, label: "Normal" }');
    expect(source).toContain('aria-label="Velocidade da fala do professor e da ajuda nativa"');
    expect(source).toContain('audio.playbackRate = dialogSpeechRate');
  });

  it("mantém o texto do professor identificado e acessível após a resposta falada", () => {
    expect(source).toContain('Resposta escrita do professor');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('setDlgFeedback(feedbackPrefix)');
    expect(source).toContain('setDlgFeedback(`${feedbackPrefix}\\n${nativeLangLabel}: ${translation.translation}`)');
  });

  it("não cria outro elemento de áudio para aplicar a velocidade", () => {
    const visibleAudioControls = source.match(/ref=\{dialogAudioElementRef\}/g) || [];
    expect(visibleAudioControls).toHaveLength(1);
  });
});
