import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const pageSource = readFileSync(
  resolve(process.cwd(), "client/src/pages/IANativa.tsx"),
  "utf8",
);

describe("comunicação da IA Nativa", () => {
  it("informa a assistência integrada sem declarar o runtime local como ativo quando ele está indisponível", () => {
    expect(pageSource).toContain("Assistência de estudo disponível");
    expect(pageSource).toContain("Este ambiente está usando a assistência integrada da plataforma");
    expect(pageSource).toContain("processamento local permanece uma opção");
    expect(pageSource).not.toContain("Runtime local do servidor indisponível");
    expect(pageSource).not.toContain("Nenhum provedor local foi encontrado no servidor deste app");
  });

  it("mantém o processamento local como opção e não como requisito para estudar", () => {
    expect(pageSource).toContain("Você não precisa instalar nenhum modelo local para estudar");
    expect(pageSource).toContain("Conhecer a opção local");
    expect(pageSource).not.toContain("Baixar Ollama Agora");
  });
});
