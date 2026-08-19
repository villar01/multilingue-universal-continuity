import { describe, expect, it } from "vitest";
import {
  PEDAGOGICAL_QUICK_ACCESS_CLASS,
  shouldShowPedagogicalQuickAccess,
} from "../client/src/lib/pedagogicalQuickAccess";

describe("pedagogical quick access mobile placement", () => {
  it("moves the closed shortcut away from the teacher's right-bottom area on narrow screens", () => {
    expect(PEDAGOGICAL_QUICK_ACCESS_CLASS).toContain("bottom-1");
    expect(PEDAGOGICAL_QUICK_ACCESS_CLASS).toContain("left-3");
    expect(PEDAGOGICAL_QUICK_ACCESS_CLASS).toContain("sm:right-4");
  });

  it("preserves the Livro SOS as the single pedagogical entry on scenes and lessons", () => {
    expect(shouldShowPedagogicalQuickAccess("/immersive-scene?scene=forest")).toBe(false);
    expect(shouldShowPedagogicalQuickAccess("/lesson/390001")).toBe(false);
    expect(shouldShowPedagogicalQuickAccess("/dashboard")).toBe(true);
    expect(shouldShowPedagogicalQuickAccess("/abc-book")).toBe(false);
  });
});
