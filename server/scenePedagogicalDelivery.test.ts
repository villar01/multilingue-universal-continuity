import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getScenePedagogicalDelivery } from "./curriculum/scenePedagogicalDelivery";

const root = resolve(import.meta.dirname, "..");
const curriculumRouter = readFileSync(resolve(root, "server/curriculum-router.ts"), "utf8");
const immersiveScene = readFileSync(resolve(root, "client/src/pages/ImmersiveScene.tsx"), "utf8");

describe("entrega pedagógica progressiva das cenas", () => {
  it("mantém as cinco etapas em uma entrega protegida para cada dificuldade", () => {
    const expectedStages = ["concept", "guided_practice", "student_response", "feedback", "transfer"];

    expect(getScenePedagogicalDelivery("beach")).toMatchObject({
      difficulty: "beginner",
      pedagogicalLevel: "initial",
      responseMode: "choice_or_repeat",
      correctionDepth: "direct",
      requiresCompatibleTeacherMedia: true,
    });
    expect(getScenePedagogicalDelivery("tokyo")).toMatchObject({
      difficulty: "advanced",
      pedagogicalLevel: "advanced",
      responseMode: "open_scenario",
      correctionDepth: "contextual",
      requiresCompatibleTeacherMedia: true,
    });
    expect(getScenePedagogicalDelivery("beach")?.stages.map((stage) => stage.id)).toEqual(expectedStages);
    expect(getScenePedagogicalDelivery("unknown-scene")).toBeNull();
  });

  it("requer autorização curricular antes de entregar a orientação", () => {
    expect(curriculumRouter).toMatch(/sceneInteractionProgression:\s*protectedProcedure/);
    expect(curriculumRouter).toContain("await assertCurriculumDelivery(ctx.user.id, input.lessonKey)");
    expect(curriculumRouter).not.toMatch(/sceneInteractionProgression:\s*publicProcedure/);
  });

  it("apresenta o roteiro na cena sem alterar a política de mídia docente", () => {
    expect(immersiveScene).toContain("trpc.curriculum.sceneInteractionProgression.useQuery");
    expect(immersiveScene).toContain("Roteiro de aprendizagem");
    expect(immersiveScene).toContain("Professor visível · fala compatível");
    expect(immersiveScene).toContain("canUseAuthorizedSceneInteractions && sceneInteractionProgressionQuery.data");
  });
});
