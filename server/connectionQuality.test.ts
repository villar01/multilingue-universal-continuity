import { describe, expect, it } from "vitest";
import { getConnectionHealthUrl } from "../client/src/hooks/useConnectionQuality";

describe("getConnectionHealthUrl", () => {
  it("uses the existing system.health tRPC query instead of the legacy 404 route", () => {
    const url = getConnectionHealthUrl(123456789);

    expect(url).toMatch(/^\/api\/trpc\/system\.health\?input=/);
    expect(url).not.toContain("/api/trpc/health");

    const encodedInput = new URLSearchParams(url.split("?")[1]).get("input");
    expect(encodedInput).toBeTruthy();
    expect(JSON.parse(encodedInput ?? "{}")).toEqual({
      json: { timestamp: 123456789 },
    });
  });
});
