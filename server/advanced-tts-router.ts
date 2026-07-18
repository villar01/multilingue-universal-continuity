import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { generateAdvancedTTS, extractPhonemes, calculatePhonemeDurations } from "./advanced-tts";

export const advancedTTSRouter = router({
  // Gerar áudio TTS com vozes ultra-realistas
  generate: publicProcedure
    .input(
      z.object({
        text: z.string().min(1).max(5000),
        languageCode: z.string().default("pt-BR"),
        voiceGender: z.enum(["MALE", "FEMALE", "NEUTRAL"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await generateAdvancedTTS(input);
      return result;
    }),

  // Extrair phonemes para animação labial
  getPhonemes: publicProcedure
    .input(
      z.object({
        text: z.string().min(1).max(5000),
        languageCode: z.string().default("pt-BR"),
        duration: z.number().optional(),
      })
    )
    .query(({ input }) => {
      const phonemes = extractPhonemes(input.text, input.languageCode);
      const duration = input.duration || phonemes.length * 0.1; // 100ms por phoneme
      const phonemeDurations = calculatePhonemeDurations(phonemes, duration);

      return {
        phonemes,
        phonemeDurations,
        totalDuration: duration,
      };
    }),
});
