import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    get: mocks.get,
  },
}));

import {
  __resetLMStudioAvailabilityWarningForTests,
  isLMStudioAvailable,
} from "./lmstudio";

describe("LM Studio availability warning", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    __resetLMStudioAvailabilityWarningForTests();
  });

  afterEach(() => {
    warn.mockClear();
  });

  it("logs one unavailable warning until a successful health check resets the outage state", async () => {
    mocks.get.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    mocks.get.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    mocks.get.mockResolvedValueOnce({ status: 200 });
    mocks.get.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    await expect(isLMStudioAvailable()).resolves.toBe(false);
    await expect(isLMStudioAvailable()).resolves.toBe(false);
    expect(warn).toHaveBeenCalledTimes(1);

    await expect(isLMStudioAvailable()).resolves.toBe(true);
    await expect(isLMStudioAvailable()).resolves.toBe(false);
    expect(warn).toHaveBeenCalledTimes(2);
  });
});
