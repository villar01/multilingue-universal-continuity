export const TRIAL_DURATION_DAYS = 14;
export const TRIAL_DURATION_MS = TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;

export type AccountContentAccess = {
  subscriptionType?: string | null;
  role?: "user" | "admin" | null;
};

/** Administradores e assinaturas ativas acessam a trilha completa; avaliações recebem apenas a fração autorizada. */
export function hasFullCurriculumAccess(account: AccountContentAccess): boolean {
  return account.role === "admin" || Boolean(account.subscriptionType && account.subscriptionType !== "free");
}

/** Trials existentes recebem uma única validade nova a partir do primeiro acesso após a atualização. */
export function getTrialExpiryDate(existingExpiry: Date | null | undefined, now = new Date()): Date {
  return existingExpiry ?? new Date(now.getTime() + TRIAL_DURATION_MS);
}

export function isTrialExpired(expiresAt: Date | null | undefined, now = new Date()): boolean {
  return Boolean(expiresAt && expiresAt.getTime() <= now.getTime());
}

/** Revogação encerra somente o acesso de avaliação dentro do aplicativo, não a sessão OAuth do provedor. */
export function isTrialRevoked(status: string | null | undefined): boolean {
  return status === "revoked";
}
