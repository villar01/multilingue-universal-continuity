import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/bilingual-conversation-router.ts"), "utf8");
const section = source.slice(source.indexOf("translateRealtime:"), source.indexOf("addToVocabulary:"));

describe("tradutor legado da conversa bilíngue", () => {
  it("não processa texto por IA como procedimento público", () => {
    expect(section).toContain("translateRealtime: protectedProcedure");
    expect(section).toContain("await ensureConversationAccess(ctx.user.id)");
    expect(section).toContain("const inputSafety = await assessConversationText");
    expect(section).toContain("const outputSafety = await assessConversationText");
    expect(section).not.toContain("translateRealtime: publicProcedure");
  });
});
