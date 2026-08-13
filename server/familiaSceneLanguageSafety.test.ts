import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const routerSource = readFileSync(resolve(root, 'server/routers.ts'), 'utf8');
const polyLessonSource = readFileSync(resolve(root, 'client/src/components/PolyLesson.tsx'), 'utf8');
const section = routerSource.slice(routerSource.indexOf('familiaScene:'), routerSource.indexOf('// ── Treinamento de Estrutura Frasal'));

describe('Cena Família multilíngue e protegida', () => {
  it('exige sessão e recebe idioma nativo e CEFR explícitos', () => {
    expect(section).toMatch(/familiaScene:\s*protectedProcedure/);
    expect(section).toContain("nativeLanguage: z.string().min(2)");
    expect(section).toContain("cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])");
    expect(section).toContain('await ensureConversationAccess(ctx.user.id)');
    expect(polyLessonSource).toContain('nativeLanguage: selectedNativeLanguage');
    expect(polyLessonSource).toContain('cefrLevel: selectedCefrLevel');
  });

  it('não expõe fallback em português ou inglês fixo quando a geração falha', () => {
    expect(section).not.toContain("teacherIntro: 'Vamos conhecer");
    expect(section).not.toContain("translation: 'familia'");
    expect(section).toContain('questions: []');
    expect(section).toContain('vocabulary: []');
    expect(section).toContain("teacherIntro: ''");
  });
});
