import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("entrada global de feedback", () => {
  it("mantém o atalho discreto fora das rotas e sem mostrar conteúdo de clientes", () => {
    const app = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    const button = readFileSync(resolve(process.cwd(), "client/src/components/FeedbackButton.tsx"), "utf8");

    expect(app).toContain("<FeedbackButton />");
    expect(button).toContain('href="/suporte"');
    expect(button).toContain("Enviar opinião, sugestão ou relatar um problema");
    expect(button).not.toContain("customerSupportMessages");
  });
});
