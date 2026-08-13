import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const routerSource = readFileSync(resolve(root, 'server/routers.ts'), 'utf8');
const arTeacher = readFileSync(resolve(root, 'client/src/pages/ARTeacher.tsx'), 'utf8');
const objectScan = readFileSync(resolve(root, 'client/src/pages/ObjectScanAR.tsx'), 'utf8');
const scanObjects = routerSource.slice(routerSource.indexOf('scanObjects:'), routerSource.indexOf('analyzeFace:'));

describe('Análise de objetos em RA protegida e multilíngue', () => {
  it('exige sessão e idioma explícito no servidor', () => {
    expect(scanObjects).toMatch(/scanObjects:\s*protectedProcedure/);
    expect(scanObjects).toContain('targetLanguage: z.string().min(2)');
    expect(scanObjects).toContain('nativeLanguage: z.string().min(2)');
    expect(scanObjects).not.toContain('nativeLanguage: z.string().default("pt-BR")');
  });

  it('não envia imagens de visitantes e usa o idioma nativo do perfil', () => {
    expect(arTeacher).toContain('if (!user) { toast.error("Entre na sua conta para analisar objetos com IA."); return; }');
    expect(objectScan).toContain('if (!user) {');
    expect(objectScan).toContain('nativeLanguage: profile.nativeCode');
  });
});
