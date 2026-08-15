import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { learningTrials, termsAcceptances, trialLessonAccesses, users } from "../drizzle/schema";
import { getDb } from "./db";
import { protectedProcedure, router } from "./_core/trpc";

export const TRIAL_LESSON_LIMIT = 10;

export function decideTrialLessonAccess(input: {
  isPaid: boolean;
  lessonsUsed: number;
  lessonLimit: number;
  isPreviouslyAuthorized: boolean;
}) {
  if (input.isPaid || input.isPreviouslyAuthorized) {
    return { allowed: true, shouldConsume: false, limitReached: false };
  }

  if (input.lessonsUsed >= input.lessonLimit) {
    return { allowed: false, shouldConsume: false, limitReached: true };
  }

  return {
    allowed: true,
    shouldConsume: true,
    limitReached: input.lessonsUsed + 1 >= input.lessonLimit,
  };
}

async function assertAcceptedTerms(userId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Não foi possível verificar a proteção da conta." });

  const acceptance = await db
    .select({ id: termsAcceptances.id })
    .from(termsAcceptances)
    .where(and(
      eq(termsAcceptances.userId, userId),
      eq(termsAcceptances.confirmedMoralConduct, true),
      eq(termsAcceptances.confirmedNoDiscrimination, true),
      eq(termsAcceptances.confirmedNoAbuse, true),
    ))
    .limit(1);

  if (acceptance.length === 0) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Conclua o aceite de proteção antes de iniciar as lições." });
  }

  return db;
}

export async function getLearningContentEntitlement(userId: number) {
  const db = await assertAcceptedTerms(userId);
  const [account] = await db.select({ subscriptionType: users.subscriptionType }).from(users).where(eq(users.id, userId)).limit(1);
  const [trial] = await db.select().from(learningTrials).where(eq(learningTrials.userId, userId)).limit(1);
  const isPaid = account?.subscriptionType !== "free" && account?.subscriptionType != null;
  const lessonLimit = trial?.lessonLimit ?? TRIAL_LESSON_LIMIT;
  const lessonsUsed = trial?.lessonsUsed ?? 0;

  if (!isPaid && lessonsUsed >= lessonLimit) {
    throw new TRPCError({ code: "FORBIDDEN", message: "O período gratuito de 10 lições foi concluído." });
  }

  return { db, isPaid, lessonLimit, lessonsUsed };
}

/**
 * A lista de lições nunca pode ser tratada como uma licença para percorrer
 * conteúdo. No teste, somente os IDs que passaram por authorizeLesson são
 * devolvidos pelos endpoints de curso. Contas pagas não precisam dessa lista.
 */
export async function getAuthorizedTrialLessonIds(userId: number, entitlement?: Awaited<ReturnType<typeof getLearningContentEntitlement>>) {
  const resolvedEntitlement = entitlement ?? await getLearningContentEntitlement(userId);
  if (resolvedEntitlement.isPaid) return null;

  const accesses = await resolvedEntitlement.db
    .select({ lessonKey: trialLessonAccesses.lessonKey })
    .from(trialLessonAccesses)
    .where(eq(trialLessonAccesses.userId, userId));

  return accesses
    .map(({ lessonKey }) => /^lesson:(\d+)$/.exec(lessonKey)?.[1])
    .filter((lessonId): lessonId is string => Boolean(lessonId))
    .map((lessonId) => Number(lessonId));
}

export async function hasAuthorizedTrialLessonKey(userId: number, lessonKey: string, entitlement?: Awaited<ReturnType<typeof getLearningContentEntitlement>>): Promise<boolean> {
  const resolvedEntitlement = entitlement ?? await getLearningContentEntitlement(userId);
  if (resolvedEntitlement.isPaid) return true;
  const [access] = await resolvedEntitlement.db
    .select({ id: trialLessonAccesses.id })
    .from(trialLessonAccesses)
    .where(and(eq(trialLessonAccesses.userId, userId), eq(trialLessonAccesses.lessonKey, lessonKey)))
    .limit(1);
  return Boolean(access);
}

export function filterLessonsForEntitlement<T extends { id: number }>(lessons: T[], authorizedIds: number[] | null): T[] {
  return authorizedIds === null
    ? lessons
    : lessons.filter((lesson) => authorizedIds.includes(lesson.id));
}

export const trialAccessRouter = router({
  status: protectedProcedure.query(async ({ ctx }) => {
    const db = await assertAcceptedTerms(ctx.user.id);
    const [account] = await db.select({ subscriptionType: users.subscriptionType }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
    const [trial] = await db.select().from(learningTrials).where(eq(learningTrials.userId, ctx.user.id)).limit(1);
    const isPaid = account?.subscriptionType !== "free" && account?.subscriptionType != null;
    const lessonsUsed = trial?.lessonsUsed ?? 0;
    const lessonLimit = trial?.lessonLimit ?? TRIAL_LESSON_LIMIT;

    return {
      isPaid,
      lessonsUsed,
      lessonLimit,
      remainingLessons: isPaid ? null : Math.max(0, lessonLimit - lessonsUsed),
      limitReached: !isPaid && lessonsUsed >= lessonLimit,
    };
  }),

  authorizeLesson: protectedProcedure
    .input(z.object({ lessonKey: z.string().trim().min(1).max(160) }))
    .mutation(async ({ ctx, input }) => {
      const db = await assertAcceptedTerms(ctx.user.id);
      const [account] = await db.select({ subscriptionType: users.subscriptionType }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
      const isPaid = account?.subscriptionType !== "free" && account?.subscriptionType != null;

      let [trial] = await db.select().from(learningTrials).where(eq(learningTrials.userId, ctx.user.id)).limit(1);
      if (!trial) {
        await db.insert(learningTrials).values({ userId: ctx.user.id, lessonLimit: TRIAL_LESSON_LIMIT, lessonsUsed: 0, status: "active" });
        [trial] = await db.select().from(learningTrials).where(eq(learningTrials.userId, ctx.user.id)).limit(1);
      }
      if (!trial) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Não foi possível iniciar o período gratuito." });

      const [previousAccess] = await db.select({ id: trialLessonAccesses.id })
        .from(trialLessonAccesses)
        .where(and(eq(trialLessonAccesses.userId, ctx.user.id), eq(trialLessonAccesses.lessonKey, input.lessonKey)))
        .limit(1);

      const decision = decideTrialLessonAccess({
        isPaid,
        lessonsUsed: trial.lessonsUsed,
        lessonLimit: trial.lessonLimit,
        isPreviouslyAuthorized: Boolean(previousAccess),
      });

      if (!decision.allowed) {
        await db.update(learningTrials).set({ status: "limit_reached", limitReachedAt: new Date() }).where(eq(learningTrials.id, trial.id));
        return { allowed: false, remainingLessons: 0, lessonLimit: trial.lessonLimit, lessonsUsed: trial.lessonsUsed };
      }

      let lessonsUsed = trial.lessonsUsed;
      if (decision.shouldConsume) {
        lessonsUsed += 1;
        await db.insert(trialLessonAccesses).values({ userId: ctx.user.id, lessonKey: input.lessonKey });
        await db.update(learningTrials)
          .set({
            lessonsUsed,
            status: decision.limitReached ? "limit_reached" : "active",
            limitReachedAt: decision.limitReached ? new Date() : null,
          })
          .where(eq(learningTrials.id, trial.id));
      }

      return {
        allowed: true,
        remainingLessons: isPaid ? null : Math.max(0, trial.lessonLimit - lessonsUsed),
        lessonLimit: trial.lessonLimit,
        lessonsUsed,
      };
    }),
});
