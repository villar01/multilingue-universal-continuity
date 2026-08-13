import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(import.meta.dirname, '../client/src/components/EnhancedTeacherAvatar.tsx'), 'utf8');

describe('posições faciais calibradas do avatar aprimorado', () => {
  it('mapeia os onze retratos ativos antes de recorrer à posição genérica', () => {
    const portraitKeys = source.match(/"teacher-portrait-[^"]+":\s+\{ mouthX:/g) ?? [];
    expect(portraitKeys).toHaveLength(11);
    expect(source).toContain('"teacher-portrait-sophie_"');
    expect(source).toContain('"teacher-portrait-emre_"');
    expect(source).toContain('"teacher-portrait-verified-b_"');
  });

  it('mantém a posição genérica somente como fallback e conserva a exceção do Ricardo', () => {
    expect(source).toContain('const DEFAULT_POS');
    expect(source).toContain('const allowsMouthAnimation = !/^\\s*(prof\\.?\\s*)?ricardo\\b/i.test(teacherName);');
  });
});
