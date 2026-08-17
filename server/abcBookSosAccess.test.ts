import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const appSource = readFileSync(path.join(root, "client/src/App.tsx"), "utf8");
const bookSource = readFileSync(path.join(root, "client/src/pages/ABCBook.tsx"), "utf8");
const sosSource = readFileSync(path.join(root, "client/src/components/FlyingSOSBook.tsx"), "utf8");
const sceneSource = readFileSync(path.join(root, "client/src/pages/ImmersiveScene.tsx"), "utf8");
const lessonSource = readFileSync(path.join(root, "client/src/pages/Lesson.tsx"), "utf8");

describe("Livro ABC e Socorro SOS voluntário", () => {
  it("registra a rota protegida de leitura do Livro ABC", () => {
    expect(appSource).toContain('const ABCBook = lazy(() => import("./pages/ABCBook"))');
    expect(appSource).toContain('<Route path="/abc-book" component={ABCBook} />');
  });

  it("cria um destino SOS interno que preserva a atividade de origem", () => {
    expect(sosSource).toContain('return `/abc-book?returnTo=${encodeURIComponent(safeOrigin(location))}`');
    expect(sosSource).toContain('aria-label="Socorro: abrir o Livro ABC de Idiomas e retornar a esta atividade"');
    expect(sosSource).toContain('!location.startsWith("//")');
  });

  it("mantém o acesso voluntário ao SOS na Cena Imersiva e na Lição", () => {
    expect(sceneSource).toContain('import { FlyingSOSBook } from "@/components/FlyingSOSBook"');
    expect(sceneSource).toContain('<FlyingSOSBook className="relative z-0" />');
    expect(lessonSource).toContain('import { FlyingSOSBook } from "@/components/FlyingSOSBook"');
    expect(lessonSource).toContain('<FlyingSOSBook className="fixed bottom-6 left-4 z-[80]" />');
  });

  it("permite sair do livro e retornar à origem, inclusive depois do Pareto", () => {
    expect(bookSource).toContain('requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard"');
    expect(bookSource).toContain('const paretoReturnTo = `/abc-book?returnTo=${encodeURIComponent(returnTo)}`');
    expect(bookSource).toContain('onClick={() => setLocation(returnTo)}');
  });
});
