import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/components/SceneLesson.tsx"), "utf8");
const selection = source.slice(source.indexOf("const handleSelectScene"), source.indexOf("// ── Handle hotspot click"));

describe("scene lesson greeting language", () => {
  it("does not append the Portuguese-only greeting to every selected scene", () => {
    expect(selection).toContain("content: scene.teacherGreeting,");
    expect(selection).not.toContain("scene.greetingPt");
  });
});
