import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const routerSource = readFileSync(resolve(import.meta.dirname, './routers.ts'), 'utf8');
const builderSource = readFileSync(resolve(import.meta.dirname, '../client/src/components/SentenceBuilder.tsx'), 'utf8');
const polySource = readFileSync(resolve(import.meta.dirname, '../client/src/components/PolyLesson.tsx'), 'utf8');

describe('Construtor de Frases multilíngue e protegido', () => {
  it('exige sessão e CEFR nas duas rotas de IA estrutural', () => {
    const section = routerSource.slice(routerSource.indexOf('structureTraining:'), routerSource.indexOf('// ── Cenas com Professor'));
    expect(section).toMatch(/structureTraining:\s*protectedProcedure/);
    expect(section).toMatch(/structureChat:\s*protectedProcedure/);
    expect(section).toContain("cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])");
    expect(section).toContain('assessConversationText(ctx.user.id');
  });

  it('propaga idioma nativo, CEFR e vocabulário real sem rótulo PT-BR fixo', () => {
    expect(polySource).toContain('nativeLanguage={selectedNativeLanguage}');
    expect(polySource).toContain('cefrLevel={selectedCefrLevel}');
    expect(builderSource).toContain('buildVocabularyPatterns(vocabulary)');
    expect(builderSource).toContain('🌐 {nativeLanguage.toUpperCase()}');
    expect(builderSource).not.toContain('🇧🇷 PORTUGUÊS');
  });
});
