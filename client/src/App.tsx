import { Toaster } from "@/components/ui/sonner";
import React, { lazy, Suspense, useEffect, type ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { OfflineStatusBar } from "./components/OfflineStatusBar";
import { TourButton } from "./components/TourSpotlight";
import { DownloadManager } from "./components/DownloadManager";
import UpdatesNotificationBanner from "./components/UpdatesNotificationBanner";
import { FeedbackButton } from "./components/FeedbackButton";
import { registerServiceWorker } from "./lib/registerSW";
import { ImmersiveSceneRecoveryBoundary } from "./components/ImmersiveSceneRecoveryBoundary";
import { LessonRecoveryBoundary } from "./components/LessonRecoveryBoundary";
import { ActivityRecoveryBoundary } from "./components/ActivityRecoveryBoundary";

// Lazy load non-critical routes for faster initial load
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardReal = lazy(() => import("./pages/DashboardReal"));
const Lesson = lazy(() => import("./pages/Lesson"));
const CompleteLesson = lazy(() => import("./pages/CompleteLesson"));
const Checkout = lazy(() => import("./pages/Checkout"));
const AvatarSelection = lazy(() => import("./pages/AvatarSelection"));
const Admin = lazy(() => import("./pages/Admin"));
const PreLaunch = lazy(() => import("./pages/PreLaunch"));
const AiChat = lazy(() => import("./pages/AIChat"));
const Finance = lazy(() => import("./pages/Finance"));
const Pricing = lazy(() => import("./pages/Pricing"));
const PricingComparison = lazy(() => import("./pages/PricingComparison"));
const AdminRegenerateLessons = lazy(() => import("./pages/AdminRegenerateLessons"));
const AdminLessonGenerator = lazy(() => import("./pages/AdminLessonGenerator"));
const AdminModeration = lazy(() => import("./pages/AdminModeration"));
const AdminSIGA = lazy(() => import("./pages/AdminSIGA"));
const Upgrade = lazy(() => import("./pages/Upgrade"));
const InteractiveVideos = lazy(() => import("./pages/InteractiveVideos"));
const PhrasalVerbsExercises = lazy(() => import("./components/PhrasalVerbsExercises"));
const PracticeClips = lazy(() => import("./pages/PracticeClips"));
const VideoPlayer = lazy(() => import("./pages/VideoPlayer"));
const ReelsPage = lazy(() => import("./pages/ReelsPage"));
const RoleplayPage = lazy(() => import("./pages/RoleplayPage"));
const Clips = lazy(() => import("./pages/Clips"));
const ARTeacher = lazy(() => import("./pages/ARTeacher"));
const PricingAssistencial = lazy(() => import("./pages/PricingAssistencial"));
const SalesDashboard = lazy(() => import("./pages/SalesDashboard"));
const CRMLeads = lazy(() => import("./pages/CRMLeads"));
const ARMode = lazy(() => import("./pages/ARMode"));
const VRConversation = lazy(() => import("./pages/VRConversation"));
const WordGame = lazy(() => import("./pages/WordGame"));
const Ranking = lazy(() => import("./pages/Ranking"));
const DailyChallenge = lazy(() => import("./pages/DailyChallenge"));
const StudentProgress = lazy(() => import("./pages/StudentProgress"));
const SubscriptionPlans = lazy(() => import("./pages/SubscriptionPlans"));
const Achievements = lazy(() => import("./pages/Achievements"));
const LessonHistory = lazy(() => import("./pages/LessonHistory"));
const BattleMode = lazy(() => import("./pages/BattleMode"));
const Certificates = lazy(() => import("./pages/Certificates"));
const PronunciationHistory = lazy(() => import("./pages/PronunciationHistory"));
const StructuredLesson = lazy(() => import("./pages/StructuredLesson"));
const ImmersiveScene = lazy(() => import("./pages/ImmersiveScene"));
const ResilientImmersiveScene = () => (
  <ImmersiveSceneRecoveryBoundary>
    <ImmersiveScene />
  </ImmersiveSceneRecoveryBoundary>
);
export const ResilientLesson = ({ children }: { children?: ReactNode }) => (
  <LessonRecoveryBoundary>
    {children ?? <Lesson />}
  </LessonRecoveryBoundary>
);
const ResilientLessonRoute = () => <ResilientLesson />;
const ResilientStructuredLesson = () => (
  <LessonRecoveryBoundary>
    <StructuredLesson />
  </LessonRecoveryBoundary>
);
const ResilientCompleteLesson = () => (
  <LessonRecoveryBoundary>
    <CompleteLesson />
  </LessonRecoveryBoundary>
);
const ResilientPracticeClips = () => (
  <LessonRecoveryBoundary>
    <PracticeClips />
  </LessonRecoveryBoundary>
);
const ResilientVideoPlayer = () => (
  <LessonRecoveryBoundary>
    <VideoPlayer />
  </LessonRecoveryBoundary>
);
const ResilientImmersiveLesson = () => (
  <LessonRecoveryBoundary>
    <ImmersiveLesson />
  </LessonRecoveryBoundary>
);
const ResilientABCBook = () => (
  <LessonRecoveryBoundary>
    <ABCBook />
  </LessonRecoveryBoundary>
);
const ResilientStudyBase = () => (
  <LessonRecoveryBoundary>
    <StudyBase />
  </LessonRecoveryBoundary>
);
const ResilientMasterLesson = () => (
  <LessonRecoveryBoundary>
    <MasterLesson />
  </LessonRecoveryBoundary>
);
const ResilientNaturalLesson = () => (
  <LessonRecoveryBoundary>
    <NaturalLesson />
  </LessonRecoveryBoundary>
);
const ResilientPhrasalVerbsExercises = () => (
  <LessonRecoveryBoundary>
    <PhrasalVerbsExercises />
  </LessonRecoveryBoundary>
);
const ResilientLessonsHub = () => (
  <LessonRecoveryBoundary>
    <LessonsHub />
  </LessonRecoveryBoundary>
);
const ResilientInteractiveVideos = () => (
  <ActivityRecoveryBoundary activityLabel="os vídeos interativos">
    <InteractiveVideos />
  </ActivityRecoveryBoundary>
);
const ResilientReels = () => (
  <ActivityRecoveryBoundary activityLabel="os Reels educacionais">
    <ReelsPage />
  </ActivityRecoveryBoundary>
);
const ResilientRoleplay = () => (
  <ActivityRecoveryBoundary activityLabel="o roleplay">
    <RoleplayPage />
  </ActivityRecoveryBoundary>
);
const ResilientARMode = () => (
  <ActivityRecoveryBoundary activityLabel="o modo de realidade aumentada">
    <ARMode />
  </ActivityRecoveryBoundary>
);
const ResilientVRConversation = () => (
  <ActivityRecoveryBoundary activityLabel="a conversação imersiva">
    <VRConversation />
  </ActivityRecoveryBoundary>
);
const ResilientWordGame = () => (
  <ActivityRecoveryBoundary activityLabel="os jogos de palavras">
    <WordGame />
  </ActivityRecoveryBoundary>
);
const ResilientBattleMode = () => (
  <ActivityRecoveryBoundary activityLabel="o modo batalha">
    <BattleMode />
  </ActivityRecoveryBoundary>
);
const ResilientFreeTalk = () => (
  <ActivityRecoveryBoundary activityLabel="a conversação livre">
    <FreeTalk />
  </ActivityRecoveryBoundary>
);
const ResilientARTeacher = () => (
  <ActivityRecoveryBoundary activityLabel="o professor em realidade aumentada">
    <ARTeacher />
  </ActivityRecoveryBoundary>
);
const ResilientDailyMemory = () => (
  <ActivityRecoveryBoundary activityLabel="a memória diária">
    <DailyMemoryPage />
  </ActivityRecoveryBoundary>
);
const ResilientSmartReview = () => (
  <ActivityRecoveryBoundary activityLabel="a revisão inteligente">
    <SmartReview />
  </ActivityRecoveryBoundary>
);
const ResilientPareto1000 = () => (
  <ActivityRecoveryBoundary activityLabel="o treinamento Pareto 1000">
    <Pareto1000 />
  </ActivityRecoveryBoundary>
);
const ResilientImmersiveDialogue = () => (
  <ActivityRecoveryBoundary activityLabel="o diálogo imersivo">
    <ImmersiveDialogue />
  </ActivityRecoveryBoundary>
);
const ResilientNaturalLearning = () => (
  <ActivityRecoveryBoundary activityLabel="o aprendizado natural">
    <NaturalLearning />
  </ActivityRecoveryBoundary>
);
const ResilientClips = () => (
  <ActivityRecoveryBoundary activityLabel="os clipes educacionais">
    <Clips />
  </ActivityRecoveryBoundary>
);
const ResilientAiChat = () => (
  <ActivityRecoveryBoundary activityLabel="o chat pedagógico">
    <AiChat />
  </ActivityRecoveryBoundary>
);
const ResilientMyTeacher = () => (
  <ActivityRecoveryBoundary activityLabel="a página do professor">
    <MyTeacher />
  </ActivityRecoveryBoundary>
);
const ResilientStudentProgress = () => (
  <ActivityRecoveryBoundary activityLabel="o progresso de aprendizagem">
    <StudentProgress />
  </ActivityRecoveryBoundary>
);
const ResilientDailyChallenge = () => (
  <ActivityRecoveryBoundary activityLabel="o desafio diário">
    <DailyChallenge />
  </ActivityRecoveryBoundary>
);
const ResilientDashboardReal = () => (
  <ActivityRecoveryBoundary activityLabel="o painel de aprendizagem">
    <DashboardReal />
  </ActivityRecoveryBoundary>
);
const ResilientLanguageSelect = () => (
  <ActivityRecoveryBoundary activityLabel="a seleção de idiomas">
    <LanguageSelect />
  </ActivityRecoveryBoundary>
);
const ResilientRanking = () => (
  <ActivityRecoveryBoundary activityLabel="o ranking de aprendizagem">
    <Ranking />
  </ActivityRecoveryBoundary>
);
const ResilientAchievements = () => (
  <ActivityRecoveryBoundary activityLabel="as conquistas de aprendizagem">
    <Achievements />
  </ActivityRecoveryBoundary>
);
const ResilientLessonHistory = () => (
  <ActivityRecoveryBoundary activityLabel="o histórico de lições">
    <LessonHistory />
  </ActivityRecoveryBoundary>
);
const ResilientCertificates = () => (
  <ActivityRecoveryBoundary activityLabel="os certificados de aprendizagem">
    <Certificates />
  </ActivityRecoveryBoundary>
);
const ResilientPronunciationHistory = () => (
  <ActivityRecoveryBoundary activityLabel="o histórico de pronúncia">
    <PronunciationHistory />
  </ActivityRecoveryBoundary>
);
const ResilientOnboarding = () => (
  <ActivityRecoveryBoundary activityLabel="a configuração inicial">
    <Onboarding />
  </ActivityRecoveryBoundary>
);
const ResilientIANativa = () => (
  <ActivityRecoveryBoundary activityLabel="a IA de estudo">
    <IANativa />
  </ActivityRecoveryBoundary>
);
const ResilientAIMonitor = () => (
  <ActivityRecoveryBoundary activityLabel="o monitor de IA">
    <AIMonitor />
  </ActivityRecoveryBoundary>
);
const ResilientLanguageDetect = () => (
  <ActivityRecoveryBoundary activityLabel="a detecção de idioma">
    <LanguageDetect />
  </ActivityRecoveryBoundary>
);
const ResilientParentalControl = () => (
  <ActivityRecoveryBoundary activityLabel="o controle parental">
    <ParentalControlPanel />
  </ActivityRecoveryBoundary>
);
const ResilientBackupGuide = () => (
  <ActivityRecoveryBoundary activityLabel="o guia de backup">
    <BackupGuide />
  </ActivityRecoveryBoundary>
);
const ResilientDemo = () => (
  <ActivityRecoveryBoundary activityLabel="a demonstração guiada">
    <Demo />
  </ActivityRecoveryBoundary>
);
const ResilientCustomerSupport = () => (
  <ActivityRecoveryBoundary activityLabel="o suporte privado">
    <CustomerSupport />
  </ActivityRecoveryBoundary>
);
const ResilientAdminControlCenter = () => (
  <ActivityRecoveryBoundary activityLabel="o centro de controle">
    <AdminControlCenter />
  </ActivityRecoveryBoundary>
);
const ResilientAdminUpdates = () => (
  <ActivityRecoveryBoundary activityLabel="as atualizações administrativas">
    <AdminUpdates />
  </ActivityRecoveryBoundary>
);
const Onboarding = lazy(() => import("./pages/Onboarding"));
const AIMonitor = lazy(() => import("./pages/AIMonitor"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const LanguageDetect = lazy(() => import("./pages/LanguageDetect"));
const AdminUpdates = lazy(() => import("./pages/AdminUpdates"));
const AdminControlCenter = lazy(() => import("./pages/AdminControlCenter"));
const LanguageSelect = lazy(() => import("./pages/LanguageSelect"));
const FreeTalk = lazy(() => import("./pages/FreeTalk"));
const DailyMemoryPage = lazy(() => import("./pages/DailyMemoryPage"));
const MyTeacher = lazy(() => import("./pages/MyTeacher"));
const ImmersiveLesson = lazy(() => import("./pages/ImmersiveLesson"));
const LessonsHub = lazy(() => import("./pages/LessonsHub"));
const Demo = lazy(() => import("./pages/DemoA1"));
const BeachDemo = lazy(() => import("./pages/BeachDemo"));
const ImmersiveDialogue = lazy(() => import("./pages/ImmersiveDialogue"));
const NaturalLearning = lazy(() => import("./pages/NaturalLearning"));
const NaturalLesson = lazy(() => import("./pages/NaturalLesson"));
const MasterLesson = lazy(() => import("./pages/MasterLesson"));
const IANativa = lazy(() => import("./pages/IANativa"));
const SmartReview = lazy(() => import("./pages/SmartReview"));
const ParentalControlPanel = lazy(() => import("./pages/ParentalControlPanel"));
const StudyBase = lazy(() => import("./pages/StudyBase"));
const Pareto1000 = lazy(() => import("./pages/Pareto1000"));
const ABCBook = lazy(() => import("./pages/ABCBook"));
const BackupGuide = lazy(() => import("./pages/BackupGuide"));
const CustomerSupport = lazy(() => import("./pages/CustomerSupport"));
import LocalAINotification from "./components/LocalAINotification";
import { LipSyncSetupGuide } from "./components/LipSyncSetupGuide";
import ConnectivityIndicator from "./components/ConnectivityIndicator";
import { QuickStudyAccess } from "./components/QuickStudyAccess";
import { LearningAccessGate } from "./components/LearningAccessGate";

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
        <Route path="/demo-scene" component={BeachDemo} />
        <Route path="/onboarding" component={ResilientOnboarding} />
        <Route path="/dashboard" component={ResilientDashboardReal} />
        <Route path="/dashboard-real" component={ResilientDashboardReal} />
      <Route path={"/lesson/:id"} component={ResilientLessonRoute} />
       <Route path="/complete-lesson/:id" component={ResilientCompleteLesson} />
      <Route path="/practice/clips" component={ResilientPracticeClips} />
      <Route path="/practice/clips/:id" component={ResilientVideoPlayer} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/avatar-selection"} component={AvatarSelection} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/admin/regenerate-lessons"} component={AdminRegenerateLessons} />
      <Route path={"/admin-lesson-generator"} component={AdminLessonGenerator} />
      <Route path={"/admin/moderation"} component={AdminModeration} />
      <Route path={"/admin/siga"} component={AdminSIGA} />
      <Route path={"/upgrade"} component={Upgrade} />
      <Route path={"/chat"} component={ResilientAiChat} />
      <Route path={"/ai-chat"} component={ResilientAiChat} />
      <Route path={"/finance"} component={Finance} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/pricing-comparison"} component={PricingComparison} />
      <Route path={"/prelaunch"} component={PreLaunch} />
      <Route path={"/pre-launch"} component={PreLaunch} />
      <Route path="/phrasal-verbs-exercises" component={ResilientPhrasalVerbsExercises} />
      <Route path="/interactive-videos" component={ResilientInteractiveVideos} />
        <Route path="/reels" component={ResilientReels} />
        <Route path="/roleplay" component={ResilientRoleplay} />
        <Route path="/clips" component={ResilientClips} />
        <Route path="/ar-teacher" component={ResilientARTeacher} />
        <Route path="/pricing-assistencial" component={PricingAssistencial} />
        <Route path="/sales-dashboard" component={SalesDashboard} />
        <Route path="/crm" component={CRMLeads} />
        <Route path="/crm-leads" component={CRMLeads} />
        <Route path="/ar-mode" component={ResilientARMode} />
        <Route path="/ar-ultimate" component={ResilientARMode} />
        <Route path="/vr-conversation" component={ResilientVRConversation} />
        <Route path="/free-talk" component={ResilientFreeTalk} />
        <Route path="/word-game" component={ResilientWordGame} />
        <Route path="/ranking" component={ResilientRanking} />
        <Route path="/daily-challenge" component={ResilientDailyChallenge} />
        <Route path="/progress" component={ResilientStudentProgress} />
        <Route path="/subscription-plans" component={SubscriptionPlans} />
        <Route path="/achievements" component={ResilientAchievements} />
        <Route path="/lesson-history" component={ResilientLessonHistory} />
        <Route path="/battle" component={ResilientBattleMode} />
        <Route path="/certificates" component={ResilientCertificates} />
        <Route path="/pronunciation-history" component={ResilientPronunciationHistory} />
        <Route path="/structured-lesson" component={ResilientStructuredLesson} />
        <Route path="/immersive-scene" component={ResilientImmersiveScene} />
        <Route path="/ai-monitor" component={ResilientAIMonitor} />
        <Route path="/terms" component={TermsOfUse} />
        <Route path="/language-detect" component={ResilientLanguageDetect} />
        <Route path="/admin/updates" component={ResilientAdminUpdates} />
        <Route path="/admin/control-center" component={ResilientAdminControlCenter} />
        <Route path="/language-select" component={ResilientLanguageSelect} />
        <Route path="/daily-memory" component={ResilientDailyMemory} />
        <Route path="/my-teacher" component={ResilientMyTeacher} />
        <Route path="/immersive-lesson" component={ResilientImmersiveLesson} />
        <Route path="/lessons-hub" component={ResilientLessonsHub} />
        <Route path="/demo" component={ResilientDemo} />
        <Route path="/dialogue" component={ResilientImmersiveDialogue} />
        <Route path="/natural-learning" component={ResilientNaturalLearning} />
        <Route path="/natural-lesson" component={ResilientNaturalLesson} />
        <Route path="/master-lesson" component={ResilientMasterLesson} />
        <Route path="/ia-nativa" component={ResilientIANativa} />
        <Route path="/smart-review" component={ResilientSmartReview} />
        <Route path="/parental-control" component={ResilientParentalControl} />
        <Route path="/base-de-estudos" component={ResilientStudyBase} />
        <Route path="/abc-book" component={ResilientABCBook} />
        <Route path="/pareto-1000" component={ResilientPareto1000} />
        <Route path="/guia-backup" component={ResilientBackupGuide} />
        <Route path="/suporte" component={ResilientCustomerSupport} />
      <Route path={"/ 404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  useEffect(() => {
    // Registrar Service Worker para offline
    registerServiceWorker();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <OfflineStatusBar />
          <UpdatesNotificationBanner />
          <Suspense fallback={<PageLoader />}>
            <LearningAccessGate>
              <Router />
            </LearningAccessGate>
          </Suspense>
          <FeedbackButton />
          <LipSyncSetupGuide />
          <QuickStudyAccess />
          <LocalAINotification />
          <ConnectivityIndicator />
          <TourButton />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
