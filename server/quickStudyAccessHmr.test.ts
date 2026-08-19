import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("QuickStudyAccess hot refresh contract", () => {
  it("keeps navigation helpers private to the component module", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/components/QuickStudyAccess.tsx"),
      "utf8"
    );

    expect(source).toContain('import { getQuickStudyHref } from "@/lib/quickStudyAccess"');
    expect(source).not.toContain("function getQuickStudyHref");
    expect(source).not.toContain("export function getQuickStudyHref");
    expect(source).toContain("export function QuickStudyAccess");
  });
});
