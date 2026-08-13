import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const routers = readFileSync(resolve(root, 'server/routers.ts'), 'utf8');
const structuredLesson = readFileSync(resolve(root, 'client/src/pages/StructuredLesson.tsx'), 'utf8');
const wordGame = readFileSync(resolve(root, 'client/src/pages/WordGame.tsx'), 'utf8');
const tinyLesson = routers.slice(routers.indexOf('tinyLesson: router({'), routers.indexOf('// ── Ranking Global'));

describe('geração de vocabulário situacional protegida', () => {
  it('exige sessão antes de acionar o provedor de IA', () => {
    expect(tinyLesson).toContain('generateByScenario: protectedProcedure');
    expect(tinyLesson).not.toContain('generateByScenario: publicProcedure');
    expect(tinyLesson).toContain('await invokeLLM');
  });

  it('impede as duas interfaces consumidoras de chamar a geração sem sessão', () => {
    expect(structuredLesson).toContain('Entre para gerar o vocabulário personalizado desta aula.');
    expect(structuredLesson).toContain('!isAuthenticated || authLoading');
    expect(wordGame).toContain('Entre para gerar palavras personalizadas.');
    expect(wordGame).toContain('!isAuthenticated || authLoading');
  });
});
