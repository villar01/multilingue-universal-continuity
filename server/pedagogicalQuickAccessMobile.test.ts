import { describe, expect, it } from "vitest";
import {
  PEDAGOGICAL_QUICK_ACCESS_CLASS,
  shouldShowPedagogicalQuickAccess,
} from "../client/src/components/PedagogicalQuickAccess";

describe("pedagogical quick access mobile placement", () => {
  it("moves the closed shortcut away from the teacher's right-bottom area on narrow screens", () => {
    expect(PEDAGOGICAL_QUICK_ACCESS_CLASS).toContain("bottom-1");
    expect(PEDAGOGICAL_QUICK_ACCESS_CLASS).toContain("left-3");
    expect(PEDAGOGICAL_QUICK_ACCESS_CLASS).toContain("sm:right-4");
  });

  it("remains available on an immersive scene and hidden on the book itself", () => {
    expect(shouldShowPedagogicalQuickAccess("/immersive-scene?scene=forest")).toBe(true);
    expect(shouldShowPedagogicalQuickAccess("/abc-book")).toBe(false);
  });
});
