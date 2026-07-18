import { getDb } from './db';
import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const downloadsRouter = router({
  // Obter status de downloads do usuário no mês atual
  getDownloadStatus: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // Verificar limite baseado no plano do usuário
    let downloadLimit = 0;
    if ((ctx.user as any).subscriptionStatus === 'premium') {
      downloadLimit = 5;
    } else if ((ctx.user as any).subscriptionStatus === 'vip') {
      downloadLimit = 999999; // Ilimitado
    }

    // Buscar ou criar registro de downloads do mês
    const downloadRecord = (await (await getDb())!.execute(`SELECT * FROM user_downloads WHERE user_id = ${ctx.user.id} AND month = ${currentMonth}`)) as any[];

    if (!downloadRecord || (downloadRecord as any[]).length === 0) {
      // Criar novo registro
      await (await getDb())!.execute(`INSERT INTO user_downloads (user_id, month, download_count, download_limit) VALUES (${ctx.user.id}, ${currentMonth}, 0, ${downloadLimit})`);
      return {
        downloadCount: 0,
        downloadLimit,
        remaining: downloadLimit,
        canDownload: downloadLimit > 0,
      };
    }

    const record = (downloadRecord as any[])[0] as any;
    return {
      downloadCount: record.download_count,
      downloadLimit,
      remaining: Math.max(0, downloadLimit - record.download_count),
      canDownload: record.download_count < downloadLimit,
    };
  }),

  // Registrar um novo download
  recordDownload: publicProcedure
    .input(
      z.object({
        lessonId: z.number(),
        fileType: z.enum(['pdf', 'audio', 'video', 'material']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Usuários free não podem baixar
      if (!(ctx.user as any).subscriptionStatus || (ctx.user as any).subscriptionStatus === 'free') {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Faça upgrade para Premium ou VIP para baixar materiais",
        });
      }

      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // Verificar limite
      let downloadLimit = 0;
      if ((ctx.user as any).subscriptionStatus === 'premium') {
        downloadLimit = 5;
      } else if ((ctx.user as any).subscriptionStatus === 'vip') {
        downloadLimit = 999999;
      }

      // Buscar registro atual
      const downloadRecord = (await (await getDb())!.execute(`SELECT * FROM user_downloads WHERE user_id = ${ctx.user.id} AND month = ${currentMonth}`)) as any[];

      let currentCount = 0;
      if (downloadRecord && (downloadRecord as any[]).length > 0) {
        currentCount = ((downloadRecord as any[])[0] as any).download_count;
      }

      // Verificar se atingiu o limite
      if (currentCount >= downloadLimit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Limite de ${downloadLimit} downloads/mês atingido. Faça upgrade para VIP para downloads ilimitados!`,
        });
      }

      // Incrementar contador
      if (downloadRecord && (downloadRecord as any[]).length > 0) {
        await (await getDb())!.execute(`UPDATE user_downloads SET download_count = download_count + 1 WHERE user_id = ${ctx.user.id} AND month = ${currentMonth}`);
      } else {
        await (await getDb())!.execute(`INSERT INTO user_downloads (user_id, month, download_count, download_limit) VALUES (${ctx.user.id}, ${currentMonth}, 1, ${downloadLimit})`);
      }

      return {
        success: true,
        remaining: downloadLimit - (currentCount + 1),
      };
    }),

  // Obter histórico de downloads
  getDownloadHistory: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const history = (await (await getDb())!.execute(`SELECT * FROM user_downloads WHERE user_id = ${ctx.user.id} ORDER BY month DESC LIMIT 12`)) as any[];

    return history;
  }),
});
