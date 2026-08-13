import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const router = readFileSync(resolve(root, "server/gamification-router.ts"), "utf8");
const schema = readFileSync(resolve(root, "drizzle/schema.ts"), "utf8");

describe("Persistência de gamificação", () => {
  it("mantém as tabelas de estatísticas e desbloqueios exigidas pelas rotas ativas", () => {
    expect(schema).toContain('mysqlTable("user_stats"');
    expect(schema).toContain('mysqlTable("user_achievements"');
    expect(schema).toContain('uniqueIndex("user_achievements_user_achievement_unique")');
  });

  it("usa operações Drizzle tipadas em vez de SQL interpolado", () => {
    expect(router).toContain("getOrCreateUserStats");
    expect(router).toContain("database.select().from(userStats)");
    expect(router).toContain("database.insert(userStats)");
    expect(router).toContain("database.update(userStats)");
    expect(router).toContain("checkAndUnlockAchievements");
    expect(router).not.toContain("SELECT * FROM user_stats WHERE user_id = ${userId}");
    expect(router).not.toContain("last_activity_date = ${today}");
  });
});
