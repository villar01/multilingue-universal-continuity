import { Toaster } from "@/components/ui/sonner";
import { lazy, Suspense, useEffect } from "react";
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
import { registerServiceWorker } from "./lib/registerSW";

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
const Demo = lazy(() => import("./pages/Demo"));
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
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/dashboard" component={DashboardReal} />
        <Route path="/dashboard-real" component={DashboardReal} />
      <Route path={"/lesson/:id"} component={Lesson} />
       <Route path="/complete-lesson/:id" component={CompleteLesson} />
      <Route path="/practice/clips" component={PracticeClips} />
      <Route path="/practice/clips/:id" component={VideoPlayer} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/avatar-selection"} component={AvatarSelection} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/admin/regenerate-lessons"} component={AdminRegenerateLessons} />
      <Route path={"/admin-lesson-generator"} component={AdminLessonGenerator} />
      <Route path={"/admin/moderation"} component={AdminModeration} />
      <Route path={"/admin/siga"} component={AdminSIGA} />
      <Route path={"/upgrade"} component={Upgrade} />
      <Route path={"/chat"} component={AiChat} />
      <Route path={"/ai-chat"} component={AiChat} />
      <Route path={"/finance"} component={Finance} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/pricing-comparison"} component={PricingComparison} />
      <Route path={"/prelaunch"} component={PreLaunch} />
      <Route path={"/phrasal-verbs-exercises"} component={PhrasalVerbsExercises} />
      <Route path="/interactive-videos" component={InteractiveVideos} />
        <Route path="/reels" component={ReelsPage} />
        <Route path="/roleplay" component={RoleplayPage} />
        <Route path="/clips" component={Clips} />
        <Route path="/ar-teacher" component={ARTeacher} />
        <Route path="/pricing-assistencial" component={PricingAssistencial} />
        <Route path="/sales-dashboard" component={SalesDashboard} />
        <Route path="/crm" component={CRMLeads} />
        <Route path="/crm-leads" component={CRMLeads} />
        <Route path="/ar-mode" component={ARMode} />
        <Route path="/ar-ultimate" component={ARMode} />
        <Route path="/vr-conversation" component={VRConversation} />
        <Route path="/free-talk" component={FreeTalk} />
        <Route path="/word-game" component={WordGame} />
        <Route path="/ranking" component={Ranking} />
        <Route path="/daily-challenge" component={DailyChallenge} />
        <Route path="/progress" component={StudentProgress} />
        <Route path="/subscription-plans" component={SubscriptionPlans} />
        <Route path="/achievements" component={Achievements} />
        <Route path="/lesson-history" component={LessonHistory} />
        <Route path="/battle" component={BattleMode} />
        <Route path="/certificates" component={Certificates} />
        <Route path="/pronunciation-history" component={PronunciationHistory} />
        <Route path="/structured-lesson" component={StructuredLesson} />
        <Route path="/immersive-scene" component={ImmersiveScene} />
        <Route path="/ai-monitor" component={AIMonitor} />
        <Route path="/terms" component={TermsOfUse} />
        <Route path="/language-detect" component={LanguageDetect} />
        <Route path="/admin/updates" component={AdminUpdates} />
        <Route path="/admin/control-center" component={AdminControlCenter} />
        <Route path="/language-select" component={LanguageSelect} />
        <Route path="/daily-memory" component={DailyMemoryPage} />
        <Route path="/my-teacher" component={MyTeacher} />
        <Route path="/immersive-lesson" component={ImmersiveLesson} />
        <Route path="/lessons-hub" component={LessonsHub} />
        <Route path="/demo" component={Demo} />
        <Route path="/dialogue" component={ImmersiveDialogue} />
        <Route path="/natural-learning" component={NaturalLearning} />
        <Route path="/natural-lesson" component={NaturalLesson} />
        <Route path="/master-lesson" component={MasterLesson} />
        <Route path="/ia-nativa" component={IANativa} />
        <Route path="/smart-review" component={SmartReview} />
        <Route path="/parental-control" component={ParentalControlPanel} />
        <Route path="/base-de-estudos" component={StudyBase} />
        <Route path="/abc-book" component={ABCBook} />
        <Route path="/pareto-1000" component={Pareto1000} />
        <Route path="/guia-backup" component={BackupGuide} />
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
