import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const lesson = readFileSync(resolve(root, 'client/src/pages/Lesson.tsx'), 'utf8');
const lessonBook = readFileSync(resolve(root, 'client/src/components/LessonBook.tsx'), 'utf8');
const routers = readFileSync(resolve(root, 'server/routers.ts'), 'utf8');

describe('livro da lição com CEFR explícito', () => {
  it('recebe o nível central da aula e não um agrupamento genérico do curso', () => {
    const lessonBookStart = lesson.indexOf('<LessonBook');
    const lessonBookBlock = lesson.slice(lessonBookStart, lesson.indexOf('</Suspense>', lessonBookStart));
    expect(lessonBookBlock).toContain('level={cefrLevel}');
    expect(lessonBookBlock).not.toContain("level={(lesson as any).courseLevel || 'beginner'}");
    expect(lessonBook).toContain('level?: CEFRLevel');
    expect(lessonBook).toContain('level = "A1"');
  });

  it('valida A1–C2 e devolve o estágio explícito no capítulo gerado', () => {
    expect(routers).toContain("level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('A1')");
    expect(routers).toContain('- CEFR Level: ${input.level}');
    expect(routers).toContain('"level": "${input.level}"');
  });
});
