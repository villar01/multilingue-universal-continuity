import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/components/SceneLesson.tsx"), "utf8");
const pronunciation = source.slice(source.indexOf("const startPronunciation"), source.indexOf("// ── Scene picker"));

describe("scene lesson pronunciation", () => {
  it("uses authenticated transcription and a deterministic comparison instead of random scoring", () => {
    expect(source).toContain("trpc.voiceTranscription.transcribe.useMutation()");
    expect(pronunciation).toContain("transcriptionMutation.mutateAsync");
    expect(pronunciation).toContain("pronunciationSimilarity(selectedHotspot.label, heard)");
    expect(pronunciation).not.toContain("Math.random");
  });
});
