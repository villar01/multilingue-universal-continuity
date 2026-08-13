import { describe, expect, it } from "vitest";
import { autoImprovementRouter } from "./auto-improvement-router";

describe("autorização do módulo de autoaperfeiçoamento", () => {
  it("recusa mutações internas para visitante e usuário não administrativo", async () => {
    const visitor = autoImprovementRouter.createCaller({ user: null } as any);
    const student = autoImprovementRouter.createCaller({ user: { id: 7, role: "user" } } as any);

    await expect(visitor.generateFeature({ featureName: "x", description: "x", techStack: [] })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(student.autoFix({ problemDescription: "x", affectedFiles: [] })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(student.fixTTSPronunciation({ language: "en-US", text: "hello", currentVoiceId: "voice", currentRate: 1, currentPitch: 0, issues: [] })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("mantém consultas estáticas de configuração de voz disponíveis sem sessão", async () => {
    const visitor = autoImprovementRouter.createCaller({ user: null } as any);

    const config = await visitor.getOptimizedConfig({ language: "en-US" });
    const voices = await visitor.getCertifiedVoices();

    expect(config.voiceId).toBeTruthy();
    expect(typeof voices.voices).toBe("object");
    expect(Object.keys(voices.voices).length).toBeGreaterThan(0);
  });
});
