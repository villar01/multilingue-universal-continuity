import { describe, expect, it } from "vitest";
import { deriveMaintenanceAlerts } from "./maintenanceAlertPolicy";

describe("maintenance alert policy", () => {
  const now = new Date("2026-08-20T12:00:00Z");

  it("raises critical alerts for unverified backups and critical support", () => {
    const alerts = deriveMaintenanceAlerts({
      unresolvedCriticalSupport: 1,
      performanceStatus: "healthy",
      securityStatus: "healthy",
      qualityStatus: "healthy",
    }, now);

    expect(alerts).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "backup", level: "critical" }),
      expect.objectContaining({ id: "support", level: "critical" }),
    ]));
  });

  it("stays clear when all controls have a current healthy status", () => {
    const alerts = deriveMaintenanceAlerts({
      backupVerifiedAt: new Date("2026-08-10T12:00:00Z"),
      recoveryKitVerifiedAt: new Date("2026-08-10T12:00:00Z"),
      unresolvedCriticalSupport: 0,
      performanceStatus: "healthy",
      securityStatus: "healthy",
      qualityStatus: "healthy",
    }, now);

    expect(alerts).toEqual([]);
  });

  it("sinaliza apenas ao proprietário quando a última verificação de qualidade reprovou", () => {
    const alerts = deriveMaintenanceAlerts({
      backupVerifiedAt: new Date("2026-08-10T12:00:00Z"),
      recoveryKitVerifiedAt: new Date("2026-08-10T12:00:00Z"),
      unresolvedCriticalSupport: 0,
      performanceStatus: "healthy",
      securityStatus: "healthy",
      qualityStatus: "degraded",
    }, now);

    expect(alerts).toEqual([expect.objectContaining({ id: "quality", level: "critical" })]);
  });
});
