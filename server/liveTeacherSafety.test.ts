import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/live-teacher-router.ts"), "utf8");

describe("segurança do Professor ao Vivo", () => {
  it("exige autenticação e portão etário antes de cada interação geradora", () => {
    expect(source).toContain("chat: protectedProcedure");
    expect(source).toContain("introduce: protectedProcedure");
    expect(source).toContain("feedback: protectedProcedure");
    expect(source).toContain("commentObject: protectedProcedure");
    expect(source).toContain("await ensureConversationAccess(ctx.user.id)");
  });

  it("avalia entrada e saída com fallback pedagógico seguro, sem usuário público fictício", () => {
    expect(source).toContain("await assessConversationText(ctx.user.id, input.message, input.targetLang)");
    expect(source).toContain("await assessConversationOutput(ctx.user.id, input.message, content, input.targetLang)");
    expect(source).toContain("Vamos continuar com uma explicação segura da lição.");
    expect(source).not.toContain("userId: 0");
  });
});
