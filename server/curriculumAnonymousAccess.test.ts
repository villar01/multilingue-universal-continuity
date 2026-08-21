import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAnonymousContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("entrega curricular protegida", () => {
  it("recusa chamadas diretas de visitante antes de entregar qualquer material curricular", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());

    const abcBook = caller.curriculum.abcBook({
      lessonKey: "pt-BR-en-US-a1-01",
      nativeLanguage: "pt-BR",
      targetLanguage: "en-US",
    });
    const studyBase = caller.curriculum.studyBase({ lessonKey: "pt-BR-en-US-a1-01" });
    const pareto = caller.curriculum.pareto({ lessonKey: "pt-BR-en-US-a1-01" });
    const localizedPareto = caller.curriculum.localizedPareto({
      lessonKey: "pt-BR-en-US-a1-01",
      nativeLanguage: "pt-BR",
      targetLanguage: "en-US",
    });
    const localizedSceneDialogue = caller.curriculum.localizedSceneDialogue({
      lessonKey: "pt-BR-en-US-a1-01",
      sceneId: "beach",
      nativeLanguage: "pt-BR",
      targetLanguage: "en-US",
    });
    const sceneCanonicalMaterial = caller.curriculum.sceneCanonicalMaterial({
      lessonKey: "pt-BR-en-US-a1-01",
      sceneId: "beach",
    });
    const languageBlocks = caller.curriculum.languageBlocks({ lessonKey: "pt-BR-en-US-a1-01" });
    const commercialLanguageUnits = caller.curriculum.commercialLanguageUnits({
      lessonKey: "pt-BR-en-US-a1-01",
      targetLanguage: "en-US",
    });
    const phrasalVerbSearch = caller.phrasalVerbs.search({ searchTerm: "give up" });
    const phrasalVerbById = caller.phrasalVerbs.getById({ id: 1 });

    await Promise.all([
      expect(abcBook).rejects.toMatchObject({ code: "UNAUTHORIZED" }),
      expect(studyBase).rejects.toMatchObject({ code: "UNAUTHORIZED" }),
      expect(pareto).rejects.toMatchObject({ code: "UNAUTHORIZED" }),
      expect(localizedPareto).rejects.toMatchObject({ code: "UNAUTHORIZED" }),
      expect(localizedSceneDialogue).rejects.toMatchObject({ code: "UNAUTHORIZED" }),
      expect(sceneCanonicalMaterial).rejects.toMatchObject({ code: "UNAUTHORIZED" }),
      expect(languageBlocks).rejects.toMatchObject({ code: "UNAUTHORIZED" }),
      expect(commercialLanguageUnits).rejects.toMatchObject({ code: "UNAUTHORIZED" }),
      expect(phrasalVerbSearch).rejects.toMatchObject({ code: "UNAUTHORIZED" }),
      expect(phrasalVerbById).rejects.toMatchObject({ code: "UNAUTHORIZED" }),
    ]);
  });
});
