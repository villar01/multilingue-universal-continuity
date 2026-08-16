import type { Request, Response } from "express";
import { sdk } from "../_core/sdk";
import { getDb } from "../db";
import { purgeExpiredOptionalParentalData } from "../parentalDataRetention";

export async function handleParentalOptionalDataRetention(req: Request, res: Response): Promise<void> {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      res.status(403).json({ error: "cron-only" });
      return;
    }

    const database = await getDb();
    if (!database) throw new Error("Database unavailable");
    const [rows] = await (database as any).$client.promise().execute(
      `SELECT id FROM parental_optional_data_retention_schedule
       WHERE heartbeat_task_uid = ? LIMIT 1`,
      [user.taskUid],
    );
    if (!Array.isArray(rows) || rows.length === 0) {
      res.json({ ok: true, skipped: "orphan" });
      return;
    }

    const purgedOptionalFields = await purgeExpiredOptionalParentalData();
    res.json({ ok: true, purgedOptionalFields });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }
}
