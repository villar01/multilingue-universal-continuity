import { describe, it, expect } from "vitest";
import { getAllLessons } from "./db";

describe("lessons.list router", () => {
  it("should return array of lessons from database", async () => {
    const lessons = await getAllLessons();
    
    console.log('\n=== TEST RESULTS ===');
    console.log('Total lessons:', lessons?.length);
    console.log('First 3 lessons:', lessons?.slice(0, 3).map(l => ({ id: l.id, title: l.title })));
    
    expect(lessons).toBeDefined();
    expect(Array.isArray(lessons)).toBe(true);
    expect(lessons.length).toBeGreaterThan(0);
    
    // Verificar estrutura da primeira lição
    if (lessons.length > 0) {
      const firstLesson = lessons[0];
      expect(firstLesson).toHaveProperty('id');
      expect(firstLesson).toHaveProperty('title');
      expect(firstLesson).toHaveProperty('courseId');
      expect(firstLesson).toHaveProperty('orderIndex');
    }
  });
});
