import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const scene = readFileSync(resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"), "utf8");
const setup = readFileSync(resolve(process.cwd(), "client/src/pages/IANativa.tsx"), "utf8");

describe("fronteira técnica da cena imersiva", () => {
  it("mantém avisos de infraestrutura fora do fluxo pedagógico", () => {
    expect(scene).not.toMatch(/GPU|CUDA|Ollama|LM Studio|Runtime local/);
    expect(setup).toContain("IA para estudo");
    expect(setup).toContain("Assistência de estudo disponível");
  });

  it("preserva o retrato estável como política da cena enquanto não há motor facial validado", () => {
    expect(scene).toContain("A foto permanece estável até existir um motor facial guiado por áudio.");
  });
});
