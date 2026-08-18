import type { NextFunction, Request, Response } from "express";
import { TRPCError } from "@trpc/server";

const LEARNING_ROUTE_PREFIXES = [
  "/base-de-estudos",
  "/lesson",
  "/complete-lesson",
  "/pareto-1000",
  "/immersive-scene",
  "/practice",
  "/abc-book",
  "/chat",
  "/ai-chat",
  "/free-talk",
  "/roleplay",
  "/interactive-videos",
  "/reels",
  "/clips",
  "/ar-teacher",
  "/ar-mode",
  "/vr-conversation",
  "/word-game",
  "/daily-challenge",
  "/structured-lesson",
  "/immersive-lesson",
  "/lessons-hub",
  "/dialogue",
  "/natural-learning",
  "/natural-lesson",
  "/master-lesson",
  "/ia-nativa",
  "/smart-review",
  "/daily-memory",
  "/my-teacher",
  "/phrasal-verbs-exercises",
  "/dashboard",
  "/dashboard-real",
  "/onboarding",
  "/avatar-selection",
  "/ranking",
  "/progress",
  "/achievements",
  "/lesson-history",
  "/battle",
  "/certificates",
  "/pronunciation-history",
  "/parental-control",
] as const;

export function requiresLearningHttpGate(pathname: string): boolean {
  const normalizedPath = pathname.split("?")[0].replace(/\/+$/, "") || "/";
  return LEARNING_ROUTE_PREFIXES.some((prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`));
}

type LearningAccount = { id: number };

export function createLearningHttpGate(dependencies: {
  authenticate: (request: Request) => Promise<LearningAccount>;
  assertEntitlement: (userId: number) => Promise<unknown>;
}) {
  return async (request: Request, response: Response, next: NextFunction) => {
    if (!(["GET", "HEAD"] as const).includes(request.method as "GET" | "HEAD") || !requiresLearningHttpGate(request.path)) {
      next();
      return;
    }

    try {
      const user = await dependencies.authenticate(request);
      await dependencies.assertEntitlement(user.id);
      next();
    } catch (error) {
      if (error instanceof TRPCError && error.code === "FORBIDDEN") {
        response.status(403).json({ code: "learning-entitlement-required" });
        return;
      }
      if (error instanceof TRPCError && error.code === "SERVICE_UNAVAILABLE") {
        response.status(503).json({ code: "learning-access-unavailable" });
        return;
      }
      response.status(401).json({ code: "learning-authentication-required" });
    }
  };
}
