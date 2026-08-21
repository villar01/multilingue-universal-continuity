import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("client/src/pages/PreLaunch.tsx", "utf8");
const appSource = readFileSync("client/src/App.tsx", "utf8");

describe("claims verificáveis da página de pré-lançamento", () => {
  it("usa o catálogo canônico de idiomas e os códigos comerciais compartilhados", () => {
    expect(source).toContain('import { LANGUAGES_57, TOTAL_LANGUAGES } from "../lib/languages"');
    expect(source).toContain('import { INITIAL_COMMERCIAL_LANGUAGE_CODES } from "@shared/commercialLanguageBlocks"');
    expect(source).toContain("INITIAL_COMMERCIAL_LANGUAGE_CODES.map");
    expect(source).toContain("{TOTAL_LANGUAGES} idiomas");
    expect(source).toContain("{INITIAL_COMMERCIAL_LANGUAGE_CODES.length} idiomas comerciais iniciais");
    expect(source).not.toContain("54 Idiomas");
    expect(source).not.toContain("69 idiomas");
  });

  it("não declara um provedor de IA não confirmado nem inventa adesões de clientes", () => {
    expect(source).toContain("IA Adaptativa");
    expect(source).not.toContain("GPT-4");
    expect(source).not.toContain("47 pessoas já garantiram");
    expect(source).not.toContain("Social Proof");
  });

  it("mantém as duas rotas navegáveis do pré-lançamento", () => {
    expect(appSource).toContain('<Route path={"/prelaunch"} component={PreLaunch} />');
    expect(appSource).toContain('<Route path={"/pre-launch"} component={PreLaunch} />');
  });
});
