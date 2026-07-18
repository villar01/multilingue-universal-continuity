/**
 * MODERATION ROUTER - tRPC endpoints para dashboard de moderação
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import {
  moderationAlerts,
  conversationLogs,
  blockedContent,
  userSafetyProfile,
  type InsertBlockedContent,
} from "../drizzle/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const moderationRouter = router({
  /**
   * Estatísticas de moderação
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Apenas admin pode acessar
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const db = await getDb();
    if (!db) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Alertas pendentes
    const pendingAlertsResult = await (db as any)
      .select({ count: sql<number>`COUNT(*)` })
      .from(moderationAlerts)
      .where(eq(moderationAlerts.status, "pending"));
    const pendingAlerts = Number(pendingAlertsResult[0]?.count || 0);

    // Conversas hoje
    const conversationsTodayResult = await (db as any)
      .select({ count: sql<number>`COUNT(*)` })
      .from(conversationLogs)
      .where(gte(conversationLogs.createdAt, today));
    const conversationsToday = Number(conversationsTodayResult[0]?.count || 0);

    // Bloqueadas hoje
    const blockedTodayResult = await (db as any)
      .select({ count: sql<number>`COUNT(*)` })
      .from(conversationLogs)
      .where(
        and(
          gte(conversationLogs.createdAt, today),
          eq(conversationLogs.wasBlocked, true)
        )
      );
    const blockedToday = Number(blockedTodayResult[0]?.count || 0);

    // Taxa de bloqueio (7 dias)
    const totalLast7DaysResult = await (db as any)
      .select({ count: sql<number>`COUNT(*)` })
      .from(conversationLogs)
      .where(gte(conversationLogs.createdAt, sevenDaysAgo));
    const totalLast7Days = Number(totalLast7DaysResult[0]?.count || 0);

    const blockedLast7DaysResult = await (db as any)
      .select({ count: sql<number>`COUNT(*)` })
      .from(conversationLogs)
      .where(
        and(
          gte(conversationLogs.createdAt, sevenDaysAgo),
          eq(conversationLogs.wasBlocked, true)
        )
      );
    const blockedLast7Days = Number(blockedLast7DaysResult[0]?.count || 0);

    const blockRate = totalLast7Days > 0 ? blockedLast7Days / totalLast7Days : 0;

    // Total conversas (30 dias)
    const totalConversationsResult = await (db as any)
      .select({ count: sql<number>`COUNT(*)` })
      .from(conversationLogs)
      .where(gte(conversationLogs.createdAt, thirtyDaysAgo));
    const totalConversations = Number(totalConversationsResult[0]?.count || 0);

    // Total bloqueadas (30 dias)
    const totalBlockedResult = await (db as any)
      .select({ count: sql<number>`COUNT(*)` })
      .from(conversationLogs)
      .where(
        and(
          gte(conversationLogs.createdAt, thirtyDaysAgo),
          eq(conversationLogs.wasBlocked, true)
        )
      );
    const totalBlocked = Number(totalBlockedResult[0]?.count || 0);

    // Total reformuladas (30 dias)
    const totalReformulatedResult = await (db as any)
      .select({ count: sql<number>`COUNT(*)` })
      .from(conversationLogs)
      .where(
        and(
          gte(conversationLogs.createdAt, thirtyDaysAgo),
          eq(conversationLogs.wasReformulated, true)
        )
      );
    const totalReformulated = Number(totalReformulatedResult[0]?.count || 0);

    // Violações por tipo
    const violationsByTypeResult = await (db as any)
      .select({
        type: moderationAlerts.violationType,
        count: sql<number>`COUNT(*)`,
      })
      .from(moderationAlerts)
      .where(gte(moderationAlerts.createdAt, thirtyDaysAgo))
      .groupBy(moderationAlerts.violationType);

    const violationsByType = violationsByTypeResult.map((row: any) => ({
      type: row.type,
      count: Number(row.count),
    }));

    return {
      pendingAlerts,
      conversationsToday,
      blockedToday,
      blockRate,
      totalConversations,
      totalBlocked,
      totalReformulated,
      violationsByType,
    };
  }),

  /**
   * Buscar alertas pendentes
   */
  getPendingAlerts: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const db = await getDb();
    if (!db) return [];

    const alerts = await (db as any)
      .select()
      .from(moderationAlerts)
      .where(eq(moderationAlerts.status, "pending"))
      .orderBy(desc(moderationAlerts.createdAt))
      .limit(50);

    return alerts;
  }),

  /**
   * Buscar logs recentes
   */
  getRecentLogs: protectedProcedure
    .input(z.object({ limit: z.number().optional().default(50) }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) return [];

      const logs = await (db as any)
        .select()
        .from(conversationLogs)
        .orderBy(desc(conversationLogs.createdAt))
        .limit(input.limit);

      return logs;
    }),

  /**
   * Buscar palavras bloqueadas
   */
  getBlockedWords: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const db = await getDb();
    if (!db) return [];

    const words = await (db as any)
      .select()
      .from(blockedContent)
      .where(
        and(
          eq(blockedContent.listType, "blacklist"),
          eq(blockedContent.isActive, true)
        )
      )
      .orderBy(blockedContent.content);

    return words;
  }),

  /**
   * Revisar alerta
   */
  reviewAlert: protectedProcedure
    .input(
      z.object({
        alertId: z.number(),
        status: z.enum(["reviewed", "resolved", "dismissed"]),
        actionTaken: z.enum(["none", "warning_sent", "content_blocked", "user_suspended", "escalated"]),
        reviewNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .update(moderationAlerts)
        .set({
          status: input.status,
          actionTaken: input.actionTaken,
          reviewedBy: ctx.user.id,
          reviewNotes: input.reviewNotes || null,
          reviewedAt: new Date(),
        } as any)
        .where(eq(moderationAlerts.id, input.alertId));

      return { success: true };
    }),

  /**
   * Adicionar palavra bloqueada
   */
  addBlockedWord: protectedProcedure
    .input(
      z.object({
        word: z.string(),
        ageGroups: z.array(z.string()),
        severity: z.enum(["low", "medium", "high", "critical"]),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const data: Omit<InsertBlockedContent, "id" | "createdAt" | "updatedAt"> = {
        listType: "blacklist",
        contentType: "word",
        content: input.word.toLowerCase(),
        isRegex: false,
        ageGroups: input.ageGroups,
        countries: null,
        religions: null,
        reason: input.reason,
        severity: input.severity,
        isActive: true,
        addedBy: ctx.user.id,
      };

      await (db as any).insert(blockedContent).values(data as any);

      return { success: true };
    }),

  /**
   * Remover palavra bloqueada
   */
  removeBlockedWord: protectedProcedure
    .input(z.object({ wordId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .update(blockedContent)
        .set({ isActive: false } as any)
        .where(eq(blockedContent.id, input.wordId));

      return { success: true };
    }),

  /**
   * Exportar logs para auditoria
   */
  exportLogs: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const startDate = new Date(input.startDate);
      const endDate = input.endDate ? new Date(input.endDate) : new Date();

      const logs = await (db as any)
        .select()
        .from(conversationLogs)
        .where(
          and(
            gte(conversationLogs.createdAt, startDate),
            lte(conversationLogs.createdAt, endDate)
          )
        )
        .orderBy(conversationLogs.createdAt);

      // Gerar CSV
      const headers = [
        "ID",
        "User ID",
        "Age Group",
        "Country",
        "Religion",
        "Conversation Type",
        "User Message",
        "AI Response",
        "Moderation Score",
        "Was Blocked",
        "Was Reformulated",
        "Created At",
      ];

      const rows = logs.map((log: any) => [
        log.id,
        log.userId,
        log.userAgeGroup || "",
        log.userCountry || "",
        log.userReligion || "",
        log.conversationType,
        `"${(log.userMessage || "").replace(/"/g, '""')}"`,
        `"${(log.aiResponse || "").replace(/"/g, '""')}"`,
        log.moderationScore,
        log.wasBlocked ? "Yes" : "No",
        log.wasReformulated ? "Yes" : "No",
        log.createdAt.toISOString(),
      ]);

      const csv = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");

      return { csv };
    }),
});
