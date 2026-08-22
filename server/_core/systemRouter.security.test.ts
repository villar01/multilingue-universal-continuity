import { describe, expect, it } from "vitest";
import { systemRouter } from "./systemRouter";
import type { TrpcContext } from "./context";

function createContext(role: "user" | "admin"): TrpcContext {
  const now = new Date();
  return {
    user: {
      id: role === "admin" ? 1 : 2,
      openId: `${role}-audit-user`,
      name: role,
      email: null,
      loginMethod: "manus",
      role,
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("system operational data access", () => {
  it("rejects AI metrics for a non-administrator", async () => {
    const caller = systemRouter.createCaller(createContext("user"));
    await expect(caller.getAiMetrics()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects the abuse-containment summary for a non-administrator", async () => {
    const caller = systemRouter.createCaller(createContext("user"));
    await expect(caller.getAbuseProtectionSummary()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns only aggregate abuse counters to an administrator", async () => {
    const caller = systemRouter.createCaller(createContext("admin"));
    await expect(caller.getAbuseProtectionSummary()).resolves.toEqual({
      activeRecords: expect.any(Number),
      activeBlocks: expect.any(Number),
      bySignal: expect.objectContaining({
        "rate-limit": expect.any(Number),
        scanner: expect.any(Number),
        "malicious-input": expect.any(Number),
        "repeated-access-denied": expect.any(Number),
      }),
    });
  });

  it("rejects owner support summaries for a non-administrator", async () => {
    const caller = systemRouter.createCaller(createContext("user"));
    await expect(caller.getOwnerSupportSummary()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns owner support only as aggregate security data", async () => {
    const caller = systemRouter.createCaller(createContext("admin"));
    const summary = await caller.getOwnerSupportSummary();
    expect(summary.security).toEqual({
      eventsLast7Days: expect.any(Number),
      unresolvedEvents: expect.any(Number),
      highPriorityEvents: expect.any(Number),
      activeAbuseBlocks: expect.any(Number),
      activeAbuseRecords: expect.any(Number),
    });
    expect(summary.customerFeedback).toEqual({
      openThreads: expect.any(Number),
      securityReports: expect.any(Number),
      productFeedback: expect.any(Number),
      salesInterest: expect.any(Number),
    });
    expect(summary.activity).toMatchObject({
      assistedRequestsLast7Days: expect.any(Number),
      incidentsLast7Days: expect.any(Number),
      customerReturnsLast7Days: expect.any(Number),
      daily: expect.any(Array),
    });
    expect(summary.activity.daily).toHaveLength(7);
    expect(summary.privacy).toEqual({
      containsPersonalData: false,
      containsStudentContent: false,
      containsVisitorIdentifiers: false,
    });
    expect(JSON.stringify(summary)).not.toMatch(/email|ipAddress|userAgent|conversation/i);
    expect(summary.customerFeedback).not.toHaveProperty("content");
    expect(summary.customerFeedback).not.toHaveProperty("subject");
  });

  it("rejects security-event writes for a non-administrator", async () => {
    const caller = systemRouter.createCaller(createContext("user"));
    await expect(
      caller.logSecurityEvent({
        eventType: "other",
        severity: "low",
        description: "attempted public write",
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
