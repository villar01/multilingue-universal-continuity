import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const lesson = readFileSync(resolve(root, 'client/src/pages/Lesson.tsx'), 'utf8');
const notebook = readFileSync(resolve(root, 'client/src/components/NotebookLesson.tsx'), 'utf8');

describe('caderno da lição com CEFR explícito', () => {
  it('recebe o nível central calculado pela lição', () => {
    const notebookStart = lesson.indexOf('<NotebookLesson');
    const notebookBlock = lesson.slice(notebookStart, lesson.indexOf('</Suspense>', notebookStart));
    expect(notebookBlock).toContain('level={cefrLevel}');
    expect(notebookBlock).not.toContain("level={(lesson as any).courseLevel || 'beginner'}");
  });

  it('aceita apenas o CEFR canônico e ajusta o volume de frases locais', () => {
    expect(notebook).toContain('level?: CEFRLevel');
    expect(notebook).toContain('level = "A1"');
    expect(notebook).toContain('const practiceCountByLevel: Record<CEFRLevel, number>');
    expect(notebook).toContain('return templates[key].slice(0, practiceCount)');
  });
});
