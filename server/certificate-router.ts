import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { generateCertificate } from "./certificate-generator";
import { getDb } from "./db";
import { sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const certificateRouter = router({
  // Gerar certificado para um idioma
  generate: protectedProcedure
    .input(
      z.object({
        languageCode: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar se é VIP
      if ((ctx.user as any).subscriptionStatus !== 'vip') {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Certificados estão disponíveis apenas para assinantes VIP. Faça upgrade agora!",
        });
      }

      const certificateData = await generateCertificate(ctx.user.id, input.languageCode);
      return {
        certificateData,
        html: `<div>Certificado: ${certificateData.studentName} - ${certificateData.languageName}</div>`,
      };
    }),

  // Verificar elegibilidade para certificado
  checkEligibility: protectedProcedure
    .input(
      z.object({
        languageCode: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const progressRows = await db.execute(sql`SELECT COUNT(DISTINCT lesson_id) as completed FROM user_progress WHERE user_id = ${ctx.user.id} AND completed = 1`);
      const progressArr = (progressRows as any).rows ?? progressRows;
      const completedLessons = progressArr && (progressArr as any[]).length > 0 ? (progressArr as any[])[0].completed : 0;

      const totalRows = await db.execute(sql`SELECT COUNT(*) as total FROM lessons WHERE languageCode = ${input.languageCode}`);
      const totalArr = (totalRows as any).rows ?? totalRows;
      const totalLessons = totalArr && (totalArr as any[]).length > 0 ? (totalArr as any[])[0].total : 0;

      const completionPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      const isEligible = completionPercentage >= 80;

      return {
        isEligible,
        isVIP: (ctx.user as any).role === 'admin',
        completedLessons: Number(completedLessons),
        totalLessons: Number(totalLessons),
        completionPercentage: parseFloat(completionPercentage.toFixed(1)),
        requiredPercentage: 80,
      };
    }),
});
