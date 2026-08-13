/**
 * Translate Router — Tradução por Imagem (estilo Google Translate AR)
 */
import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { invokeLLM, type ImageContent, type TextContent } from "./_core/llm";
import { generateAI } from "./aiProvider";

export const translateRouter = router({
  translateImage: protectedProcedure
    .input(
      z.object({
        imageBase64: z.string(),
        targetLanguage: z.string().default("English"),
        nativeLanguage: z.string().default("Português"),
      })
    )
    .mutation(async ({ input }) => {
      // Usar LLM multimodal para detectar texto na imagem e traduzir
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an OCR and translation assistant. 
Analyze the image and detect any text visible in it.
For each text found, provide its translation to ${input.nativeLanguage}.
Return a JSON object with a "translations" array.
Each item must have: "original" (text found), "translated" (translation), "x" (horizontal position 0-100), "y" (vertical position 0-100).
If no text is found, return {"translations": []}.
Return ONLY valid JSON, nothing else.`,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url" as const,
                image_url: { url: input.imageBase64, detail: "low" as const },
              } as ImageContent,
              {
                type: "text" as const,
                text: `Detect all text in this image and translate each piece to ${input.nativeLanguage}. Return JSON only.`,
              } as TextContent,
            ],
          },
        ],
      });

      let translations: Array<{ original: string; translated: string; x: number; y: number }> = [];
      try {
        const content = response.choices?.[0]?.message?.content || "{}";
        const parsed = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));
        translations = parsed.translations || [];
      } catch {
        translations = [];
      }

      return { translations };
    }),

  translateWord: protectedProcedure
    .input(
      z.object({
        word: z.string(),
        fromLanguage: z.string().default("English"),
        toLanguage: z.string().default("Português"),
        context: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Translate from ${input.fromLanguage} to ${input.toLanguage}. Return ONLY the translation.`,
          },
          {
            role: "user",
            content: input.context
              ? `Translate "${input.word}" in this context: ${input.context}`
              : `Translate: ${input.word}`,
          },
        ],
      });
      const translation = response.choices?.[0]?.message?.content || input.word;
      return { translation: typeof translation === "string" ? translation : input.word };
    }),

  dialogueText: protectedProcedure
    .input(
      z.object({
        text: z.string().trim().min(1).max(600),
        sourceLanguage: z.string().trim().min(2).max(80),
        targetLanguage: z.string().trim().min(2).max(80),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input.sourceLanguage.toLowerCase() === input.targetLanguage.toLowerCase()) {
        return { translation: input.text, translated: false };
      }

      try {
        const response = await generateAI({
          messages: [
            {
              role: "system",
              content: `Translate educational dialogue from ${input.sourceLanguage} to ${input.targetLanguage}. Preserve the meaning, appropriate CEFR difficulty, and student-safe tone. Return ONLY the translated text, with no notes or labels.`,
            },
            { role: "user", content: input.text },
          ],
          temperature: 0,
          max_tokens: 400,
          useCache: true,
          userId: ctx.user.id,
        });
        const translation = response.content.trim();
        return { translation: translation || input.text, translated: Boolean(translation) };
      } catch {
        return { translation: input.text, translated: false };
      }
    }),
});
