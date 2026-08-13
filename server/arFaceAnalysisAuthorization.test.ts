import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(import.meta.dirname, 'routers.ts'), 'utf8');
const analyzeFace = source.slice(source.indexOf('analyzeFace:'), source.indexOf('  }),\n  // ── Adaptive Learning Path'));

describe('Análise facial de pronúncia protegida e multilíngue', () => {
  it('exige sessão e os dois idiomas do estudante', () => {
    expect(analyzeFace).toMatch(/analyzeFace:\s*protectedProcedure/);
    expect(analyzeFace).toContain('nativeLanguage: z.string().min(2)');
    expect(analyzeFace).toContain('tip (one short encouraging tip in ${input.nativeLanguage}');
  });

  it('não usa dicas ou fallback fixos em português', () => {
    expect(analyzeFace).not.toContain('em Português');
    expect(analyzeFace).not.toContain('Relaxe e tente novamente!');
    expect(analyzeFace).toContain('tip: "", encouragement: ""');
  });
});
