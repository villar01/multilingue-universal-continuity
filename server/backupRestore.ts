import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { getDb } from "./db";
import { storageGet, storagePut } from "./storage";
import { ENV } from "./_core/env";

export type BackupType = "full" | "config" | "lessons" | "users";

export interface BackupInfo {
  id: string;
  type: BackupType;
  size: number;
  tables: string[];
  createdAt: number;
  status: "completed" | "failed" | "restoring";
}

export type BackupReadiness = {
  status: "ready" | "attention" | "awaiting_snapshot";
  latestBackupId?: string;
  latestCreatedAt?: number;
  ageMs?: number;
  reason: string;
};

type SnapshotPayload = {
  version: 1;
  createdAt: number;
  type: BackupType;
  tables: Array<{ name: string; rows: Record<string, unknown>[] }>;
};

const TABLE_NAME = /^[A-Za-z0-9_]+$/;
const EXCLUDED_TABLES = new Set(["backup_history", "backup_snapshots"]);
const TYPE_TABLES: Record<Exclude<BackupType, "full">, string[]> = {
  users: ["users", "child_profiles", "parental_settings", "user_safety_profile"],
  lessons: ["lessons", "lesson_progress", "daily_words", "lesson_exercise_attempts"],
  config: ["parental_settings", "blocked_words", "content_moderation_rules", "blocked_content"],
};

function quoteIdentifier(value: string): string {
  if (!TABLE_NAME.test(value)) throw new Error("Invalid backup table identifier");
  return `\`${value}\``;
}

async function executeQuery(database: any, query: string, values: unknown[] = []): Promise<any> {
  return (database as any).$client.promise().execute(query, values);
}

function getEncryptionKey(): Buffer {
  if (!ENV.cookieSecret) throw new Error("Backup encryption key is unavailable");
  return createHash("sha256").update(`multilingue-backup-v1:${ENV.cookieSecret}`).digest();
}

function encryptSnapshot(plain: Buffer): Buffer {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain), cipher.final()]);
  return Buffer.concat([Buffer.from("MLB1"), iv, cipher.getAuthTag(), encrypted]);
}

function decryptSnapshot(payload: Buffer): Buffer {
  if (payload.subarray(0, 4).toString() !== "MLB1") throw new Error("Unsupported backup format");
  const iv = payload.subarray(4, 16);
  const authTag = payload.subarray(16, 32);
  const encrypted = payload.subarray(32);
  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

async function getExistingTables(database: any): Promise<string[]> {
  const result = await executeQuery(database, "SHOW TABLES");
  const rows = (result[0] ?? result) as Array<Record<string, unknown>>;
  return rows
    .map((row) => String(Object.values(row)[0] ?? ""))
    .filter((table) => TABLE_NAME.test(table) && !EXCLUDED_TABLES.has(table));
}

function selectBackupTables(type: BackupType, allTables: string[]): string[] {
  if (type === "full") return allTables;
  const allowed = new Set(TYPE_TABLES[type]);
  return allTables.filter((table) => allowed.has(table));
}

async function ensureSnapshotTable(database: any): Promise<void> {
  await executeQuery(database, `CREATE TABLE IF NOT EXISTS backup_snapshots (
    id VARCHAR(100) PRIMARY KEY,
    backup_type VARCHAR(20) NOT NULL,
    storage_key VARCHAR(512) NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    encryption_version VARCHAR(20) NOT NULL,
    tables_backed_up JSON NOT NULL,
    total_records INT NOT NULL DEFAULT 0,
    file_size_bytes INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'completed',
    schedule_bucket VARCHAR(32) UNIQUE,
    created_at BIGINT NOT NULL,
    completed_at BIGINT NULL
  )`);
}

export async function createBackup(
  type: BackupType = "full",
  options?: { id?: string; scheduleBucket?: string }
): Promise<BackupInfo> {
  const now = Date.now();
  const backupId = options?.id ?? `backup_${now}_${randomBytes(4).toString("hex")}`;
  let tables: string[] = [];
  try {
    const database = await getDb();
    if (!database) throw new Error("Database unavailable");
    await ensureSnapshotTable(database);

    if (options?.scheduleBucket) {
      const existing = await executeQuery(database,
        "SELECT id, backup_type, tables_backed_up, file_size_bytes, created_at, status FROM backup_snapshots WHERE schedule_bucket = ? LIMIT 1",
        [options.scheduleBucket]
      );
      const row = ((existing[0] ?? existing) as unknown as Array<Record<string, unknown>>)[0];
      if (row?.id && row.status === "completed") {
        return {
          id: String(row.id),
          type: String(row.backup_type) as BackupType,
          size: Number(row.file_size_bytes ?? 0),
          tables: Array.isArray(row.tables_backed_up) ? row.tables_backed_up as string[] : JSON.parse(String(row.tables_backed_up ?? "[]")),
          createdAt: Number(row.created_at ?? now),
          status: "completed",
        };
      }
    }

    tables = selectBackupTables(type, await getExistingTables(database));
    const snapshotTables: SnapshotPayload["tables"] = [];
    for (const table of tables) {
      const result = await executeQuery(database, `SELECT * FROM ${quoteIdentifier(table)}`);
      const rows = (result[0] ?? result) as unknown as Record<string, unknown>[];
      snapshotTables.push({ name: table, rows });
    }

    const snapshot: SnapshotPayload = { version: 1, createdAt: now, type, tables: snapshotTables };
    const plain = Buffer.from(JSON.stringify(snapshot), "utf8");
    const encrypted = encryptSnapshot(plain);
    const checksum = createHash("sha256").update(encrypted).digest("hex");

    // Confirma o artefato antes do envio: nunca dispara restauração nem altera dados do aluno.
    const verifiedPlain = decryptSnapshot(encrypted);
    const verifiedChecksum = createHash("sha256").update(encrypted).digest("hex");
    if (!verifiedPlain.equals(plain) || verifiedChecksum !== checksum) {
      throw new Error("Snapshot integrity verification failed before storage");
    }

    const storageKey = `backups/database/${backupId}.mlb`;
    await storagePut(storageKey, encrypted, "application/octet-stream");
    const totalRecords = snapshotTables.reduce((sum, table) => sum + table.rows.length, 0);

    await executeQuery(database,
      `INSERT INTO backup_snapshots
        (id, backup_type, storage_key, checksum, encryption_version, tables_backed_up, total_records, file_size_bytes, status, schedule_bucket, created_at, completed_at)
       VALUES (?, ?, ?, ?, 'aes-256-gcm-v1', ?, ?, ?, 'completed', ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), completed_at = VALUES(completed_at)`,
      [backupId, type, storageKey, checksum, JSON.stringify(tables), totalRecords, encrypted.length, options?.scheduleBucket ?? null, now, Date.now()]
    );

    return { id: backupId, type, size: encrypted.length, tables, createdAt: now, status: "completed" };
  } catch (error) {
    console.error("[BACKUP] Failed:", error);
    return { id: backupId, type, size: 0, tables, createdAt: now, status: "failed" };
  }
}

export async function listBackups(): Promise<BackupInfo[]> {
  const database = await getDb();
  if (!database) return [];
  await ensureSnapshotTable(database);
  const result = await executeQuery(database, "SELECT * FROM backup_snapshots ORDER BY created_at DESC LIMIT 50");
  const rows = (result[0] ?? result) as unknown as Array<Record<string, unknown>>;
  return rows.map((row) => ({
    id: String(row.id),
    type: String(row.backup_type) as BackupType,
    size: Number(row.file_size_bytes ?? 0),
    tables: Array.isArray(row.tables_backed_up) ? row.tables_backed_up as string[] : JSON.parse(String(row.tables_backed_up ?? "[]")),
    createdAt: Number(row.created_at),
    status: String(row.status) as BackupInfo["status"],
  }));
}

/** Avalia somente metadados: não baixa, restaura ou modifica dados. */
export async function getBackupReadiness(now = Date.now()): Promise<BackupReadiness> {
  const database = await getDb();
  if (!database) return { status: "attention", reason: "Banco indisponível para verificar o histórico de snapshots" };
  await ensureSnapshotTable(database);
  const result = await executeQuery(database,
    "SELECT id, status, created_at, completed_at, file_size_bytes, checksum, tables_backed_up FROM backup_snapshots ORDER BY created_at DESC LIMIT 1"
  );
  const row = ((result[0] ?? result) as unknown as Array<Record<string, unknown>>)[0];
  if (!row) return { status: "awaiting_snapshot", reason: "Nenhum snapshot concluído foi registrado ainda" };

  const latestCreatedAt = Number(row.created_at ?? 0);
  const ageMs = Math.max(0, now - latestCreatedAt);
  const tables = Array.isArray(row.tables_backed_up)
    ? row.tables_backed_up
    : JSON.parse(String(row.tables_backed_up ?? "[]"));
  const ready = row.status === "completed"
    && Number(row.file_size_bytes ?? 0) > 32
    && /^[a-f0-9]{64}$/i.test(String(row.checksum ?? ""))
    && Array.isArray(tables)
    && tables.length > 0;

  if (!ready) {
    return {
      status: "attention",
      latestBackupId: String(row.id),
      latestCreatedAt,
      ageMs,
      reason: "O último snapshot não possui metadados completos para exportação segura",
    };
  }

  return {
    status: "ready",
    latestBackupId: String(row.id),
    latestCreatedAt,
    ageMs,
    reason: "Snapshot cifrado, com checksum e tabelas registradas, pronto para exportação manual",
  };
}

export async function restoreFromBackup(
  backupId: string,
  confirmation: string
): Promise<{ success: boolean; message: string }> {
  if (confirmation !== `RESTORE ${backupId}`) {
    return { success: false, message: "Confirmação explícita de restauração obrigatória" };
  }
  const database = await getDb();
  if (!database) return { success: false, message: "Banco indisponível" };
  await ensureSnapshotTable(database);
  const result = await executeQuery(database, "SELECT * FROM backup_snapshots WHERE id = ? LIMIT 1", [backupId]);
  const backup = ((result[0] ?? result) as unknown as Array<Record<string, unknown>>)[0];
  if (!backup) return { success: false, message: "Backup não encontrado" };

  try {
    await executeQuery(database, "UPDATE backup_snapshots SET status = 'restoring' WHERE id = ?", [backupId]);
    const { url } = await storageGet(String(backup.storage_key));
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Snapshot download failed (${response.status})`);
    const encrypted = Buffer.from(await response.arrayBuffer());
    const actualChecksum = createHash("sha256").update(encrypted).digest("hex");
    if (actualChecksum !== backup.checksum) throw new Error("Snapshot checksum mismatch");
    const snapshot = JSON.parse(decryptSnapshot(encrypted).toString("utf8")) as SnapshotPayload;
    if (snapshot.version !== 1) throw new Error("Unsupported snapshot version");

    // Sempre cria um ponto de retorno antes de uma operação destrutiva.
    const restorePoint = await createBackup("full");
    if (restorePoint.status !== "completed") throw new Error("Restore point creation failed");

    await executeQuery(database, "START TRANSACTION");
    try {
      await executeQuery(database, "SET FOREIGN_KEY_CHECKS = 0");
      for (const table of [...snapshot.tables].reverse()) {
        await executeQuery(database, `DELETE FROM ${quoteIdentifier(table.name)}`);
      }
      for (const table of snapshot.tables) {
        for (const row of table.rows) {
          const columns = Object.keys(row).filter((column) => TABLE_NAME.test(column));
          if (!columns.length) continue;
          const values = columns.map((column) => row[column]);
          const placeholders = columns.map(() => "?").join(", ");
          await executeQuery(database,
            `INSERT INTO ${quoteIdentifier(table.name)} (${columns.map(quoteIdentifier).join(", ")}) VALUES (${placeholders})`,
            values
          );
        }
      }
      await executeQuery(database, "SET FOREIGN_KEY_CHECKS = 1");
      await executeQuery(database, "COMMIT");
    } catch (error) {
      await executeQuery(database, "ROLLBACK");
      throw error;
    } finally {
      await executeQuery(database, "SET FOREIGN_KEY_CHECKS = 1").catch(() => undefined);
    }

    await executeQuery(database, "UPDATE backup_snapshots SET status = 'completed', completed_at = ? WHERE id = ?", [Date.now(), backupId]);
    return { success: true, message: `Restauração concluída. Ponto de retorno: ${restorePoint.id}` };
  } catch (error) {
    await executeQuery(database, "UPDATE backup_snapshots SET status = 'failed' WHERE id = ?", [backupId]).catch(() => undefined);
    console.error("[RESTORE] Failed:", error);
    return { success: false, message: "Falha na restauração; nenhuma confirmação de recuperação foi retornada" };
  }
}

export async function runScheduledBackup(scheduleBucket: string): Promise<BackupInfo> {
  return createBackup("full", { id: `backup_scheduled_${scheduleBucket}`, scheduleBucket });
}

export const __backupCrypto = {
  encryptSnapshot,
  decryptSnapshot,
};
