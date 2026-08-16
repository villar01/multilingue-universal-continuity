import { describe, expect, it } from "vitest";
import {
  PARENTAL_OPTIONAL_DATA_RETENTION_DAYS,
  buildOptionalParentalDataPurgeStatement,
  getParentalOptionalDataRetentionCutoff,
} from "./parentalDataRetention";

describe("retenção de dados parentais opcionais", () => {
  it("define a janela confirmada de trinta dias", () => {
    expect(PARENTAL_OPTIONAL_DATA_RETENTION_DAYS).toBe(30);
    expect(getParentalOptionalDataRetentionCutoff(new Date("2026-08-16T00:00:00.000Z"))).toEqual(
      new Date("2026-07-17T00:00:00.000Z"),
    );
  });

  it("limpa apenas documento e e-mail opcionais após revogação ou inatividade", () => {
    const cutoff = new Date("2026-07-17T00:00:00.000Z");
    const statement = buildOptionalParentalDataPurgeStatement(cutoff);

    expect(statement.sql).toContain("guardian_document = NULL");
    expect(statement.sql).toContain("guardian_email = NULL");
    expect(statement.sql).toContain("consent.revoked_at IS NOT NULL");
    expect(statement.sql).toContain("learner.lastSignedIn <= ?");
    expect(statement.sql).not.toContain("guardian_name = NULL");
    expect(statement.sql).not.toContain("relationship = NULL");
    expect(statement.sql).not.toContain("confirmed_terms = NULL");
    expect(statement.params).toEqual([cutoff, cutoff]);
  });
});
