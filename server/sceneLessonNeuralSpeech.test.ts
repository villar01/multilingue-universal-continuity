import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sceneLesson = readFileSync(resolve(process.cwd(), "client/src/components/SceneLesson.tsx"), "utf8");
const naturalVoice = readFileSync(resolve(process.cwd(), "client/src/hooks/useNaturalVoice.ts"), "utf8");

describe("scene lesson neural speech", () => {
  it("sends each object to the selected target locale through Edge neural TTS", () => {
    expect(sceneLesson).toContain("speakNaturalVoice(word, languageCode");
    expect(naturalVoice).toContain('import { speakEdgeTTS, stopEdgeTTS }');
    expect(naturalVoice).toContain("speakEdgeTTS(text, bcp47");
    expect(naturalVoice.slice(naturalVoice.indexOf("export function speakText"), naturalVoice.indexOf("// ── Hook"))).not.toContain("speechSynthesis.speak");
  });
});
