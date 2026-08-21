import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getABCBookSemanticContrastForScene } from "./curriculum/abcBookContent";

const root = resolve(import.meta.dirname, "..");
const curriculumRouter = readFileSync(resolve(root, "server/curriculum-router.ts"), "utf8");
const paretoPanel = readFileSync(resolve(root, "client/src/components/ParetoPanel.tsx"), "utf8");

describe("contrastes semânticos contextuais no Pareto", () => {
  it("reaproveita contrastes do Livro SOS por cena e mantém sua progressão", () => {
    expect(getABCBookSemanticContrastForScene({ sceneId: "beach", nativeLanguage: "pt-BR", targetLanguage: "en-US" })?.focus).toBe("ever / always");
    expect(getABCBookSemanticContrastForScene({ sceneId: "airport", nativeLanguage: "pt-BR", targetLanguage: "en-US" })?.focus).toBe("there / their / they're");
    expect(getABCBookSemanticContrastForScene({ sceneId: "newyork", nativeLanguage: "pt-BR", targetLanguage: "en-US" })?.focus).toBe("say / tell");
    expect(getABCBookSemanticContrastForScene({ sceneId: "museum", nativeLanguage: "pt-BR", targetLanguage: "en-US" })?.focus).toBe("look up / look for");
  });

  it("não fabrica contraste para idioma ou cena sem conteúdo aprovado", () => {
    expect(getABCBookSemanticContrastForScene({ sceneId: "beach", nativeLanguage: "en-US", targetLanguage: "pt-BR" })).toBeNull();
    expect(getABCBookSemanticContrastForScene({ sceneId: "unknown-scene", nativeLanguage: "pt-BR", targetLanguage: "en-US" })).toBeNull();
  });

  it("entrega o contraste somente por rota curricular protegida e o mostra no Pareto contextual", () => {
    expect(curriculumRouter).toMatch(/sceneSemanticContrast:\s*protectedProcedure/);
    expect(curriculumRouter).toContain("await assertCurriculumDelivery(ctx.user.id, input.lessonKey)");
    expect(curriculumRouter).not.toMatch(/sceneSemanticContrast:\s*publicProcedure/);
    expect(paretoPanel).toContain("trpc.curriculum.sceneSemanticContrast.useQuery");
    expect(paretoPanel).toContain("Contraste de sentido");
    expect(paretoPanel).toContain("Antes de responder:");
  });
});
