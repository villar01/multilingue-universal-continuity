import { describe, expect, it } from "vitest";
import { createSecurityIncidentReporter } from "./securityIncidentReporter";

describe("security incident reporter", () => {
  it("notifica o proprietário e persiste somente contexto operacional minimizado", async () => {
    const alerts: Array<{ title: string; content: string }> = [];
    const records: Array<Record<string, unknown>> = [];
    const reporter = createSecurityIncidentReporter({
      sendOwnerAlert: async (payload) => {
        alerts.push(payload);
        return true;
      },
      persistIncident: async (record) => {
        records.push(record);
      },
    });

    await reporter.report({
      kind: "sql_injection",
      endpoint: "/api/trpc/learning.save?email=private@example.com",
      now: 10 * 60 * 1000,
    });

    expect(alerts).toHaveLength(1);
    expect(alerts[0].title).toBe("Segurança: contenção automática aplicada");
    expect(alerts[0].content).toContain("sem incluir identificadores de visitantes");
    expect(JSON.stringify(alerts)).not.toMatch(/private@example\.com|ipAddress|userAgent/i);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      eventType: "sql_injection",
      severity: "high",
      endpoint: "/api",
      actionTaken: "admin_notified",
      adminNotified: true,
      evidence: {
        blocked: true,
        alertAttempted: true,
        alertDelivered: true,
        source: "security-middleware",
      },
    });
  });

  it("evita tempestade de notificações sem deixar de registrar cada contenção", async () => {
    let notificationCount = 0;
    const records: Array<Record<string, unknown>> = [];
    const reporter = createSecurityIncidentReporter({
      sendOwnerAlert: async () => {
        notificationCount += 1;
        return true;
      },
      persistIncident: async (record) => {
        records.push(record);
      },
    });

    await reporter.report({ kind: "suspicious_user_agent", endpoint: "/api/trpc", now: 1_000_000 });
    await reporter.report({ kind: "suspicious_user_agent", endpoint: "/api/trpc", now: 1_000_100 });

    expect(notificationCount).toBe(1);
    expect(records).toHaveLength(2);
    expect(records[0]).toMatchObject({ adminNotified: true, actionTaken: "admin_notified" });
    expect(records[1]).toMatchObject({ adminNotified: false, actionTaken: "blocked" });
  });
});
