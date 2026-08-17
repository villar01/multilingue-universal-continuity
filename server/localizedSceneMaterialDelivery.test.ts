import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("entrega protegida de diálogo localizado", () => {
  const source = readFileSync("server/curriculum-router.ts", "utf8");
  const sceneSource = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");

  it("exige sessão protegida e lição autorizada antes de localizar uma cena", () => {
    expect(source).toContain("localizedSceneDialogue: protectedProcedure");
    expect(source).toContain("await assertCurriculumDelivery(ctx.user.id, input.lessonKey)");
    expect(source).toContain("return localizeSceneDialogue({");
  });

  it("recebe apenas identificadores e idiomas, não currículo de cena enviado pelo navegador", () => {
    const routeStart = source.indexOf("localizedSceneDialogue: protectedProcedure");
    const routeEnd = source.indexOf("languageBlocks: protectedProcedure", routeStart);
    const route = source.slice(routeStart, routeEnd);
    expect(route).toContain("sceneId: z.string().trim().min(1).max(80)");
    expect(route).toContain("targetLanguage: z.string().trim().min(2).max(16)");
    expect(route).toContain("nativeLanguage: z.string().trim().min(2).max(16)");
    expect(route).not.toContain("dialog:");
    expect(route).not.toContain("hotspots:");
  });

  it("só solicita e exibe o material depois de uma lição de cena autorizada", () => {
    expect(sceneSource).toContain("const authorizeLessonMut = trpc.trialAccess.authorizeLesson.useMutation()");
    expect(sceneSource).toContain("const localizedSceneDialogueQuery = trpc.curriculum.localizedSceneDialogue.useQuery");
    expect(sceneSource).toContain("enabled: isAuthenticated");
    expect(sceneSource).toContain("authorizeLessonMut.mutateAsync({ lessonKey })");
    expect(sceneSource).toContain("Material localizado da cena");
    expect(sceneSource).toContain("Objetos para praticar");
    expect(sceneSource).toContain("localizedSceneDialogueQuery.data.objects.map");
  });

  it("vincula a autorização à cena e aos dois idiomas antes de habilitar a consulta", () => {
    expect(sceneSource).toContain("const [authorizedSceneMaterial, setAuthorizedSceneMaterial]");
    expect(sceneSource).toContain("authorizedSceneMaterial?.sceneId === selectedScene?.id");
    expect(sceneSource).toContain("authorizedSceneMaterial?.targetLanguage === targetLang");
    expect(sceneSource).toContain("authorizedSceneMaterial?.nativeLanguage === nativeLang");
    expect(sceneSource).toContain("sceneId: selectedScene.id,");
    expect(sceneSource).toContain("targetLanguage: targetLang,");
    expect(sceneSource).toContain("nativeLanguage: nativeLang,");
  });

  it("entrega a semente canônica somente por procedimento protegido e autorizado", () => {
    expect(source).toContain("sceneCanonicalMaterial: protectedProcedure");
    expect(source).toContain("getSecureSceneSeed(input.sceneId)");
    expect(source).toContain("O conteúdo canônico desta cena ainda não foi migrado.");
  });

  it("não inicia cenas migradas até o material autorizado chegar ao cliente", () => {
    expect(sceneSource).toContain('const sceneMaterialIsPreparing = (selectedScene?.id === "beach" || selectedScene?.id === "airport" || selectedScene?.id === "cafe" || selectedScene?.id === "cinema" || selectedScene?.id === "desert" || selectedScene?.id === "forest" || selectedScene?.id === "hospital" || selectedScene?.id === "medieval" || selectedScene?.id === "museum" || selectedScene?.id === "park" || selectedScene?.id === "paris" || selectedScene?.id === "port" || selectedScene?.id === "spa" || selectedScene?.id === "tokyo" || selectedScene?.id === "newyork" || selectedScene?.id === "kitchen" || selectedScene?.id === "restaurant" || selectedScene?.id === "hotel" || selectedScene?.id === "supermarket" || selectedScene?.id === "school" || selectedScene?.id === "mountain") && activeSceneDialog.length === 0');
    expect(sceneSource).toContain("activeSceneDialog.length > 0 && (");
    expect(sceneSource).toContain("Preparando material protegido da cena…");
  });
});
