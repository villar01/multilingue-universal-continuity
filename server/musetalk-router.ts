import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { ENV } from "./_core/env";

// MuseTalk via fal.ai - melhor lip-sync open source do mundo
// Recebe: URL do vídeo fonte (professor) + URL do áudio TTS
// Retorna: URL do vídeo com lip-sync perfeito sincronizado com o áudio

export const musetalKRouter = router({
  // Verificar se a API key do fal.ai está configurada
  status: publicProcedure.query(() => {
    return {
      available: !!ENV.falApiKey,
      message: ENV.falApiKey
        ? "MuseTalk disponível — lip-sync de IA ativo"
        : "Configure FAL_KEY nas configurações para ativar lip-sync de IA",
    };
  }),

  // Gerar vídeo com lip-sync perfeito usando MuseTalk
  generateLipSync: protectedProcedure
    .input(
      z.object({
        sourceVideoUrl: z.string().url(), // URL do vídeo do professor (pode ser um vídeo curto em loop)
        audioUrl: z.string().url(), // URL do áudio TTS gerado pelo Google Neural2
      })
    )
    .mutation(async ({ input }) => {
      if (!ENV.falApiKey) {
        throw new Error("FAL_KEY não configurado. Acesse as configurações para ativar o lip-sync de IA.");
      }

      try {
        // Chamar a API fal.ai MuseTalk via REST
        const response = await fetch("https://queue.fal.run/fal-ai/musetalk", {
          method: "POST",
          headers: {
            "Authorization": `Key ${ENV.falApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            source_video_url: input.sourceVideoUrl,
            audio_url: input.audioUrl,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`fal.ai API error: ${response.status} - ${error}`);
        }

        const queueResult = await response.json() as { request_id: string; status: string };
        const requestId = queueResult.request_id;

        // Polling para aguardar o resultado (max 60 segundos)
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          attempts++;

          const statusResponse = await fetch(
            `https://queue.fal.run/fal-ai/musetalk/requests/${requestId}/status`,
            {
              headers: { "Authorization": `Key ${ENV.falApiKey}` },
            }
          );

          const statusData = await statusResponse.json() as { status: string };

          if (statusData.status === "COMPLETED") {
            // Buscar o resultado
            const resultResponse = await fetch(
              `https://queue.fal.run/fal-ai/musetalk/requests/${requestId}`,
              {
                headers: { "Authorization": `Key ${ENV.falApiKey}` },
              }
            );
            const resultData = await resultResponse.json() as { video: { url: string } };
            return {
              success: true,
              videoUrl: resultData.video?.url,
              requestId,
            };
          }

          if (statusData.status === "FAILED") {
            throw new Error("MuseTalk falhou ao gerar o vídeo");
          }
        }

        throw new Error("Timeout: MuseTalk demorou mais de 60 segundos");
      } catch (error) {
        console.error("[MuseTalk] Erro:", error);
        throw error;
      }
    }),

  // Verificar status de uma requisição em andamento
  checkStatus: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .query(async ({ input }) => {
      if (!ENV.falApiKey) {
        return { status: "NO_KEY", videoUrl: null };
      }

      try {
        const statusResponse = await fetch(
          `https://queue.fal.run/fal-ai/musetalk/requests/${input.requestId}/status`,
          {
            headers: { "Authorization": `Key ${ENV.falApiKey}` },
          }
        );

        const statusData = await statusResponse.json() as { status: string };

        if (statusData.status === "COMPLETED") {
          const resultResponse = await fetch(
            `https://queue.fal.run/fal-ai/musetalk/requests/${input.requestId}`,
            {
              headers: { "Authorization": `Key ${ENV.falApiKey}` },
            }
          );
          const resultData = await resultResponse.json() as { video: { url: string } };
          return { status: "COMPLETED", videoUrl: resultData.video?.url };
        }

        return { status: statusData.status, videoUrl: null };
      } catch {
        return { status: "ERROR", videoUrl: null };
      }
    }),
});
