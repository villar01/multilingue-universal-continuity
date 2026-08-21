import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JAMES_TROPICAL_PILOT_CLIPS } from "../shared/jamesTropicalPilotClips";

const sceneSource = readFileSync(resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"), "utf8");
const clipGuardSource = readFileSync(resolve(process.cwd(), "client/src/lib/sceneTeacherClipGuard.ts"), "utf8");

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

  it("mantém a faixa masculina de reserva e permite o clipe lateral somente durante o áudio correspondente", () => {
    expect(sceneSource).toContain('const JAMES_TROPICAL_INTRO_FALLBACK_URL = "/manus-storage/james-tropical-introduction-exact-fallback_2d892849.wav";');
    expect(sceneSource).toContain('playJamesTropicalClip("james-tropical-greeting")');
    expect(sceneSource).toContain("if (!clip) return null;");
    expect(sceneSource).toContain('import { shouldRenderCompatibleTeacherClip } from "@/lib/sceneTeacherClipGuard";');
    expect(sceneSource).toContain("const showPilotClip = shouldRenderCompatibleTeacherClip({");
    expect(clipGuardSource).toContain('media.mode === "pre_generated_video" || media.mode === "audio_timed_motion_video"');
    expect(sceneSource).toContain("JAMES_TROPICAL_INTRO_FALLBACK_URL,");
  });

  it("mantém o retrato original quando a apresentação não está em reprodução", () => {
    const greeting = JAMES_TROPICAL_PILOT_CLIPS.find((clip) => clip.id === "james-tropical-greeting");
    const introBranchStart = sceneSource.indexOf('if (dialogueScene.id === "beach" && dialogueScene.teacherName === "James" && teacherSpeech.text === JAMES_TROPICAL_INTRO_LINE)');
    const introBranch = sceneSource.slice(introBranchStart, introBranchStart + 900);

    expect(introBranchStart).toBeGreaterThan(-1);
    expect(introBranch.indexOf('playJamesTropicalClip("james-tropical-greeting")')).toBeGreaterThan(-1);
    expect(introBranch.indexOf('playJamesTropicalClip("james-tropical-greeting")')).toBeLessThan(introBranch.indexOf("void playTeacherAudio("));
    expect(greeting?.audioVideoExactPair).not.toBe(true);
    expect(sceneSource).toContain("audio.onplaying = () => {");
    expect(sceneSource).toContain("const promotePendingJamesClipForSpokenText = useCallback");
    expect(sceneSource).toContain("pendingClip.dialogue !== spokenText");
    expect(sceneSource).toContain("promotePendingJamesClipForSpokenText(phrase);");
    expect(sceneSource).toContain("promotePendingJamesClipForSpokenText(text);");
  });

  it("expõe vídeo exato ou movimento lateral temporizado, sem declarar sincronização labial fora do par exato", () => {
    expect(clipGuardSource).toContain("Audio-timed motion is allowed");
    expect(clipGuardSource).toContain('media.mode === "pre_generated_video" || media.mode === "audio_timed_motion_video"');
    expect(sceneSource).toContain("hasExactAudioVideoPair: activeClipHasExactAudioVideoPair");
  });
});
