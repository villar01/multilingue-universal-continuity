import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const routers = readFileSync(resolve(root, 'server/routers.ts'), 'utf8');
const dailyTrainer = readFileSync(resolve(root, 'client/src/components/DailyMemoryTrainer.tsx'), 'utf8');
const lessonBook = readFileSync(resolve(root, 'client/src/components/LessonBook.tsx'), 'utf8');

describe('autorização de geração pedagógica por IA', () => {
  it('requer sessão antes de gerar palavras diárias ou livro de lição', () => {
    const dailyWords = routers.slice(routers.indexOf('getDailyWords:'), routers.indexOf('// Voz neural'));
    const lessonBookRouter = routers.slice(routers.indexOf('generateLessonBook:'), routers.indexOf('// Gerar palavras do dia'));
    expect(dailyWords).toContain('getDailyWords: protectedProcedure');
    expect(dailyWords).not.toContain('getDailyWords: publicProcedure');
    expect(lessonBookRouter).toContain('generateLessonBook: protectedProcedure');
    expect(lessonBookRouter).not.toContain('generateLessonBook: publicProcedure');
  });

  it('não inicia consultas protegidas sem uma sessão autenticada', () => {
    expect(dailyTrainer).toContain('enabled: isAuthenticated && !authLoading');
    expect(dailyTrainer).toContain('Entre para iniciar o treino diário.');
    expect(lessonBook).toContain('enabled: isAuthenticated && !authLoading');
    expect(lessonBook).toContain('Entre para abrir o livro desta lição.');
  });
});
