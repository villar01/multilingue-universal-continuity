import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("prática de phrasal verbs protegida", () => {
  it("não consulta o dicionário curricular antes de a sessão ser confirmada e oferece entrada segura ao visitante", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/components/PhrasalVerbsExercises.tsx"),
      "utf8",
    );

    expect(source).toContain("enabled: isAuthenticated && !authLoading");
    expect(source).toContain("Entre para praticar phrasal verbs");
    expect(source).toContain("Criar conta ou entrar");
  });
});
