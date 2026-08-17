import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const home = readFileSync(path.resolve(import.meta.dirname, "../client/src/pages/Home.tsx"), "utf8");

describe("bandeiras flutuantes da abertura", () => {
  it("usa representação local estável sem baixar imagens externas", () => {
    expect(home).toContain("FLOAT_FLAG_EMOJIS");
    expect(home).toContain('role="img"');
    expect(home).not.toContain("flagcdn.com");
  });

  it("apresenta benefício pedagógico em vez de mensagem técnica residual", () => {
    expect(home).toContain("Prática guiada em cada etapa");
    expect(home).not.toContain("Suporte local configurável");
  });
});
