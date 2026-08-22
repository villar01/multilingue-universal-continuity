export type MaintenanceAlertLevel = "critical" | "warning" | "healthy";

export type MaintenanceSnapshot = {
  backupVerifiedAt?: Date;
  recoveryKitVerifiedAt?: Date;
  unresolvedCriticalSupport: number;
  performanceStatus: "healthy" | "degraded" | "unknown";
  securityStatus: "healthy" | "degraded" | "unknown";
  qualityStatus: "healthy" | "degraded" | "unknown";
};

export type MaintenanceAlert = {
  id: "backup" | "recovery-kit" | "support" | "performance" | "security" | "quality";
  level: MaintenanceAlertLevel;
  message: string;
};

const STALE_AFTER_DAYS = 30;

function isStale(date: Date | undefined, now: Date) {
  if (!date) return true;
  return now.getTime() - date.getTime() > STALE_AFTER_DAYS * 86_400_000;
}

export function deriveMaintenanceAlerts(snapshot: MaintenanceSnapshot, now = new Date()): MaintenanceAlert[] {
  const alerts: MaintenanceAlert[] = [];

  if (isStale(snapshot.backupVerifiedAt, now)) {
    alerts.push({ id: "backup", level: "critical", message: "Backup precisa de verificação." });
  }
  if (isStale(snapshot.recoveryKitVerifiedAt, now)) {
    alerts.push({ id: "recovery-kit", level: "warning", message: "Kit de recuperação precisa de revisão." });
  }
  if (snapshot.unresolvedCriticalSupport > 0) {
    alerts.push({ id: "support", level: "critical", message: "Há solicitações críticas de suporte sem revisão." });
  }
  if (snapshot.performanceStatus !== "healthy") {
    alerts.push({ id: "performance", level: snapshot.performanceStatus === "degraded" ? "critical" : "warning", message: "Desempenho precisa de verificação." });
  }
  if (snapshot.securityStatus !== "healthy") {
    alerts.push({ id: "security", level: snapshot.securityStatus === "degraded" ? "critical" : "warning", message: "Segurança precisa de verificação." });
  }
  if (snapshot.qualityStatus !== "healthy") {
    alerts.push({ id: "quality", level: snapshot.qualityStatus === "degraded" ? "critical" : "warning", message: "Cenas, áudio e professores precisam de revisão." });
  }

  return alerts;
}
