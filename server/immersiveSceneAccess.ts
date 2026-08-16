import type { NextFunction, Request, Response } from "express";

type RequestAuthenticator = {
  authenticateRequest: (request: Request) => Promise<unknown>;
};

export const PROTECTED_LEARNING_ROUTE_PREFIXES = [
  "/lesson",
  "/complete-lesson",
  "/practice",
  "/phrasal-verbs-exercises",
  "/interactive-videos",
  "/reels",
  "/roleplay",
  "/clips",
  "/ar-teacher",
  "/ar-mode",
  "/ar-ultimate",
  "/vr-conversation",
  "/free-talk",
  "/word-game",
  "/daily-challenge",
  "/progress",
  "/achievements",
  "/lesson-history",
  "/battle",
  "/certificates",
  "/pronunciation-history",
  "/structured-lesson",
  "/immersive-scene",
  "/daily-memory",
  "/my-teacher",
  "/immersive-lesson",
  "/lessons-hub",
  "/dialogue",
  "/natural-learning",
  "/natural-lesson",
  "/master-lesson",
  "/ia-nativa",
  "/smart-review",
  "/base-de-estudos",
  "/pareto-1000",
] as const;

export function isProtectedLearningPath(pathname: string): boolean {
  return PROTECTED_LEARNING_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * Protects the immersive-scene shell itself, so unauthenticated requests never
 * reach Vite/static delivery for this curriculum route.
 */
export function requireImmersiveSceneAccess(authenticator: RequestAuthenticator) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      await authenticator.authenticateRequest(request);
      next();
    } catch {
      response.status(401).json({ error: "authentication-required" });
    }
  };
}

/**
 * Blocks direct HTTP delivery of every route that can expose curriculum. Pages
 * such as home, pricing, legal terms, and OAuth stay public by omission.
 */
export function requireLearningRouteAccess(authenticator: RequestAuthenticator) {
  return async (request: Request, response: Response, next: NextFunction) => {
    if (!isProtectedLearningPath(request.path)) {
      next();
      return;
    }
    await requireImmersiveSceneAccess(authenticator)(request, response, next);
  };
}
