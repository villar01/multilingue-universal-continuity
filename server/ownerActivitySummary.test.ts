import { describe, expect, it } from "vitest";
import { buildOwnerActivitySeries } from "./ownerActivitySummary";

describe("série agregada privada do proprietário", () => {
  it("forma sete dias de contagens sem carregar textos ou identificadores", () => {
    const series = buildOwnerActivitySeries({
      usageRecords: [{ createdAt: new Date("2026-08-20T10:00:00Z") }, { createdAt: new Date("2026-08-20T11:00:00Z") }],
      incidentRecords: [{ createdAt: new Date("2026-08-21T12:00:00Z") }],
      feedbackRecords: [{ createdAt: new Date("2026-08-21T14:00:00Z") }],
    }, new Date("2026-08-22T10:00:00Z"));

    expect(series).toHaveLength(7);
    expect(series.find((day) => day.day === "2026-08-20")).toMatchObject({ assistedRequests: 2, securityIncidents: 0, customerReturns: 0 });
    expect(series.find((day) => day.day === "2026-08-21")).toMatchObject({ assistedRequests: 0, securityIncidents: 1, customerReturns: 1 });
    expect(JSON.stringify(series)).not.toMatch(/email|message|conversation|ipAddress|userAgent/i);
  });
});
