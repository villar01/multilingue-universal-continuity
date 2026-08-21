import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const routerSource = readFileSync(join(process.cwd(), "server/bilingual-conversation-router.ts"), "utf8");

describe("orientação de registro na conversa bilíngue", () => {
  it("mantém registro formal como modelo e explica gírias ou variações regionais sem tratá-las como erro", () => {
    expect(routerSource).toContain("formal ${input.targetLanguage} as the preferred model");
    expect(routerSource).toContain("slang, an uncommon expression, or a regional variant");
    expect(routerSource).toContain("formal equivalent");
    expect(routerSource).toContain("not as a mistake");
  });
});
