import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { IMMERSIVE_SCENES } from "../client/src/lib/immersiveScenesCatalog";
import { resolveCanonicalTeacherResource } from "../client/src/lib/teacherResourceResolver";

const sceneSource = readFileSync(resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"), "utf8");
const audioSource = readFileSync(resolve(process.cwd(), "client/src/lib/audioSource.ts"), "utf8");

describe("contrato compartilhado das 29 cenas imersivas", () => {
  it("resolve retrato, voz e política estável para cada cena PT-BR para EN sem misturar docentes", () => {
    expect(IMMERSIVE_SCENES).toHaveLength(29);
    expect(new Set(IMMERSIVE_SCENES.map((scene) => scene.id)).size).toBe(29);

    for (const scene of IMMERSIVE_SCENES) {
      const resource = resolveCanonicalTeacherResource(scene, "en-US", "pt-BR");
      expect(resource.resolution.materialIsInTargetLanguage).toBe(true);
      expect(resource.teacherName).toMatch(/^(James|Ingrid)$/);
      expect(resource.portrait).toContain("/manus-storage/");
      expect(resource.voiceLang).toBe("en-US");
      expect(resource.media.mode).toBe("neural_audio_portrait");
      expect(resource.media.lipMotion).toBe("none");
    }
  });

  it("centraliza preparação de áudio e não expõe player até a duração ser positiva", () => {
    expect(sceneSource.match(/const playTeacherAudio = useCallback/g)).toHaveLength(1);
    expect(sceneSource).toContain("if (!hasPlayableDuration()) return false;");
    expect(sceneSource).toContain("setDialogAudioSource(null);");
    expect(sceneSource).toContain("setDialogAudioSource(source);");
    expect(audioSource).toContain("parseAudioBase64");
    expect(audioSource).toContain("dataUrlMatch");
  });

  it("mantém mídia visual restrita ao par aprovado em vez de reutilizar vídeo entre cenas", () => {
    expect(sceneSource).toContain('teacherMedia.mode === "pre_generated_video" || teacherMedia.mode === "audio_timed_motion_video"');
    expect(sceneSource).toContain("activeClip.sceneId === scene.id");
    expect(sceneSource).toContain("activeClip.teacherName === (overrideName || scene.teacherName)");
  });
});
