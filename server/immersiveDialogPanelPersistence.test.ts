import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../client/src/pages/ImmersiveScene.tsx", import.meta.url), "utf8");

describe("persistência do painel de diálogo imersivo", () => {
  it("reabre o painel quando uma fala de diálogo ainda está ativa", () => {
    expect(source).toContain("if (isSpeaking && activeDialogLineRef.current && !dlgOpen)");
    expect(source).toContain("setDlgOpen(true);");
  });

  it("mantém o painel renderizado durante a fala da linha ativa", () => {
    expect(source).toContain("{(dlgOpen || (isSpeaking && activeDialogLineRef.current)) && selectedScene.dialog[dlgStep] && (");
  });
});
