import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(import.meta.dirname, "../client/src/pages/Achievements.tsx"), "utf8");

describe("Página de conquistas com dados persistidos", () => {
  it("consulta catálogo, desbloqueios e estatísticas reais somente quando há sessão", () => {
    expect(source).toContain("trpc.gamification.listAchievements.useQuery");
    expect(source).toContain("trpc.gamification.getUserAchievements.useQuery");
    expect(source).toContain("trpc.gamification.getStats.useQuery");
    expect(source).toContain("const enabled = !!user;");
    expect(source).toContain("enabled });");
  });

  it("não mantém catálogo, progresso ou XP inventados", () => {
    expect(source).not.toContain("const ACHIEVEMENTS");
    expect(source).not.toContain('unlocked: true');
    expect(source).not.toContain('progress: 23');
    expect(source).not.toContain('xp: 1000');
    expect(source).toContain("const unlockedIds = new Set");
    expect(source).toContain("metricFor(type, statistics)");
    expect(source).toContain("Nenhuma conquista disponível ainda");
  });
});
