import { router, protectedProcedure } from './_core/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { getDb } from './db';
import { childProfiles, parentalSettings, usageSessions, parentalAlerts } from '../drizzle/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { getUsagePatterns } from './contentFilter';

export const parentalControlRouter = router({
  getUsagePatterns: protectedProcedure
    .input(z.object({ childId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      if (input.childId) {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
        const [child] = await database.select().from(childProfiles)
          .where(and(eq(childProfiles.id, input.childId), eq(childProfiles.parentId, ctx.user.id)));
        if (!child) throw new TRPCError({ code: 'FORBIDDEN', message: 'Child profile not found' });
      }
      return getUsagePatterns(ctx.user.id, input.childId);
    }),

  // ── CHILD PROFILES ──────────────────────────────────────────
  listChildren: protectedProcedure
    .query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
      const children = await database.select().from(childProfiles)
        .where(eq(childProfiles.parentId, ctx.user.id))
        .orderBy(desc(childProfiles.createdAt));
      return children;
    }),

  createChild: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      emoji: z.string().max(10).default('👧'),
      level: z.enum(['infantil', 'adolescente', 'adulto']).default('infantil'),
      birthDate: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
      const [child] = await database.insert(childProfiles).values({
        parentId: ctx.user.id,
        name: input.name,
        emoji: input.emoji,
        level: input.level,
        birthDate: input.birthDate ? new Date(input.birthDate) : null,
      }).$returningId();
      // Create default settings
      await database.insert(parentalSettings).values({
        childId: child.id,
        pinCode: '1234',
        timeLimitMinutes: 60,
        allowedDays: [true, true, true, true, true, false, false],
        levelsAllowed: ['beginner'],
      });
      return { success: true, childId: child.id };
    }),

  updateChild: protectedProcedure
    .input(z.object({
      childId: z.number(),
      name: z.string().optional(),
      emoji: z.string().optional(),
      level: z.enum(['infantil', 'adolescente', 'adulto']).optional(),
      birthDate: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
      const updateData: Record<string, unknown> = {};
      if (input.name) updateData.name = input.name;
      if (input.emoji) updateData.emoji = input.emoji;
      if (input.level) updateData.level = input.level;
      if (input.birthDate) updateData.birthDate = input.birthDate;
      await database.update(childProfiles).set(updateData).where(eq(childProfiles.id, input.childId));
      return { success: true };
    }),

  deleteChild: protectedProcedure
    .input(z.object({ childId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
      await database.delete(childProfiles).where(eq(childProfiles.id, input.childId));
      return { success: true };
    }),

  // ── PARENTAL SETTINGS ──────────────────────────────────────
  getSettings: protectedProcedure
    .input(z.object({ childId: z.number() }))
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
      const [settings] = await database.select().from(parentalSettings)
        .where(eq(parentalSettings.childId, input.childId));
      return settings || null;
    }),

  updateSettings: protectedProcedure
    .input(z.object({
      childId: z.number(),
      pinCode: z.string().max(4).optional(),
      timeLimitMinutes: z.number().min(1).max(480).optional(),
      allowedDays: z.array(z.boolean()).optional(),
      levelsAllowed: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
      const updateData: Record<string, unknown> = {};
      if (input.pinCode) updateData.pinCode = input.pinCode;
      if (input.timeLimitMinutes) updateData.timeLimitMinutes = input.timeLimitMinutes;
      if (input.allowedDays) updateData.allowedDays = input.allowedDays;
      if (input.levelsAllowed) updateData.levelsAllowed = input.levelsAllowed;
      await database.update(parentalSettings).set(updateData)
        .where(eq(parentalSettings.childId, input.childId));
      return { success: true };
    }),

  verifyPin: protectedProcedure
    .input(z.object({ childId: z.number(), pin: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
      const [settings] = await database.select().from(parentalSettings)
        .where(eq(parentalSettings.childId, input.childId));
      if (!settings) return { valid: false };
      return { valid: settings.pinCode === input.pin };
    }),

  // ── USAGE SESSIONS (real-time tracking) ─────────────────────
  startSession: protectedProcedure
    .input(z.object({ childId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
      const [session] = await database.insert(usageSessions).values({
        childId: input.childId,
        sessionStart: new Date(),
        minutesUsed: 0,
        lessonsCompleted: 0,
        accuracyScore: 0,
      }).$returningId();
      return { sessionId: session.id };
    }),

  endSession: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      minutesUsed: z.number(),
      lessonsCompleted: z.number().optional(),
      accuracyScore: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
      await database.update(usageSessions).set({
        sessionEnd: new Date(),
        minutesUsed: input.minutesUsed,
        lessonsCompleted: input.lessonsCompleted || 0,
        accuracyScore: input.accuracyScore || 0,
      }).where(eq(usageSessions.id, input.sessionId));
      return { success: true };
    }),

  getTodayUsage: protectedProcedure
    .input(z.object({ childId: z.number() }))
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sessions = await database.select().from(usageSessions)
        .where(and(
          eq(usageSessions.childId, input.childId),
          gte(usageSessions.sessionStart, today)
        ));
      const totalMinutes = sessions.reduce((sum, s) => sum + (s.minutesUsed || 0), 0);
      const totalLessons = sessions.reduce((sum, s) => sum + (s.lessonsCompleted || 0), 0);
      const avgAccuracy = sessions.length > 0
        ? sessions.reduce((sum, s) => sum + (s.accuracyScore || 0), 0) / sessions.length
        : 0;
      return {
        totalMinutes,
        totalLessons,
        avgAccuracy,
        sessionsCount: sessions.length,
        sessions,
      };
    }),

  getWeeklyUsage: protectedProcedure
    .input(z.object({ childId: z.number() }))
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const sessions = await database.select().from(usageSessions)
        .where(and(
          eq(usageSessions.childId, input.childId),
          gte(usageSessions.sessionStart, weekAgo)
        ))
        .orderBy(desc(usageSessions.sessionStart));
      const totalMinutes = sessions.reduce((sum, s) => sum + (s.minutesUsed || 0), 0);
      const totalLessons = sessions.reduce((sum, s) => sum + (s.lessonsCompleted || 0), 0);
      return { totalMinutes, totalLessons, sessions };
    }),

  // ── ALERTS ──────────────────────────────────────────────────
  listAlerts: protectedProcedure
    .input(z.object({ childId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
      if (input.childId) {
        const alerts = await database.select().from(parentalAlerts)
          .where(eq(parentalAlerts.childId, input.childId))
          .orderBy(desc(parentalAlerts.createdAt));
        return alerts;
      }
      // Get all children's alerts
      const children = await database.select().from(childProfiles)
        .where(eq(childProfiles.parentId, ctx.user.id));
      if (children.length === 0) return [];
      const childIds = children.map(c => c.id);
      const alerts = await database.select().from(parentalAlerts)
        .where(sql`${parentalAlerts.childId} IN (${sql.join(childIds.map(id => sql`${id}`), sql`,`)})`)
        .orderBy(desc(parentalAlerts.createdAt));
      return alerts;
    }),

  markAlertRead: protectedProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
      await database.update(parentalAlerts).set({ isRead: true })
        .where(eq(parentalAlerts.id, input.alertId));
      return { success: true };
    }),

  createAlert: protectedProcedure
    .input(z.object({
      childId: z.number(),
      alertType: z.string(),
      title: z.string(),
      detail: z.string().optional(),
      icon: z.string().default('⚠️'),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
      await database.insert(parentalAlerts).values({
        childId: input.childId,
        alertType: input.alertType,
        title: input.title,
        detail: input.detail || null,
        icon: input.icon,
      });
      return { success: true };
    }),

  // ── CYBERSECURITY THREAT PROCEDURES ─────────────────────────
  listCyberThreats: protectedProcedure
    .input(z.object({ onlyUnresolved: z.boolean().default(false), limit: z.number().default(50) }))
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
      let queryStr = `SELECT * FROM cybersecurity_threats WHERE user_id = ${ctx.user.id}`;
      if (input.onlyUnresolved) { queryStr += ` AND is_resolved = FALSE`; }
      queryStr += ` ORDER BY created_at DESC LIMIT ${input.limit}`;
      const result = await database.execute(sql.raw(queryStr));
      return { threats: result[0] || [] };
    }),

  reportCyberThreat: protectedProcedure
    .input(z.object({
      threatType: z.string().default('unknown'),
      severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
      source: z.string().optional(),
      description: z.string().optional(),
      recommendedAction: z.string().optional(),
      deviceInfo: z.string().optional(),
      ipAddress: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
      const now = Date.now();
      await database.execute(sql`INSERT INTO cybersecurity_threats (user_id, threat_type, severity, source, description, recommended_action, device_info, ip_address, created_at, updated_at) VALUES (${ctx.user.id}, ${input.threatType}, ${input.severity}, ${input.source || null}, ${input.description || null}, ${input.recommendedAction || null}, ${input.deviceInfo || null}, ${input.ipAddress || null}, ${now}, ${now})`);
      return { success: true };
    }),

  resolveCyberThreat: protectedProcedure
    .input(z.object({ threatId: z.number(), resolvedAction: z.string().default('resolved_by_user') }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
      const now = Date.now();
      await database.execute(sql`UPDATE cybersecurity_threats SET is_resolved = TRUE, resolved_action = ${input.resolvedAction}, resolved_at = ${now}, updated_at = ${now} WHERE id = ${input.threatId} AND user_id = ${ctx.user.id}`);
      return { success: true };
    }),

  // Auto-detect suspicious content and create parental alert
  autoDetectSuspiciousContent: protectedProcedure
    .input(z.object({
      childId: z.number(),
      content: z.string(),
      contentType: z.enum(['chat', 'lesson_response', 'voice_transcript', 'translation', 'free_text']),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });

      // Suspicious patterns: adult content, violence, drugs, cyberbullying, phishing, grooming, cyber threats
      const suspiciousPatterns = [
        /sex|porn|erotic|nude|nsfw/i,
        /kill|murder|suicide|self.?harm|cut.?yourself/i,
        /drug|cocaine|weed|marijuana|heroin|lsd|ecstasy/i,
        /stupid|idiot|ugly|fat|loser|hate.?you|kill.?yourself/i,
        /password|credit.?card|bank.?account|ssn|social.?security|pix.?key/i,
        /meet.?me.?alone|don.?t.?tell.?your.?parents|secret.?between.?us/i,
        /hack|malware|virus|trojan|phishing|ransomware|keylogger/i,
      ];

      const matches: string[] = [];
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(input.content)) {
          matches.push(pattern.source);
        }
      }

      if (matches.length === 0) {
        return { suspicious: false, alertId: null };
      }

      const severity = matches.length >= 3 ? 'critical' : matches.length >= 2 ? 'high' : 'medium';
      const alertType = matches.some(m => /sex|porn|erotic|nude|nsfw/i.test(m)) ? 'adult_content'
        : matches.some(m => /kill|murder|suicide|self.?harm/i.test(m)) ? 'violence'
        : matches.some(m => /drug|cocaine|weed|marijuana|heroin/i.test(m)) ? 'drugs'
        : matches.some(m => /stupid|idiot|ugly|fat|loser|hate.?you|kill.?yourself/i.test(m)) ? 'cyberbullying'
        : matches.some(m => /password|credit.?card|bank.?account|ssn|pix.?key/i.test(m)) ? 'phishing'
        : matches.some(m => /meet.?me.?alone|don.?t.?tell.?your.?parents|secret.?between.?us/i.test(m)) ? 'grooming'
        : 'cyber_threat';

      const now = Date.now();
      const description = `Conteudo suspeito detectado (${alertType}): ${input.content.substring(0, 200)}...`;

      await database.execute(sql`INSERT INTO parental_alerts (child_id, alert_type, severity, description, is_read, created_at) VALUES (${input.childId}, ${alertType}, ${severity}, ${description}, FALSE, ${now})`);

      // Also log as cybersecurity threat if it's a cyber threat type
      if (alertType === 'cyber_threat' || alertType === 'phishing') {
        await database.execute(sql`INSERT INTO cybersecurity_threats (user_id, threat_type, severity, source, description, recommended_action, created_at, updated_at) VALUES (${ctx.user.id}, ${alertType}, ${severity}, ${input.contentType}, ${description}, 'Revise o conteudo e bloqueie se necessario. Se ataque cibernetico detectado, considere desligar o dispositivo.', ${now}, ${now})`);
      }

      return { suspicious: true, alertType, severity, matches };
    }),

  // List interaction logs for parental monitoring
  listInteractionLogs: protectedProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
      const result = await database.execute(sql`SELECT * FROM interaction_logs WHERE user_id = ${ctx.user.id} ORDER BY created_at DESC LIMIT ${input.limit} OFFSET ${input.offset}`);
      return { logs: result[0] || [] };
    }),

  getSecurityStats: protectedProcedure
    .query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB unavailable' });
      const totalResult = await database.execute(sql`SELECT COUNT(*) as count FROM cybersecurity_threats WHERE user_id = ${ctx.user.id}`);
      const total = (totalResult[0] as any)?.[0]?.count || 0;
      const unresolvedResult = await database.execute(sql`SELECT COUNT(*) as count FROM cybersecurity_threats WHERE user_id = ${ctx.user.id} AND is_resolved = FALSE`);
      const unresolved = (unresolvedResult[0] as any)?.[0]?.count || 0;
      const criticalResult = await database.execute(sql`SELECT COUNT(*) as count FROM cybersecurity_threats WHERE user_id = ${ctx.user.id} AND severity = 'critical'`);
      const critical = (criticalResult[0] as any)?.[0]?.count || 0;
      const highResult = await database.execute(sql`SELECT COUNT(*) as count FROM cybersecurity_threats WHERE user_id = ${ctx.user.id} AND severity = 'high'`);
      const high = (highResult[0] as any)?.[0]?.count || 0;
      return { totalThreats: total, unresolvedThreats: unresolved, criticalThreats: critical, highThreats: high };
    }),
});
