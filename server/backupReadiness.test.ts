import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/backupRestore.ts"), "utf8");

describe("prontidão verificável de backup", () => {
  it("valida a cifra e o checksum do snapshot antes de enviá-lo ao armazenamento", () => {
    expect(source).toContain("const verifiedPlain = decryptSnapshot(encrypted)");
    expect(source).toContain("const verifiedChecksum = createHash(\"sha256\").update(encrypted).digest(\"hex\")");
    expect(source).toContain("Snapshot integrity verification failed before storage");
    expect(source.indexOf("Snapshot integrity verification failed before storage")).toBeLessThan(source.indexOf("await storagePut"));
  });

  it("expõe somente uma avaliação de metadados e não baixa, restaura ou modifica dados", () => {
    const readinessSource = source.slice(
      source.indexOf("export async function getBackupReadiness"),
      source.indexOf("export async function restoreFromBackup")
    );
    expect(readinessSource).toContain("ORDER BY created_at DESC LIMIT 1");
    expect(readinessSource).toContain('status: "ready"');
    expect(readinessSource).not.toContain("storageGet(");
    expect(readinessSource).not.toContain("restoreFromBackup(");
    expect(readinessSource).not.toContain("DELETE FROM");
    expect(readinessSource).not.toContain("INSERT INTO");
  });
});
