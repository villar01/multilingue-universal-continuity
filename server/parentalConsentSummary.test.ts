import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const panel = readFileSync("client/src/pages/ParentalControlPanel.tsx", "utf8");

describe("resumo prévio de autorização parental", () => {
  it("explica autorização, dados mínimos e os controles de revisão antes do aceite", () => {
    expect(panel).toContain('aria-labelledby="parental-consent-summary"');
    expect(panel).toContain("Antes de autorizar");
    expect(panel).toContain("limites de tempo, filtros, alertas e acompanhamento pelo responsável");
    expect(panel).toContain("Não são solicitados foto, documento ou e-mail.");
    expect(panel).toContain("revisar configurações, ajustar limites e revogar a autorização");
  });
});
