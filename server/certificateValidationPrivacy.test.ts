import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
const schemaSource = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");
const pageSource = readFileSync(resolve(process.cwd(), "client/src/pages/CertificateValidation.tsx"), "utf8");
const certificatesBlock = routerSource.slice(routerSource.indexOf("// ── Certificados"), routerSource.indexOf("// ── Vision"));

describe("validação pública de certificados", () => {
  it("usa um código opaco persistido e não seleciona dados pessoais na consulta pública", () => {
    const validateBlock = certificatesBlock.slice(certificatesBlock.indexOf("validate: publicProcedure"));
    expect(schemaSource).toContain('validationCode: varchar("validation_code", { length: 48 }).unique()');
    expect(schemaSource).toContain('revokedAt: timestamp("revoked_at")');
    expect(routerSource).toContain("function createCertificateValidationCode()");
    expect(validateBlock).toContain("z.string().trim().regex(/^MLU-[A-F0-9]{32}$/)");
    expect(validateBlock).toContain("languageName: certificates.languageName");
    expect(validateBlock).toContain("targetLanguage: certificates.targetLanguage");
    expect(validateBlock).toContain("issuedAt: certificates.issuedAt");
    expect(validateBlock).not.toContain("userName:");
    expect(validateBlock).not.toContain("userId:");
    expect(pageSource).toContain("Nenhum progresso, e-mail ou dado de aluno é exibido.");
  });

  it("exige elegibilidade no servidor antes de emitir e permite revogação sem apagar histórico", () => {
    const issueBlock = certificatesBlock.slice(certificatesBlock.indexOf("issue: protectedProcedure"), certificatesBlock.indexOf("    list: protectedProcedure"));
    expect(issueBlock).toContain("if (level < 5)");
    expect(issueBlock).toContain('code: "FORBIDDEN"');
    expect(routerSource).toContain('status: "revoked" as const');
  });
});
