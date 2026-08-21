import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(import.meta.dirname, '../client/src/pages/Pricing.tsx'), 'utf8');

describe('alegações canônicas da página de preços', () => {
  it('apresenta o catálogo de 143 idiomas e diferencia disponibilidade atual', () => {
    expect(source).toContain('Catálogo de 143 idiomas');
    expect(source).toContain('58 idiomas ativos agora · 85 em preparação');
    expect(source).toContain('Catálogo de 143 idiomas, com 58 ativos agora e 85 em preparação');
    expect(source).not.toContain('Aprenda 54 idiomas');
    expect(source).not.toContain('Todos os 69 idiomas');
    expect(source).not.toContain('200+ lições por idioma');
  });

  it('não chama de vitalício um plano explicitamente limitado a 18 meses', () => {
    expect(source).toContain('name: "Acesso de 18 meses"');
    expect(source).toContain('description: "Acesso por 18 meses"');
    expect(source).not.toContain('Acesso vitalício');
  });
});
