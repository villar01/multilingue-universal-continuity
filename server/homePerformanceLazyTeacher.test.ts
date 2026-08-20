import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

describe("home initial load performance", () => {
  it("loads the lower-page teacher demonstration lazily", () => {
    expect(source).toContain('lazy(async () => ({ default: (await import("@/components/AnimatedTeacher")).AnimatedTeacher }))');
    expect(source).toContain("<Suspense fallback=");
    expect(source).not.toContain('import AnimatedTeacher from "@/components/AnimatedTeacher"');
  });

  it("loads the optional user guide separately from the initial navigation bundle", () => {
    expect(source).toContain('const UserGuide = lazy(() => import("@/components/UserGuide"));');
    expect(source).not.toContain('import UserGuide from "@/components/UserGuide"');
  });
});
