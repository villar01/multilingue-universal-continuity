import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const routerSource = fs.readFileSync(path.resolve(import.meta.dirname, "routers.ts"), "utf8");
const roleplaySource = fs.readFileSync(path.resolve(import.meta.dirname, "../client/src/pages/RoleplayPage.tsx"), "utf8");

describe("contrato docente do roleplay", () => {
  it("resolve o professor protegido no início e usa o mesmo resolvedor na continuação", () => {
    const conversationBlock = routerSource.slice(routerSource.indexOf("conversationAI: router({"), routerSource.indexOf("// Chatbot de IA"));
    expect(conversationBlock).toContain("teacherName: await resolveConversationTeacherName(ctx.user.id)");
    expect(conversationBlock).toContain("teacherName: await resolveConversationTeacherName(ctx.user.id, input.teacherId)");
  });

  it("mantém o roleplay no fluxo protegido de conversa", () => {
    expect(roleplaySource).toContain("trpc.conversationAI.start.useMutation()");
    expect(roleplaySource).toContain("trpc.conversationAI.continue.useMutation()");
  });
});
