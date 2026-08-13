import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(import.meta.dirname, '../client/src/pages/MyTeacher.tsx'), 'utf8');

describe('prévia honesta do professor', () => {
  it('não desenha uma boca artificial sobre retratos estáticos', () => {
    expect(source).not.toContain('Lip-sync mouth overlay');
    expect(source).not.toContain('rgba(220,50,50');
    expect(source).not.toContain('openPx');
  });

  it('indica somente a reprodução da voz neural com medidor de áudio', () => {
    expect(source).toContain('function useAudioPreviewMeter()');
    expect(source).toContain('aria-label="Prévia de voz em reprodução"');
    expect(source).toContain('Voz neural');
  });
});
