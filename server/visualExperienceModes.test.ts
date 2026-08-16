import { describe, expect, it } from "vitest";
import { resolveVisualExperienceMode, TEACHER_VISUAL_LAYERS, VISUAL_EXPERIENCE_MODES } from "../shared/visualExperienceModes";

describe("modos de experiência visual", () => {
  it("mantém todos os alunos na experiência padrão sem consentimento local", () => {
    expect(resolveVisualExperienceMode({
      localCompanionApproved: false,
      nvidiaCudaAvailable: true,
      localCompanionReachable: true,
    }).id).toBe("standard");
  });

  it("só habilita o modo avançado com consentimento, CUDA e componente local disponível", () => {
    expect(resolveVisualExperienceMode({
      localCompanionApproved: true,
      nvidiaCudaAvailable: true,
      localCompanionReachable: true,
    }).id).toBe("local_gpu_advanced");
  });

  it("declara fallback seguro sem GPU externa nem instalação silenciosa", () => {
    const advanced = VISUAL_EXPERIENCE_MODES.local_gpu_advanced;
    expect(advanced.fallbackMode).toBe("standard");
    expect(advanced.usesRemoteGpu).toBe(false);
    expect(advanced.prohibitedBehaviors.join(" ")).toContain("Não é ativado apenas pela presença de GPU");
  });

  it("preserva poses pedagógicas pré-geradas mesmo sem GPU e limita boca dinâmica à camada futura", () => {
    const [poses, lipSync] = TEACHER_VISUAL_LAYERS;
    expect(poses.requiresNvidiaCuda).toBe(false);
    expect(poses.purpose).toContain("Saudação");
    expect(lipSync.requiresNvidiaCuda).toBe(true);
    expect(lipSync.fallback).toContain("pose pré-gerada");
  });
});
