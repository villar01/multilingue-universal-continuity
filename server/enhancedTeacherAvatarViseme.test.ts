import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(import.meta.dirname, '../client/src/components/EnhancedTeacherAvatar.tsx'), 'utf8');

describe('visemas do avatar aprimorado', () => {
  it('desenha boca, dentes e língua a partir do estado de fala calculado', () => {
    expect(source).toContain('Visema facial: usa a amplitude neural/linha fonética e a posição da foto.');
    expect(source).toContain('mouthWidthPct');
    expect(source).toContain('mouthHeightPct');
    expect(source).toContain('mO > 0.20');
    expect(source).toContain('mO > 0.42');
  });

  it('mantém a boca sintética desativada e não a sobrepõe ao vídeo externo', () => {
    expect(source).toContain('const allowsMouthAnimation = false;');
    expect(source).toContain('const supportsValidatedFacialSync = false;');
    expect(source).toContain('activelySpeaking && allowsMouthAnimation && !showVideo');
  });
});
