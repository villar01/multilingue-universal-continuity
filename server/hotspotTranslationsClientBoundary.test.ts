import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const clientRoot = path.join(projectRoot, "client", "src");
const legacyTranslationsPath = path.join(clientRoot, "lib", "hotspot-translations.ts");

function collectSourceFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(fullPath);
    return /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });
}

describe("hotspot translations client boundary", () => {
  it("does not retain the legacy multilingual hotspot curriculum module in the browser", () => {
    expect(fs.existsSync(legacyTranslationsPath)).toBe(false);
  });

  it("does not import legacy hotspot translations from client source", () => {
    const imports = collectSourceFiles(clientRoot)
      .map((filePath) => fs.readFileSync(filePath, "utf8"))
      .join("\n");

    expect(imports).not.toMatch(/from\s+["'][^"']*hotspot-translations/);
    expect(imports).not.toContain("HOTSPOT_TRANSLATIONS");
  });
});
