import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/StudyBase.tsx"), "utf8");

describe("integração das unidades comerciais na Base de Estudos", () => {
  it("consulta unidades pelo idioma-alvo ativo, sem embutir o conteúdo no cliente", () => {
    expect(source).toContain("trpc.curriculum.commercialLanguageUnits.useQuery");
    expect(source).toContain("targetLanguage: profile.targetCode");
    expect(source).toContain("Unidades A1 autorizadas");
    expect(source).not.toContain("Where is the station?");
  });

  it("oferece vocabulário, diálogo, escrita, pergunta e orientação docente", () => {
    expect(source).toContain("selectedCommercialUnit.paretoVocabulary");
    expect(source).toContain("selectedCommercialUnit.dialogue");
    expect(source).toContain("selectedCommercialUnit.writingPrompt");
    expect(source).toContain("selectedCommercialUnit.question.prompt");
    expect(source).toContain("selectedCommercialUnit.teacherCue");
  });
});
