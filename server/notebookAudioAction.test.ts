import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const notebookSource = readFileSync(
  new URL("../client/src/components/Notebook.tsx", import.meta.url),
  "utf8",
);

describe("áudio do Caderno de Anotações", () => {
  it("reproduz cada registro pelo mecanismo próprio acionado no clique", () => {
    expect(notebookSource).toContain('import { speakEdgeTTS, stopEdgeTTS } from "@/lib/edgeTTSClient"');
    expect(notebookSource).toContain("const speakEntry = useCallback");
    expect(notebookSource).toContain("void speakEdgeTTS(entry.word, entry.langCode");
    expect(notebookSource).toContain("onClick={() => speakEntry(entry)}");
  });
});
