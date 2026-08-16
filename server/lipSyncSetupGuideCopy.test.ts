import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const guideSource = readFileSync("client/src/components/LipSyncSetupGuide.tsx", "utf8");
const copySource = readFileSync("client/src/lib/lipSyncSetup.ts", "utf8");

describe("comunicação do guia inicial de IA local", () => {
  it("mantém o guia restrito ao início da jornada", () => {
    expect(guideSource).toContain('const START_ROUTES = new Set(["/"]);');
    expect(guideSource).toContain("if (!open || !START_ROUTES.has(location)) return null;");
    expect(guideSource).toContain('setOpen(localStorage.getItem(LIP_SYNC_GUIDE_STORAGE_KEY) !== "1")');
  });

  it("prioriza recursos disponíveis e expansão opcional sem linguagem técnica negativa", () => {
    expect(guideSource).toContain("Pronto para aprender agora:");
    expect(guideSource).toContain("Recursos disponíveis hoje:");
    expect(guideSource).toContain("aproveite a voz, o diálogo e os clipes pedagógicos disponíveis");
    expect(copySource).toContain('title: "Comece a aprender agora"');
    expect(copySource).toContain('title: "Amplie a prática de texto com Qwen ou Llama"');
    expect(copySource).toContain('title: "Escolha a configuração adequada ao seu objetivo"');
    expect(copySource).toContain("interações visuais avançadas permanecem como uma expansão opcional");
    expect(guideSource).not.toContain("sem placa NVIDIA confirmada");
    expect(copySource).not.toContain("Não deixe o notebook ligado esperando animação");
    expect(copySource).not.toContain("não produzem movimento labial");
  });
});
