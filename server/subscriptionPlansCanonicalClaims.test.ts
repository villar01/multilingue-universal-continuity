import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(import.meta.dirname, '../client/src/pages/SubscriptionPlans.tsx'), 'utf8');

describe('alegações canônicas dos planos de assinatura', () => {
  it('diferencia catálogo, idiomas ativos e conteúdo em expansão', () => {
    expect(source).toContain('Catálogo de 143 idiomas');
    expect(source).toContain('58 idiomas ativos agora · 85 em preparação');
    expect(source).toContain('Conteúdo curricular em expansão');
    expect(source).not.toContain('69 idiomas disponíveis');
    expect(source).not.toContain('200 lições por idioma');
  });

  it('não chama de vitalício o plano de dois anos', () => {
    expect(source).toContain('name: "Acesso de 2 anos"');
    expect(source).toContain('cta: "Comprar acesso de 2 anos"');
    expect(source).not.toContain('name: "Vitalício"');
  });
});
