import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(import.meta.dirname, '..', 'server/routers.ts'), 'utf8');
const tinyLesson = source.slice(source.indexOf('tinyLesson: router({'), source.indexOf('// ── Ranking Global'));

describe('frase do dia protegida', () => {
  it('requer sessão antes de gerar uma frase com IA', () => {
    expect(tinyLesson).toContain('phraseOfTheDay: protectedProcedure');
    expect(tinyLesson).not.toContain('phraseOfTheDay: publicProcedure');
    expect(tinyLesson).toContain('Generate a useful daily phrase');
  });
});
