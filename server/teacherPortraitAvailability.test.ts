import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(import.meta.dirname, '../client/src/lib/teachers-data.ts'), 'utf8');

describe('retratos do catálogo de professores', () => {
  it('usa os retratos restaurados e não referencia os arquivos expirados da grade', () => {
    expect(source).toContain('/manus-storage/teacher-portrait-james_0b43cb3d.jpg');
    expect(source).toContain('/manus-storage/teacher-portrait-yuki_11528cd6.jpg');
    expect(source).toContain('/manus-storage/teacher-portrait-emre_cb7b002a.jpg');
    expect(source).not.toContain('/manus-storage/prof_james_0aee8d8d.png');
    expect(source).not.toContain('/manus-storage/prof_carlos_v2_fff862cf.jpg');
    expect(source).not.toContain('teacher-james-restored_0a24c606.jpg');
  });

  it('mantém onze retratos fotográficos distintos para os professores selecionáveis', () => {
    const photos = [...source.matchAll(/photo: "([^"]+)"/g)].map((match) => match[1]);
    expect(photos).toHaveLength(11);
    expect(new Set(photos).size).toBe(11);
    expect(photos.every((photo) => photo.startsWith('/manus-storage/teacher-portrait-'))).toBe(true);
  });
});
