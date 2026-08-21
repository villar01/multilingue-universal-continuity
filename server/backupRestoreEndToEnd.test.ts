import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  objects: new Map<string, Buffer>(),
  snapshots: new Map<string, Record<string, unknown>>(),
  queries: [] as string[],
  database: null as any,
}));

vi.mock("./db", () => ({
  getDb: async () => state.database,
}));

vi.mock("./storage", () => ({
  storagePut: async (key: string, data: Buffer) => {
    state.objects.set(key, Buffer.from(data));
    return { key, url: `memory://${key}` };
  },
  storageGet: async (key: string) => ({ key, url: `memory://${key}` }),
}));

import { createBackup, restoreFromBackup } from "./backupRestore";

function makeDatabase() {
  return {
    $client: {
      promise: () => ({
        execute: async (query: string, values: unknown[] = []) => {
          state.queries.push(query);
          if (query === "SHOW TABLES") return [[{ Tables_in_test: "users" }, { Tables_in_test: "backup_snapshots" }], []];
          if (query.startsWith("SELECT * FROM `users`")) return [[{ id: 7, name: "Aluno de teste" }], []];
          if (query.startsWith("SELECT id, backup_type")) return [[], []];
          if (query.startsWith("SELECT * FROM backup_snapshots WHERE id")) {
            const snapshot = state.snapshots.get(String(values[0]));
            return [snapshot ? [snapshot] : [], []];
          }
          if (query.startsWith("INSERT INTO backup_snapshots")) {
            const [id, backupType, storageKey, checksum, tables, totalRecords, fileSize, scheduleBucket, createdAt, completedAt] = values;
            state.snapshots.set(String(id), {
              id,
              backup_type: backupType,
              storage_key: storageKey,
              checksum,
              tables_backed_up: tables,
              total_records: totalRecords,
              file_size_bytes: fileSize,
              status: "completed",
              schedule_bucket: scheduleBucket,
              created_at: createdAt,
              completed_at: completedAt,
            });
            return [{ affectedRows: 1 }, []];
          }
          return [[], []];
        },
      }),
    },
  };
}

describe("backup e restauração de ponta a ponta sem banco real", () => {
  beforeEach(() => {
    state.objects.clear();
    state.snapshots.clear();
    state.queries.length = 0;
    state.database = makeDatabase();
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      const payload = state.objects.get(url.replace("memory://", ""));
      return payload ? new Response(payload) : new Response(null, { status: 404 });
    }));
  });

  it("cria snapshot cifrado, bloqueia confirmação inválida e restaura apenas no banco simulado", async () => {
    const backup = await createBackup("users", { id: "backup_e2e_users" });

    expect(backup).toMatchObject({ id: "backup_e2e_users", type: "users", status: "completed", tables: ["users"] });
    expect(state.objects.get("backups/database/backup_e2e_users.mlb")?.subarray(0, 4).toString()).toBe("MLB1");

    const rejected = await restoreFromBackup(backup.id, "RESTORE outro_backup");
    expect(rejected.success).toBe(false);
    expect(state.queries.some((query) => query.startsWith("DELETE FROM"))).toBe(false);

    const restored = await restoreFromBackup(backup.id, `RESTORE ${backup.id}`);
    expect(restored.success).toBe(true);
    expect(restored.message).toContain("Ponto de retorno:");
    expect(state.queries).toContain("START TRANSACTION");
    expect(state.queries).toContain("COMMIT");
    expect(state.queries.some((query) => query.startsWith("DELETE FROM `users`"))).toBe(true);
    expect(state.queries.some((query) => query.startsWith("INSERT INTO `users`"))).toBe(true);
    expect(state.objects.size).toBeGreaterThanOrEqual(2);
  });
});
