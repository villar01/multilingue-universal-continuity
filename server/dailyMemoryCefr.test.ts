import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const page = readFileSync(resolve(root, 'client/src/pages/DailyMemoryPage.tsx'), 'utf8');
const trainer = readFileSync(resolve(root, 'client/src/components/DailyMemoryTrainer.tsx'), 'utf8');
const routers = readFileSync(resolve(root, 'server/routers.ts'), 'utf8');

describe('treino diário com CEFR explícito', () => {
  it('oferece os seis estágios CEFR ao aluno sem grupos genéricos', () => {
    for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
      expect(page).toContain(`value: "${level}"`);
    }
    expect(page).not.toContain('value: "beginner"');
    expect(page).not.toContain('value: "intermediate"');
    expect(page).not.toContain('value: "advanced"');
  });

  it('envia somente um CEFR canônico ao gerador de palavras', () => {
    expect(trainer).toContain('level?: CEFRLevel');
    expect(trainer).toContain('level = "A1"');
    expect(trainer).toContain('{ languageCode, nativeLanguage, level, count: 15, topic }');
  });

  it('valida e orienta a geração por CEFR no servidor', () => {
    expect(routers).toContain("level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('A1')");
    expect(routers).toContain('CEFR Level: ${input.level}');
    expect(routers).toContain('Level constraints: ${levelLabel[input.level]}');
  });
});
