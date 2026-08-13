import { TRPCError } from "@trpc/server";
import { getUserSafetyContext, moderateAIResponse } from "./content-moderation";
import { checkContent } from "./contentFilter";
import { recordConversationSafetyAlert } from "./parentalConversationAlert";

export type ConversationSafetyDecision =
  | { allowed: true; context: Awaited<ReturnType<typeof getUserSafetyContext>>["context"] }
  | { allowed: false; reason: "blocked_content"; flaggedContent: string[] };

export async function ensureConversationAccess(userId: number) {
  const safety = await getUserSafetyContext(userId);
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
