import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JAMES_TROPICAL_PILOT_CLIPS } from "../shared/jamesTropicalPilotClips";

const sceneSource = readFileSync(resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"), "utf8");

describe("backup audiovisual aprovado de James", () => {
  it("mantém o clipe lateral canônico da Praia Tropical associado à saudação publicada", () => {
    const greeting = JAMES_TROPICAL_PILOT_CLIPS.find((clip) => clip.id === "james-tropical-greeting");

    expect(greeting).toMatchObject({
      teacherName: "James",
      sceneId: "beach",
      language: "en-US",
      preserveOriginalPortrait: true,
      fallback: "original_portrait",
      videoUrl: "/manus-storage/james-tropical-greeting_5f8622cb.mp4",
    });
    expect(greeting?.audioVideoExactPair).not.toBe(true);
  });

  it("mantém a faixa masculina de reserva e só promove o clipe depois de áudio confirmado", () => {
    expect(sceneSource).toContain('const JAMES_TROPICAL_INTRO_FALLBACK_URL = "/manus-storage/james-tropical-introduction-exact-fallback_2d892849.wav";');
    expect(sceneSource).toContain('playJamesTropicalClip("james-tropical-greeting")');
    expect(sceneSource).toContain("audio.onplaying = () => {");
    expect(sceneSource).toContain("setActiveJamesClipId(pendingJamesClipIdRef.current);");
    expect(sceneSource).toContain("JAMES_TROPICAL_INTRO_FALLBACK_URL,");
  });
});
