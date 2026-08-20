import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (name: string) => fs.readFileSync(path.join(process.cwd(), "client/src/pages", name), "utf8");

describe("contagens canônicas nas atividades imersivas", () => {
  it("usa o catálogo compartilhado em conversação imersiva e jogos de palavras", () => {
    const vrConversation = read("VRConversation.tsx");
    const wordGame = read("WordGame.tsx");

    for (const source of [vrConversation, wordGame]) {
      expect(source).toContain("ACTIVE_LANGUAGE_COUNT");
      expect(source).toContain("TOTAL_LANGUAGES");
      expect(source).not.toMatch(/69 idiomas|57 disponíveis/);
    }
  });
});
