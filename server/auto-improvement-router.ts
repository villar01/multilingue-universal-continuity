/**
 * Router tRPC para Sistema de Autoaperfeiçoamento com Blackbox AI
 */

import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { autoFixTTSPronunciation, testPronunciationQuality, getOptimizedTTSConfig, CERTIFIED_VOICES } from "./tts-auto-fix";
import { generateFeatureCode, autoImproveSystem } from "./blackbox-ai";

export const autoImprovementRouter = router({
  /**
   * Corrige automaticamente problemas de pronúncia TTS
   */
  fixTTSPronunciation: publicProcedure
    .input(
      z.object({
        language: z.string(),
        text: z.string(),
        currentVoiceId: z.string(),
        currentRate: z.number(),
        currentPitch: z.number(),
        issues: z.array(z.string()),
        userFeedback: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await autoFixTTSPronunciation({
        language: input.language,
        text: input.text,
        currentConfig: {
          voiceId: input.currentVoiceId,
          rate: input.currentRate,
          pitch: input.currentPitch,
          volume: 1.0,
          provider: "elevenlabs",
        },
        issues: input.issues,
        userFeedback: input.userFeedback,
      });

      return {
        success: true,
        fixedConfig: result.fixedConfig,
        analysis: result.analysis,
        improvements: result.improvements,
        confidence: result.confidence,
      };
    }),

  /**
   * Testa qualidade de pronúncia
   */
  testPronunciation: publicProcedure
    .input(
      z.object({
        language: z.string(),
        text: z.string(),
        voiceId: z.string(),
        rate: z.number(),
        pitch: z.number(),
      })
    )
    .query(async ({ input }) => {
      const result = await testPronunciationQuality(input);
      return {
        score: result.score,
        issues: result.issues,
        recommendations: result.recommendations,
        passed: result.score >= 80,
      };
    }),

  /**
   * Retorna configuração TTS otimizada
   */
  getOptimizedConfig: publicProcedure
    .input(
      z.object({
        language: z.string(),
        gender: z.enum(["MALE", "FEMALE"]).optional(),
        useCase: z.enum(["lesson", "conversation", "exercise"]).optional(),
      })
    )
    .query(({ input }) => {
      const config = getOptimizedTTSConfig(input);
      return {
        voiceId: config.voiceId,
        rate: config.rate,
        pitch: config.pitch,
        volume: config.volume,
        provider: config.provider,
      };
    }),

  /**
   * Lista todas vozes certificadas disponíveis
   */
  getCertifiedVoices: publicProcedure.query(() => {
    return {
      voices: CERTIFIED_VOICES,
    };
  }),

  /**
   * Gera código automaticamente para funcionalidade pendente
   */
  generateFeature: publicProcedure
    .input(
      z.object({
        featureName: z.string(),
        description: z.string(),
        techStack: z.array(z.string()),
        existingCode: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await generateFeatureCode(input);
      return {
        success: true,
        code: result.code,
        explanation: result.explanation,
        dependencies: result.dependencies,
        testCases: result.testCases,
      };
    }),

  /**
   * Sistema de autoaperfeiçoamento: detecta e resolve problemas
   */
  autoFix: publicProcedure
    .input(
      z.object({
        problemDescription: z.string(),
        affectedFiles: z.array(z.string()),
        errorLogs: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await autoImproveSystem(input);
      return {
        success: true,
        rootCause: result.rootCause,
        solution: result.solution,
        codeChanges: result.codeChanges,
        preventionSteps: result.preventionSteps,
      };
    }),
});
