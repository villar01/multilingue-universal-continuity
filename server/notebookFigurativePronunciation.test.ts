import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(
  resolve(import.meta.dirname, '..', 'client/src/components/NotebookLesson.tsx'),
  'utf8',
);

describe('pronúncia figurativa no caderno de aulas', () => {
  it('substitui a notação IPA pelas aproximações de leitura em português', () => {
    expect(source).not.toContain('IPA');
    expect(source).not.toContain('/hɛ');
    expect(source).toContain('phonetic: "rê-lôu, ráu ar iú?"');
    expect(source).toContain('phonetic: "gúd mór-ning"');
  });

  it('rotula a pronúncia de modo claro na prática, no histórico e na exportação', () => {
    expect(source).toContain('Como soa em português:');
    expect(source).toContain('<FigurativePronunciation value={currentPhrase.phonetic}');
    expect(source).toContain('<FigurativePronunciation value={entry.phonetic}');
    expect(source).toContain('Como soa em português: ${e.phonetic}');
  });
});
