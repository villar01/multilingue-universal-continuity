import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
const seedSegment = source.slice(source.indexOf("seed: router({"), source.indexOf("// Professores virtuais"));

describe("autorizações das semeaduras legadas", () => {
  it("exige administrador antes de alterar conteúdo, conquistas ou professores", () => {
    expect(seedSegment.match(/: adminProcedure/g)).toHaveLength(4);
    expect(seedSegment).toContain("populateMassive: adminProcedure");
    expect(seedSegment).toContain("populateExtraLessons: adminProcedure");
    expect(seedSegment).toContain("populateAchievements: adminProcedure");
    expect(seedSegment).toContain("populateTeachers: adminProcedure");
  });
});
