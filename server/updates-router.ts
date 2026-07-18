/**
 * updates-router.ts
 * Gerencia atualizações contínuas do app sem interrupção de serviço.
 * - Admin publica atualizações com agendamento
 * - Alunos recebem notificações automáticas de novas lições/professores/funcionalidades
 * - Sistema de leitura/confirmação por usuário
 */

import { z } from "zod";
import { sql } from "drizzle-orm";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { notifyOwner } from "./_core/notification";

function now() { return Date.now(); }

async function isAdmin(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.execute(sql`SELECT role FROM user WHERE id = ${userId} LIMIT 1`);
  const rows = (result as any)[0] as any[];
  return rows && rows.length > 0 && rows[0].role === "admin";
}

export const updatesRouter = router({

  /** Lista atualizações publicadas (para alunos) */
  listPublished: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const limit = input?.limit ?? 10;
      const ts = now();
      const result = await db.execute(
        sql`SELECT * FROM app_updates
            WHERE is_published = 1
              AND (scheduled_at IS NULL OR scheduled_at <= ${ts})
            ORDER BY published_at DESC
            LIMIT ${limit}`
      );
      const rows = (result as any)[0] as any[];
      if (!rows) return [];
      return rows.map((r: any) => ({
        id: r.id,
        version: r.version,
        title: r.title,
        description: r.description,
        updateType: r.update_type as string,
        affectedLanguages: r.affected_languages ? JSON.parse(r.affected_languages) : ["all"],
        isCritical: r.is_critical === 1,
        publishedAt: r.published_at as number,
      }));
    }),

  /** Verifica se há atualizações não lidas para o usuário logado */
  getUnread: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { count: 0, hasCritical: false, updates: [] };
    const ts = now();
    const result = await db.execute(
      sql`SELECT u.id, u.version, u.title, u.update_type, u.is_critical, u.published_at
          FROM app_updates u
          LEFT JOIN user_update_reads r ON r.update_id = u.id AND r.user_id = ${ctx.user.id}
          WHERE u.is_published = 1
            AND (u.scheduled_at IS NULL OR u.scheduled_at <= ${ts})
            AND r.id IS NULL
          ORDER BY u.published_at DESC`
    );
    const rows = (result as any)[0] as any[];
    if (!rows) return { count: 0, hasCritical: false, updates: [] };
    return {
      count: rows.length,
      hasCritical: rows.some((r: any) => r.is_critical === 1),
      updates: rows.map((r: any) => ({
        id: r.id as number,
        version: r.version as string,
        title: r.title as string,
        updateType: r.update_type as string,
        isCritical: r.is_critical === 1,
        publishedAt: r.published_at as number,
      })),
    };
  }),

  /** Marca uma ou todas as atualizações como lidas */
  markRead: protectedProcedure
    .input(z.object({ updateId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const ts = now();
      if (input.updateId) {
        await db.execute(
          sql`INSERT IGNORE INTO user_update_reads (user_id, update_id, read_at)
              VALUES (${ctx.user.id}, ${input.updateId}, ${ts})`
        );
      } else {
        const result = await db.execute(sql`SELECT id FROM app_updates WHERE is_published = 1`);
        const rows = (result as any)[0] as any[];
        if (rows) {
          for (const row of rows) {
            await db.execute(
              sql`INSERT IGNORE INTO user_update_reads (user_id, update_id, read_at)
                  VALUES (${ctx.user.id}, ${row.id}, ${ts})`
            );
          }
        }
      }
      return { success: true };
    }),

  /** [ADMIN] Lista todas as atualizações */
  adminList: protectedProcedure.query(async ({ ctx }) => {
    if (!(await isAdmin(ctx.user.id))) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
    }
    const db = await getDb();
    if (!db) return [];
    const result = await db.execute(
      sql`SELECT * FROM app_updates ORDER BY created_at DESC`
    );
    const rows = (result as any)[0] as any[];
    if (!rows) return [];
    return rows.map((r: any) => ({
      id: r.id as number,
      version: r.version as string,
      title: r.title as string,
      description: r.description as string,
      updateType: r.update_type as string,
      affectedLanguages: r.affected_languages ? JSON.parse(r.affected_languages) : ["all"],
      isPublished: r.is_published === 1,
      isCritical: r.is_critical === 1,
      scheduledAt: r.scheduled_at as number | null,
      publishedAt: r.published_at as number | null,
      createdBy: r.created_by as string,
      createdAt: r.created_at as number,
    }));
  }),

  /** [ADMIN] Cria nova atualização */
  adminCreate: protectedProcedure
    .input(z.object({
      version: z.string().min(1).max(20),
      title: z.string().min(1).max(200),
      description: z.string().min(1),
      updateType: z.enum(["lesson", "teacher", "feature", "security", "bugfix", "content"]),
      affectedLanguages: z.array(z.string()).default(["all"]),
      isCritical: z.boolean().default(false),
      publishNow: z.boolean().default(false),
      scheduledAt: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!(await isAdmin(ctx.user.id))) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const ts = now();
      const publishedAt = input.publishNow ? ts : null;
      const langs = JSON.stringify(input.affectedLanguages);
      const isPublished = input.publishNow ? 1 : 0;
      const isCritical = input.isCritical ? 1 : 0;
      const scheduledAt = input.scheduledAt ?? null;
      const createdBy = ctx.user.name || "admin";

      await db.execute(
        sql`INSERT INTO app_updates
              (version, title, description, update_type, affected_languages, is_published, is_critical, scheduled_at, published_at, created_by, created_at, updated_at)
            VALUES
              (${input.version}, ${input.title}, ${input.description}, ${input.updateType},
               ${langs}, ${isPublished}, ${isCritical}, ${scheduledAt}, ${publishedAt},
               ${createdBy}, ${ts}, ${ts})`
      );

      if (input.publishNow) {
        await notifyOwner({
          title: `🚀 Nova atualização publicada: v${input.version}`,
          content: `**${input.title}**\n\n${input.description}\n\nTipo: ${input.updateType} | Crítica: ${input.isCritical ? "Sim" : "Não"}`,
        });
      }
      return { success: true };
    }),

  /** [ADMIN] Publica uma atualização existente */
  adminPublish: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!(await isAdmin(ctx.user.id))) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const ts = now();
      await db.execute(
        sql`UPDATE app_updates SET is_published = 1, published_at = ${ts}, updated_at = ${ts} WHERE id = ${input.id}`
      );
      const result = await db.execute(sql`SELECT * FROM app_updates WHERE id = ${input.id}`);
      const rows = (result as any)[0] as any[];
      if (rows && rows.length > 0) {
        const u = rows[0];
        await notifyOwner({
          title: `✅ Atualização publicada: v${u.version}`,
          content: `**${u.title}** está disponível para todos os alunos.`,
        });
      }
      return { success: true };
    }),

  /** [ADMIN] Deleta uma atualização */
  adminDelete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!(await isAdmin(ctx.user.id))) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.execute(sql`DELETE FROM app_updates WHERE id = ${input.id}`);
      await db.execute(sql`DELETE FROM user_update_reads WHERE update_id = ${input.id}`);
      return { success: true };
    }),

  /** [ADMIN] Estatísticas de leitura */
  adminStats: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!(await isAdmin(ctx.user.id))) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
      }
      const db = await getDb();
      if (!db) return { totalUsers: 0, readCount: 0, unreadCount: 0, readRate: 0 };
      const totalResult = await db.execute(sql`SELECT COUNT(*) as cnt FROM user`);
      const readResult = await db.execute(
        sql`SELECT COUNT(*) as cnt FROM user_update_reads WHERE update_id = ${input.id}`
      );
      const total = ((totalResult as any)[0] as any[])?.[0]?.cnt ?? 0;
      const read = ((readResult as any)[0] as any[])?.[0]?.cnt ?? 0;
      return {
        totalUsers: total,
        readCount: read,
        unreadCount: total - read,
        readRate: total > 0 ? Math.round((read / total) * 100) : 0,
      };
    }),
});
