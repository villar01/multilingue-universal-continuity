import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte } from "drizzle-orm";
import { z } from "zod";
import { customerSupportMessages, customerSupportThreads } from "../drizzle/schema";
import { getDb } from "./db";
import { adminProcedure, protectedProcedure, router } from "./_core/trpc";

const contentSchema = z.string().trim().min(1, "Escreva uma mensagem.").max(1500, "A mensagem pode ter no máximo 1.500 caracteres.");

async function requireDb() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "O suporte privado está temporariamente indisponível." });
  return db;
}

async function assertMessageLimit(userId: number) {
  const db = await requireDb();
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await db.select({ id: customerSupportMessages.id })
    .from(customerSupportMessages)
    .where(and(eq(customerSupportMessages.authorUserId, userId), gte(customerSupportMessages.createdAt, since)))
    .limit(10);
  if (recent.length >= 10) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Para proteger o suporte, aguarde alguns minutos antes de enviar outra mensagem." });
  }
}

export const customerSupportRouter = router({
  create: protectedProcedure.input(z.object({
    subject: z.string().trim().min(3).max(180),
    category: z.enum(["help", "bug", "feedback", "idea", "security"]),
    content: contentSchema,
  })).mutation(async ({ ctx, input }) => {
    await assertMessageLimit(ctx.user.id);
    const db = await requireDb();
    const result = await db.insert(customerSupportThreads).values({
      userId: ctx.user.id, subject: input.subject, category: input.category,
    });
    const threadId = Number(result[0].insertId);
    await db.insert(customerSupportMessages).values({
      threadId, authorUserId: ctx.user.id, authorRole: "customer", content: input.content,
    });
    return { threadId };
  }),

  listMine: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDb();
    return db.select().from(customerSupportThreads)
      .where(eq(customerSupportThreads.userId, ctx.user.id))
      .orderBy(desc(customerSupportThreads.updatedAt));
  }),

  getMine: protectedProcedure.input(z.object({ threadId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = await requireDb();
    const [thread] = await db.select().from(customerSupportThreads)
      .where(and(eq(customerSupportThreads.id, input.threadId), eq(customerSupportThreads.userId, ctx.user.id))).limit(1);
    if (!thread) throw new TRPCError({ code: "NOT_FOUND", message: "Conversa privada não encontrada." });
    const messages = await db.select().from(customerSupportMessages)
      .where(eq(customerSupportMessages.threadId, thread.id))
      .orderBy(customerSupportMessages.createdAt);
    return { thread, messages };
  }),

  sendMine: protectedProcedure.input(z.object({ threadId: z.number().int().positive(), content: contentSchema })).mutation(async ({ ctx, input }) => {
    await assertMessageLimit(ctx.user.id);
    const db = await requireDb();
    const [thread] = await db.select({ id: customerSupportThreads.id, status: customerSupportThreads.status })
      .from(customerSupportThreads)
      .where(and(eq(customerSupportThreads.id, input.threadId), eq(customerSupportThreads.userId, ctx.user.id))).limit(1);
    if (!thread) throw new TRPCError({ code: "NOT_FOUND", message: "Conversa privada não encontrada." });
    if (thread.status === "closed") throw new TRPCError({ code: "FORBIDDEN", message: "Esta conversa já foi encerrada." });
    await db.insert(customerSupportMessages).values({ threadId: thread.id, authorUserId: ctx.user.id, authorRole: "customer", content: input.content });
    await db.update(customerSupportThreads).set({ status: "open", updatedAt: new Date() }).where(eq(customerSupportThreads.id, thread.id));
    return { success: true };
  }),

  adminList: adminProcedure.query(async () => {
    const db = await requireDb();
    return db.select().from(customerSupportThreads).orderBy(desc(customerSupportThreads.updatedAt)).limit(100);
  }),

  adminGet: adminProcedure.input(z.object({ threadId: z.number().int().positive() })).query(async ({ input }) => {
    const db = await requireDb();
    const [thread] = await db.select().from(customerSupportThreads).where(eq(customerSupportThreads.id, input.threadId)).limit(1);
    if (!thread) throw new TRPCError({ code: "NOT_FOUND", message: "Conversa privada não encontrada." });
    const messages = await db.select().from(customerSupportMessages)
      .where(eq(customerSupportMessages.threadId, thread.id))
      .orderBy(customerSupportMessages.createdAt);
    return { thread, messages };
  }),

  adminReply: adminProcedure.input(z.object({ threadId: z.number().int().positive(), content: contentSchema, close: z.boolean().default(false) }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const [thread] = await db.select({ id: customerSupportThreads.id }).from(customerSupportThreads).where(eq(customerSupportThreads.id, input.threadId)).limit(1);
      if (!thread) throw new TRPCError({ code: "NOT_FOUND", message: "Conversa privada não encontrada." });
      await db.insert(customerSupportMessages).values({ threadId: thread.id, authorUserId: ctx.user.id, authorRole: "admin", content: input.content });
      await db.update(customerSupportThreads).set({ status: input.close ? "closed" : "replied", closedAt: input.close ? new Date() : null, updatedAt: new Date() }).where(eq(customerSupportThreads.id, thread.id));
      return { success: true };
    }),
});
