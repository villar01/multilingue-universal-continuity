import { describe, expect, it } from "vitest";
import { getTeacherVoiceCoverage } from "./teacherVoiceCoverage";

describe("cobertura verificável de professor e voz", () => {
  it("declara os dois perfis regionais de inglês como cobertura compatível", () => {
    const coverage = getTeacherVoiceCoverage("en-US");
    expect(coverage.isAvailable).toBe(true);
    expect(coverage.compatibleTeacherIds).toContain("prof-en-us");
    expect(coverage.compatibleTeacherIds).toContain("prof-en-gb");
  });

  it("não afirma cobertura onde não há perfil e voz neural compatíveis", () => {
    const coverage = getTeacherVoiceCoverage("ne-NP");
    expect(coverage.isAvailable).toBe(false);
    expect(coverage.compatibleTeacherCount).toBe(0);
  });
});
