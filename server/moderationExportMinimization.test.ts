import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const routerSource = readFileSync(resolve(process.cwd(), "server/moderation-router.ts"), "utf8");
const exportSection = routerSource.slice(routerSource.indexOf("exportLogs: protectedProcedure"));

describe("exportação de moderação minimizada", () => {
  it("exporta somente metadados de auditoria necessários", () => {
    expect(exportSection).toContain('"Timestamp"');
    expect(exportSection).toContain('"Violation Type"');
    expect(exportSection).toContain('"Severity"');
    expect(exportSection).toContain('"Age Group"');
    expect(exportSection).toContain('"Moderation Score"');
    expect(exportSection).toContain('"Was Blocked"');
    expect(exportSection).toContain('"Was Reformulated"');
  });

  it("não inclui identificadores, conteúdo integral ou categorias sensíveis no CSV", () => {
    for (const forbiddenField of [
      '"ID"',
      '"User ID"',
      '"Country"',
      '"Religion"',
      '"User Message"',
      '"AI Response"',
      "log.userId",
      "log.userCountry",
      "log.userReligion",
      "log.userMessage",
      "log.aiResponse",
      "log.originalAiResponse",
      "log.detectedContent",
    ]) {
      expect(exportSection).not.toContain(forbiddenField);
    }
  });
});
