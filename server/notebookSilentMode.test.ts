import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("client/src/components/Notebook.tsx", "utf8");

describe("Caderno em modo silencioso", () => {
  it("não importa TTS nem inicia fala ao revelar uma tradução", () => {
    expect(source).not.toContain("edgeTTSClient");
    expect(source).not.toContain("speakEntry");
    expect(source).toContain("onClick={() => setQuizRevealed(true)}");
    expect(source).toContain("Revelar tradução");
  });

  it("não mostra um controle de ouvir nas anotações", () => {
    expect(source).not.toContain('title={speakingEntryId === entry.id ? "Reproduzindo" : "Ouvir"}');
    expect(source).not.toContain("speakingEntryId");
  });
});
