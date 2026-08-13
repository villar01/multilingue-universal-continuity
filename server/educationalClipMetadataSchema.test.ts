import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const schema = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");
const migration = readFileSync(resolve(process.cwd(), "drizzle/0022_mighty_wendigo.sql"), "utf8");

describe("metadados pedagógicos de clipes educacionais", () => {
  it("mantém vocabulário e legendas opcionais sem alterar o acervo existente", () => {
    const educationalClipsSection = schema.slice(
      schema.indexOf('export const educationalClips'),
      schema.indexOf('export type EducationalClip')
    );

    expect(educationalClipsSection).toContain('vocabularyData: json("vocabularyData")');
    expect(educationalClipsSection).toContain('subtitlesData: json("subtitlesData")');
    expect(migration).toContain('ADD `vocabularyData` json');
    expect(migration).toContain('ADD `subtitlesData` json');
    expect(migration).not.toMatch(/UPDATE\s+`?educational_clips`?/i);
  });
});
