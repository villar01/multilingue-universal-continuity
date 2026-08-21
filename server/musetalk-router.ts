import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

// A integração permanece desativada até uma validação real de qualidade, custo,
// privacidade, licenças e compatibilidade exata entre professor, fala e áudio.
// Nenhuma credencial por si só comprova que o lip-sync está pronto para alunos.

export const musetalKRouter = router({
  status: publicProcedure.query(() => {
    return {
      available: false,
      message: "Os retratos dos professores permanecem estáveis enquanto a sincronização facial por áudio passa por validação.",
    };
  }),

  generateLipSync: protectedProcedure
    .input(
      z.object({
        sourceVideoUrl: z.string().url(), // URL do vídeo do professor (pode ser um vídeo curto em loop)
        audioUrl: z.string().url(), // URL do áudio TTS gerado pelo Google Neural2
      })
    )
    .mutation(async (): Promise<{ success: boolean; videoUrl: string | null; requestId: string | null }> => {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "A sincronização facial por áudio permanece em validação. O retrato e o áudio compatível continuam disponíveis nesta lição.",
      });
    }),

  checkStatus: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .query(async () => {
      return { status: "VALIDATION_REQUIRED", videoUrl: null };
    }),
});
