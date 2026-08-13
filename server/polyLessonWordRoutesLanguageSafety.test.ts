import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const routerSource = readFileSync(resolve(root, 'server/routers.ts'), 'utf8');
const polyLessonSource = readFileSync(resolve(root, 'client/src/components/PolyLesson.tsx'), 'utf8');
const wordIntro = routerSource.slice(routerSource.indexOf('wordIntro:'), routerSource.indexOf('// Avaliar resposta do aluno'));
const evaluateAnswer = routerSource.slice(routerSource.indexOf('evaluateAnswer:'), routerSource.indexOf('// Pergunta contextual'));

describe('Apresentação e avaliação de palavras multilíngues e protegidas', () => {
  it('exigem sessão, idioma nativo e CEFR', () => {
    for (const section of [wordIntro, evaluateAnswer]) {
      expect(section).toMatch(/protectedProcedure/);
      expect(section).toContain("nativeLanguage: z.string().min(2)");
      expect(section).toContain("cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])");
      expect(section).toContain('await ensureConversationAccess(ctx.user.id)');
    }
    expect(polyLessonSource).toContain('nativeLanguage: selectedNativeLanguage');
    expect(polyLessonSource).toContain('cefrLevel: selectedCefrLevel');
  });

  it('não mantém instruções ou feedback PT-BR fixos em fallback', () => {
    expect(wordIntro).not.toContain('Em português significa');
    expect(evaluateAnswer).not.toContain('Muito bem! Você acertou!');
    expect(wordIntro).toContain("|| ''");
    expect(evaluateAnswer).toContain("|| ''");
  });
});
