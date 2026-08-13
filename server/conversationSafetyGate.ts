import { TRPCError } from "@trpc/server";
import { getUserSafetyContext, moderateAIResponse } from "./content-moderation";
import { checkContent } from "./contentFilter";
import { recordConversationSafetyAlert } from "./parentalConversationAlert";
import { isContentAllowedForJurisdiction } from "../client/src/lib/country-compliance";

export type ConversationSafetyDecision =
  | { allowed: true; context: Awaited<ReturnType<typeof getUserSafetyContext>>["context"] }
  | { allowed: false; reason: "blocked_content"; flaggedContent: string[] };

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
