import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const routers = readFileSync(resolve(root, 'server/routers.ts'), 'utf8');
const polyLesson = readFileSync(resolve(root, 'client/src/components/PolyLesson.tsx'), 'utf8');
const wordIntro = routers.slice(routers.indexOf('wordIntro:'), routers.indexOf('evaluateAnswer:'));

describe('introdução de palavras protegida', () => {
  it('exige sessão antes de gerar a introdução da palavra com IA', () => {
    expect(wordIntro).toContain('wordIntro: protectedProcedure');
    expect(wordIntro).not.toContain('wordIntro: publicProcedure');
    expect(wordIntro).toContain('await invokeLLM');
  });

  it('preserva abertura local para visitantes sem acionar a mutação protegida', () => {
    expect(polyLesson).toContain('if (!isLoggedIn)');
    expect(polyLesson).toContain('setTeacherIntro(`Vamos aprender a palavra');
    expect(polyLesson).toContain('speakWord(v.word);');
  });
});
