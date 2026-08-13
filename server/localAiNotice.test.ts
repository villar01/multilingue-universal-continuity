import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const noticeSource = readFileSync(
  resolve(process.cwd(), "client/src/components/LocalAINotification.tsx"),
  "utf8",
);

describe("aviso de IA local", () => {
  it("orienta uso local de texto sem prometer que Qwen produz voz neural ou animação", () => {
    expect(noticeSource).toContain("Qwen 2.5");
    expect(noticeSource).toContain("geração de texto, conversas e prática no dispositivo");
    expect(noticeSource).toContain("voz neural e a animação labial continuam sendo produzidas pelos mecanismos próprios");
    expect(noticeSource).not.toContain("usa o Qwen 2.5 para voz natural e animação");
    expect(noticeSource).toContain("qualidade de voz neural e animação não depende do Qwen");
  });

  it("mantém o caminho oficial de instalação e não indica execução administrativa desnecessária do modelo", () => {
    expect(noticeSource).toContain("https://ollama.com/download");
    expect(noticeSource).toContain("Não é necessário executar como administrador para baixar o modelo");
    expect(noticeSource).not.toContain("irm https://ollama.com/install.ps1 | iex");
  });
});
