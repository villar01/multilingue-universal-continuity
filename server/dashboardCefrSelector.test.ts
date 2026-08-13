import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(import.meta.dirname, '../client/src/pages/DashboardReal.tsx'), 'utf8');

describe('seletor CEFR do painel principal', () => {
  it('expõe as seis etapas CEFR e não mantém opções genéricas como contrato ativo', () => {
    for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
      expect(source).toContain(`id: "${level}"`);
    }
    expect(source).toContain('type CourseLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";');
    expect(source).not.toContain('id: "negocios_tecnologia"');
  });

  it('migra a preferência legada e mantém a resolução dos três cursos existentes', () => {
    expect(source).toContain('const LEGACY_LEVEL_TO_CEFR');
    expect(source).toContain('localStorage.getItem("multilingue_cefr_level")');
    expect(source).toContain('A1: \'beginner\'');
    expect(source).toContain('B1: \'intermediate\'');
    expect(source).toContain('C1: \'advanced\'');
  });
});
