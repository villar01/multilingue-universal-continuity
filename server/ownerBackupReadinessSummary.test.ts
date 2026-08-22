import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const routerSource = readFileSync(resolve(process.cwd(), "server/_core/systemRouter.ts"), "utf8");
const panelSource = readFileSync(resolve(process.cwd(), "client/src/pages/AdminControlCenter.tsx"), "utf8");

describe("resumo privado de prontidão de backup", () => {
  it("retorna somente estado agregado e recomendação manual ao proprietário", () => {
    expect(routerSource).toContain('import { getBackupReadiness } from "../backupRestore"');
    expect(routerSource).toContain("const backupReadiness = await getBackupReadiness()");
    expect(routerSource).toContain("exportReady: backupReadiness.status === \"ready\"");
    expect(routerSource).not.toContain("storage_key: backupReadiness");
    expect(routerSource).not.toContain("checksum: backupReadiness");
    expect(routerSource).not.toContain("latestBackupId: backupReadiness");
  });

  it("apresenta o resultado somente no Centro de Controle, sem ação automática", () => {
    expect(panelSource).toContain("Prontidão de backup");
    expect(panelSource).toContain("Snapshot pronto para exportação");
    expect(panelSource).toContain("Snapshot requer revisão");
    expect(panelSource).not.toContain("restoreFromBackup");
  });
});
