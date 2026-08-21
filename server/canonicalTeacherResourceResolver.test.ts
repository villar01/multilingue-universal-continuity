import { describe, expect, it } from "vitest";
import { resolveCanonicalTeacherResource } from "../client/src/lib/teacherResourceResolver";
import { IMMERSIVE_SCENES } from "../client/src/lib/immersiveScenesCatalog";

describe("resolvedor canônico de recursos docentes", () => {
  it("mantém James, retrato e voz canônicos na Praia Tropical PT-BR para EN", () => {
    const beach = IMMERSIVE_SCENES.find((scene) => scene.id === "beach");
    expect(beach).toBeDefined();

    const resource = resolveCanonicalTeacherResource(beach!, "en-US", "pt-BR");
    expect(resource.teacherName).toBe("James");
    expect(resource.portrait).toContain("prof_james");
    expect(resource.voiceLang).toBe("en-US");
    expect(resource.media.mode).toBe("neural_audio_portrait");
    expect(resource.media.lipMotion).toBe("none");
  });

  it("não libera movimento para uma solicitação interativa sem mídia aprovada", () => {
    const beach = IMMERSIVE_SCENES.find((scene) => scene.id === "beach");
    const resource = resolveCanonicalTeacherResource(beach!, "en-US", "pt-BR");
    expect(resource.media.requiresExternalGpu).toBe(false);
    expect(resource.media.requiresAdditionalConsent).toBe(false);
  });
});
