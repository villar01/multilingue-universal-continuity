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
    expect(sceneSource).toContain("enabled: isAuthenticated && Boolean(authorizedSceneMaterialKey)");
    expect(sceneSource).toContain("authorizeLessonMut.mutateAsync({ lessonKey: materialLessonKey })");
    expect(sceneSource).toContain("Material localizado da cena");
  });
});
