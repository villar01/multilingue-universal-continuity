import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

describe("comunicação de cadastro por faixa etária", () => {
  it("permite cadastro de adultos e exige responsável somente para menores", () => {
    expect(homeSource).toContain("Adultos podem criar a própria conta.");
    expect(homeSource).toContain("Para menores de 18 anos, o cadastro e o acesso às lições exigem autorização");
    expect(homeSource).not.toContain("só pode ser realizado por pais e/ou responsáveis maiores de 18 anos");
  });

  it("não exige foto de identificação nem comunica rastreamento jurídico intimidatório", () => {
    expect(homeSource).not.toContain("foto de identificação");
    expect(homeSource).not.toContain("Dados falsos são rastreados");
    expect(homeSource).toContain("O responsável pode revisar ou revogar a autorização a qualquer momento");
  });
});
