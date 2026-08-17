import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(
  path.resolve(import.meta.dirname, "../client/src/pages/LessonsHub.tsx"),
  "utf8",
);

describe("ponte Base de Estudos–trilha de lições", () => {
  it("aceita apenas retorno interno à Base de Estudos e mantém o dashboard como destino seguro", () => {
    expect(source).toContain('requestedReturnTo?.startsWith("/base-de-estudos") ? requestedReturnTo : "/dashboard"');
    expect(source).toContain("setLocation(lessonsReturnTo)");
  });
});
