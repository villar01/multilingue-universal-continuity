import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../client/src/components/CybersecurityAlert.tsx", import.meta.url), "utf8");

describe("orientações de cibersegurança", () => {
  it("distingue evento no app de diagnóstico de comprometimento do dispositivo", () => {
    expect(source).toContain("Isso não confirma, por si só, comprometimento do dispositivo");
    expect(source).toContain("Ele não diagnostica sozinho o dispositivo");
    expect(source).not.toContain("Invasão em andamento detectada");
    expect(source).not.toContain("A IA de segurança continua protegendo seus dados");
  });

  it("orienta isolamento proporcional em vez de prometer neutralizar ameaças ao desligar", () => {
    expect(source).toContain("Se houver indícios reais, desconecte Wi-Fi/cabo de rede");
    expect(source).toContain("execute a verificação do antivírus instalado");
    expect(source).not.toContain("desestabilizar ameaças externas");
    expect(source).not.toContain("DESLIGUE O NOTEBOOK AGORA");
  });
});
