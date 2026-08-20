import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const appSource = readFileSync(path.join(root, "client/src/App.tsx"), "utf8");
const lessonBoundarySource = readFileSync(path.join(root, "client/src/components/LessonRecoveryBoundary.tsx"), "utf8");
const activityBoundarySource = readFileSync(path.join(root, "client/src/components/ActivityRecoveryBoundary.tsx"), "utf8");

const lessonRouteBindings = [
  '<Route path={"/lesson/:id"} component={ResilientLesson} />',
  '<Route path="/complete-lesson/:id" component={ResilientCompleteLesson} />',
  '<Route path="/structured-lesson" component={ResilientStructuredLesson} />',
  '<Route path="/practice/clips" component={ResilientPracticeClips} />',
  '<Route path="/practice/clips/:id" component={ResilientVideoPlayer} />',
  '<Route path="/immersive-lesson" component={ResilientImmersiveLesson} />',
  '<Route path="/abc-book" component={ResilientABCBook} />',
  '<Route path="/base-de-estudos" component={ResilientStudyBase} />',
  '<Route path="/master-lesson" component={ResilientMasterLesson} />',
];

const activityRouteBindings = [
  '<Route path="/interactive-videos" component={ResilientInteractiveVideos} />',
  '<Route path="/reels" component={ResilientReels} />',
  '<Route path="/roleplay" component={ResilientRoleplay} />',
  '<Route path="/ar-teacher" component={ResilientARTeacher} />',
  '<Route path="/ar-mode" component={ResilientARMode} />',
  '<Route path="/ar-ultimate" component={ResilientARMode} />',
  '<Route path="/vr-conversation" component={ResilientVRConversation} />',
  '<Route path="/free-talk" component={ResilientFreeTalk} />',
  '<Route path="/word-game" component={ResilientWordGame} />',
  '<Route path="/battle" component={ResilientBattleMode} />',
  '<Route path="/daily-memory" component={ResilientDailyMemory} />',
  '<Route path="/smart-review" component={ResilientSmartReview} />',
  '<Route path="/pareto-1000" component={ResilientPareto1000} />',
];

describe("contrato de cobertura de recuperação crítica", () => {
  it("mantém as rotas críticas de lição e atividade atrás de uma fronteira local", () => {
    for (const binding of lessonRouteBindings) expect(appSource).toContain(binding);
    for (const binding of activityRouteBindings) expect(appSource).toContain(binding);
    expect(appSource).toContain('<Route path="/immersive-scene" component={ResilientImmersiveScene} />');
  });

  it("mantém detecção, tentativa única e saídas seguras nas duas fronteiras", () => {
    for (const source of [lessonBoundarySource, activityBoundarySource]) {
      expect(source).toContain("static getDerivedStateFromError");
      expect(source).toContain("autoRecoveryUsed");
      expect(source).toContain("retryKey");
      expect(source).toContain("window.setTimeout");
      expect(source).toContain("Tentar");
      expect(source).toContain('window.location.assign("/dashboard")');
    }

    expect(lessonBoundarySource).toContain('window.location.assign("/lessons-hub")');
  });
});
