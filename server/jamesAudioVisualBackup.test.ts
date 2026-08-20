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

  it("agenda o clipe da apresentação antes da faixa e o promove apenas após a confirmação do áudio", () => {
    const introBranchStart = sceneSource.indexOf('if (dialogueScene.id === "beach" && dialogueScene.teacherName === "James" && teacherSpeech.text === JAMES_TROPICAL_INTRO_LINE)');
    const introBranch = sceneSource.slice(introBranchStart, introBranchStart + 900);
    const onPlayingStart = sceneSource.indexOf("audio.onplaying = () => {");
    const onPlayingBlock = sceneSource.slice(onPlayingStart, onPlayingStart + 650);

    expect(introBranchStart).toBeGreaterThan(-1);
    expect(introBranch.indexOf('playJamesTropicalClip("james-tropical-greeting")')).toBeGreaterThan(-1);
    expect(introBranch.indexOf('playJamesTropicalClip("james-tropical-greeting")')).toBeLessThan(introBranch.indexOf("void playTeacherAudio("));
    expect(onPlayingBlock).toContain("pendingJamesClipIdRef.current");
    expect(onPlayingBlock).toContain("setActiveJamesClipId(confirmedJamesClipId);");
  });

  it("promove a saudação no áudio confirmado mesmo se a referência pendente for limpa antes do evento", () => {
    expect(sceneSource).toContain('requestKey === "james-tropical-introduction" ? "james-tropical-greeting" : null');
    expect(sceneSource).toContain("setActiveJamesClipId(confirmedJamesClipId);");
  });
});
