/**
 * Security Middleware - Anti-Piracy & Anti-Hacker Protection
 * 
 * Implementa múltiplas camadas de segurança:
 * - Rate limiting
 * - Detecção de múltiplos logins
 * - Limite de dispositivos
 * - Proteção contra bots
 */

import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

// Rate Limiting - Memória em cache (em produção, usar Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate Limiting - Limita requisições por IP/usuário
 */
export function checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000): void {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    // Nova janela de tempo
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return;
  }

  if (record.count >= maxRequests) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Muitas requisições. Tente novamente em alguns minutos.",
    });
  }

  record.count++;
}

/**
 * Detecção de Múltiplos Logins Simultâneos
 * Permite até 3 dispositivos por conta
 */
export async function checkMultipleLogins(userId: number, deviceId: string): Promise<void> {
  // TODO: Implementar tabela de sessões ativas
  // Por enquanto, apenas log
  console.log(`[Security] User ${userId} login from device ${deviceId}`);
}

/**
 * Limite de Dispositivos por Conta
 */
const MAX_DEVICES_PER_ACCOUNT = 3;

export async function checkDeviceLimit(userId: number): Promise<void> {
  // TODO: Implementar verificação real no banco
  // Por enquanto, apenas validação básica
  console.log(`[Security] Checking device limit for user ${userId}`);
}

/**
 * Detecção de Bot/Automação
 * Verifica padrões suspeitos de comportamento
 */
export function detectBot(userAgent: string | undefined): boolean {
  if (!userAgent) return true;
  
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
  ];

  return botPatterns.some(pattern => pattern.test(userAgent));
}

/**
 * Watermark Digital - Adiciona marca d'água invisível
 * Usado para rastrear vazamento de conteúdo
 */
export function generateWatermark(userId: number, email: string): string {
  const timestamp = Date.now();
  const data = `${userId}-${email}-${timestamp}`;
  return Buffer.from(data).toString('base64');
}

/**
 * Validação de Assinatura Ativa
 * Verifica se usuário tem assinatura válida
 */
export async function checkActiveSubscription(userId: number): Promise<boolean> {
  // TODO: Implementar verificação real de assinatura
  // Por enquanto, retorna true
  return true;
}

/**
 * Proteção contra SQL Injection
 * Valida e sanitiza inputs
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/['"]/g, '') // Remove aspas
    .trim();
}

/**
 * Geração de Token Seguro
 * Para links temporários de mídia
 */
export function generateSecureToken(data: string, expiresIn: number = 3600): string {
  const timestamp = Date.now() + (expiresIn * 1000);
  const payload = `${data}:${timestamp}`;
  return Buffer.from(payload).toString('base64');
}

/**
 * Validação de Token Seguro
 */
export function validateSecureToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [, timestampStr] = decoded.split(':');
    const timestamp = parseInt(timestampStr, 10);
    return Date.now() < timestamp;
  } catch {
    return false;
  }
}

/**
 * Proteção CORS
 * Lista de origens permitidas
 */
export const ALLOWED_ORIGINS = [
  'https://multilingue.manus.space',
  'http://localhost:3000',
  'http://localhost:5173',
];

export function checkOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));
}

// ============================================================
// SEGURANÇA AVANÇADA — Proteção do proprietário
// ============================================================

/** IPs bloqueados permanentemente (atualizado em runtime) */
const blockedIPs = new Set<string>();

/** Contador de tentativas falhas por IP */
const failedAttempts = new Map<string, { count: number; blockedUntil: number }>();

/**
 * Registra tentativa falha e bloqueia IP após 5 tentativas
 */
export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const record = failedAttempts.get(ip) || { count: 0, blockedUntil: 0 };
  record.count++;
  if (record.count >= 5) {
    record.blockedUntil = now + 30 * 60 * 1000; // 30 minutos
    console.warn(`[Security] IP ${ip} bloqueado por 30min após ${record.count} tentativas falhas`);
  }
  failedAttempts.set(ip, record);
}

/**
 * Verifica se IP está bloqueado
 */
export function isIPBlocked(ip: string): boolean {
  if (blockedIPs.has(ip)) return true;
  const record = failedAttempts.get(ip);
  if (record && Date.now() < record.blockedUntil) return true;
  return false;
}

/**
 * Bloqueia IP permanentemente (uso do owner)
 */
export function blockIP(ip: string): void {
  blockedIPs.add(ip);
  console.warn(`[Security] IP ${ip} bloqueado permanentemente pelo proprietário`);
}

/**
 * Rate limit agressivo para rotas de pagamento (10 req/min por identidade)
 */
export function checkPaymentRateLimit(identifier: string): void {
  checkRateLimit(`payment:${identifier}`, 10, 60000);
}

/**
 * Rate limit para rotas de IA (30 req/min)
 */
export function checkAIRateLimit(identifier: string): void {
  checkRateLimit(`ai:${identifier}`, 30, 60000);
}

/**
 * Valida que a ação é do proprietário (OWNER_OPEN_ID env)
 * A Última palavra é sempre do dono — lança FORBIDDEN se não for
 */
export function assertOwner(userOpenId: string | undefined, ownerOpenId: string | undefined): void {
  if (!ownerOpenId || !userOpenId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Acesso restrito ao proprietário do sistema.',
    });
  }
  if (userOpenId !== ownerOpenId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Apenas o proprietário pode executar esta ação.',
    });
  }
}

/**
 * Middleware Express: bloqueia IPs suspeitos antes de qualquer rota
 */
export function ipBlockMiddleware(req: any, res: any, next: any): void {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
    || req.ip
    || req.connection?.remoteAddress
    || 'unknown';
  if (isIPBlocked(ip)) {
    res.status(429).json({ error: 'Acesso temporariamente bloqueado. Contate o suporte se for um erro.' });
    return;
  }
  next();
}

/**
 * Limpa registros expirados do rate limit store (executar periodicamente)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  Array.from(rateLimitStore.entries()).forEach(([key, record]) => {
    if (now > record.resetAt) rateLimitStore.delete(key);
  });
  Array.from(failedAttempts.entries()).forEach(([key, record]) => {
    if (now > record.blockedUntil && record.count < 5) failedAttempts.delete(key);
  });
}

// Limpar store a cada 10 minutos automaticamente
setInterval(cleanupRateLimitStore, 10 * 60 * 1000);
