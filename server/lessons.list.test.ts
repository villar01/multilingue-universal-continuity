import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const dbSource = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");

describe("lessons.list router", () => {
  it("mantém uma consulta limitada, ordenada e segura quando o banco estiver indisponível", () => {
    const querySource = dbSource.slice(
      dbSource.indexOf("export async function getAllLessons"),
      dbSource.indexOf("export async function getLessonsByCourseLevel")
    );

    expect(querySource).toContain("export async function getAllLessons(): Promise<Lesson[]>");
    expect(querySource).toContain("if (!db) return []");
    expect(querySource).toContain("db.select().from(lessons)");
    expect(querySource).toContain(".orderBy(lessons.orderIndex)");
    expect(querySource).toContain(".limit(100)");
  });
});
