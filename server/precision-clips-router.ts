/**
 * Router tRPC para Geração de Clipes de Precisão Extrema
 */

import { z } from "zod";
import { adminProcedure, publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { generatePrecisionClip, generatePrecisionClipLibrary, savePrecisionClip } from "./precision-clip-generator";
import * as dbFunctions from "./db";
import { videoClips } from "../drizzle/schema";

export const precisionClipsRouter = router({
  /**
   * Gerar um único clipe de precisão
   */
  generateSingle: adminProcedure
    .input(
      z.object({
        topic: z.string().min(1),
        targetLanguage: z.string(),
        nativeLanguage: z.string(),
        difficulty: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
        duration: z.number().min(30).max(180), // 30-180 segundos
        accentVariation: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const clip = await generatePrecisionClip(input);
      const clipData = await savePrecisionClip(clip);
      
      // Salvar no banco via função do db.ts
      await dbFunctions.insertVideoClip(clipData);

      return {
        success: true,
        clip: {
          id: clip.id,
          title: clip.title,
          qualityScore: clip.qualityScore,
          verificationStatus: clip.verificationStatus,
        },
      };
    }),

  /**
   * Gerar biblioteca massiva de clipes (100+)
   */
  generateLibrary: adminProcedure
    .input(
      z.object({
        targetLanguage: z.string(),
        nativeLanguage: z.string(),
        difficulty: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
        count: z.number().min(1).max(200).default(100),
      })
    )
    .mutation(async ({ input }) => {
      const result = await generatePrecisionClipLibrary(input);

      return {
        success: true,
        generated: result.generated,
        approved: result.approved,
        failed: result.failed,
        message: `Gerados ${result.generated} clipes (${result.approved} aprovados, ${result.failed} falharam)`,
      };
    }),

  /**
   * Listar clipes gerados
   */
  list: publicProcedure
    .input(
      z.object({
        targetLanguage: z.string().optional(),
        difficulty: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const clips = await dbFunctions.getAllVideoClips();

      return {
        clips: clips.slice(0, input.limit),
        total: clips.length,
      };
    }),

  /**
   * Obter detalhes de um clipe
   */
  getById: publicProcedure
    .input(z.object({ clipId: z.number() }))
    .query(async ({ input }) => {
      const clip = await dbFunctions.getVideoClipById(input.clipId);

      if (!clip) {
        throw new Error("Clipe não encontrado");
      }

      return clip;
    }),

  /**
   * Obter estatísticas de clipes
   */
  getStats: protectedProcedure.query(async () => {
    const allClips = await dbFunctions.getAllVideoClips();

    return {
      total: allClips.length,
      averageQualityScore: allClips.length > 0 
        ? allClips.reduce((sum, clip) => sum + (clip.qualityScore || 0), 0) / allClips.length 
        : 0,
    };
  }),
});
