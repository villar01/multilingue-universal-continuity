import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const notebookSource = readFileSync(
  new URL("../client/src/components/Notebook.tsx", import.meta.url),
  "utf8",
);

describe("modo silencioso do Caderno de Anotações", () => {
  it("não reproduz registros nem inicia fala ao revelar a tradução", () => {
    expect(notebookSource).not.toContain("edgeTTSClient");
    expect(notebookSource).not.toContain("speakEntry");
    expect(notebookSource).toContain("onClick={() => setQuizRevealed(true)}");
  });
});
