import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(import.meta.dirname, '../client/src/pages/ImmersiveLesson.tsx'), 'utf8');

describe('indicador honesto da aula imersiva', () => {
  it('não sobrepõe uma boca artificial no retrato do professor', () => {
    expect(source).not.toContain('Lip-sync mouth overlay');
    expect(source).not.toContain('rgba(200,40,40');
    expect(source).not.toContain('openPx');
  });

  it('mostra apenas a reprodução de áudio neural vinculada à amplitude real', () => {
    expect(source).toContain('aria-label="Áudio neural em reprodução"');
    expect(source).toContain('Voz neural');
    expect(source).toContain('mouthOpen * 20 * h');
  });
});
