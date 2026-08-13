import type { Request, Response, NextFunction } from 'express';

// ── Rate Limiting ─────────────────────────────────────────────
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const API_RATE_LIMIT_MAX = 300;
const AUTH_RATE_LIMIT_MAX = 30;

// ── DDoS Protection ───────────────────────────────────────────
const globalRequestCounts = { count: 0, resetTime: Date.now() + RATE_LIMIT_WINDOW };
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

// ── Main Security Middleware ───────────────────────────────────
export function securityMiddleware(req: Request, res: Response, next: NextFunction): void {
  const clientIp = getClientIp(req);
  const userAgent = req.headers['user-agent'] || '';
  const now = Date.now();

  // DDoS Protection
  if (now > globalRequestCounts.resetTime) {
    globalRequestCounts.count = 0;
    globalRequestCounts.resetTime = now + RATE_LIMIT_WINDOW;
  }
  globalRequestCounts.count++;
  if (globalRequestCounts.count > GLOBAL_RATE_LIMIT) {
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
        res.status(429).json({ error: 'Limite de requisicoes excedido.' });
        return;
      }
    }
  }

  // Suspicious User Agent
  if (isSuspiciousUserAgent(userAgent)) {
    console.warn(`[SECURITY] Suspicious UA: ${clientIp} - ${userAgent}`);
    res.status(403).json({ error: 'Acesso negado.' });
    return;
  }

  // SQL Injection & XSS Detection
  const checkObject = (obj: Record<string, unknown>, path: string): boolean => {
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'string') {
        if (detectSqlInjection(value)) {
          console.warn(`[SECURITY] SQL Injection: ${clientIp} - ${path}.${key}`);
          return true;
        }
        if (detectXss(value)) {
          console.warn(`[SECURITY] XSS: ${clientIp} - ${path}.${key}`);
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
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(self), camera=(self)');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  next();
}

// ── Clean up expired entries ──────────────────────────────────
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now > data.resetTime) requestCounts.delete(ip);
  }
}, 5 * 60 * 1000);

/** Somente para isolamento determinístico dos testes de segurança. */
export function __resetSecurityStateForTests(): void {
  requestCounts.clear();
  globalRequestCounts.count = 0;
  globalRequestCounts.resetTime = Date.now() + RATE_LIMIT_WINDOW;
}
