/**
 * CRM Router — Gestão de Leads, Deals, Atividades e Métricas de Vendas
 */
import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";

// ─── Helpers ────────────────────────────────────────────────────────────────

async function getClient() {
  const db = await getDb();
  return (db as any).$client;
}

async function queryAll(query: string, params: unknown[] = []) {
  const client = await getClient();
  const [rows] = await client.execute(query, params);
  return rows as any[];
}

async function queryOne(query: string, params: unknown[] = []) {
  const rows = await queryAll(query, params);
  return rows[0] ?? null;
}

async function execute(query: string, params: unknown[] = []) {
  const client = await getClient();
  const [result] = await client.execute(query, params);
  return result as any;
}

// ─── Router ─────────────────────────────────────────────────────────────────

export const crmRouter = router({

  // ── CONTACTS ──────────────────────────────────────────────────────────────

  contacts: router({
    list: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        source: z.string().optional(),
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }))
      .query(async ({ input }) => {
        let where = "WHERE 1=1";
        const params: unknown[] = [];
        if (input.status) { where += " AND status = ?"; params.push(input.status); }
        if (input.source) { where += " AND source = ?"; params.push(input.source); }
        if (input.search) { where += " AND (name LIKE ? OR email LIKE ? OR company LIKE ?)"; params.push(`%${input.search}%`, `%${input.search}%`, `%${input.search}%`); }
        const offset = (input.page - 1) * input.limit;
        const contacts = await queryAll(`SELECT * FROM crm_contacts ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, input.limit, offset]);
        const [{ total }] = await queryAll(`SELECT COUNT(*) as total FROM crm_contacts ${where}`, params);
        return { contacts, total: Number(total), page: input.page, limit: input.limit };
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const contact = await queryOne("SELECT * FROM crm_contacts WHERE id = ?", [input.id]);
        const deals = await queryAll("SELECT * FROM crm_deals WHERE contact_id = ? ORDER BY created_at DESC", [input.id]);
        const activities = await queryAll("SELECT * FROM crm_activities WHERE contact_id = ? ORDER BY created_at DESC LIMIT 20", [input.id]);
        return { contact, deals, activities };
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        jobTitle: z.string().optional(),
        source: z.string().optional(),
        segment: z.string().optional(),
        status: z.string().optional(),
        targetLanguage: z.string().optional(),
        nativeLanguage: z.string().optional(),
        notes: z.string().optional(),
        country: z.string().optional(),
        city: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await execute(
          `INSERT INTO crm_contacts (name, email, phone, company, job_title, source, segment, status, target_language, native_language, notes, country, city)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [input.name, input.email ?? null, input.phone ?? null, input.company ?? null,
           input.jobTitle ?? null, input.source ?? 'website', input.segment ?? 'individual',
           input.status ?? 'new', input.targetLanguage ?? null, input.nativeLanguage ?? null,
           input.notes ?? null, input.country ?? null, input.city ?? null]
        );
        return { id: result.insertId, success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        status: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...fields } = input;
        const sets = Object.entries(fields).filter(([, v]) => v !== undefined).map(([k]) => `${k.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`).join(', ');
        const vals = Object.entries(fields).filter(([, v]) => v !== undefined).map(([, v]) => v);
        if (sets) await execute(`UPDATE crm_contacts SET ${sets} WHERE id = ?`, [...vals, id]);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await execute("DELETE FROM crm_contacts WHERE id = ?", [input.id]);
        return { success: true };
      }),
  }),

  // ── DEALS ─────────────────────────────────────────────────────────────────

  deals: router({
    list: protectedProcedure
      .input(z.object({
        stage: z.string().optional(),
        contactId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        let where = "WHERE 1=1";
        const params: unknown[] = [];
        if (input.stage) { where += " AND d.stage = ?"; params.push(input.stage); }
        if (input.contactId) { where += " AND d.contact_id = ?"; params.push(input.contactId); }
        return queryAll(
          `SELECT d.*, c.name as contact_name, c.email as contact_email
           FROM crm_deals d LEFT JOIN crm_contacts c ON d.contact_id = c.id
           ${where} ORDER BY d.created_at DESC`,
          params
        );
      }),

    create: protectedProcedure
      .input(z.object({
        contactId: z.number(),
        title: z.string().min(1),
        value: z.number().default(0),
        planType: z.string().optional(),
        stage: z.string().optional(),
        probability: z.number().min(0).max(100).optional(),
        expectedCloseDate: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await execute(
          `INSERT INTO crm_deals (contact_id, assigned_to, title, value, plan_type, stage, probability, expected_close_date, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [input.contactId, ctx.user.id, input.title, input.value * 100,
           input.planType ?? 'monthly', input.stage ?? 'lead',
           input.probability ?? 10, input.expectedCloseDate ?? null, input.notes ?? null]
        );
        return { id: result.insertId, success: true };
      }),

    updateStage: protectedProcedure
      .input(z.object({
        id: z.number(),
        stage: z.enum(["lead", "qualified", "proposal", "negotiation", "won", "lost"]),
        lostReason: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const closedAt = ["won", "lost"].includes(input.stage) ? new Date() : null;
        await execute(
          `UPDATE crm_deals SET stage = ?, lost_reason = ?, closed_at = ?, probability = ? WHERE id = ?`,
          [input.stage, input.lostReason ?? null, closedAt,
           input.stage === 'won' ? 100 : input.stage === 'lost' ? 0 : null,
           input.id]
        );
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await execute("DELETE FROM crm_deals WHERE id = ?", [input.id]);
        return { success: true };
      }),
  }),

  // ── ACTIVITIES ────────────────────────────────────────────────────────────

  activities: router({
    list: protectedProcedure
      .input(z.object({
        contactId: z.number().optional(),
        dealId: z.number().optional(),
        type: z.string().optional(),
        status: z.string().optional(),
        limit: z.number().default(50),
      }))
      .query(async ({ input }) => {
        let where = "WHERE 1=1";
        const params: unknown[] = [];
        if (input.contactId) { where += " AND a.contact_id = ?"; params.push(input.contactId); }
        if (input.dealId) { where += " AND a.deal_id = ?"; params.push(input.dealId); }
        if (input.type) { where += " AND a.type = ?"; params.push(input.type); }
        if (input.status) { where += " AND a.status = ?"; params.push(input.status); }
        return queryAll(
          `SELECT a.*, c.name as contact_name FROM crm_activities a
           LEFT JOIN crm_contacts c ON a.contact_id = c.id
           ${where} ORDER BY a.created_at DESC LIMIT ?`,
          [...params, input.limit]
        );
      }),

    create: protectedProcedure
      .input(z.object({
        contactId: z.number().optional(),
        dealId: z.number().optional(),
        type: z.enum(["call", "email", "meeting", "whatsapp", "demo", "proposal_sent", "follow_up", "note", "task"]),
        title: z.string().min(1),
        description: z.string().optional(),
        scheduledAt: z.string().optional(),
        dueDate: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await execute(
          `INSERT INTO crm_activities (contact_id, deal_id, user_id, type, title, description, scheduled_at, due_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [input.contactId ?? null, input.dealId ?? null, ctx.user.id,
           input.type, input.title, input.description ?? null,
           input.scheduledAt ?? null, input.dueDate ?? null]
        );
        return { id: result.insertId, success: true };
      }),

    complete: protectedProcedure
      .input(z.object({ id: z.number(), outcome: z.string().optional() }))
      .mutation(async ({ input }) => {
        await execute(
          "UPDATE crm_activities SET status = 'completed', completed_at = NOW(), outcome = ? WHERE id = ?",
          [input.outcome ?? null, input.id]
        );
        return { success: true };
      }),
  }),

  // ── MÉTRICAS DE VENDAS ────────────────────────────────────────────────────

  metrics: protectedProcedure
    .input(z.object({
      period: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
    }))
    .query(async ({ input }) => {
      const days = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 }[input.period];
      const since = new Date(Date.now() - days * 86400000);

      // KPIs principais
      const [totalRevenue] = await queryAll(
        "SELECT COALESCE(SUM(amount), 0) as total FROM subscriptions WHERE status = 'active' AND createdAt >= ?",
        [since]
      );
      const [newLeads] = await queryAll(
        "SELECT COUNT(*) as total FROM crm_contacts WHERE created_at >= ?",
        [since]
      );
      const [wonDeals] = await queryAll(
        "SELECT COUNT(*) as total, COALESCE(SUM(value), 0) as value FROM crm_deals WHERE stage = 'won' AND closed_at >= ?",
        [since]
      );
      const [lostDeals] = await queryAll(
        "SELECT COUNT(*) as total FROM crm_deals WHERE stage = 'lost' AND closed_at >= ?",
        [since]
      );
      const [activeDeals] = await queryAll(
        "SELECT COUNT(*) as total, COALESCE(SUM(value), 0) as pipeline FROM crm_deals WHERE stage NOT IN ('won','lost')",
        []
      );

      // Funil de vendas
      const funnelData = await queryAll(
        `SELECT stage, COUNT(*) as count, COALESCE(SUM(value), 0) as total_value
         FROM crm_deals GROUP BY stage ORDER BY FIELD(stage, 'lead','qualified','proposal','negotiation','won','lost')`,
        []
      );

      // Receita por mês (últimos 6 meses)
      const revenueByMonth = await queryAll(
        `SELECT DATE_FORMAT(createdAt, '%Y-%m') as month,
                COUNT(*) as subscriptions,
                COALESCE(SUM(amount), 0) as revenue
         FROM subscriptions
         WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
         GROUP BY month ORDER BY month ASC`,
        []
      );

      // Leads por fonte
      const leadsBySource = await queryAll(
        "SELECT source, COUNT(*) as count FROM crm_contacts WHERE created_at >= ? GROUP BY source ORDER BY count DESC",
        [since]
      );

      // Leads por status
      const leadsByStatus = await queryAll(
        "SELECT status, COUNT(*) as count FROM crm_contacts GROUP BY status",
        []
      );

      // Conversão
      const totalLeads = Number(newLeads.total) || 1;
      const totalWon = Number(wonDeals.total) || 0;
      const conversionRate = ((totalWon / totalLeads) * 100).toFixed(1);

      // Atividades recentes
      const recentActivities = await queryAll(
        `SELECT a.*, c.name as contact_name FROM crm_activities a
         LEFT JOIN crm_contacts c ON a.contact_id = c.id
         ORDER BY a.created_at DESC LIMIT 10`,
        []
      );

      // Assinaturas ativas por plano
      const subsByPlan = await queryAll(
        "SELECT type, COUNT(*) as count, SUM(amount) as revenue FROM subscriptions WHERE status = 'active' GROUP BY type",
        []
      );

      // Total de usuários ativos
      const [totalUsers] = await queryAll(
        "SELECT COUNT(*) as total FROM users WHERE createdAt >= ?",
        [since]
      );

      return {
        kpis: {
          totalRevenue: Number(totalRevenue.total) / 100,
          newLeads: Number(newLeads.total),
          wonDeals: Number(wonDeals.total),
          wonValue: Number(wonDeals.value) / 100,
          lostDeals: Number(lostDeals.total),
          activeDeals: Number(activeDeals.total),
          pipeline: Number(activeDeals.pipeline) / 100,
          conversionRate: parseFloat(conversionRate),
          newUsers: Number(totalUsers.total),
        },
        funnelData: funnelData.map(r => ({
          stage: r.stage,
          count: Number(r.count),
          value: Number(r.total_value) / 100,
        })),
        revenueByMonth: revenueByMonth.map(r => ({
          month: r.month,
          subscriptions: Number(r.subscriptions),
          revenue: Number(r.revenue) / 100,
        })),
        leadsBySource: leadsBySource.map(r => ({ source: r.source, count: Number(r.count) })),
        leadsByStatus: leadsByStatus.map(r => ({ status: r.status, count: Number(r.count) })),
        subsByPlan: subsByPlan.map(r => ({ type: r.type, count: Number(r.count), revenue: Number(r.revenue) / 100 })),
        recentActivities,
      };
    }),

  // ── METAS DE VENDAS ───────────────────────────────────────────────────────

  targets: router({
    getCurrent: protectedProcedure.query(async () => {
      const now = new Date();
      return queryAll(
        "SELECT * FROM sales_targets WHERE year = ? AND (month = ? OR month IS NULL) ORDER BY period",
        [now.getFullYear(), now.getMonth() + 1]
      );
    }),

    set: protectedProcedure
      .input(z.object({
        period: z.enum(["monthly", "quarterly", "annual"]),
        year: z.number(),
        month: z.number().optional(),
        quarter: z.number().optional(),
        revenueTarget: z.number(),
        leadsTarget: z.number().optional(),
        dealsTarget: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await execute(
          `INSERT INTO sales_targets (period, year, month, quarter, revenue_target, leads_target, deals_target)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE revenue_target = VALUES(revenue_target), leads_target = VALUES(leads_target)`,
          [input.period, input.year, input.month ?? null, input.quarter ?? null,
           input.revenueTarget * 100, input.leadsTarget ?? 0, input.dealsTarget ?? 0]
        );
        return { success: true };
      }),
  }),

  // ── SEED DE DEMONSTRAÇÃO ─────────────────────────────────────────────────

  seedDemo: protectedProcedure.mutation(async () => {
    const contacts = [
      ["Ana Silva", "ana.silva@email.com", "(11) 99999-0001", "Escola Estadual SP", "Diretora", "instagram", "educational_institution", "qualified", "en-US", "pt-BR", "Brasil", "São Paulo"],
      ["Carlos Mendes", "carlos@empresa.com", "(21) 98888-0002", "TechCorp Ltda", "Gerente RH", "linkedin", "company", "proposal", "en-US", "pt-BR", "Brasil", "Rio de Janeiro"],
      ["Maria Fernanda", "mf@gmail.com", "(31) 97777-0003", null, null, "google_ads", "professional", "contacted", "es-ES", "pt-BR", "Brasil", "Belo Horizonte"],
      ["João Paulo", "joao@ong.org", "(41) 96666-0004", "ONG Educar+", "Coordenador", "referral", "ngo", "qualified", "fr-FR", "pt-BR", "Brasil", "Curitiba"],
      ["Beatriz Costa", "beatriz@escola.edu.br", "(51) 95555-0005", "Colégio Futuro", "Professora", "organic", "educational_institution", "new", "de-DE", "pt-BR", "Brasil", "Porto Alegre"],
      ["Roberto Lima", "roberto@startup.io", "(85) 94444-0006", "StartupBR", "CEO", "facebook_ads", "company", "negotiation", "en-US", "pt-BR", "Brasil", "Fortaleza"],
      ["Camila Rocha", "camila@gmail.com", null, null, null, "whatsapp", "student", "customer", "ja-JP", "pt-BR", "Brasil", "Recife"],
      ["Pedro Alves", "pedro@universidade.br", "(62) 93333-0007", "UFGO", "Professor", "email_campaign", "educational_institution", "qualified", "zh-CN", "pt-BR", "Brasil", "Goiânia"],
    ];

    for (const c of contacts) {
      await execute(
        `INSERT IGNORE INTO crm_contacts (name, email, phone, company, job_title, source, segment, status, target_language, native_language, country, city)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        c
      );
    }

    // Criar deals de demonstração
    const [{ id: c1 }] = await queryAll("SELECT id FROM crm_contacts WHERE email = 'carlos@empresa.com'", []);
    const [{ id: c2 }] = await queryAll("SELECT id FROM crm_contacts WHERE email = 'roberto@startup.io'", []);
    const [{ id: c3 }] = await queryAll("SELECT id FROM crm_contacts WHERE email = 'joao@ong.org'", []);

    if (c1) await execute(
      "INSERT IGNORE INTO crm_deals (contact_id, title, value, plan_type, stage, probability) VALUES (?, ?, ?, ?, ?, ?)",
      [c1, "Plano Empresarial 50 usuários", 250000, "annual", "proposal", 60]
    );
    if (c2) await execute(
      "INSERT IGNORE INTO crm_deals (contact_id, title, value, plan_type, stage, probability) VALUES (?, ?, ?, ?, ?, ?)",
      [c2, "Licença Startup 20 usuários", 120000, "monthly", "negotiation", 80]
    );
    if (c3) await execute(
      "INSERT IGNORE INTO crm_deals (contact_id, title, value, plan_type, stage, probability) VALUES (?, ?, ?, ?, ?, ?)",
      [c3, "Plano ONG Educacional", 50000, "annual", "qualified", 40]
    );

    return { success: true, message: "Dados de demonstração criados com sucesso!" };
  }),
});
