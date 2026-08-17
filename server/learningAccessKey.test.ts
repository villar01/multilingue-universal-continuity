import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const accessSource = readFileSync("client/src/lib/learningAccess.ts", "utf8");

describe("immersive scene learning access key", () => {
  it("uses the canonical scene key instead of the route URL with query parameters", () => {
    expect(accessSource).toContain('if (normalizedPath === "/immersive-scene")');
    expect(accessSource).toContain('return sceneId ? `scene:${sceneId}` : "scene:catalog";');
  });
});
