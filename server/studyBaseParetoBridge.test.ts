import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const studyBaseSource = fs.readFileSync(path.join(root, "client/src/pages/StudyBase.tsx"), "utf8");
const paretoSource = fs.readFileSync(path.join(root, "client/src/pages/Pareto1000.tsx"), "utf8");

describe("ponte Base de Estudos–Pareto", () => {
  it("envia o item ativo como retorno ao abrir a prática Pareto", () => {
    expect(studyBaseSource).toContain("/pareto-1000?returnTo=${encodeURIComponent(returnPath)}");
    expect(studyBaseSource).toContain("/base-de-estudos?entry=${encodeURIComponent(activeEntry.id)}");
  });

  it("faz o Pareto voltar apenas à Base de Estudos contextual", () => {
    expect(paretoSource).toContain('requestedDestination?.startsWith("/base-de-estudos")');
    expect(paretoSource).toContain('<Link href={returnTo}>');
  });
});
