import type { NextFunction, Request, Response } from "express";

type RequestAuthenticator = {
  authenticateRequest: (request: Request) => Promise<unknown>;
};

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
