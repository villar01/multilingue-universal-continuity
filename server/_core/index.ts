import "dotenv/config";
import express from "express";
import { createServer } from "http";
import compression from "compression";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { sdk } from "./sdk";
import { serveStatic, setupVite } from "./vite";
import { ipBlockMiddleware } from "./security";
import { securityMiddleware } from "../securityMiddleware";
import { consumePublicErrorReportQuota, sanitizePublicErrorReport } from "./httpRouteSecurity";
import { createLearningHttpGate } from "../learning-http-gate";
import { getLearningContentEntitlement } from "../trial-access-router";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Proteção anti-invasão: bloqueia IPs suspeitos ANTES de qualquer rota
  app.use(ipBlockMiddleware);

  // Middleware de segurança cibernética: rate limiting, SQL injection, XSS, DDoS, headers
  app.use(securityMiddleware);

  // Enable gzip compression for all responses (70% size reduction)
  app.use(compression({ level: 6 }));
  
  // File bytes use storage directly; API bodies stay deliberately small.
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));
  // Storage proxy for /manus-storage/* paths
  registerStorageProxy(app);
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Must run before Vite/static fallback: an anonymous request receives no learning page shell.
  app.use(createLearningHttpGate({
    authenticate: (request) => sdk.authenticateRequest(request),
    assertEntitlement: (userId) => getLearningContentEntitlement(userId),
  }));
  // Scheduled: expansão diária de vocabulário Pareto (+200 palavras/dia via IA)
  const { handleVocabExpand } = await import("../scheduled/vocab-expand");
  app.post("/api/scheduled/vocab-expand", handleVocabExpand);
  const { handleScheduledBackup } = await import("../scheduled/backup");
  app.post("/api/scheduled/backup", handleScheduledBackup);
  const { handleParentalOptionalDataRetention } = await import("../scheduled/parental-data-retention");
  app.post("/api/scheduled/parental-optional-data-retention", handleParentalOptionalDataRetention);

  // Telemetry is public so signed-out clients can report failures, but it stores
  // only a fixed event and a short controlled context label.
  app.post("/api/error-report", async (req, res) => {
    const clientKey = req.ip || req.socket.remoteAddress || "unknown";
    if (!consumePublicErrorReportQuota(clientKey)) {
      res.status(429).json({ ok: false });
      return;
    }

    const telemetry = sanitizePublicErrorReport(req.body);
    console.error(`[CLIENT ERROR] [${telemetry.context}] ${telemetry.eventType}`);

    try {
      const { getDb } = await import("../db");
      const db = await getDb();
      if (db) {
        const pool = (db as any).$client;
        await pool.execute(
          `INSERT INTO app_telemetry (event_type, context) VALUES (?, ?)`,
          [telemetry.eventType, telemetry.context]
        );
      }
    } catch (_e) { /* silencioso */ }
    res.json({ ok: true });
  });
  // IA de Autoaperfeiçoamento — somente tarefa agendada autenticada.
  app.post("/api/scheduled/ai-self-improve", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) {
        res.status(403).json({ error: "cron-only" });
        return;
      }
      const { runAISelfImprove } = await import("../scheduled/ai-self-improve");
      const result = await runAISelfImprove();
      res.json(result);
    } catch {
      res.status(500).json({ success: false, error: "scheduled-task-failed" });
    }
  });
  // AI insights contain operational data and are never public.
  app.get("/api/ai-insights", async (req, res) => {
    try {
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        res.status(401).json({ error: "authentication-required" });
        return;
      }
      if (user.role !== "admin") {
        res.status(403).json({ error: "admin-only" });
        return;
      }
      const { getDb } = await import("../db");
      const db = await getDb();
      if (!db) return res.json([]);
      const pool = (db as any).$client;
      const [rows] = await pool.execute(
        `SELECT id, insight_type, title, severity, status, created_at, updated_at
         FROM ai_insights ORDER BY created_at DESC LIMIT 20`
      );
      res.json(rows);
    } catch {
      res.status(500).json({ error: "request-failed" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
