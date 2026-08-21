import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/components/ContentProtection.tsx"), "utf8");

describe("marca d’água de conteúdo protegido", () => {
  it("mantém um identificador interno de conta sem exibir nome ou e-mail", () => {
    expect(source).toContain("ACESSO PROTEGIDO");
    expect(source).toContain("user?.id");
    expect(source).not.toContain("user?.name");
    expect(source).not.toMatch(/user\?\.email/i);
  });
});
