import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("contagem de idiomas nos certificados", () => {
  it("usa as constantes canônicas sem alterar a emissão do certificado", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "client/src/pages/Certificates.tsx"), "utf8");
    expect(source).toContain("ACTIVE_LANGUAGE_COUNT");
    expect(source).toContain("TOTAL_LANGUAGES");
    expect(source).not.toContain("domínio em 69 idiomas");
    expect(source).toContain("issueCert.mutateAsync");
  });
});
