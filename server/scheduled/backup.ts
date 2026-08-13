import type { Request, Response } from "express";
import { sdk } from "../_core/sdk";
import { runScheduledBackup } from "../backupRestore";

export async function handleScheduledBackup(req: Request, res: Response): Promise<void> {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      res.status(403).json({ error: "cron-only" });
      return;
    }
    const bucket = String(Math.floor(Date.now() / (6 * 60 * 60 * 1000)));
    const backup = await runScheduledBackup(bucket);
    if (backup.status !== "completed") throw new Error("Backup snapshot did not complete");
    res.json({ ok: true, id: backup.id, skipped: backup.id !== `backup_scheduled_${bucket}` ? true : undefined });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }
}
