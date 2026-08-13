import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const routerSource = readFileSync(resolve(root, 'server/routers.ts'), 'utf8');
const polyLessonSource = readFileSync(resolve(root, 'client/src/components/PolyLesson.tsx'), 'utf8');
const section = routerSource.slice(routerSource.indexOf('cartilhaQuestion:'), routerSource.indexOf('familiaScene:'));

describe('Cartilha multilíngue e protegida', () => {
  it('exige sessão e recebe idioma nativo e CEFR explícitos', () => {
    expect(section).toMatch(/cartilhaQuestion:\s*protectedProcedure/);
    expect(section).toContain("nativeLanguage: z.string().min(2)");
    expect(section).toContain("cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])");
    expect(section).toContain('await ensureConversationAccess(ctx.user.id)');
    expect(polyLessonSource).toContain('nativeLanguage: selectedNativeLanguage');
    expect(polyLessonSource).toContain('cefrLevel: selectedCefrLevel');
  });

  it('retorna estrutura vazia segura em falha, sem perguntas PT-BR ou inglês fixas', () => {
    expect(section).not.toContain("question: 'O que tem com a letra");
    expect(section).not.toContain("questionInTarget: 'What has the letter");
    expect(section).toContain("question: ''");
    expect(section).toContain("teacherIntro: ''");
  });
});
