import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const router = readFileSync(resolve(import.meta.dirname, 'translate-router.ts'), 'utf8');
const camera = readFileSync(resolve(import.meta.dirname, '../client/src/components/CameraTranslator.tsx'), 'utf8');

describe('Tradução por câmera protegida', () => {
  it('exige sessão antes de enviar imagem ou palavra para IA', () => {
    expect(router).toMatch(/translateImage:\s*protectedProcedure/);
    expect(router).toMatch(/translateWord:\s*protectedProcedure/);
  });

  it('não envia o quadro da câmera para visitantes', () => {
    expect(camera).toContain('Faça login para traduzir imagens com IA.');
    expect(camera).toContain('if (!user)');
  });
});
