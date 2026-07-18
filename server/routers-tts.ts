/**
 * ═══════════════════════════════════════════════════════════════════
 * server/routers-tts.ts
 * Routers tRPC para TTS (Text-to-Speech) e Lip-Sync
 * ═══════════════════════════════════════════════════════════════════
 */

import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { ttsRouter } from "./tts-coqui-server";
import { lipSyncRouter } from "./lip-sync-claude";

// ─── SCHEMAS ──────────────────────────────────────────────────────────────────

const TTSRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  languageCode: z.string().min(2).max(5),
  gender: z.enum(["male", "female"]).optional().default("female"),
  speed: z.number().min(0.5).max(2.0).optional().default(1.0),
  emotion: z.enum(["neutral", "happy", "sad", "angry", "surprised"]).optional().default("neutral"),
});

const LipSyncRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  language: z.string().min(2).max(5),
  fps: z.number().min(15).max(60).optional().default(30),
});

// ─── TTS ROUTER ───────────────────────────────────────────────────────────────

export const ttsPublicRouter = router({
  /**
   * Sintetizar fala com Coqui XTTS v2
   * Suporta 57 idiomas com sotaques realistas
   */
  synthesize: publicProcedure
    .input(TTSRequestSchema)
    .mutation(async ({ input }) => {
      try {
        const result = await ttsRouter.synthesize(input);
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Erro ao sintetizar voz",
        };
      }
    }),

  /**
   * Obter lista de idiomas suportados
   */
  getLanguages: publicProcedure.query(async () => {
    try {
      const languages = await ttsRouter.getLanguages();
      return {
        success: true,
        languages,
        count: languages.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao obter idiomas",
      };
    }
  }),

  /**
   * Obter sotaque de um idioma
   */
  getAccent: publicProcedure
    .input(z.object({ languageCode: z.string() }))
    .query(async ({ input }) => {
      try {
        const accent = await ttsRouter.getAccent(input.languageCode);
        return {
          success: true,
          accent,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Erro ao obter sotaque",
        };
      }
    }),
});

// ─── LIP-SYNC ROUTER ──────────────────────────────────────────────────────────

export const lipSyncPublicRouter = router({
  /**
   * Gerar lip-sync completo (phonemas + frames)
   */
  generate: publicProcedure
    .input(LipSyncRequestSchema)
    .mutation(async ({ input }) => {
      try {
        const result = await lipSyncRouter.generateComplete(input.text, input.language);
        return {
          success: true,
          data: result,
          frameCount: result.frames.length,
          quality: result.quality,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Erro ao gerar lip-sync",
        };
      }
    }),

  /**
   * Gerar apenas phonemas
   */
  generatePhonemes: publicProcedure
    .input(z.object({ text: z.string(), language: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const phonemes = await lipSyncRouter.generatePhonemes(input.text, input.language);
        return {
          success: true,
          phonemes,
          count: phonemes.length,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Erro ao gerar phonemas",
        };
      }
    }),

  /**
   * Gerar frames de animação
   */
  generateFrames: publicProcedure
    .input(
      z.object({
        phonemes: z.array(
          z.object({
            phoneme: z.string(),
            viseme: z.number(),
            duration: z.number(),
            startTime: z.number(),
            confidence: z.number(),
          })
        ),
        fps: z.number().optional().default(30),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const frames = await lipSyncRouter.generateFrames(input.phonemes, input.fps);
        return {
          success: true,
          frames,
          count: frames.length,
          fps: input.fps,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Erro ao gerar frames",
        };
      }
    }),

  /**
   * Melhorar qualidade com feedback
   */
  improve: publicProcedure
    .input(
      z.object({
        text: z.string(),
        language: z.string(),
        feedback: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Gerar lip-sync inicial
        const initialData = await lipSyncRouter.generateComplete(input.text, input.language);

        // Melhorar com feedback
        const improvedData = await lipSyncRouter.improve(initialData, input.feedback);

        return {
          success: true,
          data: improvedData,
          qualityImprovement: improvedData.quality - initialData.quality,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Erro ao melhorar lip-sync",
        };
      }
    }),
});

// ─── ROUTER COMBINADO ─────────────────────────────────────────────────────────

export const voiceRouter = router({
  tts: ttsPublicRouter,
  lipSync: lipSyncPublicRouter,
});
