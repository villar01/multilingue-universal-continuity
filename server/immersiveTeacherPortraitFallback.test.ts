import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"), "utf8");

describe("fallback de retrato do professor na cena imersiva", () => {
  it("mantém a foto original montada sob o clipe opcional", () => {
    const portraitIndex = source.indexOf("src={overrideImage || scene.teacherImage}");
    const videoIndex = source.indexOf("{showPilotClip && activeClip?.videoUrl && (");
    expect(portraitIndex).toBeGreaterThan(-1);
    expect(videoIndex).toBeGreaterThan(portraitIndex);
    expect(source).toContain("zIndex: 2");
  });

  it("remove somente a camada de clipe quando ela encerra ou falha", () => {
    expect(source).toContain("onError={onClipFinished}");
    expect(source).toContain('onClipFinished={() => { setActiveJamesClipId(null); setActiveSophieClipId(null); }}');
    expect(source).toContain('const showPilotClip = Boolean(');
    expect(source).toContain('const showSyntheticMouth = false;');
  });

  it("usa vídeo somente após a estratégia confirmar um clipe pré-gerado aprovado", () => {
    expect(source).toContain('import { selectTeacherMedia, selectTeacherPoseAudioCue } from "@shared/teacherMediaStrategy";');
    expect(source).toContain("const teacherMedia = selectTeacherMedia({");
    expect(source).toContain('kind: activeClip?.videoUrl ? "scripted" : "interactive",');
    expect(source).toContain('hasApprovedPreGeneratedVideo: Boolean(activeClip?.videoUrl),');
    expect(source).toContain('teacherMedia.mode === "pre_generated_video"');
  });

  it("expõe a pose e a intenção de fala do clipe roteirizado sem aplicá-las a respostas livres", () => {
    expect(source).toContain("const teacherPoseCue = activeClip ? selectTeacherPoseAudioCue(activeClip.trigger) : null;");
    expect(source).toContain("data-teacher-pose={teacherPoseCue?.pose.id}");
    expect(source).toContain("data-teacher-audio-intent={teacherPoseCue?.audioIntent}");
  });
});
