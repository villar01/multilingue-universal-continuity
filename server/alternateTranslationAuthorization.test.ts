import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(import.meta.dirname, '..', 'server/routers.ts'), 'utf8');
const alternativeTranslation = source.slice(source.indexOf('// AI: Tradução e Análise'), source.indexOf('chatWithCharacter:'));

describe('rota alternativa de tradução protegida', () => {
  it('requer sessão antes de encaminhar texto ao provedor de tradução', () => {
    expect(alternativeTranslation).toContain('translateWord: protectedProcedure');
    expect(alternativeTranslation).not.toContain('translateWord: publicProcedure');
    expect(alternativeTranslation).toContain('translateWordWithBlackbox');
  });
});
