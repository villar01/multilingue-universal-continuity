import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PEDAGOGICAL_LEVEL_PASSAGE } from "./curriculum/pedagogicalLevelPassage";

const root = resolve(import.meta.dirname, "..");
const routerSource = readFileSync(resolve(root, "server/routers.ts"), "utf8");
const dashboardSource = readFileSync(resolve(root, "client/src/pages/DashboardReal.tsx"), "utf8");

describe("quatro níveis pedagógicos no painel", () => {
  it("mantém o contrato completo e a etapa tecnológica protegida", () => {
    expect(Object.keys(PEDAGOGICAL_LEVEL_PASSAGE)).toEqual(["initial", "intermediate", "advanced", "technological"]);
    expect(PEDAGOGICAL_LEVEL_PASSAGE.technological).toMatchObject({
      contentStatus: "planned_protected",
      minimumMastery: 0.9,
    });
  });

  it("entrega os contratos apenas junto ao progresso protegido do curso", () => {
    expect(routerSource).toContain("getCourseProgress: protectedProcedure");
    expect(routerSource).toContain("pedagogicalLevels: Object.values(PEDAGOGICAL_LEVEL_PASSAGE)");
    expect(routerSource).not.toContain("getCourseProgress: publicProcedure");
  });

  it("apresenta os níveis sem oferecer conteúdo tecnológico como disponível", () => {
    expect(dashboardSource).toContain("pedagogicalLevels.map");
    expect(dashboardSource).toContain("Etapa planejada: unidades aprovadas serão incorporadas quando disponíveis.");
    expect(dashboardSource).toContain("Etapa disponível mediante domínio e evidências.");
    expect(dashboardSource).toContain("ela não libera currículo");
  });
});
