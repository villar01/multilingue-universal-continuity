import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { generateAI } from "./aiProvider";
import { assessConversationOutput, assessConversationText } from "./conversationSafetyGate";

const conversationTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(600),
});

const vocabularySchema = z.object({
  label: z.string().trim().min(1).max(80),
  translation: z.string().trim().min(1).max(100),
  example: z.string().trim().max(240).optional(),
});

const safeTargetReply = "I can help you practise vocabulary, grammar, places, and new sentences from this lesson. What would you like to practise?";

export function buildImmersiveTutorPrompt(input: {
  teacherName: string;
  targetLanguage: string;
  nativeLanguage: string;
  sceneTitle: string;
  sceneDescription: string;
  locationDisclosure: string;
  vocabulary: Array<{ label: string; translation: string; example?: string }>;
}) {
  const vocabulary = input.vocabulary
    .map((word) => `${word.label} = ${word.translation}${word.example ? ` (${word.example})` : ""}`)
    .join("; ");

  return `You are ${input.teacherName}, a real, patient ${input.targetLanguage} teacher in an interactive language lesson.
The student speaks ${input.nativeLanguage} and is learning ${input.targetLanguage}.
Scene: ${input.sceneTitle}. Scene context: ${input.sceneDescription}.
Declared location status: ${input.locationDisclosure}
Lesson vocabulary: ${vocabulary}.

Respond to any safe question that helps the student learn: vocabulary, grammar, sentence building, culture, places, pronunciation guidance, or how to use lesson words in new situations. Do not limit the student to visible objects or prewritten alternatives.
If the student makes a target-language mistake, gently give the corrected form and then answer their idea. Reuse lesson vocabulary where helpful and offer one short next practice.
Never invent a real country, city, landmark, or source for a generic illustration. If the declared location says the scene is generic, say that honestly and then offer a related language or geography practice example.
Write ONLY in ${input.targetLanguage}; keep the answer warm, clear, and limited to 1-3 short sentences. Do not use markdown, headings, emojis, or a third language.`;
}

export const immersiveSceneTutorRouter = router({
  chat: protectedProcedure
    .input(z.object({
      teacherName: z.string().trim().min(1).max(80),
      targetLanguage: z.string().trim().min(2).max(80),
      targetLocale: z.string().trim().min(2).max(12),
      nativeLanguage: z.string().trim().min(2).max(80),
      sceneTitle: z.string().trim().min(1).max(120),
      sceneDescription: z.string().trim().min(1).max(500),
      locationDisclosure: z.string().trim().min(1).max(500),
      vocabulary: z.array(vocabularySchema).min(1).max(18),
      studentMessage: z.string().trim().min(1).max(600),
      history: z.array(conversationTurnSchema).max(8).default([]),
    }))
    .mutation(async ({ input, ctx }) => {
      const blockedReply = { targetReply: safeTargetReply, blocked: true, provider: "safety" as const };
      let inputSafety;
      try {
        inputSafety = await assessConversationText(ctx.user.id, input.studentMessage, input.targetLocale);
      } catch {
        return blockedReply;
      }
      if (!inputSafety.allowed) return blockedReply;

      const messages = [
        { role: "system" as const, content: buildImmersiveTutorPrompt(input) },
        ...input.history.slice(-6),
        { role: "user" as const, content: input.studentMessage },
      ];

      try {
        const generated = await generateAI({
          messages,
          preferredProvider: "ollama",
          temperature: 0.35,
          max_tokens: 220,
          useCache: false,
          userId: ctx.user.id,
          allowRemoteFallback: true,
        });
        const targetReply = generated.content.trim();
        if (!targetReply) return blockedReply;
        const outputSafety = await assessConversationOutput(ctx.user.id, input.studentMessage, targetReply, input.targetLocale);
        if (!outputSafety.allowed) return blockedReply;
        return { targetReply, blocked: false, provider: generated.provider };
      } catch {
        return { targetReply: safeTargetReply, blocked: false, provider: "fallback" as const };
      }
    }),
});
