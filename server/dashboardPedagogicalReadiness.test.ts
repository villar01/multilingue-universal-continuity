import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(import.meta.dirname, "../client/src/pages/DashboardReal.tsx"), "utf8");

describe("prontidão pedagógica no painel do aluno", () => {
  it("consulta somente o progresso protegido do curso selecionado", () => {
    expect(source).toContain("trpc.progress.getCourseProgress.useQuery");
    expect(source).toContain("enabled: courseId > 0 && !!user");
    expect(source).not.toContain("trpc.progress.getCourseProgress.useMutation");
  });

  it("explica domínio e evidência sem converter XP ou seleção visual em desbloqueio", () => {
    expect(source).toContain("Prontidão pedagógica");
    expect(source).toContain("Domínio derivado do SRS");
    expect(source).toContain("XP mantém somente sua função motivacional");
    expect(source).toContain("ela não libera currículo");
    expect(source).toContain("PEDAGOGICAL_LEVEL_LABELS");
  });
});
