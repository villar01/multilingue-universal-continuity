import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
const section = source.slice(source.indexOf("sceneLesson: protectedProcedure"), source.indexOf("// ── Chat livre sobre a cena"));

describe("scene lesson language fallback", () => {
  it("requests both selected languages and returns empty content instead of fixed PT/EN examples", () => {
    expect(section).toContain("speakers of ' + input.nativeLanguage");
    expect(section).toContain("Never use a third language.");
    expect(section).toContain("teacherIntro: ''");
    expect(section).toContain("objects: []");
    expect(section).not.toContain("This is a ");
    expect(section).not.toContain("What do you see in the");
  });
});
