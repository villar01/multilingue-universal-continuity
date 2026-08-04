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
import { serveStatic, setupVite } from "./vite";
import { ipBlockMiddleware } from "./security";
import { securityMiddleware } from "../securityMiddleware";
import { startAutoBackup } from "../backupRestore";

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

  // Iniciar sistema de backup automático (a cada 6 horas)
  startAutoBackup();

  // Enable gzip compression for all responses (70% size reduction)
  app.use(compression({ level: 6 }));
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Storage proxy for /manus-storage/* paths
  registerStorageProxy(app);
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Scheduled: expansão diária de vocabulário Pareto (+200 palavras/dia via IA)
  const { handleVocabExpand } = await import("../scheduled/vocab-expand");
  app.post("/api/scheduled/vocab-expand", handleVocabExpand);

  // Telemetria + Error reporting — salva no banco para IA de autoaperfeiçoamento
  app.post("/api/error-report", async (req, res) => {
    const { context, message, stack, url, timestamp, eventType } = req.body || {};
    if (message) {
      console.error(`[CLIENT ERROR] [${context || 'unknown'}] ${message} | url:${url} | ts:${timestamp}`);
      if (stack) console.error(`  Stack: ${stack.slice(0, 300)}`);
    }
    try {
      const { getDb } = await import("../db");
      const db = await getDb();
      if (db) {
        const pool = (db as any).$client;
        await pool.execute(
          `INSERT INTO app_telemetry (event_type, context, message, stack, url) VALUES (?, ?, ?, ?, ?)`,
          [eventType || 'error', (context || '').slice(0, 100), (message || '').slice(0, 500), (stack || '').slice(0, 1000), (url || '').slice(0, 200)]
        );
      }
    } catch (_e) { /* silencioso */ }
    res.json({ ok: true });
  });
  // IA de Autoaperfeiçoamento — análise diária via cron ou manual pelo admin
  app.post("/api/scheduled/ai-self-improve", async (req, res) => {
    try {
      const { runAISelfImprove } = await import("../scheduled/ai-self-improve");
      const result = await runAISelfImprove();
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });
  // Insights da IA — listagem para o painel admin
  app.get("/api/ai-insights", async (req, res) => {
    try {
      const { getDb } = await import("../db");
      const db = await getDb();
      if (!db) return res.json([]);
      const pool = (db as any).$client;
      const [rows] = await pool.execute(`SELECT * FROM ai_insights ORDER BY created_at DESC LIMIT 20`);
      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
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
