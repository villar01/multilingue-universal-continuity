import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const schema = readFileSync(resolve(import.meta.dirname, '../drizzle/schema.ts'), 'utf8');
const router = readFileSync(resolve(import.meta.dirname, 'routers.ts'), 'utf8');
const page = readFileSync(resolve(import.meta.dirname, '../client/src/pages/BattleMode.tsx'), 'utf8');

describe('Salas de batalha por CEFR', () => {
  it('persiste o nível CEFR, idioma nativo e quiz compartilhado sem invalidar salas existentes', () => {
    const roomSchema = schema.slice(schema.indexOf('export const battleRooms'), schema.indexOf('export type BattleRoom'));
    expect(roomSchema).toContain('mysqlEnum("cefr_level", ["A1", "A2", "B1", "B2", "C1", "C2"]).notNull().default("A1")');
    expect(roomSchema).toContain('nativeLanguage: varchar("native_language", { length: 20 }).notNull().default("pt-BR")');
    expect(roomSchema).toContain('quizData: json("quiz_data")');
  });

  it('cria um único quiz no estágio da sala e impede perguntas locais diferentes', () => {
    const battle = router.slice(router.indexOf('battle: router({'), router.indexOf('// ── Certificados'));
    expect(router).toContain('async function createBattleQuiz');
    expect(battle).toContain('cefrLevel: input.cefrLevel, quizData, status: "waiting"');
    expect(battle).toContain('if (room.hostId !== ctx.user.id && room.guestId !== ctx.user.id)');
    expect(page).toContain('const CEFR_LEVELS =');
    expect(page).toContain('setQuestions(roomData.quizData)');
    expect(page).not.toContain('generateQuiz.mutateAsync');
  });
});
