import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const hub = readFileSync(resolve(import.meta.dirname, '../client/src/pages/LessonsHub.tsx'), 'utf8');

describe('Hub de lições por etapa CEFR', () => {
  it('expõe as seis etapas canônicas sem usar agrupamentos como seleção do aluno', () => {
    expect(hub).toContain('const CEFR_ORDER: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"]');
    expect(hub).toContain('const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>');
    expect(hub).toContain('localStorage.setItem("lessonsHub_cefr", cefrLevel)');
    expect(hub).not.toContain('useState<Level>("beginner")');
  });

  it('distribui cenas e práticas pelo estágio selecionado', () => {
    expect(hub).toContain('const CEFR_STAGE_BY_SCENE: Record<string, CEFRLevel>');
    expect(hub).toContain('const PARETO_CEFR_CARDS: Record<CEFRLevel, MemoryCard[]>');
    expect(hub).toContain('const scenes = VISUAL_SCENES.filter((scene) => getSceneCefrLevel(scene) === selectedLevel)');
    expect(hub).toContain('cefrLevel={selectedLevel}');
    expect(hub).toContain('{cefrLevel} · {CEFR_CONFIGS[cefrLevel].label}');
  });
});
