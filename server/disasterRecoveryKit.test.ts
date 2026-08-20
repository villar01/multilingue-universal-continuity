import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const kit = readFileSync(resolve(process.cwd(), "docs/disaster-recovery-kit.md"), "utf8");

describe("disaster recovery kit", () => {
  it("requires separate recoverable layers and a local owner copy", () => {
    expect(kit).toContain("Código e configuração");
    expect(kit).toContain("Dados do aplicativo");
    expect(kit).toContain("Cópia local");
    expect(kit).toContain("notebook do proprietário");
  });

  it("forbids automatic or destructive recovery without confirmation", () => {
    expect(kit).toContain("não executa restauração automática");
    expect(kit).toContain("Não importar ou restaurar");
    expect(kit).toContain("Não depender de uma única cópia");
  });
});
