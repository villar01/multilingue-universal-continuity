import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/components/SceneLesson.tsx"), "utf8");
const dialogue = source.slice(source.indexOf("{/* Dialog section */}"), source.indexOf("{/* ── TAB: OBJECTS"));

describe("scene lesson native dialogue", () => {
  it("shows Portuguese-only dialogue translations only for Portuguese native profiles", () => {
    expect(dialogue).toContain("profile.nativeCode?.startsWith('pt')");
    expect(dialogue).toContain("line.textPt");
  });
});
