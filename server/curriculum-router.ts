import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { hasAuthorizedTrialLessonKey, getLearningContentEntitlement } from "./trial-access-router";
import { STRUCTURED_A1_UNITS, STUDY_BASE_A1_ENTRIES } from "./curriculum/studyBaseContent";
import { LANGUAGE_BLOCKS } from "./curriculum/languageBlocksContent";
import { getParetoProgramWords, getParetoWordsForChapter, getParetoWordsForScene, PARETO_CHAPTER_COUNT, PARETO_VOCAB } from "./curriculum/paretoContent";
import { getParetoBookContext, getParetoBookContextWords, PARETO_BOOK_CONTEXT_IDS } from "./curriculum/paretoBookContexts";
import { getParetoAdvancedChallenge } from "./curriculum/paretoAdvancedChallenges";
import { localizeParetoWords } from "./curriculum/localizedPareto";
import { localizeSceneDialogue } from "./curriculum/localizedSceneMaterial";
import { getSecureSceneSeedForLanguage } from "./curriculum/secureSceneSeeds";
import { getABCBookDelivery } from "./curriculum/abcBookContent";

const accessInput = z.object({ lessonKey: z.string().trim().min(1).max(160) });

async function assertCurriculumDelivery(userId: number, lessonKey: string) {
  const entitlement = await getLearningContentEntitlement(userId);
  const authorized = await hasAuthorizedTrialLessonKey(userId, lessonKey, entitlement);
  if (!authorized) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Este material só é entregue dentro de uma lição autorizada." });
  }
  return entitlement;
}

export const curriculumRouter = router({
  abcBook: protectedProcedure.input(accessInput.extend({
    targetLanguage: z.string().trim().min(2).max(16),
    nativeLanguage: z.string().trim().min(2).max(16),
  })).query(async ({ ctx, input }) => {
    await assertCurriculumDelivery(ctx.user.id, input.lessonKey);
    return getABCBookDelivery({
      nativeLanguage: input.nativeLanguage,
      targetLanguage: input.targetLanguage,
    });
  }),

  studyBase: protectedProcedure.input(accessInput).query(async ({ ctx, input }) => {
    const entitlement = await assertCurriculumDelivery(ctx.user.id, input.lessonKey);
    return entitlement.hasFullCurriculum
      ? { entries: STUDY_BASE_A1_ENTRIES, structuredUnits: STRUCTURED_A1_UNITS }
      : { entries: STUDY_BASE_A1_ENTRIES.slice(0, 1), structuredUnits: STRUCTURED_A1_UNITS.slice(0, 1) };
  }),

  pareto: protectedProcedure.input(accessInput.extend({ scene: z.string().trim().max(80).optional() })).query(async ({ ctx, input }) => {
    const entitlement = await assertCurriculumDelivery(ctx.user.id, input.lessonKey);
    if (!entitlement.hasFullCurriculum) return PARETO_VOCAB.slice(0, 10);
    return input.scene ? PARETO_VOCAB.filter((word) => word.scene === input.scene) : PARETO_VOCAB;
  }),

  localizedPareto: protectedProcedure.input(accessInput.extend({
    scene: z.string().trim().max(80).optional(),
    bookContext: z.enum(PARETO_BOOK_CONTEXT_IDS).optional(),
    chapter: z.number().int().min(1).max(PARETO_CHAPTER_COUNT).optional(),
    targetLanguage: z.string().trim().min(2).max(16),
    nativeLanguage: z.string().trim().min(2).max(16),
    page: z.number().int().min(0).default(0),
    pageSize: z.number().int().min(1).max(10).default(10),
  })).query(async ({ ctx, input }) => {
    const entitlement = await assertCurriculumDelivery(ctx.user.id, input.lessonKey);
    const programWords = getParetoProgramWords();
    const bookContext = getParetoBookContext(input.bookContext);
    const chapterWords = input.chapter ? getParetoWordsForChapter(input.chapter, programWords) : null;
    const advancedChallenge = bookContext || chapterWords ? null : getParetoAdvancedChallenge(input.page);
    const contextWords = getParetoBookContextWords(input.bookContext, programWords);
    const candidateWords = chapterWords ?? contextWords ?? programWords;
    const authorizedWords = entitlement.hasFullCurriculum ? candidateWords : candidateWords.slice(0, 10);
    const scopedWords = input.scene ? getParetoWordsForScene(input.scene, authorizedWords) : authorizedWords;
    const start = input.page * input.pageSize;
    const pageWords = scopedWords.slice(start, start + input.pageSize);
    const localized = await localizeParetoWords({
      words: pageWords,
      targetLanguage: input.targetLanguage,
      nativeLanguage: input.nativeLanguage,
      userId: ctx.user.id,
    });

    return {
      ...localized,
      total: scopedWords.length,
      page: input.page,
      pageSize: input.pageSize,
      totalPages: Math.max(1, Math.ceil(scopedWords.length / input.pageSize)),
      bookContext: bookContext ? {
        id: bookContext.id,
        title: bookContext.title,
        bookStep: bookContext.bookStep,
        grammarFocus: bookContext.grammarFocus,
        recallPrompt: bookContext.recallPrompt,
        orderPrompt: bookContext.orderPrompt,
        orderAnswer: bookContext.orderAnswer,
      } : null,
      chapter: input.chapter ? { number: input.chapter, totalWords: chapterWords?.length ?? 0 } : null,
      advancedChallenge,
    };
  }),

  localizedSceneDialogue: protectedProcedure.input(accessInput.extend({
    sceneId: z.string().trim().min(1).max(80),
    targetLanguage: z.string().trim().min(2).max(16),
    nativeLanguage: z.string().trim().min(2).max(16),
  })).query(async ({ ctx, input }) => {
    await assertCurriculumDelivery(ctx.user.id, input.lessonKey);
    return localizeSceneDialogue({
      sceneId: input.sceneId,
      targetLanguage: input.targetLanguage,
      nativeLanguage: input.nativeLanguage,
      userId: ctx.user.id,
    });
  }),

  sceneCanonicalMaterial: protectedProcedure.input(accessInput.extend({
    sceneId: z.string().trim().min(1).max(80),
    targetLanguage: z.string().trim().min(2).max(16),
    nativeLanguage: z.string().trim().min(2).max(16),
  })).query(async ({ ctx, input }) => {
    await assertCurriculumDelivery(ctx.user.id, input.lessonKey);
    const seed = getSecureSceneSeedForLanguage(input.sceneId, input.targetLanguage, input.nativeLanguage);
    if (!seed) {
      throw new TRPCError({ code: "NOT_FOUND", message: "O conteúdo canônico desta cena ainda não foi migrado." });
    }
    return seed;
  }),

  languageBlocks: protectedProcedure.input(accessInput.extend({ level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional() })).query(async ({ ctx, input }) => {
    const entitlement = await assertCurriculumDelivery(ctx.user.id, input.lessonKey);
    if (!entitlement.hasFullCurriculum) return LANGUAGE_BLOCKS.slice(0, 2);
    return input.level ? LANGUAGE_BLOCKS.filter((block) => block.cefr === input.level) : LANGUAGE_BLOCKS;
  }),
});
