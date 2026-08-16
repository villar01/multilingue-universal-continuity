import { describe, expect, it } from "vitest";
import { GPU_INTERACTION_NOTICE, LIP_SYNC_GUIDE_STORAGE_KEY, LIP_SYNC_SETUP_STEPS } from "../client/src/lib/lipSyncSetup";

describe("guia de preparação para animação facial", () => {
  it("mantém um estado de exibição persistente e passos claros", () => {
    expect(LIP_SYNC_GUIDE_STORAGE_KEY).toBe("ml-lip-sync-setup-guide-seen");
    expect(LIP_SYNC_SETUP_STEPS).toHaveLength(5);
  });

  it("não apresenta modelos de texto como motor de animação facial", () => {
    const guide = LIP_SYNC_SETUP_STEPS.map((step) => step.description).join(" ");
    expect(guide).toContain("Qwen e Llama respondem, explicam e auxiliam exercícios de texto");
    expect(guide).toContain("não movimentam rosto, boca ou lábios");
    expect(guide).toContain("placa NVIDIA compatível com CUDA");
    expect(guide).toContain("Não será usado tremor artificial");
  });

  it("explica as interações visuais futuras sem prometer GPU ou instalação automática", () => {
    expect(GPU_INTERACTION_NOTICE.withCuda).toContain("interações visuais mais complexas");
    expect(GPU_INTERACTION_NOTICE.withCuda).toContain("resposta facial por áudio");
    expect(GPU_INTERACTION_NOTICE.withoutCuda).toContain("vídeos pré-gerados");
    expect(GPU_INTERACTION_NOTICE.withoutCuda).toContain("não simula movimento com tremores");
    expect(GPU_INTERACTION_NOTICE.availability).toContain("não são ativados automaticamente");
  });
});
