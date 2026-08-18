import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { requiresLearningHttpGate } from "./learning-http-gate";

const appSource = readFileSync(resolve(import.meta.dirname, "../client/src/App.tsx"), "utf8");

const protectedRoutes = [
  "/lesson",
  "/complete-lesson",
  "/practice/clips",
  "/chat",
  "/ai-chat",
  "/phrasal-verbs-exercises",
  "/interactive-videos",
  "/reels",
  "/roleplay",
  "/clips",
  "/ar-teacher",
  "/ar-mode",
  "/vr-conversation",
  "/free-talk",
  "/word-game",
  "/daily-challenge",
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
  "/abc-book",
  "/pareto-1000",
  "/dashboard",
  "/progress",
  "/achievements",
  "/lesson-history",
  "/battle",
  "/certificates",
  "/pronunciation-history",
  "/parental-control",
] as const;

function routeIsRegistered(route: string) {
  const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`path=\\{?["']${escaped}(?:/|["'])`).test(appSource);
}

describe("cobertura de rotas no portão HTTP de aprendizagem", () => {
  it("protege todas as rotas educacionais e de acompanhamento registradas", () => {
    for (const route of protectedRoutes) {
      expect(routeIsRegistered(route)).toBe(true);
      expect(requiresLearningHttpGate(route)).toBe(true);
    }
  });

  it("mantém apresentação, preços, termos e detecção de idioma fora do portão", () => {
    for (const route of ["/", "/pricing", "/pricing-comparison", "/terms", "/language-detect", "/checkout"] as const) {
      expect(requiresLearningHttpGate(route)).toBe(false);
    }
  });
});
