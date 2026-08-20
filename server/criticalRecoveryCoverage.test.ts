import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const appSource = readFileSync(path.join(root, "client/src/App.tsx"), "utf8");
const lessonBoundarySource = readFileSync(path.join(root, "client/src/components/LessonRecoveryBoundary.tsx"), "utf8");
const activityBoundarySource = readFileSync(path.join(root, "client/src/components/ActivityRecoveryBoundary.tsx"), "utf8");
const packageSource = readFileSync(path.join(root, "package.json"), "utf8");

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
  '<Route path="/natural-lesson" component={ResilientNaturalLesson} />',
];

const activityRouteBindings = [
  '<Route path="/onboarding" component={ResilientOnboarding} />',
  '<Route path="/dashboard" component={ResilientDashboardReal} />',
  '<Route path="/dashboard-real" component={ResilientDashboardReal} />',
  '<Route path={"/chat"} component={ResilientAiChat} />',
  '<Route path={"/ai-chat"} component={ResilientAiChat} />',
  '<Route path="/phrasal-verbs-exercises" component={ResilientPhrasalVerbsExercises} />',
  '<Route path="/interactive-videos" component={ResilientInteractiveVideos} />',
  '<Route path="/reels" component={ResilientReels} />',
  '<Route path="/roleplay" component={ResilientRoleplay} />',
  '<Route path="/clips" component={ResilientClips} />',
  '<Route path="/ar-teacher" component={ResilientARTeacher} />',
  '<Route path="/ar-mode" component={ResilientARMode} />',
  '<Route path="/ar-ultimate" component={ResilientARMode} />',
  '<Route path="/vr-conversation" component={ResilientVRConversation} />',
  '<Route path="/free-talk" component={ResilientFreeTalk} />',
  '<Route path="/word-game" component={ResilientWordGame} />',
  '<Route path="/ranking" component={ResilientRanking} />',
  '<Route path="/daily-challenge" component={ResilientDailyChallenge} />',
  '<Route path="/progress" component={ResilientStudentProgress} />',
  '<Route path="/achievements" component={ResilientAchievements} />',
  '<Route path="/lesson-history" component={ResilientLessonHistory} />',
  '<Route path="/battle" component={ResilientBattleMode} />',
  '<Route path="/certificates" component={ResilientCertificates} />',
  '<Route path="/pronunciation-history" component={ResilientPronunciationHistory} />',
  '<Route path="/ai-monitor" component={ResilientAIMonitor} />',
  '<Route path="/language-detect" component={ResilientLanguageDetect} />',
  '<Route path="/admin/updates" component={ResilientAdminUpdates} />',
  '<Route path="/admin/control-center" component={ResilientAdminControlCenter} />',
  '<Route path="/language-select" component={ResilientLanguageSelect} />',
  '<Route path="/daily-memory" component={ResilientDailyMemory} />',
  '<Route path="/my-teacher" component={ResilientMyTeacher} />',
  '<Route path="/lessons-hub" component={ResilientLessonsHub} />',
  '<Route path="/demo" component={ResilientDemo} />',
  '<Route path="/dialogue" component={ResilientImmersiveDialogue} />',
  '<Route path="/natural-learning" component={ResilientNaturalLearning} />',
  '<Route path="/ia-nativa" component={ResilientIANativa} />',
  '<Route path="/parental-control" component={ResilientParentalControl} />',
  '<Route path="/smart-review" component={ResilientSmartReview} />',
  '<Route path="/pareto-1000" component={ResilientPareto1000} />',
  '<Route path="/guia-backup" component={ResilientBackupGuide} />',
  '<Route path="/suporte" component={ResilientCustomerSupport} />',
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

  it("impede o build de avançar sem executar o contrato de recuperação", () => {
    expect(packageSource).toContain('"prebuild": "pnpm verify:immersive-scene-release"');
    expect(packageSource).toContain('"verify:immersive-scene-release": "pnpm check && pnpm test"');
  });
});
