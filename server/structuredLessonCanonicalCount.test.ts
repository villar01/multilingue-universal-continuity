import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(import.meta.dirname, '../client/src/pages/StructuredLesson.tsx'), 'utf8');

describe('contagem canônica da Lição Estruturada', () => {
  it('diferencia idiomas ativos do catálogo total no cabeçalho da aula', () => {
    expect(source).toContain('58 idiomas ativos · 143 no catálogo');
    expect(source).not.toContain('69 idiomas');
  });
});
