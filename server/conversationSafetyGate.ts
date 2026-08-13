import { TRPCError } from "@trpc/server";
import { and, eq, gte, isNull } from "drizzle-orm";
import { childProfiles, parentalSettings, usageSessions } from "../drizzle/schema";
import { getDb } from "./db";
import { getUserSafetyContext, moderateAIResponse } from "./content-moderation";
import { checkContent } from "./contentFilter";
import { recordConversationSafetyAlert } from "./parentalConversationAlert";
import { isContentAllowedForJurisdiction } from "../client/src/lib/country-compliance";
import { calculateDailyUsageMinutes, canUseOnDay } from "./childConversationTimeLimit";

export type ConversationSafetyDecision =
  | { allowed: true; context: Awaited<ReturnType<typeof getUserSafetyContext>>["context"] }
  | { allowed: false; reason: "blocked_content"; flaggedContent: string[] };

async function enforceChildConversationTimeLimit(userId: number) {
  const db = await getDb();
  if (!db) return;

  const [child] = await db.select().from(childProfiles)
    .where(eq(childProfiles.linkedUserId, userId)).limit(1);
  if (!child) return;
  if (!child.parentalConsentGiven) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "É necessário consentimento explícito do responsável para liberar conversas deste perfil infantil.",
    });
  }

  const [settings] = await db.select().from(parentalSettings)
    .where(eq(parentalSettings.childId, child.id)).limit(1);
  if (!settings) return;

  const now = new Date();
  if (!canUseOnDay(settings.allowedDays, now)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "As conversas estão fora dos dias permitidos pelo responsável.",
    });
  }

  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const sessions = await db.select().from(usageSessions)
    .where(and(eq(usageSessions.childId, child.id), gte(usageSessions.sessionStart, dayStart)));
  const usedMinutes = calculateDailyUsageMinutes(sessions, now);
  const dailyLimitMinutes = settings.timeLimitMinutes ?? 60;

  if (usedMinutes >= dailyLimitMinutes) {
    await recordConversationSafetyAlert(userId, "daily_time_limit");
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "O limite diário definido pelo responsável foi atingido.",
    });
  }

  const hasActiveSession = sessions.some((session) => !session.sessionEnd);
  if (!hasActiveSession) {
    await db.insert(usageSessions).values({
      childId: child.id,
      sessionStart: now,
      minutesUsed: 0,
      lessonsCompleted: 0,
      accuracyScore: 0,
    });
  }
}

export async function ensureConversationAccess(userId: number) {
  const safety = await getUserSafetyContext(userId);
  if (!safety.hasSafetyProfile) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Conclua o perfil etário e de segurança antes de iniciar conversas com IA.",
    });
  }
  if (safety.context.ageGroup === "infantil" && !safety.hasParentalConsent) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "É necessário consentimento do responsável para liberar conversas infantis.",
    });
  }
  if (safety.context.ageGroup === "infantil") {
    await enforceChildConversationTimeLimit(userId);
  }
  return safety.context;
}

export async function assessConversationText(
  userId: number,
  text: string,
  languageCode: string,
): Promise<ConversationSafetyDecision> {
  const context = await ensureConversationAccess(userId);
  const jurisdiction = isContentAllowedForJurisdiction(text, context.country, languageCode);
  if (!jurisdiction.allowed) {
    await recordConversationSafetyAlert(userId, "country_compliance_block");
    return { allowed: false, reason: "blocked_content", flaggedContent: [jurisdiction.reason || "Conteúdo incompatível com a jurisdição do perfil"] };
  }
  const deterministic = await checkContent(text, languageCode.split("-")[0]);
  if (deterministic.isBlocked) {
    await recordConversationSafetyAlert(userId, "blocked_input");
    return { allowed: false, reason: "blocked_content", flaggedContent: deterministic.matchedPatterns };
  }
  const semantic = await moderateAIResponse(context, text, text);
  if (!semantic.isAllowed) {
    await recordConversationSafetyAlert(userId, "blocked_output");
    return { allowed: false, reason: "blocked_content", flaggedContent: semantic.flaggedContent.map((item) => item.word) };
  }
  return { allowed: true, context };
}

export async function assessConversationOutput(
  userId: number,
  inputText: string,
  outputText: string,
  languageCode: string,
): Promise<ConversationSafetyDecision> {
  const context = await ensureConversationAccess(userId);
  const jurisdiction = isContentAllowedForJurisdiction(outputText, context.country, languageCode);
  if (!jurisdiction.allowed) {
    await recordConversationSafetyAlert(userId, "country_compliance_block");
    return { allowed: false, reason: "blocked_content", flaggedContent: [jurisdiction.reason || "Conteúdo incompatível com a jurisdição do perfil"] };
  }
  const deterministic = await checkContent(outputText, languageCode.split("-")[0]);
  if (deterministic.isBlocked) {
    await recordConversationSafetyAlert(userId, "blocked_output");
    return { allowed: false, reason: "blocked_content", flaggedContent: deterministic.matchedPatterns };
  }
  const semantic = await moderateAIResponse(context, inputText, outputText);
  if (!semantic.isAllowed) {
    await recordConversationSafetyAlert(userId, "blocked_output");
    return { allowed: false, reason: "blocked_content", flaggedContent: semantic.flaggedContent.map((item) => item.word) };
  }
  return { allowed: true, context };
}
