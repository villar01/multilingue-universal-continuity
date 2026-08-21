import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/DashboardReal.tsx"), "utf8");

describe("comunicação de assistência no painel", () => {
  it("não expõe um aviso técnico negativo nem declara provedor local ativo sem confirmação", () => {
    expect(source).toContain("Recursos pedagógicos disponíveis");
    expect(source).toContain("Recursos locais podem ser incorporados posteriormente");
    expect(source).not.toContain("Provedor local do servidor indisponível");
    expect(source).not.toContain("Saber como instalar");
  });
});
