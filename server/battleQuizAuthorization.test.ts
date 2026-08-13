import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const server = readFileSync(resolve(import.meta.dirname, 'routers.ts'), 'utf8');
const page = readFileSync(resolve(import.meta.dirname, '../client/src/pages/BattleMode.tsx'), 'utf8');
const route = server.slice(server.indexOf('generateQuiz:'), server.indexOf('  }),\n\n  // ── Certificados'));

describe('Quiz do modo de batalha protegido e bilíngue', () => {
  it('exige sessão e participação na sala para acessar o quiz compartilhado', () => {
    expect(route).toMatch(/generateQuiz:\s*protectedProcedure/);
    expect(route).toContain('roomCode: z.string().min(6).max(8)');
    expect(route).toContain('Apenas participantes podem acessar o quiz');
    expect(server).toContain('Write the question in ${input.nativeLanguage}');
  });

  it('encaminha o idioma nativo à criação e não gera perguntas locais por jogador', () => {
    expect(page).toContain('nativeLanguage: profile.nativeCode');
    expect(page).toContain('setQuestions(roomData.quizData)');
    expect(page).not.toContain('generateQuiz.mutateAsync');
  });
});
