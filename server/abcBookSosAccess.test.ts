import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const appSource = readFileSync(path.join(root, "client/src/App.tsx"), "utf8");
const bookSource = readFileSync(path.join(root, "client/src/pages/ABCBook.tsx"), "utf8");
const protectedBookSource = readFileSync(path.join(root, "server/curriculum/abcBookContent.ts"), "utf8");
const curriculumRouterSource = readFileSync(path.join(root, "server/curriculum-router.ts"), "utf8");
const sosSource = readFileSync(path.join(root, "client/src/components/FlyingSOSBook.tsx"), "utf8");
const sceneSource = readFileSync(path.join(root, "client/src/pages/ImmersiveScene.tsx"), "utf8");
const lessonSource = readFileSync(path.join(root, "client/src/pages/Lesson.tsx"), "utf8");

describe("Livro ABC e Socorro SOS voluntário", () => {
  it("registra a rota protegida de leitura do Livro ABC", () => {
    expect(appSource).toContain('const ABCBook = lazy(() => import("./pages/ABCBook"))');
    expect(appSource).toContain('<Route path="/abc-book" component={ABCBook} />');
  });

  it("entrega o conteúdo da edição inicial somente pelo roteador curricular protegido", () => {
    expect(curriculumRouterSource).toContain("abcBook: protectedProcedure.input(accessInput.extend");
    expect(curriculumRouterSource).toContain("await assertCurriculumDelivery(ctx.user.id, input.lessonKey)");
    expect(curriculumRouterSource).toContain("getABCBookDelivery");
    expect(bookSource).toContain("trpc.curriculum.abcBook.useQuery");
    expect(bookSource).toContain("createTrialLessonKey(location)");
    expect(bookSource).not.toContain("const PORTUGUESE_ENGLISH_STARTER =");
    expect(bookSource).not.toContain("Hello. How are you?");
    expect(protectedBookSource).toContain("Hello. How are you?");
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

  it("mantém a leitura de cartilha com ilustração autoral e uma ação principal por capítulo", () => {
    expect(bookSource).toContain('/manus-storage/abc-cartilha-greeting-monochrome_8e5662a6.png');
    expect(bookSource).toContain("CONTEXT_ILLUSTRATIONS");
    expect(bookSource).toContain('/manus-storage/abc-family-monochrome_bdfa331e.png');
    expect(bookSource).toContain('/manus-storage/abc-home-monochrome_fcf760e9.png');
    expect(bookSource).toContain('/manus-storage/abc-city-monochrome_ba326ddc.png');
    expect(bookSource).toContain('/manus-storage/abc-food-monochrome_34623dbe.png');
    expect(bookSource).toContain("getContextIllustration(group.title, group.purpose)");
    expect(bookSource).toContain("Próximo passo: Praticar no Pareto");
    expect(bookSource).toContain("Opções desta unidade");
  });
});
