/**
 * compliance-router.ts
 * Procedures tRPC para aceite de Termos de Uso e Autorização Parental.
 */

import { z } from "zod";
import { adminProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { and, desc, eq, sql, type SQL } from "drizzle-orm";
import { securityEvents } from "../drizzle/schema";
import { createParentalConsentNotification } from "./parentalConsentPrivacy";
import { notifyOwner } from "./_core/notification";

export const complianceRouter = router({

  /** Salvar aceite de Termos de Uso */
  acceptTerms: protectedProcedure
    .input(z.object({
      termsVersion: z.string().default("1.0"),
      confirmedMoralConduct: z.boolean(),
      confirmedNoDiscrimination: z.boolean(),
      confirmedNoAbuse: z.boolean(),
      confirmedLegalCompliance: z.boolean(),
      confirmedAgeVerification: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Verificar se já existe aceite
      const existing = await db.execute(
        sql`SELECT id FROM terms_acceptances WHERE user_id = ${ctx.user.id} LIMIT 1`
      );
      const rows = (existing as any)[0] as any[];

      if (rows && rows.length > 0) {
        // Atualizar aceite existente
        await db.execute(
          sql`UPDATE terms_acceptances SET 
            terms_version = ${input.termsVersion},
            accepted_at = NOW(),
            confirmed_moral_conduct = ${input.confirmedMoralConduct ? 1 : 0},
            confirmed_no_discrimination = ${input.confirmedNoDiscrimination ? 1 : 0},
            confirmed_no_abuse = ${input.confirmedNoAbuse ? 1 : 0},
            confirmed_legal_compliance = ${input.confirmedLegalCompliance ? 1 : 0},
            confirmed_age_verification = ${input.confirmedAgeVerification ? 1 : 0}
          WHERE user_id = ${ctx.user.id}`
        );
      } else {
        // Inserir novo aceite
        await db.execute(
          sql`INSERT INTO terms_acceptances 
            (user_id, terms_version, confirmed_moral_conduct, confirmed_no_discrimination, confirmed_no_abuse, confirmed_legal_compliance, confirmed_age_verification)
            VALUES (
              ${ctx.user.id},
              ${input.termsVersion},
              ${input.confirmedMoralConduct ? 1 : 0},
              ${input.confirmedNoDiscrimination ? 1 : 0},
              ${input.confirmedNoAbuse ? 1 : 0},
              ${input.confirmedLegalCompliance ? 1 : 0},
              ${input.confirmedAgeVerification ? 1 : 0}
            )`
        );
      }

      return { success: true };
    }),

  /** Verificar se usuário já aceitou os termos */
  checkAcceptance: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { accepted: false, hasParentalConsent: false };

      const termsResult = await db.execute(
        sql`SELECT id, confirmed_moral_conduct, confirmed_no_discrimination, confirmed_no_abuse FROM terms_acceptances 
            WHERE user_id = ${ctx.user.id} 
            AND confirmed_moral_conduct = 1 
            AND confirmed_no_discrimination = 1 
            AND confirmed_no_abuse = 1 
            LIMIT 1`
      );
      const termsRows = (termsResult as any)[0] as any[];
      const accepted = termsRows && termsRows.length > 0;

      const parentalResult = await db.execute(
        sql`SELECT id FROM parental_consents 
            WHERE user_id = ${ctx.user.id} 
            AND confirmed_terms = 1 
            LIMIT 1`
      );
      const parentalRows = (parentalResult as any)[0] as any[];
      const hasParentalConsent = parentalRows && parentalRows.length > 0;

      return { accepted, hasParentalConsent };
    }),

  /** Salvar autorização parental para menores */
  submitParentalConsent: protectedProcedure
    .input(z.object({
      guardianName: z.string().trim().min(3).max(120),
      guardianDocument: z.string().trim().min(5).max(50).optional().transform(value => value || undefined),
      guardianEmail: z.string().trim().email().max(200).optional().transform(value => value || undefined),
      relationship: z.enum(["pai", "mae", "responsavel", "tutor"]),
      confirmedTerms: z.boolean(),
      confirmedMoralConduct: z.boolean(),
      confirmedParentalControl: z.boolean(),
      confirmedLegalCompliance: z.boolean(),
      userAge: z.number().min(5).max(17),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.execute(
        sql`INSERT INTO parental_consents 
          (user_id, guardian_name, guardian_document, guardian_email, relationship, 
           confirmed_terms, confirmed_moral_conduct, confirmed_parental_control, confirmed_legal_compliance,
           is_minor, user_age)
          VALUES (
            ${ctx.user.id},
            ${input.guardianName},
            ${input.guardianDocument || null},
            ${input.guardianEmail || null},
            ${input.relationship},
            ${input.confirmedTerms ? 1 : 0},
            ${input.confirmedMoralConduct ? 1 : 0},
            ${input.confirmedParentalControl ? 1 : 0},
            ${input.confirmedLegalCompliance ? 1 : 0},
            1,
            ${input.userAge}
          )`
      );

      // The notification channel must not receive guardian identity or contact data.
      await notifyOwner(createParentalConsentNotification());

      return { success: true };
    }),

  /** Listar eventos de segurança (admin) */
  getSecurityEvents: adminProcedure
    .input(z.object({
      severity: z.enum(["critical", "high", "medium", "low", "all"]).default("all"),
      resolved: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions: SQL[] = [];
      if (input.severity !== "all") conditions.push(eq(securityEvents.severity, input.severity));
      if (input.resolved !== undefined) conditions.push(eq(securityEvents.resolved, input.resolved));
      const where = conditions.length === 0 ? undefined : conditions.length === 1 ? conditions[0] : and(...conditions);

      return db
        .select({
          id: securityEvents.id,
          eventType: securityEvents.eventType,
          severity: securityEvents.severity,
          actionTaken: securityEvents.actionTaken,
          resolved: securityEvents.resolved,
          createdAt: securityEvents.createdAt,
          resolvedAt: securityEvents.resolvedAt,
        })
        .from(securityEvents)
        .where(where)
        .orderBy(desc(securityEvents.createdAt))
        .limit(input.limit);
    }),

  /** Marcar evento de segurança como resolvido (admin) */
  resolveSecurityEvent: adminProcedure
    .input(z.object({ eventId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .update(securityEvents)
        .set({ resolved: true, resolvedAt: new Date(), resolvedBy: ctx.user.id })
        .where(eq(securityEvents.id, input.eventId));
      return { success: true };
    }),
});
