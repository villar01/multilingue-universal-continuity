import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { hasAuthorizedTrialLessonKey, getLearningContentEntitlement } from "./trial-access-router";
import { STRUCTURED_A1_UNITS, STUDY_BASE_A1_ENTRIES } from "./curriculum/studyBaseContent";
import { LANGUAGE_BLOCKS } from "./curriculum/languageBlocksContent";
import { PARETO_VOCAB } from "./curriculum/paretoContent";

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
  studyBase: protectedProcedure.input(accessInput).query(async ({ ctx, input }) => {
    const entitlement = await assertCurriculumDelivery(ctx.user.id, input.lessonKey);
    return entitlement.isPaid
      ? { entries: STUDY_BASE_A1_ENTRIES, structuredUnits: STRUCTURED_A1_UNITS }
      : { entries: STUDY_BASE_A1_ENTRIES.slice(0, 1), structuredUnits: STRUCTURED_A1_UNITS.slice(0, 1) };
  }),

  pareto: protectedProcedure.input(accessInput.extend({ scene: z.string().trim().max(80).optional() })).query(async ({ ctx, input }) => {
    const entitlement = await assertCurriculumDelivery(ctx.user.id, input.lessonKey);
    if (!entitlement.isPaid) return PARETO_VOCAB.slice(0, 10);
    return input.scene ? PARETO_VOCAB.filter((word) => word.scene === input.scene) : PARETO_VOCAB;
  }),

  languageBlocks: protectedProcedure.input(accessInput.extend({ level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional() })).query(async ({ ctx, input }) => {
    const entitlement = await assertCurriculumDelivery(ctx.user.id, input.lessonKey);
    if (!entitlement.isPaid) return LANGUAGE_BLOCKS.slice(0, 2);
    return input.level ? LANGUAGE_BLOCKS.filter((block) => block.cefr === input.level) : LANGUAGE_BLOCKS;
  }),
});
