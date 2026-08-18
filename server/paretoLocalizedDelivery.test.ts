import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const routerSource = readFileSync("server/curriculum-router.ts", "utf8");
const pageSource = readFileSync("client/src/pages/Pareto1000.tsx", "utf8");
const localizerSource = readFileSync("server/curriculum/localizedPareto.ts", "utf8");

describe("entrega localizada e protegida do Pareto", () => {
  it("mantém a localização atrás da autorização curricular e pagina os lotes", () => {
    expect(routerSource).toContain("localizedPareto: protectedProcedure");
    expect(routerSource).toContain("assertCurriculumDelivery(ctx.user.id, input.lessonKey)");
    expect(routerSource).toContain("pageSize: z.number().int().min(1).max(10)");
    expect(routerSource).toContain("const programWords = getParetoProgramWords()");
    expect(routerSource).toContain("const authorizedWords = programWords;");
    expect(routerSource).not.toContain("entitlement.isPaid ? programWords : programWords.slice(0, 10)");
    expect(localizerSource).toContain("preferredProvider: \"ollama\"");
    expect(localizerSource).not.toContain("allowRemoteFallback: false");
  });

  it("faz a tela solicitar somente a dupla escolhida e usar a voz do idioma estudado", () => {
    expect(pageSource).toContain("trpc.curriculum.localizedPareto.useQuery");
    expect(pageSource).toContain("targetLanguage,");
    expect(pageSource).toContain("nativeLanguage,");
    expect(pageSource).toContain("voiceLang: targetLanguage");
    expect(pageSource).not.toContain("voiceLang: \"en-US\"");
  });

  it("isola o progresso de memorização por idioma estudado e idioma nativo", () => {
    expect(pageSource).toContain("const PROGRESS_KEY_PREFIX = \"multilingue_pareto_1000_completed\"");
    expect(pageSource).toContain("${targetLanguage.trim().toLowerCase()}");
    expect(pageSource).toContain("${nativeLanguage.trim().toLowerCase()}");
    expect(pageSource).toContain("setCompleted(loadCompletedWords(activeProgressKey))");
  });
});
