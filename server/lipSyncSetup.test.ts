import { describe, expect, it } from "vitest";
import { GPU_INTERACTION_NOTICE, LIP_SYNC_GUIDE_STORAGE_KEY, LIP_SYNC_SETUP_STEPS } from "../client/src/lib/lipSyncSetup";

describe("guia de preparação para animação facial", () => {
  it("mantém um estado de exibição persistente e passos claros", () => {
    expect(LIP_SYNC_GUIDE_STORAGE_KEY).toBe("ml-lip-sync-setup-guide-seen");
    expect(LIP_SYNC_SETUP_STEPS).toHaveLength(5);
  });

  it("distingue IA de texto da camada visual sem perder a orientação prática", () => {
    const guide = LIP_SYNC_SETUP_STEPS.map((step) => step.description).join(" ");
    expect(guide).toContain("Qwen e Llama podem responder, explicar e apoiar exercícios escritos");
    expect(guide).toContain("clipes pedagógicos continuam oferecendo a camada visual da experiência");
    expect(guide).toContain("GPU NVIDIA compatível com CUDA");
    expect(guide).toContain("validação completa");
  });

  it("explica as interações visuais futuras como expansão opcional e validada", () => {
    expect(GPU_INTERACTION_NOTICE.withCuda).toContain("interações visuais mais complexas");
    expect(GPU_INTERACTION_NOTICE.withCuda).toContain("resposta facial por áudio");
    expect(GPU_INTERACTION_NOTICE.withoutCuda).toContain("vídeos pedagógicos pré-gerados");
    expect(GPU_INTERACTION_NOTICE.withoutCuda).toContain("expansão opcional");
    expect(GPU_INTERACTION_NOTICE.availability).toContain("validação antes de cada ativação");
  });
});
