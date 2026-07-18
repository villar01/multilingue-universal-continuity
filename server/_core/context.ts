import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { checkRateLimit, detectBot } from "./security";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // Segurança: Rate limiting por IP
  const clientIP = opts.req.ip || opts.req.socket.remoteAddress || 'unknown';
  checkRateLimit(clientIP, 100, 60000); // 100 req/min

  // Segurança: Detecção de bots
  const userAgent = opts.req.headers['user-agent'];
  if (detectBot(userAgent)) {
    console.warn(`[Security] Bot detected: ${userAgent}`);
  }

  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
