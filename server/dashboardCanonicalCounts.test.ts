import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(import.meta.dirname, '../client/src/pages/DashboardReal.tsx'), 'utf8');

describe('contagens canônicas do painel principal', () => {
  it('comunica o catálogo canônico de 143 idiomas e as seis trilhas comerciais iniciais', () => {
    expect(source).toContain('TOTAL_LANGUAGES');
    expect(source).toContain('seis trilhas comerciais iniciais');
    expect(source).toContain('6 trilhas comerciais iniciais');
    expect(source).not.toContain('58 idiomas ativos agora');
    expect(source).not.toContain('69 idiomas');
    expect(source).not.toContain('200 lições');
  });

  it('mantém o avanço curricular qualificado em vez de prometer volume fixo por idioma', () => {
    expect(source).toContain('Conteúdo curricular em expansão');
    expect(source).toContain('Progressão A1–C2');
    expect(source).toContain('Catálogo de lições por idioma');
  });
});
