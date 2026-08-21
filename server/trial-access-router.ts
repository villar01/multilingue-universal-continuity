import { and, eq, isNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { learningTrials, parentalConsents, termsAcceptances, trialLessonAccesses, userSafetyProfile, users } from "../drizzle/schema";
import { getDb } from "./db";
import { protectedProcedure, router } from "./_core/trpc";
import { checkTrialLessonAuthorizationAttempt } from "./trial-authorization-abuse-guard";
import { getTrialExpiryDate, hasFullCurriculumAccess, isTrialExpired } from "./trial-access-policy";

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

  const [safetyProfile] = await db
    .select({ ageGroup: userSafetyProfile.ageGroup })
    .from(userSafetyProfile)
    .where(eq(userSafetyProfile.userId, userId))
    .limit(1);

  if (safetyProfile && safetyProfile.ageGroup !== "adulto") {
    const [activeConsent] = await db
      .select({ id: parentalConsents.id })
      .from(parentalConsents)
      .where(and(
        eq(parentalConsents.userId, userId),
        eq(parentalConsents.isMinor, true),
        eq(parentalConsents.confirmedTerms, true),
        eq(parentalConsents.confirmedMoralConduct, true),
        eq(parentalConsents.confirmedParentalControl, true),
        eq(parentalConsents.confirmedLegalCompliance, true),
        isNull(parentalConsents.revokedAt),
      ))
      .limit(1);

    if (!activeConsent) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Autorização parental válida é obrigatória antes de iniciar as lições." });
    }
  }

  return db;
}

export async function getLearningContentEntitlement(userId: number) {
  const db = await assertAcceptedTerms(userId);
  const [account] = await db.select({ subscriptionType: users.subscriptionType, role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
  let [trial] = await db.select().from(learningTrials).where(eq(learningTrials.userId, userId)).limit(1);
  const isPaid = account?.subscriptionType !== "free" && account?.subscriptionType != null;
  const hasFullCurriculum = hasFullCurriculumAccess(account ?? {});
  const lessonLimit = trial?.lessonLimit ?? TRIAL_LESSON_LIMIT;
  const lessonsUsed = trial?.lessonsUsed ?? 0;
  let expiresAt = trial?.expiresAt ?? null;

  if (!hasFullCurriculum && trial) {
    expiresAt = getTrialExpiryDate(trial.expiresAt);
    if (!trial.expiresAt) {
      await db.update(learningTrials).set({ expiresAt }).where(eq(learningTrials.id, trial.id));
      trial = { ...trial, expiresAt };
    }
    if (isTrialExpired(expiresAt)) {
      if (trial.status !== "expired") {
        await db.update(learningTrials).set({ status: "expired" }).where(eq(learningTrials.id, trial.id));
      }
      throw new TRPCError({ code: "FORBIDDEN", message: "O período gratuito de 14 dias foi concluído." });
    }
  }

  if (!hasFullCurriculum && lessonsUsed >= lessonLimit) {
    throw new TRPCError({ code: "FORBIDDEN", message: "O período gratuito de 10 lições foi concluído." });
  }

  return { db, isPaid, hasFullCurriculum, lessonLimit, lessonsUsed, expiresAt };
}

/**
 * A lista de lições nunca pode ser tratada como uma licença para percorrer
 * conteúdo. No teste, somente os IDs que passaram por authorizeLesson são
 * devolvidos pelos endpoints de curso. Contas pagas não precisam dessa lista.
 */
export async function getAuthorizedTrialLessonIds(userId: number, entitlement?: Awaited<ReturnType<typeof getLearningContentEntitlement>>) {
  const resolvedEntitlement = entitlement ?? await getLearningContentEntitlement(userId);
  if (resolvedEntitlement.hasFullCurriculum) return null;

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
  if (resolvedEntitlement.hasFullCurriculum) return true;
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
    const [account] = await db.select({ subscriptionType: users.subscriptionType, role: users.role }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
    let [trial] = await db.select().from(learningTrials).where(eq(learningTrials.userId, ctx.user.id)).limit(1);
    const isPaid = account?.subscriptionType !== "free" && account?.subscriptionType != null;
    const hasFullCurriculum = hasFullCurriculumAccess(account ?? {});
    const lessonsUsed = trial?.lessonsUsed ?? 0;
    const lessonLimit = trial?.lessonLimit ?? TRIAL_LESSON_LIMIT;
    let expiresAt = trial?.expiresAt ?? null;

    if (!hasFullCurriculum && trial) {
      expiresAt = getTrialExpiryDate(trial.expiresAt);
      if (!trial.expiresAt) {
        await db.update(learningTrials).set({ expiresAt }).where(eq(learningTrials.id, trial.id));
        trial = { ...trial, expiresAt };
      }
      if (isTrialExpired(expiresAt) && trial.status !== "expired") {
        await db.update(learningTrials).set({ status: "expired" }).where(eq(learningTrials.id, trial.id));
      }
    }
    const expired = !hasFullCurriculum && isTrialExpired(expiresAt);

    return {
      isPaid,
      hasFullCurriculum,
      lessonsUsed,
      lessonLimit,
      expiresAt,
      expired,
      remainingLessons: hasFullCurriculum ? null : Math.max(0, lessonLimit - lessonsUsed),
      limitReached: !hasFullCurriculum && lessonsUsed >= lessonLimit,
    };
  }),

  authorizeLesson: protectedProcedure
    .input(z.object({ lessonKey: z.string().trim().min(1).max(160) }))
    .mutation(async ({ ctx, input }) => {
      const db = await assertAcceptedTerms(ctx.user.id);
      const [account] = await db.select({ subscriptionType: users.subscriptionType, role: users.role }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
      const isPaid = account?.subscriptionType !== "free" && account?.subscriptionType != null;
      const hasFullCurriculum = hasFullCurriculumAccess(account ?? {});

      let [trial] = await db.select().from(learningTrials).where(eq(learningTrials.userId, ctx.user.id)).limit(1);
      if (!trial) {
        await db.insert(learningTrials).values({ userId: ctx.user.id, lessonLimit: TRIAL_LESSON_LIMIT, lessonsUsed: 0, status: "active", expiresAt: getTrialExpiryDate(null) });
        [trial] = await db.select().from(learningTrials).where(eq(learningTrials.userId, ctx.user.id)).limit(1);
      }
      if (!trial) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Não foi possível iniciar o período gratuito." });

      const expiresAt = getTrialExpiryDate(trial.expiresAt);
      if (!trial.expiresAt) {
        await db.update(learningTrials).set({ expiresAt }).where(eq(learningTrials.id, trial.id));
        trial = { ...trial, expiresAt };
      }
      if (!hasFullCurriculum && isTrialExpired(expiresAt)) {
        await db.update(learningTrials).set({ status: "expired" }).where(eq(learningTrials.id, trial.id));
        return { allowed: false, expired: true, remainingLessons: 0, lessonLimit: trial.lessonLimit, lessonsUsed: trial.lessonsUsed, expiresAt };
      }

      const [previousAccess] = await db.select({ id: trialLessonAccesses.id })
        .from(trialLessonAccesses)
        .where(and(eq(trialLessonAccesses.userId, ctx.user.id), eq(trialLessonAccesses.lessonKey, input.lessonKey)))
        .limit(1);

      if (!hasFullCurriculum && !previousAccess) {
        const abuseGuard = checkTrialLessonAuthorizationAttempt(ctx.user.id);
        if (!abuseGuard.allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "A proteção da conta pausou temporariamente novas liberações de lição. Tente novamente em alguns minutos.",
          });
        }
      }

      const decision = decideTrialLessonAccess({
        isPaid: hasFullCurriculum,
        lessonsUsed: trial.lessonsUsed,
        lessonLimit: trial.lessonLimit,
        isPreviouslyAuthorized: Boolean(previousAccess),
      });

      if (!decision.allowed) {
        await db.update(learningTrials).set({ status: "limit_reached", limitReachedAt: new Date() }).where(eq(learningTrials.id, trial.id));
        return { allowed: false, expired: false, remainingLessons: 0, lessonLimit: trial.lessonLimit, lessonsUsed: trial.lessonsUsed, expiresAt };
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
        expired: false,
        expiresAt,
        remainingLessons: hasFullCurriculum ? null : Math.max(0, trial.lessonLimit - lessonsUsed),
        lessonLimit: trial.lessonLimit,
        lessonsUsed,
      };
    }),
});
