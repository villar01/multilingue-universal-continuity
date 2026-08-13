import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const clientSource = readFileSync(new URL("../client/src/pages/FreeTalk.tsx", import.meta.url), "utf8");
const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");

describe("conversa livre com progressão CEFR", () => {
  it("oferece os seis níveis CEFR sem misturar B1 e B2 no seletor", () => {
    for (const label of ["A1 — primeiros contatos", "A2 — rotina e situações simples", "B1 — conversa independente", "B2 — interação e argumentos", "C1 — fluência avançada", "C2 — domínio e nuances"]) {
      expect(clientSource).toContain(label);
    }
    expect(clientSource).not.toContain("B1/B2 - Intermediário");
    expect(clientSource).not.toContain("A2 - Básico");
    expect(clientSource).not.toContain("C1 - Avançado");
    expect(clientSource).toContain("resolvePracticeCEFRLevel");
  });

  it("aceita somente A1–C2 na rota e impõe limites pedagógicos por estágio", () => {
    expect(routerSource).toContain('level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).default("A1")');
    expect(routerSource).toContain("Maximum 6 words per sentence");
    expect(routerSource).toContain("Maximum 25 words per sentence");
    expect(routerSource).toContain("Maximum 50 words per sentence");
    expect(routerSource).toContain("These limits override later open-ended language guidance");
  });
});
