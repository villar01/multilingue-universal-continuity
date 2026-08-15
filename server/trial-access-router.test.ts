import { describe, expect, it } from "vitest";
import { decideTrialLessonAccess, filterLessonsForEntitlement } from "./trial-access-router";

describe("trial lesson authorization", () => {
  it("consumes a new lesson while the ten-lesson period remains active", () => {
    expect(decideTrialLessonAccess({ isPaid: false, lessonsUsed: 8, lessonLimit: 10, isPreviouslyAuthorized: false }))
      .toEqual({ allowed: true, shouldConsume: true, limitReached: false });
  });

  it("allows the tenth lesson and marks that the limit is reached afterwards", () => {
    expect(decideTrialLessonAccess({ isPaid: false, lessonsUsed: 9, lessonLimit: 10, isPreviouslyAuthorized: false }))
      .toEqual({ allowed: true, shouldConsume: true, limitReached: true });
  });

  it("blocks a new lesson after the limit without blocking a previously authorized lesson", () => {
    expect(decideTrialLessonAccess({ isPaid: false, lessonsUsed: 10, lessonLimit: 10, isPreviouslyAuthorized: false }))
      .toEqual({ allowed: false, shouldConsume: false, limitReached: true });
    expect(decideTrialLessonAccess({ isPaid: false, lessonsUsed: 10, lessonLimit: 10, isPreviouslyAuthorized: true }))
      .toEqual({ allowed: true, shouldConsume: false, limitReached: false });
  });

  it("returns only lesson records explicitly authorized for a trial account", () => {
    const lessons = [{ id: 1, title: "One" }, { id: 2, title: "Two" }, { id: 3, title: "Three" }];
    expect(filterLessonsForEntitlement(lessons, [1, 3])).toEqual([{ id: 1, title: "One" }, { id: 3, title: "Three" }]);
  });

  it("keeps the full curriculum list only for a paid entitlement", () => {
    const lessons = [{ id: 1 }, { id: 2 }];
    expect(filterLessonsForEntitlement(lessons, null)).toEqual(lessons);
  });
});
