import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(import.meta.dirname, '../client/src/components/DownloadManager.tsx'), 'utf8');

describe('download de lições por CEFR', () => {
  it('expõe A1–C2 e converte cada etapa para um pacote de lições existente', () => {
    for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
      expect(source).toContain(`value: '${level}'`);
    }
    expect(source).toContain('const CEFR_DOWNLOAD_PACK');
    expect(source).toContain("A1: 'basico'");
    expect(source).toContain("B1: 'intermediario'");
    expect(source).toContain("C1: 'avancado'");
  });

  it('não envia a etapa CEFR diretamente para a rota legada de pacotes', () => {
    expect(source).toContain('courseLevel: CEFR_DOWNLOAD_PACK[selectedLevel]');
    expect(source).not.toContain('courseLevel: selectedLevel');
  });
});
