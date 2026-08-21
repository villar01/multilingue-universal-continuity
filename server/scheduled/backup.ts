import type { Request, Response } from "express";
import { sdk } from "../_core/sdk";
import { runScheduledBackup } from "../backupRestore";
import { getDb } from "../db";
import { notifyOwner } from "../_core/notification";

export async function handleScheduledBackup(req: Request, res: Response): Promise<void> {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      res.status(403).json({ error: "cron-only" });
      return;
    }
    const database = await getDb();
    if (!database) throw new Error("Database unavailable");
    const [rows] = await (database as any).$client.promise().execute(
      "SELECT heartbeat_task_uid FROM backup_schedule_config WHERE heartbeat_task_uid = ? LIMIT 1",
      [user.taskUid]
    );
    if (!Array.isArray(rows) || rows.length === 0) {
      res.json({ ok: true, skipped: "orphan" });
      return;
    }
    const bucket = String(Math.floor(Date.now() / (6 * 60 * 60 * 1000)));
    const backup = await runScheduledBackup(bucket);
    if (backup.status !== "completed") throw new Error("Backup snapshot did not complete");
    res.json({ ok: true, id: backup.id, skipped: backup.id !== `backup_scheduled_${bucket}` ? true : undefined });
  } catch (error) {
    await notifyOwner({
      title: "Snapshot automático precisa de verificação",
      content: "Um snapshot automático não foi concluído. O aplicativo permanece em funcionamento; verifique o histórico de backup antes de qualquer manutenção.",
    }).catch(() => false);
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }
}
