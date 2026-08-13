import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/components/SceneLesson.tsx"), "utf8");
const hotspotPanel = source.slice(source.indexOf("selectedHotspot &&"), source.indexOf("{/* Dialog section */}"));

describe("scene lesson native example", () => {
  it("shows the Portuguese-only example only for Portuguese native profiles", () => {
    expect(hotspotPanel).toContain("profile.nativeCode?.startsWith('pt')");
    expect(hotspotPanel).toContain("selectedHotspot.examplePt");
  });
});
