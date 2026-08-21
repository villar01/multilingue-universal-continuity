import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../server/bilingual-conversation-router.ts", import.meta.url), "utf8");
const continueStart = source.indexOf("continue: protectedProcedure");
const continueSegment = source.slice(continueStart, source.indexOf("// Gerar sugestões de resposta", continueStart));

describe("autorização da conversa por voz", () => {
  it("exige acesso curricular antes de processar a continuação bilíngue", () => {
    expect(continueStart).toBeGreaterThan(-1);
    expect(continueSegment).toContain("await ensureConversationAccess(ctx.user.id);");
    expect(continueSegment.indexOf("await ensureConversationAccess(ctx.user.id);")).toBeLessThan(continueSegment.indexOf("const nativeTag"));
    expect(continueSegment.indexOf("await ensureConversationAccess(ctx.user.id);")).toBeLessThan(continueSegment.indexOf("invokeLLM"));
  });
});
