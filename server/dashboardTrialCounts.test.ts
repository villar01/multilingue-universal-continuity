import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/Dashboard.tsx"), "utf8");

describe("contagens da avaliação no painel", () => {
  it("consulta o limite real da avaliação e não mantém o limite legado de cinco lições", () => {
    expect(source).toContain("trpc.trialAccess.status.useQuery");
    expect(source).toContain("lessonLimit ?? 10");
    expect(source).not.toContain("const freeLessonsLimit = 5");
    expect(source).not.toContain("5 lições gratuitas");
  });

  it("declara os 143 idiomas suportados sem prometer conteúdo integral em cada idioma", () => {
    expect(source).toContain("143 idiomas suportados");
    expect(source).toContain("liberação de conteúdo conforme o idioma e o plano da conta");
    expect(source).not.toContain("todos os 69 idiomas");
  });
});
