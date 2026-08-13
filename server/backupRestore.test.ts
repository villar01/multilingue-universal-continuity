import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { __backupCrypto } from "./backupRestore";

const projectRoot = path.resolve(__dirname, "..");

describe("backup durável", () => {
  it("cifra snapshots antes de enviá-los ao armazenamento e recupera o conteúdo com a chave do servidor", () => {
    const plain = Buffer.from(JSON.stringify({ version: 1, tables: [{ name: "users", rows: [{ id: 1 }] }] }));
    const encrypted = __backupCrypto.encryptSnapshot(plain);

    expect(encrypted.subarray(0, 4).toString()).toBe("MLB1");
    expect(encrypted.includes(Buffer.from("users"))).toBe(false);
    expect(__backupCrypto.decryptSnapshot(encrypted).toString()).toBe(plain.toString());
  });

  it("não usa setInterval para backup e exige autenticação cron no callback", () => {
    const backupSource = fs.readFileSync(path.join(projectRoot, "server", "backupRestore.ts"), "utf8");
    const callbackSource = fs.readFileSync(path.join(projectRoot, "server", "scheduled", "backup.ts"), "utf8");

    expect(backupSource).not.toContain("setInterval");
    expect(callbackSource).toContain("user.isCron");
    expect(callbackSource).toContain("user.taskUid");
    expect(callbackSource).toContain("runScheduledBackup");
  });

  it("exige uma confirmação vinculada ao backup antes da restauração", () => {
    const backupSource = fs.readFileSync(path.join(projectRoot, "server", "backupRestore.ts"), "utf8");
    expect(backupSource).toContain("RESTORE ${backupId}");
    expect(backupSource).toContain("createBackup(\"full\")");
    expect(backupSource).toContain("START TRANSACTION");
  });
});
