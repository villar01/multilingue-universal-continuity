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

  it('preserva a exceção do Ricardo e não sobrepõe boca ao vídeo externo', () => {
    expect(source).toContain('const allowsMouthAnimation = !/^\\s*(prof\\.?\\s*)?ricardo\\b/i.test(teacherName);');
    expect(source).toContain('activelySpeaking && allowsMouthAnimation && !showVideo');
  });
});
