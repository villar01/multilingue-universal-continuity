import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const routerSource = readFileSync(resolve(root, 'server/routers.ts'), 'utf8');
const polyLessonSource = readFileSync(resolve(root, 'client/src/components/PolyLesson.tsx'), 'utf8');
const section = routerSource.slice(routerSource.indexOf('teacherChat:'), routerSource.indexOf('// Gerar frase de apresentação'));

describe('Chat do professor multilíngue e protegido', () => {
  it('requer idioma nativo e CEFR e aplica o portão central', () => {
    expect(section).toMatch(/teacherChat:\s*protectedProcedure/);
    expect(section).toContain("nativeLanguage: z.string().min(2)");
    expect(section).toContain("cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])");
    expect(section).toContain('await ensureConversationAccess(ctx.user.id)');
    expect(polyLessonSource).toContain('nativeLanguage: selectedNativeLanguage');
    expect(polyLessonSource).toContain('cefrLevel: selectedCefrLevel');
  });

  it('não fixa explicação nem fallback em português brasileiro', () => {
    expect(section).not.toContain('Fale SEMPRE em português brasileiro');
    expect(section).not.toContain('Vamos continuar aprendendo juntos');
    expect(section).toContain("const safeFallback = { reply: ''");
  });
});
