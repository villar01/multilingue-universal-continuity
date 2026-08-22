import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/components/SceneLesson.tsx"), "utf8");
const selection = source.slice(source.indexOf("const handleSelectScene"), source.indexOf("// ── Handle hotspot click"));

describe("scene lesson material flow", () => {
  it("sends the selected native language and derives exercises only from returned scene questions", () => {
    expect(source).toContain("const { profile, immersionMode } = useLanguage()");
    expect(selection).toContain("nativeLanguage: profile.nativeCode || 'pt-BR'");
    expect(selection).toContain("setSceneContent(data)");
    expect(selection).toContain("(data.questions || []).map");
    expect(selection).not.toContain("data.exercises");
  });
});
