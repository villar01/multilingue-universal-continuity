import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";
import { getAbuseProtectionSummary } from "./abuseProtection";
import { getDb } from "../db";
import { customerSupportThreads, metrics, securityEvents } from "../../drizzle/schema";
import { sql, eq, and, gte, desc } from "drizzle-orm";
import { buildOwnerActivitySeries } from "../ownerActivitySummary";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  getAiMetrics: adminProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) {
        return {
          totalRequests: 0,
          cacheHitRate: 0,
          tokensSaved: 0,
          avgResponseTime: 0,
          ollamaUsage: 0,
          lmstudioUsage: 0,
          onlineUsage: 0,
          optimizationHistory: [],
          usageByLanguage: [],
        };
      }

      // Query all metrics from last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const allMetrics = await db
        .select()
        .from(metrics)
        .where(gte(metrics.createdAt, thirtyDaysAgo));

      const totalRequests = allMetrics.length;
      const cacheHits = allMetrics.filter((m) => m.cacheHit === true);
      const cacheHitRate = totalRequests > 0 ? (cacheHits.length / totalRequests) * 100 : 0;
      const tokensSaved = allMetrics.reduce((sum, m) => sum + (m.tokensSaved || 0), 0);
      const avgResponseTime =
        totalRequests > 0
          ? allMetrics.reduce((sum, m) => sum + (m.responseTime || 0), 0) / totalRequests / 1000
          : 0;

      // Provider usage distribution
      const ollamaCount = allMetrics.filter((m) => m.provider === "ollama").length;
      const lmstudioCount = allMetrics.filter((m) => m.provider === "lmstudio").length;
      const onlineCount = allMetrics.filter((m) => m.provider === "online").length;
      const ollamaUsage = totalRequests > 0 ? (ollamaCount / totalRequests) * 100 : 0;
      const lmstudioUsage = totalRequests > 0 ? (lmstudioCount / totalRequests) * 100 : 0;
      const onlineUsage = totalRequests > 0 ? (onlineCount / totalRequests) * 100 : 0;

      // Build optimization history from cache hit entries (sorted by date desc)
      const cacheHitEntries = cacheHits
        .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
        .slice(0, 10)
        .map((m) => ({
          date: m.createdAt?.toISOString().split("T")[0] || "",
          action: `Cache hit (${m.provider})`,
          tokensBefore: (m.tokensUsed ?? 0) + (m.tokensSaved ?? 0),
          tokensAfter: m.tokensUsed ?? 0,
          savingPercent:
            (m.tokensUsed ?? 0) + (m.tokensSaved ?? 0) > 0
              ? Math.round(((m.tokensSaved ?? 0) / ((m.tokensUsed ?? 0) + (m.tokensSaved ?? 0))) * 100)
              : 0,
        }));

      return {
        totalRequests,
        cacheHitRate: Math.round(cacheHitRate * 10) / 10,
        tokensSaved,
        avgResponseTime: Math.round(avgResponseTime * 100) / 100,
        ollamaUsage: Math.round(ollamaUsage),
        lmstudioUsage: Math.round(lmstudioUsage),
        onlineUsage: Math.round(onlineUsage),
        optimizationHistory: cacheHitEntries,
        usageByLanguage: [], // Will be populated when language tracking is added
      };
    } catch (error) {
      console.error("[getAiMetrics] Error:", error);
      return {
        totalRequests: 0,
        cacheHitRate: 0,
        tokensSaved: 0,
        avgResponseTime: 0,
        ollamaUsage: 0,
        lmstudioUsage: 0,
        onlineUsage: 0,
        optimizationHistory: [],
        usageByLanguage: [],
      };
    }
  }),

  getAbuseProtectionSummary: adminProcedure.query(() => getAbuseProtectionSummary()),

  getOwnerSupportSummary: adminProcedure.query(async () => {
    const abuse = getAbuseProtectionSummary();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let recentEvents: Array<{ severity: string; resolved: boolean | null; createdAt: Date | null }> = [];
    let supportThreads: Array<{ category: string; status: string; priority: string; createdAt: Date | null }> = [];
    let usageRecords: Array<{ createdAt: Date | null }> = [];

    try {
      const db = await getDb();
      if (db) {
        recentEvents = await db.select({
          severity: securityEvents.severity,
          resolved: securityEvents.resolved,
          createdAt: securityEvents.createdAt,
        }).from(securityEvents).where(gte(securityEvents.createdAt, sevenDaysAgo));
        supportThreads = await db.select({
          category: customerSupportThreads.category,
          status: customerSupportThreads.status,
          priority: customerSupportThreads.priority,
          createdAt: customerSupportThreads.createdAt,
        }).from(customerSupportThreads).where(gte(customerSupportThreads.updatedAt, sevenDaysAgo));
        usageRecords = await db.select({ createdAt: metrics.createdAt }).from(metrics).where(gte(metrics.createdAt, sevenDaysAgo));
      }
    } catch (error) {
      console.error("[getOwnerSupportSummary] Failed to aggregate operational events", error);
    }

    const unresolvedEvents = recentEvents.filter((event) => event.resolved !== true).length;
    const highPriorityEvents = recentEvents.filter(
      (event) => event.resolved !== true && (event.severity === "high" || event.severity === "critical"),
    ).length;
    const openSupportThreads = supportThreads.filter((thread) => thread.status !== "closed").length;
    const securityReports = supportThreads.filter((thread) => thread.category === "security" && thread.status !== "closed").length;
    const productFeedback = supportThreads.filter((thread) => (thread.category === "feedback" || thread.category === "idea" || thread.category === "bug") && thread.status !== "closed").length;
    const salesInterest = supportThreads.filter((thread) => thread.category === "sales" && thread.status !== "closed").length;
    const activity = buildOwnerActivitySeries({ usageRecords, incidentRecords: recentEvents, feedbackRecords: supportThreads });
    const suggestions = [
      ...(securityReports > 0 ? [{
        id: "review-customer-security-reports",
        priority: "high" as const,
        title: "Revisar relatos privados de segurança",
        detail: "Há relatos de segurança aguardando revisão do proprietário no canal privado.",
      }] : []),
      ...(productFeedback > 0 ? [{
        id: "review-customer-feedback",
        priority: "medium" as const,
        title: "Revisar melhorias enviadas por clientes",
        detail: "Há opiniões, ideias ou problemas aguardando classificação no canal privado.",
      }] : []),
      ...(salesInterest > 0 ? [{
        id: "review-customer-plan-interest",
        priority: "medium" as const,
        title: "Revisar interesses comerciais no canal privado",
        detail: "Há pessoas que sinalizaram interesse. Avalie cada conversa antes de apresentar plano, preço ou qualquer condição.",
      }] : []),
      ...(highPriorityEvents > 0 ? [{
        id: "review-high-priority-events",
        priority: "high" as const,
        title: "Revisar eventos de segurança pendentes",
        detail: "Existem eventos de alta prioridade aguardando revisão administrativa.",
      }] : []),
      ...(abuse.activeBlocks > 0 ? [{
        id: "review-active-abuse-blocks",
        priority: "medium" as const,
        title: "Revisar contenções temporárias ativas",
        detail: "Há bloqueios automáticos ativos; confirme se a contenção continua proporcional.",
      }] : []),
      ...(unresolvedEvents === 0 && abuse.activeBlocks === 0 ? [{
        id: "maintain-security-review",
        priority: "low" as const,
        title: "Manter a revisão periódica de segurança",
        detail: "Não há pendência agregada neste momento. Preserve a revisão de acessos, backups e dados sensíveis.",
      }] : []),
    ];

    return {
      security: {
        eventsLast7Days: recentEvents.length,
        unresolvedEvents,
        highPriorityEvents,
        activeAbuseBlocks: abuse.activeBlocks,
        activeAbuseRecords: abuse.activeRecords,
      },
      customerFeedback: {
        openThreads: openSupportThreads,
        securityReports,
        productFeedback,
        salesInterest,
      },
      activity: {
        daily: activity,
        assistedRequestsLast7Days: activity.reduce((total, day) => total + day.assistedRequests, 0),
        incidentsLast7Days: activity.reduce((total, day) => total + day.securityIncidents, 0),
        customerReturnsLast7Days: activity.reduce((total, day) => total + day.customerReturns, 0),
      },
      suggestions,
      privacy: {
        containsPersonalData: false,
        containsStudentContent: false,
        containsVisitorIdentifiers: false,
      },
    };
  }),

  logSecurityEvent: adminProcedure
    .input(
      z.object({
        eventType: z.enum(["paywall_bypass", "rate_limit_exceeded", "scraping_detected", "bot_detected", "moral_violation", "legal_violation", "abuse_content", "discrimination", "unauthorized_access", "suspicious_pattern", "ddos_attempt", "sql_injection", "xss_attempt", "other"]),
        severity: z.enum(["low", "medium", "high", "critical"]).default("low"),
        description: z.string().trim().min(1).max(240),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return { success: false };
        await db.insert(securityEvents).values({
          eventType: input.eventType,
          severity: input.severity,
          description: input.description,
          ipAddress: null,
          userId: ctx.user.id,
        });
        return { success: true };
      } catch (e) {
        console.error("[Security] Failed to log event:", e);
        return { success: false };
      }
    }),

  getSecurityEvents: adminProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) return { events: [] };
      const events = await db.select().from(securityEvents).orderBy(desc(securityEvents.createdAt)).limit(50);
      return { events };
    } catch (e) {
      console.error("[Security] Failed to fetch events:", e);
      return { events: [] };
    }
  }),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
});
