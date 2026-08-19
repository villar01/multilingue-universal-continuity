import type { Request, Response, NextFunction } from 'express';

import { isTemporarilyAbuseBlocked, recordAbuseSignal } from "./_core/abuseProtection";

// ── Rate Limiting ─────────────────────────────────────────────
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const API_RATE_LIMIT_MAX = 300;
const AUTH_RATE_LIMIT_MAX = 30;

// ── DDoS Protection ───────────────────────────────────────────
const globalRequestCounts = new Map<string, { count: number; resetTime: number }>();
const GLOBAL_RATE_LIMIT = 1000;

// ── SQL Injection Patterns ────────────────────────────────────
const SQL_INJECTION_PATTERNS = [
  /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
  /UNION\s+SELECT/i,
  /INSERT\s+INTO/i,
  /DELETE\s+FROM/i,
  /DROP\s+TABLE/i,
  /EXEC(UTE)?\s*\(/i,
  /SCRIPT\s*>/i,
  /WAITFOR\s+DELAY/i,
  /INFORMATION_SCHEMA/i,
];

// ── XSS Patterns ──────────────────────────────────────────────
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=\s*"[^"]*"/gi,
  /on\w+\s*=\s*'[^']*'/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /<object[^>]*>.*?<\/object>/gi,
  /<embed[^>]*>/gi,
  /eval\s*\(/gi,
  /expression\s*\(/gi,
];

// ── Suspicious User Agents ────────────────────────────────────
const SUSPICIOUS_UA_PATTERNS = [
  /sqlmap/i, /nikto/i, /nmap/i, /masscan/i, /dirbuster/i,
  /wpscan/i, /hydra/i, /metasploit/i, /burp/i, /zap/i,
  /acunetix/i, /nessus/i, /arachni/i,
];

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function sanitizeInput(input: string): string {
  let sanitized = input;
  for (const pattern of XSS_PATTERNS) sanitized = sanitized.replace(pattern, '');
  return sanitized;
}

function detectSqlInjection(input: string): boolean {
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

function detectXss(input: string): boolean {
  return XSS_PATTERNS.some(pattern => pattern.test(input));
}

function isSuspiciousUserAgent(ua: string): boolean {
  return SUSPICIOUS_UA_PATTERNS.some(pattern => pattern.test(ua));
}

function getRateLimitBucket(req: Request): { key: string; max: number } | null {
  const path = req.path || req.originalUrl || "";
  if (!path.startsWith("/api/")) return null;
  const isAuthRoute = /\/api\/(oauth|auth|login|register|password)/i.test(path);
  return { key: isAuthRoute ? "auth" : "api", max: isAuthRoute ? AUTH_RATE_LIMIT_MAX : API_RATE_LIMIT_MAX };
}

export function buildContentSecurityPolicy(): string {
  const isDevelopment = process.env.NODE_ENV === "development";
  const scriptSources = ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://connect.facebook.net"];
  const connectSources = ["'self'", "https://api.manus.im", "https://*.manus.im"];

  if (isDevelopment) {
    scriptSources.push("'unsafe-eval'");
    connectSources.push("ws:");
  }

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSources.join(" ")}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://*.manuscdn.com https://d36hbw14aib5lz.cloudfront.net https://d2xsxph8kpxj0f.cloudfront.net",
    "media-src 'self' data: blob: https:",
    `connect-src ${connectSources.join(" ")}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self' https://manus.im https://*.manus.im https://*.manus.computer",
  ];

  if (!isDevelopment) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

// ── Main Security Middleware ───────────────────────────────────
export function securityMiddleware(req: Request, res: Response, next: NextFunction): void {
  const clientIp = getClientIp(req);
  const userAgent = req.headers['user-agent'] || '';
  const now = Date.now();

  if (isTemporarilyAbuseBlocked(clientIp, now)) {
    res.status(429).json({ error: "Acesso temporariamente limitado por atividade técnica repetida." });
    return;
  }

  // A 403 response is treated as a signal only when it repeats. No content,
  // browser fingerprint or visitor identity is stored by this middleware.
  res.once?.("finish", () => {
    if (res.statusCode === 403 && (req.path || req.originalUrl || "").startsWith("/api/")) {
      recordAbuseSignal(clientIp, "repeated-access-denied");
    }
  });

  // DDoS Protection
  const globalData = globalRequestCounts.get(clientIp);
  if (!globalData || now > globalData.resetTime) {
    globalRequestCounts.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  } else {
    globalData.count++;
  }
  if ((globalRequestCounts.get(clientIp)?.count ?? 0) > GLOBAL_RATE_LIMIT) {
    res.status(429).json({ error: 'Servidor sobrecarregado. Tente novamente.' });
    return;
  }

  // Recursos estáticos e navegação usam apenas a proteção global; o limite por
  // IP fica reservado às chamadas de API, com proteção mais estrita no login.
  const bucket = getRateLimitBucket(req);
  if (bucket) {
    const rateKey = `${clientIp}:${bucket.key}`;
    const ipData = requestCounts.get(rateKey);
    if (!ipData || now > ipData.resetTime) {
      requestCounts.set(rateKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    } else {
      ipData.count++;
      if (ipData.count > bucket.max) {
        recordAbuseSignal(clientIp, "rate-limit", now);
        res.status(429).json({ error: 'Limite de requisicoes excedido.' });
        return;
      }
    }
  }

  // Suspicious User Agent
  if (isSuspiciousUserAgent(userAgent)) {
    recordAbuseSignal(clientIp, "scanner", now);
    console.warn("[SECURITY] Suspicious user-agent blocked");
    res.status(403).json({ error: 'Acesso negado.' });
    return;
  }

  // SQL Injection & XSS Detection
  const checkObject = (obj: Record<string, unknown>, path: string): boolean => {
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'string') {
        if (detectSqlInjection(value)) {
          recordAbuseSignal(clientIp, "malicious-input", now);
          console.warn(`[SECURITY] SQL injection pattern blocked at ${path}.${key}`);
          return true;
        }
        if (detectXss(value)) {
          recordAbuseSignal(clientIp, "malicious-input", now);
          console.warn(`[SECURITY] XSS pattern blocked at ${path}.${key}`);
          return true;
        }
        obj[key] = sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null) {
        if (checkObject(value as Record<string, unknown>, `${path}.${key}`)) return true;
      }
    }
    return false;
  };

  if (req.query && typeof req.query === 'object') {
    if (checkObject(req.query as Record<string, unknown>, 'query')) {
      res.status(403).json({ error: 'Conteudo malicioso detectado.' });
      return;
    }
  }

  if (req.body && typeof req.body === 'object') {
    if (checkObject(req.body as Record<string, unknown>, 'body')) {
      res.status(403).json({ error: 'Conteudo malicioso detectado.' });
      return;
    }
  }

  // Security Headers
  res.setHeader('Content-Security-Policy', buildContentSecurityPolicy());
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(self), camera=(self)');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  next();
}

// ── Clean up expired entries ──────────────────────────────────
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now > data.resetTime) requestCounts.delete(ip);
  }
  for (const [ip, data] of globalRequestCounts.entries()) {
    if (now > data.resetTime) globalRequestCounts.delete(ip);
  }
}, 5 * 60 * 1000);

/** Somente para isolamento determinístico dos testes de segurança. */
export function __resetSecurityStateForTests(): void {
  requestCounts.clear();
  globalRequestCounts.clear();
}
