import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const page = readFileSync(resolve(import.meta.dirname, '../client/src/pages/PracticeClips.tsx'), 'utf8');

describe('Filtro CEFR dos clipes de prática', () => {
  it('apresenta exclusivamente A1–C2 como escolhas de dificuldade', () => {
    expect(page).toContain('const [selectedDifficulty, setSelectedDifficulty] = useState<CEFRLevel | "all">("all")');
    expect(page).toContain('(Object.keys(CEFR_LEVELS) as CEFRLevel[]).map');
    expect(page).not.toContain('<SelectItem value="beginner">');
    expect(page).not.toContain('<SelectItem value="intermediate">');
    expect(page).not.toContain('<SelectItem value="advanced">');
  });

  it('normaliza somente registros legados e filtra pelo estágio individual escolhido', () => {
    expect(page).toContain('const normalizeClipCefr = (difficulty?: string): CEFRLevel | undefined');
    expect(page).toContain('if (normalized === "BEGINNER") return "A1"');
    expect(page).toContain('if (normalized === "INTERMEDIATE") return "B1"');
    expect(page).toContain('if (normalized === "ADVANCED") return "C1"');
    expect(page).toContain('clipCefr === selectedDifficulty');
  });
});
