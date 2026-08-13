import { describe, expect, it } from "vitest";
import { shouldSyncAllExercises } from "./useOfflineSync";

describe("offline exercise synchronization policy", () => {
  it("does not preload every lesson exercise during ordinary navigation", () => {
    expect(shouldSyncAllExercises(false)).toBe(false);
  });

  it("allows the full exercise package only after an explicit offline request", () => {
    expect(shouldSyncAllExercises(true)).toBe(true);
  });
});
