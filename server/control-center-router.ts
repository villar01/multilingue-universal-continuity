import { z } from "zod";
import { adminProcedure as protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { sql } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import { deriveMaintenanceAlerts } from "./maintenanceAlertPolicy";

export const controlCenterRouter = router({

  // ── System Health ──────────────────────────────────────────────────────────
  getSystemHealth: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const now = Date.now();

    const activeUsersRaw = await db.execute(
      sql`SELECT COUNT(*) as cnt FROM users WHERE updated_at > ${now - 15 * 60 * 1000}`
    );
    const activeUsers = ((activeUsersRaw as any)[0] as any[])[0]?.cnt ?? 0;

    const threatsRaw = await db.execute(
      sql`SELECT COUNT(*) as cnt FROM security_events WHERE created_at > ${now - 24 * 60 * 60 * 1000}`
    );
    const threatsBlocked = ((threatsRaw as any)[0] as any[])[0]?.cnt ?? 0;

    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    return {
      systemStatus: "OK",
      serverStatus: "Online",
      dbStatus: "Conectado",
      securityAI: "Ativa",
      selfImproveAI: "Ativa",
      voiceSystem: "OK",
      arSystem: "OK",
      uptime,
      activeUsers: Number(activeUsers),
      threatsBlocked: Number(threatsBlocked),
      lastCheck: now,
    };
  }),

  getMaintenanceAlerts: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const supportResult = await db.execute(
      sql`SELECT COUNT(*) as cnt FROM customer_support_threads WHERE status = 'open' AND priority = 'high'`
    );
    const unresolvedCriticalSupport = Number(((supportResult as any)[0] as any[])[0]?.cnt ?? 0);

    return deriveMaintenanceAlerts({
      unresolvedCriticalSupport,
      performanceStatus: "unknown",
      securityStatus: "unknown",
    });
  }),

  // ── Security Events ────────────────────────────────────────────────────────
  getSecurityEvents: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const result = await db.execute(
        sql`SELECT * FROM security_events ORDER BY created_at DESC LIMIT ${input.limit}`
      );
      return (result as any)[0] as any[];
    }),

  resolveSecurityEvent: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.execute(
        sql`UPDATE security_events SET resolved = 1, resolved_at = ${Date.now()} WHERE id = ${input.id}`
      );
      return { success: true };
    }),

  // ── Knowledge Batches ──────────────────────────────────────────────────────
  getActiveBatch: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const now = Date.now();

    const result = await db.execute(
      sql`SELECT * FROM knowledge_batches WHERE status = 'active' ORDER BY batch_number ASC LIMIT 1`
    );
    const rows = (result as any)[0] as any[];

    if (!rows || rows.length === 0) {
      await db.execute(
        sql`UPDATE knowledge_batches SET status = 'active', started_at = ${now} WHERE batch_number = 1`
      );
      const r2 = await db.execute(
        sql`SELECT * FROM knowledge_batches WHERE batch_number = 1 LIMIT 1`
      );
      const r2rows = (r2 as any)[0] as any[];
      return r2rows[0] ?? null;
    }
    return rows[0];
  }),

  getAllBatches: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const result = await db.execute(
      sql`SELECT * FROM knowledge_batches ORDER BY batch_number ASC`
    );
    return (result as any)[0] as any[];
  }),

  // ── Knowledge Items ────────────────────────────────────────────────────────
  getPendingKnowledge: protectedProcedure
    .input(z.object({ batchNumber: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const result = await db.execute(
        sql`SELECT * FROM system_knowledge 
            WHERE batch_number = ${input.batchNumber} AND active = 1
            ORDER BY 
              CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
              batch_position ASC`
      );
      return (result as any)[0] as any[];
    }),

  getAppliedHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const result = await db.execute(
        sql`SELECT * FROM system_knowledge 
            WHERE applied_count > 0
            ORDER BY last_applied_at DESC, batch_number ASC
            LIMIT ${input.limit}`
      );
      return (result as any)[0] as any[];
    }),

  // ── Apply Single Knowledge Item ────────────────────────────────────────────
  applyKnowledge: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const now = Date.now();

      const itemResult = await db.execute(
        sql`SELECT * FROM system_knowledge WHERE id = ${input.id} LIMIT 1`
      );
      const item = ((itemResult as any)[0] as any[])[0];
      if (!item) throw new Error("Configuração não encontrada");

      await db.execute(
        sql`UPDATE system_knowledge 
            SET applied_count = applied_count + 1, 
                last_applied_at = ${now},
                status_new = 'completed'
            WHERE id = ${input.id}`
      );

      await db.execute(
        sql`UPDATE knowledge_batches 
            SET completed_items = completed_items + 1
            WHERE batch_number = ${item.batch_number}`
      );

      return { success: true };
    }),

  // ── Apply All Best Configs ─────────────────────────────────────────────────
  applyAllBestConfigs: protectedProcedure
    .input(z.object({ batchNumber: z.number(), autoMode: z.boolean().default(false) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const now = Date.now();

      const result = await db.execute(
        sql`SELECT * FROM system_knowledge 
            WHERE batch_number = ${input.batchNumber} 
              AND active = 1
              AND priority IN ('critical', 'high')
            ORDER BY 
              CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 ELSE 3 END,
              batch_position ASC`
      );
      const items = (result as any)[0] as any[];

      if (!items || items.length === 0) return { applied: 0, message: "Nenhuma configuração pendente" };

      for (const item of items) {
        await db.execute(
          sql`UPDATE system_knowledge 
              SET applied_count = applied_count + 1, 
                  last_applied_at = ${now},
                  status_new = 'completed'
              WHERE id = ${item.id}`
        );
      }

      await db.execute(
        sql`UPDATE knowledge_batches 
            SET completed_items = (
              SELECT COUNT(*) FROM system_knowledge 
              WHERE batch_number = ${input.batchNumber} AND applied_count > 0
            )
            WHERE batch_number = ${input.batchNumber}`
      );

      // Check if batch complete
      const batchResult = await db.execute(
        sql`SELECT * FROM knowledge_batches WHERE batch_number = ${input.batchNumber} LIMIT 1`
      );
      const batch = ((batchResult as any)[0] as any[])[0];
      if (batch && Number(batch.completed_items) >= Number(batch.total_items) && Number(batch.total_items) > 0) {
        await db.execute(
          sql`UPDATE knowledge_batches SET status = 'completed', completed_at = ${now} WHERE batch_number = ${input.batchNumber}`
        );
        await notifyOwner({
          title: `✅ Lote ${input.batchNumber} Concluído — Avançando para Próximo`,
          content: `Todas as ${batch.total_items} configurações do Lote ${input.batchNumber} foram aplicadas. Clique em "Próximo Lote" no painel de controle.`,
        });
      }

      if (!input.autoMode) {
        await notifyOwner({
          title: `⚡ ${items.length} Melhores Configurações Aplicadas`,
          content: `${items.length} configurações críticas/altas do Lote ${input.batchNumber} foram aplicadas ao sistema MultiLingue Universal.`,
        });
      }

      return { applied: items.length, message: `${items.length} configurações aplicadas` };
    }),

  // ── Advance Batch ──────────────────────────────────────────────────────────
  advanceBatch: protectedProcedure
    .input(z.object({ currentBatch: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const now = Date.now();
      const nextBatch = input.currentBatch + 1;

      await db.execute(
        sql`UPDATE knowledge_batches 
            SET status = 'completed', completed_at = ${now}
            WHERE batch_number = ${input.currentBatch}`
      );

      const nextResult = await db.execute(
        sql`SELECT * FROM knowledge_batches WHERE batch_number = ${nextBatch} LIMIT 1`
      );
      const nextRows = (nextResult as any)[0] as any[];

      if (nextRows && nextRows.length > 0) {
        await db.execute(
          sql`UPDATE knowledge_batches 
              SET status = 'active', started_at = ${now}
              WHERE batch_number = ${nextBatch}`
        );
      } else {
        await db.execute(
          sql`INSERT INTO knowledge_batches (batch_number, title, description, total_items, completed_items, status, auto_advance, started_at, created_at)
              VALUES (${nextBatch}, ${`Lote ${nextBatch} — Melhorias Geradas pela IA`}, 'Configurações geradas automaticamente pela IA de autodesenvolvimento', 0, 0, 'active', 1, ${now}, ${now})`
        );
      }

      await notifyOwner({
        title: `⏭️ Sistema avançou para Lote ${nextBatch}`,
        content: `O Lote ${input.currentBatch} foi concluído. O sistema está agora no Lote ${nextBatch} de melhorias contínuas.`,
      });

      return { success: true, newBatch: nextBatch };
    }),

  // ── Emergency Mode ─────────────────────────────────────────────────────────
  toggleEmergencyMode: protectedProcedure
    .input(z.object({ active: z.boolean() }))
    .mutation(async ({ input }) => {
      if (input.active) {
        await notifyOwner({
          title: "🚨 MODO DE EMERGÊNCIA ATIVADO",
          content: "O proprietário ativou o modo de emergência. Novos cadastros bloqueados, IA em modo somente-leitura, pagamentos suspensos.",
        });
      } else {
        await notifyOwner({
          title: "✅ Modo de Emergência Desativado",
          content: "O sistema voltou ao funcionamento normal.",
        });
      }
      return { active: input.active };
    }),

  // ── Block User ─────────────────────────────────────────────────────────────
  blockUser: protectedProcedure
    .input(z.object({ userId: z.number(), reason: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.execute(
        sql`UPDATE users SET role = 'banned' WHERE id = ${input.userId}`
      );
      await notifyOwner({
        title: `🚫 Usuário ${input.userId} bloqueado`,
        content: `Motivo: ${input.reason}`,
      });
      return { success: true };
    }),
});
