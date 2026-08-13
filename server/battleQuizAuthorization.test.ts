import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const server = readFileSync(resolve(import.meta.dirname, 'routers.ts'), 'utf8');
const page = readFileSync(resolve(import.meta.dirname, '../client/src/pages/BattleMode.tsx'), 'utf8');
const route = server.slice(server.indexOf('generateQuiz:'), server.indexOf('  }),\n\n  // ── Certificados'));

describe('Quiz do modo de batalha protegido e bilíngue', () => {
  it('exige sessão e idioma nativo no gerador', () => {
    expect(route).toMatch(/generateQuiz:\s*protectedProcedure/);
    expect(route).toContain('nativeLanguage: z.string().min(2)');
    expect(route).toContain('Write the question in ${input.nativeLanguage}');
  });

  it('não gera perguntas para visitante e encaminha o idioma nativo do perfil', () => {
    expect(page).toContain('Faça login para gerar perguntas');
    expect(page).toContain('nativeLanguage: profile.nativeCode');
  });
});
