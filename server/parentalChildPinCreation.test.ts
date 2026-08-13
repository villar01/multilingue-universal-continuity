import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const routerSource = readFileSync(new URL("./parental-control-router.ts", import.meta.url), "utf8");
const panelSource = readFileSync(new URL("../client/src/pages/ParentalControlPanel.tsx", import.meta.url), "utf8");

describe("PIN inicial de perfil infantil", () => {
  it("exige um PIN numérico definido pelo responsável ao criar um perfil", () => {
    const createChildSegment = routerSource.slice(routerSource.indexOf("createChild:"), routerSource.indexOf("updateChild:"));
    expect(createChildSegment).toContain("pin: z.string().regex(/^\\d{4}$/");
    expect(createChildSegment).toContain("pinCode: hashParentPin(input.pin)");
    expect(createChildSegment).not.toContain("pinCode: '1234'");
  });

  it("exige confirmação do PIN no painel antes da criação", () => {
    expect(panelSource).toContain("const [newChildPin, setNewChildPin]");
    expect(panelSource).toContain("const [confirmChildPin, setConfirmChildPin]");
    expect(panelSource).toContain("if (newChildPin !== confirmChildPin)");
    expect(panelSource).toContain("pin: newChildPin");
  });
});
