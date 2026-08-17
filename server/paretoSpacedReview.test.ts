import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  getDueParetoReviewIds,
  getParetoProgramIndex,
  recordSuccessfulParetoReview,
} from "../client/src/lib/paretoSpacedReview";

const DAY = 24 * 60 * 60 * 1000;

describe("revisão espaçada Pareto", () => {
  it("agenda intervalos progressivos após cada recuperação bem-sucedida", () => {
    const first = recordSuccessfulParetoReview({}, "pareto-0001-social-x", 1_000);
    expect(first["pareto-0001-social-x"]).toMatchObject({ repetitions: 1, dueAt: 1_000 + DAY });

    const second = recordSuccessfulParetoReview(first, "pareto-0001-social-x", 1_000 + DAY);
    expect(second["pareto-0001-social-x"]).toMatchObject({ repetitions: 2, dueAt: 1_000 + DAY + 3 * DAY });
  });

  it("prioriza somente revisões vencidas e encontra sua página estável", () => {
    const schedule = {
      "pareto-0011-social-a": { repetitions: 1, dueAt: 20, updatedAt: 0 },
      "pareto-0001-social-b": { repetitions: 1, dueAt: 10, updatedAt: 0 },
      "pareto-0021-social-c": { repetitions: 1, dueAt: 30, updatedAt: 0 },
    };
    expect(getDueParetoReviewIds(schedule, 20)).toEqual(["pareto-0001-social-b", "pareto-0011-social-a"]);
    expect(getParetoProgramIndex("pareto-0011-social-a")).toBe(10);
    expect(getParetoProgramIndex("invalid")).toBeNull();
  });

  it("integra a fila de revisão à página Pareto", () => {
    const source = readFileSync("client/src/pages/Pareto1000.tsx", "utf8");
    expect(source).toContain("getDueParetoReviewIds");
    expect(source).toContain("Revisar pendências");
    expect(source).toContain("recordSuccessfulParetoReview");
  });
});
