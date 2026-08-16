import { getDb } from "./db";

export const PARENTAL_OPTIONAL_DATA_RETENTION_DAYS = 30;
const RETENTION_WINDOW_MS = PARENTAL_OPTIONAL_DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export function getParentalOptionalDataRetentionCutoff(now = new Date()): Date {
  return new Date(now.getTime() - RETENTION_WINDOW_MS);
}

export function buildOptionalParentalDataPurgeStatement(cutoff: Date) {
  return {
    sql: `
      UPDATE parental_consents AS consent
      LEFT JOIN users AS learner ON learner.id = consent.user_id
      SET consent.guardian_document = NULL,
          consent.guardian_email = NULL
      WHERE (consent.guardian_document IS NOT NULL OR consent.guardian_email IS NOT NULL)
        AND (
          (consent.revoked_at IS NOT NULL AND consent.revoked_at <= ?)
          OR (
            consent.revoked_at IS NULL
            AND learner.lastSignedIn IS NOT NULL
            AND learner.lastSignedIn <= ?
          )
        )
    `.trim(),
    params: [cutoff, cutoff],
  };
}

/**
 * Elimina somente documento e e-mail opcionais após 30 dias de revogação ou
 * inatividade. Nome, vínculo, versão, confirmações, datas e estado de
 * consentimento permanecem inalterados, assim como qualquer portão de acesso.
 */
export async function purgeExpiredOptionalParentalData(now = new Date()): Promise<number> {
  const database = await getDb();
  if (!database) throw new Error("Database unavailable");

  const statement = buildOptionalParentalDataPurgeStatement(
    getParentalOptionalDataRetentionCutoff(now),
  );
  const [result] = await (database as any).$client.promise().execute(
    statement.sql,
    statement.params,
  );

  return Number(result?.affectedRows ?? 0);
}
