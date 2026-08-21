import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const routerSource = readFileSync(resolve(process.cwd(), "server/moderation-router.ts"), "utf8");
const dashboardSource = readFileSync(resolve(process.cwd(), "client/src/pages/AdminModeration.tsx"), "utf8");
const recentLogsSection = routerSource.slice(
  routerSource.indexOf("getRecentLogs: protectedProcedure"),
  routerSource.indexOf("getBlockedWords: protectedProcedure"),
);

describe("painel administrativo de moderação minimizado", () => {
  it("retorna apenas metadados de moderação para os registros recentes", () => {
    expect(recentLogsSection).toContain("conversationType: conversationLogs.conversationType");
    expect(recentLogsSection).toContain("userAgeGroup: conversationLogs.userAgeGroup");
    expect(recentLogsSection).toContain("moderationScore: conversationLogs.moderationScore");
    expect(recentLogsSection).toContain("wasBlocked: conversationLogs.wasBlocked");
    expect(recentLogsSection).toContain("wasReformulated: conversationLogs.wasReformulated");
  });

  it("não entrega nem renderiza conteúdo integral, identificadores ou categorias sensíveis", () => {
    for (const forbiddenField of [
      "userId: conversationLogs.userId",
      "userMessage: conversationLogs.userMessage",
      "aiResponse: conversationLogs.aiResponse",
      "originalAiResponse: conversationLogs.originalAiResponse",
      "userCountry: conversationLogs.userCountry",
      "userReligion: conversationLogs.userReligion",
    ]) {
      expect(recentLogsSection).not.toContain(forbiddenField);
    }

    expect(dashboardSource).not.toContain("log.userId");
    expect(dashboardSource).not.toContain("log.userMessage");
    expect(dashboardSource).not.toContain("log.aiResponse");
  });
});
