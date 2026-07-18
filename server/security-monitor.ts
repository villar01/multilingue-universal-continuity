/**
 * security-monitor.ts
 * IA de Segurança — detecta ataques, violações morais/legais e alerta o admin.
 * Tolerância ZERO: pedofilia, discriminação, abuso, ataques ao paywall.
 */

import { getDb } from "./db";
import { securityEvents } from "../drizzle/schema";
import { notifyOwner } from "./_core/notification";
import { Request } from "express";

type ViolationType =
  | "paywall_bypass" | "rate_limit_exceeded" | "scraping_detected"
  | "bot_detected" | "moral_violation" | "legal_violation"
  | "abuse_content" | "discrimination" | "unauthorized_access"
  | "suspicious_pattern" | "ddos_attempt" | "sql_injection"
  | "xss_attempt" | "other";

type Severity = "critical" | "high" | "medium" | "low";

interface SecurityEventData {
  eventType: ViolationType;
  severity: Severity;
  userId?: number;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  description: string;
  evidence?: Record<string, unknown>;
  adminTips?: string;
  legalReference?: string;
}

// Rate limiting em memória (por IP)
const rateLimitMap = new Map<string, { count: number; firstRequest: number; blocked: boolean }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 120; // 120 req/min normal
const RATE_LIMIT_PREMIUM = 60; // 60 req/min para endpoints premium

// IPs bloqueados permanentemente
const blockedIPs = new Set<string>();

/**
 * Registra evento de segurança no banco e notifica admin se necessário
 */
export async function logSecurityEvent(data: SecurityEventData): Promise<void> {
  try {
    const isCritical = data.severity === "critical";
    const isHigh = data.severity === "high";

    // Salvar no banco
    const db = await getDb();
    if (!db) return;
    // Use drizzle insert for type safety
    const { sql } = await import("drizzle-orm");
    await db.execute(
      sql`INSERT INTO security_events 
       (event_type, severity, user_id, ip_address, user_agent, endpoint, description, evidence, action_taken, admin_notified, admin_notified_at, admin_tips, legal_reference)
       VALUES (${data.eventType}, ${data.severity}, ${data.userId || null}, ${data.ipAddress || null}, ${data.userAgent || null}, ${data.endpoint || null}, ${data.description}, ${data.evidence ? JSON.stringify(data.evidence) : null}, ${isCritical ? "account_banned" : isHigh ? "blocked" : "admin_notified"}, ${isCritical || isHigh ? 1 : 0}, ${isCritical || isHigh ? new Date() : null}, ${data.adminTips || null}, ${data.legalReference || null})`
    );

    // Notificar admin para eventos críticos e altos
    if (isCritical || isHigh) {
      const urgencyEmoji = isCritical ? "🚨 CRÍTICO" : "⚠️ ALTO";
      const monetizationWarning = isMonetizationRisk(data.eventType)
        ? "\n\n💰 RISCO DE MONETIZAÇÃO: Este evento pode impactar diretamente a receita do aplicativo."
        : "";

      await notifyOwner({
        title: `${urgencyEmoji}: ${getEventLabel(data.eventType)}`,
        content: `
**Evento de Segurança Detectado**

**Tipo:** ${getEventLabel(data.eventType)}
**Severidade:** ${data.severity.toUpperCase()}
**IP:** ${data.ipAddress || "Desconhecido"}
**Endpoint:** ${data.endpoint || "N/A"}
**Usuário ID:** ${data.userId || "Não autenticado"}
**Horário:** ${new Date().toLocaleString("pt-BR")}

**Descrição:** ${data.description}

**Referência Legal:** ${data.legalReference || "Verificar legislação aplicável"}

**Dicas de Ação para Você:**
${data.adminTips || "Revisar e tomar ação apropriada"}
${monetizationWarning}

**Ação Automática Tomada:** ${isCritical ? "Usuário banido e IP bloqueado" : "Requisição bloqueada"}
        `.trim(),
      });
    }
  } catch (err) {
    console.error("[SecurityMonitor] Erro ao registrar evento:", err);
  }
}

/**
 * Verifica se o tipo de evento representa risco à monetização
 */
function isMonetizationRisk(eventType: ViolationType): boolean {
  return ["paywall_bypass", "scraping_detected", "sql_injection", "ddos_attempt"].includes(eventType);
}

/**
 * Retorna label legível do tipo de evento
 */
function getEventLabel(eventType: ViolationType): string {
  const labels: Record<ViolationType, string> = {
    paywall_bypass: "Tentativa de Bypass do Paywall",
    rate_limit_exceeded: "Limite de Requisições Excedido",
    scraping_detected: "Scraping Detectado",
    bot_detected: "Bot Detectado",
    moral_violation: "Violação Moral",
    legal_violation: "Violação Legal",
    abuse_content: "Conteúdo Abusivo (TOLERÂNCIA ZERO)",
    discrimination: "Discriminação",
    unauthorized_access: "Acesso Não Autorizado",
    suspicious_pattern: "Padrão Suspeito",
    ddos_attempt: "Tentativa de DDoS",
    sql_injection: "Injeção SQL",
    xss_attempt: "Tentativa de XSS",
    other: "Outro Evento de Segurança",
  };
  return labels[eventType] || eventType;
}

/**
 * Middleware de rate limiting e detecção de bots
 */
export function securityMiddleware(req: Request, res: any, next: any): void {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const userAgent = req.headers["user-agent"] || "";
  const endpoint = req.path;
  const isPremiumEndpoint = endpoint.includes("/lesson") || endpoint.includes("/premium") || endpoint.includes("/download");

  // Verificar IP bloqueado
  if (blockedIPs.has(ip)) {
    res.status(403).json({ error: "Acesso bloqueado por violação dos Termos de Uso." });
    return;
  }

  // Rate limiting
  const now = Date.now();
  const existing = rateLimitMap.get(ip);

  if (existing) {
    if (now - existing.firstRequest > RATE_LIMIT_WINDOW) {
      // Reset janela
      rateLimitMap.set(ip, { count: 1, firstRequest: now, blocked: false });
    } else {
      existing.count++;
      const limit = isPremiumEndpoint ? RATE_LIMIT_PREMIUM : RATE_LIMIT_MAX;

      if (existing.count > limit * 3) {
        // DDoS
        blockedIPs.add(ip);
        logSecurityEvent({
          eventType: "ddos_attempt",
          severity: "critical",
          ipAddress: ip,
          userAgent,
          endpoint,
          description: `DDoS detectado: ${existing.count} requisições em ${RATE_LIMIT_WINDOW / 1000}s`,
          adminTips: `🚨 IP ${ip} bloqueado permanentemente.\n🔒 Considerar adicionar ao firewall do servidor.\n💰 RISCO: DDoS pode derrubar o serviço e causar perda de receita.`,
          legalReference: "Lei 12.737/12 (Brasil — Crimes Cibernéticos); CFAA (EUA)",
        });
        res.status(429).json({ error: "Acesso bloqueado." });
        return;
      }

      if (existing.count > limit) {
        logSecurityEvent({
          eventType: "rate_limit_exceeded",
          severity: "medium",
          ipAddress: ip,
          userAgent,
          endpoint,
          description: `Rate limit excedido: ${existing.count} req em ${RATE_LIMIT_WINDOW / 1000}s`,
          adminTips: `📊 IP ${ip} excedeu o limite. Monitorar para padrões de scraping.`,
        });
        res.status(429).json({ error: "Muitas requisições. Aguarde um momento." });
        return;
      }
    }
  } else {
    rateLimitMap.set(ip, { count: 1, firstRequest: now, blocked: false });
  }

  // Detectar bots
  const botAgents = ["bot", "crawler", "spider", "scraper", "wget", "curl/", "python-requests", "java/", "go-http-client", "axios/0"];
  const isBot = botAgents.some(b => userAgent.toLowerCase().includes(b));

  if (isBot && isPremiumEndpoint) {
    logSecurityEvent({
      eventType: "bot_detected",
      severity: "high",
      ipAddress: ip,
      userAgent,
      endpoint,
      description: `Bot detectado tentando acessar endpoint premium: ${endpoint}`,
      adminTips: `🤖 User-Agent suspeito: ${userAgent}\n🔒 Considerar bloquear este User-Agent.\n💰 Bots em endpoints premium = bypass de paywall.`,
      legalReference: "Lei 9.609/98 (Brasil — Lei do Software); DMCA (EUA)",
    });
    res.status(403).json({ error: "Acesso não permitido." });
    return;
  }

  // Detectar SQL Injection nos parâmetros
  const queryString = JSON.stringify(req.query) + JSON.stringify(req.body || {});
  if (detectSQLInjection(queryString)) {
    blockedIPs.add(ip);
    logSecurityEvent({
      eventType: "sql_injection",
      severity: "critical",
      ipAddress: ip,
      userAgent,
      endpoint,
      description: `Tentativa de SQL Injection detectada em ${endpoint}`,
      evidence: { query: req.query, body: req.body },
      adminTips: `🚨 IP ${ip} bloqueado.\n🔍 Verificar logs do banco de dados das últimas 24h.\n🔒 Auditar todos os endpoints de entrada de dados.\n💰 CRÍTICO: Vazamento de dados de pagamento gera multas LGPD/GDPR.`,
      legalReference: "Lei 12.737/12 (Brasil); CFAA 18 U.S.C. § 1030 (EUA)",
    });
    res.status(403).json({ error: "Requisição bloqueada por segurança." });
    return;
  }

  // Detectar XSS
  if (detectXSS(queryString)) {
    logSecurityEvent({
      eventType: "xss_attempt",
      severity: "high",
      ipAddress: ip,
      userAgent,
      endpoint,
      description: `Tentativa de XSS detectada em ${endpoint}`,
      adminTips: `🔒 Verificar sanitização de inputs.\n🔍 Verificar se outros usuários foram afetados.`,
    });
    res.status(403).json({ error: "Requisição bloqueada por segurança." });
    return;
  }

  next();
}

/**
 * Valida conteúdo enviado por usuário (mensagens, respostas, etc.)
 */
export async function validateUserContent(
  content: string,
  userId?: number,
  ipAddress?: string
): Promise<{ valid: boolean; reason?: string; severity?: Severity }> {
  const contentLower = content.toLowerCase();

  // TOLERÂNCIA ZERO — Pedofilia
  const pedoKeywords = ["child porn", "cp ", "loli", "shota", "underage sex", "menor sexo", "criança nua", "pedo", "csam"];
  if (pedoKeywords.some(k => contentLower.includes(k))) {
    await logSecurityEvent({
      eventType: "abuse_content",
      severity: "critical",
      userId,
      ipAddress,
      description: "Conteúdo de pedofilia detectado — TOLERÂNCIA ZERO",
      adminTips: `🚨 AÇÃO IMEDIATA NECESSÁRIA:\n1. Banir usuário ID ${userId} permanentemente\n2. Preservar TODOS os logs como evidência\n3. Reportar ao Ministério Público (Disque 100 no Brasil)\n4. Contatar equipe jurídica\n5. NÃO apagar evidências`,
      legalReference: "ECA Art. 241 (Brasil); 18 U.S.C. § 2256 (EUA); Convenção ONU sobre Direitos da Criança",
    });
    return { valid: false, reason: "Conteúdo não permitido.", severity: "critical" };
  }

  // TOLERÂNCIA ZERO — Abuso infantil
  const abuseKeywords = ["child abuse", "abuso infantil", "criança abusada", "molestar criança", "abuse child"];
  if (abuseKeywords.some(k => contentLower.includes(k))) {
    await logSecurityEvent({
      eventType: "abuse_content",
      severity: "critical",
      userId,
      ipAddress,
      description: "Conteúdo de abuso infantil detectado — TOLERÂNCIA ZERO",
      adminTips: `🚨 Banir usuário e reportar ao Conselho Tutelar (Brasil) ou autoridade equivalente.`,
      legalReference: "ECA Art. 5° (Brasil); Child Abuse Prevention Act (EUA)",
    });
    return { valid: false, reason: "Conteúdo não permitido.", severity: "critical" };
  }

  // Discriminação
  const discriminationKeywords = ["raça inferior", "inferior race", "kill all", "morte a todos", "exterminar", "negro de merda", "judeu de merda"];
  if (discriminationKeywords.some(k => contentLower.includes(k))) {
    await logSecurityEvent({
      eventType: "discrimination",
      severity: "high",
      userId,
      ipAddress,
      description: "Conteúdo discriminatório detectado",
      adminTips: `⚠️ Banir usuário ID ${userId}.\n📋 Registrar para relatório de conformidade.\n💰 Plataformas com discriminação perdem anunciantes.`,
      legalReference: "Lei 7.716/89 (Brasil); Civil Rights Act 1964 (EUA)",
    });
    return { valid: false, reason: "Conteúdo discriminatório não é permitido nesta plataforma.", severity: "high" };
  }

  // Terrorismo
  const terrorKeywords = ["bomb school", "bomba escola", "ataque terrorista", "jihad kill", "matar todos"];
  if (terrorKeywords.some(k => contentLower.includes(k))) {
    await logSecurityEvent({
      eventType: "moral_violation",
      severity: "critical",
      userId,
      ipAddress,
      description: "Conteúdo de apologia ao terrorismo detectado",
      adminTips: `🚨 Banir usuário e reportar à Polícia Federal (Brasil) ou FBI (EUA).`,
      legalReference: "Lei 13.260/16 (Brasil); 18 U.S.C. § 2339B (EUA)",
    });
    return { valid: false, reason: "Conteúdo não permitido.", severity: "critical" };
  }

  return { valid: true };
}

/**
 * Verifica se usuário tem aceite de termos válido
 */
export async function checkTermsAcceptance(userId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    const { sql: sql2 } = await import("drizzle-orm");
    const result = await db.execute(
      sql2`SELECT id FROM terms_acceptances WHERE user_id = ${userId} AND confirmed_moral_conduct = 1 AND confirmed_no_discrimination = 1 AND confirmed_no_abuse = 1 LIMIT 1`
    );
    return (result as any[][])[0]?.length > 0;
  } catch {
    return false;
  }
}

/**
 * Verifica se menor tem autorização parental
 */
export async function checkParentalConsent(userId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    const { sql: sql3 } = await import("drizzle-orm");
    const result = await db.execute(
      sql3`SELECT id FROM parental_consents WHERE user_id = ${userId} AND confirmed_terms = 1 AND confirmed_moral_conduct = 1 LIMIT 1`
    );
    return (result as any[][])[0]?.length > 0;
  } catch {
    return false;
  }
}

// Funções auxiliares de detecção
function detectSQLInjection(input: string): boolean {
  const patterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(--|;\/\*|\*\/)/,
    /(\bOR\b\s+\d+\s*=\s*\d+)/i,
    /(SLEEP\s*\(|BENCHMARK\s*\(|WAITFOR\s+DELAY)/i,
  ];
  return patterns.some(p => p.test(input));
}

function detectXSS(input: string): boolean {
  const patterns = [
    /<script[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /eval\s*\(/i,
  ];
  return patterns.some(p => p.test(input));
}

export default {
  logSecurityEvent,
  securityMiddleware,
  validateUserContent,
  checkTermsAcceptance,
  checkParentalConsent,
};
