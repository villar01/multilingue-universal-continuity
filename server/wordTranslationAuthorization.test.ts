import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const routers = readFileSync(resolve(root, 'server/routers.ts'), 'utf8');
const clickableWord = readFileSync(resolve(root, 'client/src/components/ClickableWord.tsx'), 'utf8');

describe('tradução de palavra sob sessão', () => {
  it('não permite que visitantes acionem a tradução por IA', () => {
    const wordTranslation = routers.slice(routers.indexOf('// Traduzir palavra'), routers.indexOf('// Gerar conteúdo completo de aula'));
    expect(wordTranslation).toContain('translateWord: protectedProcedure');
    expect(wordTranslation).not.toContain('translateWord: publicProcedure');
  });

  it('não chama recursos protegidos antes de confirmar a sessão no clique da palavra', () => {
    expect(clickableWord).toContain('if (!isAuthenticated)');
    expect(clickableWord).toContain('Entre para ouvir e consultar esta palavra.');
    expect(clickableWord).toContain('setAuthNotice(null);');
  });
});
