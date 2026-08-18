import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const analyticsSource = readFileSync(path.join(root, "client/src/lib/aggregateAnalytics.ts"), "utf8");
const abcBookSource = readFileSync(path.join(root, "client/src/pages/ABCBook.tsx"), "utf8");
const paretoSource = readFileSync(path.join(root, "client/src/pages/Pareto1000.tsx"), "utf8");
const immersiveSource = readFileSync(path.join(root, "client/src/pages/ImmersiveScene.tsx"), "utf8");

describe("eventos agregados de estudo", () => {
  it("emite somente nomes fixos e não aceita parâmetros de perfil, cena ou conversa", () => {
    expect(analyticsSource).toContain('"open_abc_book"');
    expect(analyticsSource).toContain('"open_pareto"');
    expect(analyticsSource).toContain('"open_immersive_scene"');
    expect(analyticsSource).toContain("track?: (event: AggregateLearningEvent) => void");
    expect(analyticsSource).toContain("window.umami?.track?.(event)");
    expect(analyticsSource).not.toContain("profile");
    expect(analyticsSource).not.toContain("sceneId");
    expect(analyticsSource).not.toContain("track?.(event,");
  });

  it("registra somente as aberturas autorizadas de cartilha, Pareto e Cena Imersiva", () => {
    expect(abcBookSource).toContain('trackAggregateLearningEvent("open_abc_book")');
    expect(paretoSource).toContain('trackAggregateLearningEvent("open_pareto")');
    expect(immersiveSource).toContain('trackAggregateLearningEvent("open_immersive_scene")');
  });
});
