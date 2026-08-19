import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const pagePath = path.resolve(process.cwd(), "client/src/pages/BackupGuide.tsx");
const page = fs.readFileSync(pagePath, "utf8");

describe("guia de backup com páginas reais", () => {
  it("mantém a sequência direta, as capturas reais e o bloqueio de restauração", () => {
    expect(page).toContain("Exportar dados das tarefas");
    expect(page).toContain("Exportação concluída");
    expect(page).toContain("Verificar pacotes de dados");
    expect(page).toContain("Não clique em “Importar dados locais”. Não restaure nada.");
    expect(page).toContain("/manus-storage/01-exportar_b474ab64.png");
    expect(page).toContain("/manus-storage/02-baixar_3e073807.png");
    expect(page).toContain("/manus-storage/03-verificar_3071c62d.png");
  });
});
