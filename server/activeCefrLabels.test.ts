import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const freeTalk = readFileSync(resolve(import.meta.dirname, '../client/src/pages/FreeTalk.tsx'), 'utf8');
const tour = readFileSync(resolve(import.meta.dirname, '../client/src/lib/tourSteps.ts'), 'utf8');

describe('rótulos CEFR nas entradas pedagógicas ativas', () => {
  it('mantém as seis etapas explícitas na conversa livre sem rótulos genéricos', () => {
    for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
      expect(freeTalk).toContain(`id: "${level}"`);
    }
    expect(freeTalk).not.toContain('A2 - Básico');
    expect(freeTalk).not.toContain('B1 - Intermediário');
    expect(freeTalk).not.toContain('C1 - Avançado');
  });

  it('orienta o tour do painel por A1–C2', () => {
    expect(tour).toContain('etapa CEFR de A1 a C2');
    expect(tour).not.toContain('Básico/Intermediário/Avançado/Negócios');
  });
});
