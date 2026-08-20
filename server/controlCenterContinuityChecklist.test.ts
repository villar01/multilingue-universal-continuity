import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/AdminControlCenter.tsx"), "utf8");

describe("control center continuity checklist", () => {
  it("shows the recoverable continuity checks without automatic restoration", () => {
    expect(source).toContain("Lista de continuidade recuperável");
    expect(source).toContain("Cópia independente");
    expect(source).toContain("Esta lista não restaura nem altera dados.");
  });
});
