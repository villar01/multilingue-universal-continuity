import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  Trophy, 
  Flame, 
  Globe,
  Play,
  Lock,
  Award,
  Sparkles,
  Loader2,
  GraduationCap,
  TrendingUp,
  Briefcase,
  Cpu,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";

// ─── Tipos de nível de curso ────────────────────────────────────────────────
type CourseLevel = "basico" | "intermediario" | "avancado" | "negocios_tecnologia";

interface LevelOption {
  id: CourseLevel;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;
}

const LEVEL_OPTIONS: LevelOption[] = [
  {
    id: "basico",
    label: "Básico",
    description: "Primeiros passos no idioma",
    icon: <GraduationCap className="h-6 w-6" />,
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    activeBg: "bg-green-600",
    activeBorder: "border-green-600",
    activeText: "text-white",
  },
  {
    id: "intermediario",
    label: "Intermediário",
    description: "Expanda seu vocabulário",
    icon: <BookOpen className="h-6 w-6" />,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    activeBg: "bg-blue-600",
    activeBorder: "border-blue-600",
    activeText: "text-white",
  },
  {
    id: "avancado",
    label: "Avançado",
    description: "Fluência e expressões",
    icon: <TrendingUp className="h-6 w-6" />,
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    activeBg: "bg-purple-600",
    activeBorder: "border-purple-600",
    activeText: "text-white",
  },
  {
    id: "negocios_tecnologia",
    label: "Negócios / Tecnologia",
    description: "Vocabulário profissional",
    icon: <Briefcase className="h-6 w-6" />,
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    activeBg: "bg-orange-600",
    activeBorder: "border-orange-600",
    activeText: "text-white",
  },
];

// Mapeia nível → palavras-chave para filtrar lições
const LEVEL_KEYWORDS: Record<CourseLevel, string[]> = {
  basico: ["basic", "basics", "beginner", "introduction", "intro", "greetings", "alphabet", "numbers", "colors", "family", "food", "animals", "body", "clothes", "weather", "school", "a1", "a2", "básico", "iniciante", "introdução", "saudações", "números", "cores", "família", "animais"],
  intermediario: ["intermediate", "conversation", "grammar", "tenses", "vocabulary", "phrases", "b1", "b2", "intermediário", "conversação", "gramática", "tempos verbais", "vocabulário"],
  avancado: ["advanced", "fluency", "idioms", "expressions", "phrasal", "literature", "c1", "c2", "avançado", "fluência", "expressões", "literatura", "verbos frasais"],
  negocios_tecnologia: ["business", "technology", "tech", "professional", "finance", "marketing", "email", "meeting", "presentation", "startup", "ai", "software", "negócios", "tecnologia", "profissional", "finanças", "reunião", "apresentação"],
};

function matchesLevel(lesson: { title: string; description?: string | null }, level: CourseLevel): boolean {
  const keywords = LEVEL_KEYWORDS[level];
  const text = `${lesson.title} ${lesson.description || ""}`.toLowerCase();
  return keywords.some(kw => text.includes(kw));
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function DashboardReal() {
  const { user, logout } = useAuth();
  const [selectedLanguageId, setSelectedLanguageId] = useState<number>(() => {
    try {
      const savedId = localStorage.getItem("ml_target_lang_id");
      if (savedId && Number(savedId) > 0) return Number(savedId);
    } catch {}
    return 1; // Default: English (id=1)
  });

  // Nível persistido em localStorage
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel>(() => {
    try {
      return (localStorage.getItem("multilingue_course_level") as CourseLevel) || "basico";
    } catch {
      return "basico";
    }
  });

  const handleLevelChange = (level: CourseLevel) => {
    setSelectedLevel(level);
    try {
      localStorage.setItem("multilingue_course_level", level);
    } catch {}
  };

  // Buscar idiomas disponíveis
  const { data: languages, isLoading: loadingLanguages } = trpc.languages.list.useQuery();

  // Buscar cursos do idioma selecionado (do banco, sem fórmula hardcoded)
  const { data: languageCourses } = trpc.courses.getByLanguage.useQuery(
    { languageId: selectedLanguageId },
    { enabled: selectedLanguageId > 0 }
  );

  // Mapear nível do curso para o level do banco
  const levelToDbLevel: Record<CourseLevel, string> = {
    basico: 'beginner',
    intermediario: 'intermediate',
    avancado: 'advanced',
    negocios_tecnologia: 'beginner',
  };

  // Encontrar o courseId correto buscando no banco pelo level
  const dbLevel = levelToDbLevel[selectedLevel];
  const matchedCourse = (languageCourses as any[])?.find(
    (c: any) => c.level === dbLevel
  );
  // Fallback: se não encontrar o level exato, usar o primeiro curso do idioma
  const courseId = matchedCourse?.id ?? (languageCourses as any[])?.[0]?.id ?? 0;

  // Buscar lições do curso correspondente ao idioma + nível
  const { data: courseData, isLoading: loadingLessons } = trpc.lessons.getByCourse.useQuery(
    { courseId, limit: 200, offset: 0 },
    { enabled: courseId > 0 }
  );

  const allLangLessons = Array.isArray((courseData as any)?.lessons) ? (courseData as any).lessons : [];
  // Mostrar todas as lições do curso (já filtradas por nível via courseId)
  const displayLessons = allLangLessons;

  // Carregar idioma alvo do localStorage (definido no Onboarding/Home)
  useEffect(() => {
    if (languages && languages.length > 0) {
      const savedId = localStorage.getItem("ml_target_lang_id");
      const savedCode = localStorage.getItem("ml_target_lang");
      if (savedId && Number(savedId) > 0) {
        const match = languages.find((l: any) => l.id === Number(savedId));
        if (match && match.id !== selectedLanguageId) {
          setSelectedLanguageId(match.id);
        }
      } else if (savedCode) {
        const prefix = savedCode.split('-')[0];
        const match = languages.find((l: any) => l.code === prefix || l.code === savedCode);
        if (match && match.id !== selectedLanguageId) {
          setSelectedLanguageId(match.id);
        }
      }
    }
  }, [languages]);

  // Premium check: user has paid subscription
  const isPremium = (user as any)?.subscriptionTier === 'premium' || (user as any)?.subscriptionTier === 'vip' || (user as any)?.subscriptionType === 'monthly' || (user as any)?.subscriptionType === 'annual' || (user as any)?.subscriptionType === 'lifetime';
  const freeLessonsLimit = 5; // Lições 1-5 grátis, 6+ requer Premium
  const premiumLessonsTotal = 200;

  // Status de IA nativa local (Ollama / LM Studio)
  const { data: iaNativaStatus } = trpc.offlineAI.getStatus.useQuery(undefined, { refetchInterval: 15000, retry: false });
  const ollamaOnline = (iaNativaStatus as any)?.ollama ?? false;
  const lmstudioOnline = (iaNativaStatus as any)?.lmstudio ?? false;
  const iaNativaAtiva = ollamaOnline || lmstudioOnline;

  const { data: gamificationStats } = trpc.gamification.getStats.useQuery(undefined, { enabled: !!user, retry: false });
  const userProgress = {
    currentStreak: (gamificationStats as any)?.streak_days ?? 0,
    totalXP: (gamificationStats as any)?.total_xp ?? 0,
    lessonsCompleted: (gamificationStats as any)?.lessons_completed ?? 0,
    currentLevel: (gamificationStats as any)?.current_level ?? 1,
  };

  const selectedLanguage = languages?.find(l => l.id === selectedLanguageId);
  const currentLevelOption = LEVEL_OPTIONS.find(l => l.id === selectedLevel)!;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header data-tour="tour-dash-level" className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <Globe className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold">MultiLingue Universal</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-orange-600">
                <Flame className="h-5 w-5" />
                <span className="font-bold">{userProgress.currentStreak} dias</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-600">
                <Trophy className="h-5 w-5" />
                <span className="font-bold">{userProgress.totalXP} XP</span>
              </div>
              <Button variant="ghost" onClick={logout}>Sair</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Olá, {user?.name}! 👋</h1>
          <p className="text-gray-600">Continue sua jornada de aprendizado hoje</p>
        </div>

        {/* ── BANNER PRINCIPAL: CENAS IMERSIVAS ──────────────────── */}
        <Link href="/immersive-scene">
          <div className="mb-6 cursor-pointer group relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 hover:scale-[1.01]" style={{background:'linear-gradient(135deg,#1e3a5f 0%,#0f4c81 45%,#1a6b5a 100%)'}}>
            <div className="relative p-6 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="text-6xl">🌍</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-black text-2xl">Aulas em Cenas Imersivas</span>
                    <span className="bg-orange-400 text-orange-900 text-xs font-bold px-2 py-0.5 rounded-full">PRINCIPAL</span>
                  </div>
                  <p className="text-blue-200 text-sm mb-2">Paris • Praia • Tokyo • Nova York • Floresta • Cozinha • e muito mais</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">🇺🇸 Inglês</span>
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">🇪🇸 Espanhol</span>
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">🇫🇷 Francês</span>
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">🇧🇷 Português</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 bg-orange-500 group-hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-xl transition-all text-lg">
                Entrar →
              </div>
            </div>
          </div>
        </Link>

        <div data-tour="tour-dash-lessons" className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── SELETOR DE NÍVEL ─────────────────────────────────────── */}
            <Card className="border-2 border-blue-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  Qual nível de curso você deseja?
                </CardTitle>
                <CardDescription>
                  Escolha o nível e as lições serão filtradas automaticamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {LEVEL_OPTIONS.map((level) => {
                    const isActive = selectedLevel === level.id;
                    return (
                      <button
                        key={level.id}
                        onClick={() => handleLevelChange(level.id)}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-center
                          ${isActive
                            ? `${level.activeBg} ${level.activeBorder} ${level.activeText} shadow-md scale-105`
                            : `${level.bgColor} ${level.borderColor} ${level.color} hover:scale-102 hover:shadow-sm`
                          }`}
                      >
                        <div className={`${isActive ? "text-white" : level.color}`}>
                          {level.icon}
                        </div>
                        <span className="font-bold text-sm leading-tight">{level.label}</span>
                        <span className={`text-xs leading-tight ${isActive ? "text-white/80" : "text-gray-500"}`}>
                          {level.description}
                        </span>
                        {isActive && (
                          <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full opacity-80" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* Indicador do nível ativo */}
                <div className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-lg ${currentLevelOption.bgColor} ${currentLevelOption.borderColor} border`}>
                  <span className={currentLevelOption.color}>{currentLevelOption.icon}</span>
                  <span className={`font-semibold text-sm ${currentLevelOption.color}`}>
                    Nível selecionado: {currentLevelOption.label}
                  </span>
                  <ChevronRight className={`h-4 w-4 ml-auto ${currentLevelOption.color}`} />
                  <span className="text-xs text-gray-500">
                    {displayLessons.length > 0 ? `${displayLessons.length} lições encontradas` : 'Carregando...'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Premium Upgrade Banner */}
            {!isPremium && (
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">🎁 Versão Gratuita — 10 Lições</h3>
                      <p className="text-gray-700 mb-4">
                        Desbloqueie <strong>200 lições completas</strong>, <strong>todos os 69 idiomas</strong> e
                        recursos premium!
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary" className="bg-white">✅ 200 lições por idioma</Badge>
                        <Badge variant="secondary" className="bg-white">✅ 69 idiomas</Badge>
                        <Badge variant="secondary" className="bg-white">✅ Todos os níveis</Badge>
                      </div>
                      <Link href="/checkout">
                        <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                          ⭐ Upgrade para Premium — R$ 59,00/mês
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Language Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Selecione seu Idioma
                </CardTitle>
                <CardDescription>
                  {isPremium ? "69 idiomas disponíveis" : "1 idioma na versão gratuita"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingLanguages ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="p-4 rounded-lg border-2 border-gray-200">
                        <Skeleton className="h-8 w-8 rounded-full mb-2" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {languages?.slice(0, isPremium ? undefined : 1).map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => setSelectedLanguageId(lang.id)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedLanguageId === lang.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="text-3xl mb-2">{lang.flag}</div>
                        <div className="font-semibold text-sm">{lang.name}</div>
                      </button>
                    ))}
                    {!isPremium && (
                      <div className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 flex flex-col items-center justify-center">
                        <Lock className="h-8 w-8 text-gray-400 mb-2" />
                        <div className="text-xs text-gray-500 text-center">+56 idiomas</div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course Progress */}
            {selectedLanguage && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {selectedLanguage.flag} {selectedLanguage.name}
                  </CardTitle>
                  <CardDescription>
                    {userProgress.lessonsCompleted} de {isPremium ? premiumLessonsTotal : freeLessonsLimit} lições completadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress
                    value={(userProgress.lessonsCompleted / (isPremium ? premiumLessonsTotal : freeLessonsLimit)) * 100}
                    className="h-3 mb-4"
                  />
                  {!isPremium && userProgress.lessonsCompleted >= 8 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                      <p className="text-sm text-gray-700">
                        🎉 <strong>Parabéns!</strong> Você completou {userProgress.lessonsCompleted} de 10 lições gratuitas.
                        Faça upgrade para continuar!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Lessons List — filtradas pelo nível */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Lições — Nível {currentLevelOption.label}
                </CardTitle>
                <CardDescription>
                  {displayLessons.length > 0
                    ? `${displayLessons.length} lições para o nível ${currentLevelOption.label}`
                    : loadingLessons ? "Carregando..." : isPremium ? "200 lições disponíveis" : "5 lições gratuitas"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingLessons ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-lg" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-20 rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : displayLessons.length > 0 ? (
                  displayLessons.map((lesson: any, index: number) => {
                    const isLocked = !isPremium && index >= freeLessonsLimit;
                    const isCompleted = index < userProgress.lessonsCompleted;

                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                          isLocked
                            ? "bg-gray-50 border-gray-200"
                            : isCompleted
                            ? "bg-green-50 border-green-200"
                            : "bg-blue-50 border-blue-200 hover:border-blue-400 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {isLocked ? (
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <Lock className="h-6 w-6 text-gray-400" />
                            </div>
                          ) : isCompleted ? (
                            <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                              <Award className="h-6 w-6 text-white" />
                            </div>
                          ) : (
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${currentLevelOption.activeBg}`}>
                              <Play className="h-6 w-6 text-white" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold">{lesson.title}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <span>Lição {lesson.orderIndex} • 15 min</span>
                              <Badge variant="outline" className={`text-xs ${currentLevelOption.color} ${currentLevelOption.borderColor}`}>
                                {currentLevelOption.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {isLocked ? (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                            🔒 Premium
                          </Badge>
                        ) : (
                          <Link href={`/lesson/${lesson.id}`}>
                            <Button size="sm" className={isCompleted ? "" : currentLevelOption.activeBg}>
                              {isCompleted ? "Revisar" : "Começar"}
                            </Button>
                          </Link>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <GraduationCap className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">Nenhuma lição encontrada para o nível {currentLevelOption.label}</p>
                    <p className="text-sm mt-1">Novas lições serão adicionadas em breve</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Nível Ativo Card */}
            <Card className={`border-2 ${currentLevelOption.borderColor}`}>
              <CardHeader className="pb-2">
                <CardTitle className={`flex items-center gap-2 text-base ${currentLevelOption.color}`}>
                  {currentLevelOption.icon}
                  Nível Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${currentLevelOption.color} mb-1`}>
                  {currentLevelOption.label}
                </div>
                <div className="text-sm text-gray-500">{currentLevelOption.description}</div>
                <div className="mt-3 flex flex-col gap-2">
                  {LEVEL_OPTIONS.filter(l => l.id !== selectedLevel).map(l => (
                    <button
                      key={l.id}
                      onClick={() => handleLevelChange(l.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${l.bgColor} ${l.color} hover:opacity-80 transition-opacity`}
                    >
                      {l.icon}
                      <span className="font-medium">{l.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* IA Nativa Status */}
            <Card className={`border-2 ${iaNativaAtiva ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"}`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Cpu className={`h-5 w-5 ${iaNativaAtiva ? "text-green-600" : "text-amber-600"}`} />
                  Runtime local do servidor
                </CardTitle>
              </CardHeader>
              <CardContent>
                {iaNativaAtiva ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Provedor local do servidor ativo
                    </div>
                    <div className="text-xs text-green-600">
                      {ollamaOnline && "Ollama: Online"}
                      {ollamaOnline && lmstudioOnline && " · "}
                      {lmstudioOnline && "LM Studio: Online"}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
                      <AlertCircle className="h-4 w-4" />
                      Provedor local do servidor indisponível
                    </div>
                    <p className="text-xs text-amber-600">
                      A página mostra somente provedores acessíveis ao servidor. Um modelo no computador do aluno requer integração cliente-local explícita.
                    </p>
                    <Link href="/ia-nativa">
                      <Button size="sm" variant="outline" className="w-full mt-2 border-amber-400 text-amber-700 hover:bg-amber-100">
                        Saber como instalar →
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recursos Especiais */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Recursos Especiais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/natural-learning">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all text-left shadow-lg border border-violet-400/30">
                    <span className="text-xl">🧠</span>
                    <div>
                      <div className="font-semibold text-white text-sm">Aprendizado Natural</div>
                      <div className="text-xs text-violet-200">Infância → Fluente · Como o cérebro aprende</div>
                    </div>
                    <span className="ml-auto text-xs bg-yellow-400 text-black font-bold px-1.5 py-0.5 rounded-full">NOVO</span>
                  </button>
                </Link>
                <Link href="/my-teacher">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all text-left shadow-md">
                    <span className="text-xl">👨‍🏫</span>
                    <div>
                      <div className="font-semibold text-white text-sm">Meu Professor</div>
                      <div className="text-xs text-purple-200">Escolha seu professor pessoal</div>
                    </div>
                  </button>
                </Link>
                <Link href="/free-talk">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 transition-all text-left shadow-md">
                    <span className="text-xl">🎙️</span>
                    <div>
                      <div className="font-semibold text-white text-sm">FreeTalk — Conversação Livre</div>
                      <div className="text-xs text-green-200">Fale com IA nativa em inglês</div>
                    </div>
                  </button>
                </Link>
                <Link href="/immersive-lesson">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all text-left shadow-md">
                    <span className="text-xl">🎓</span>
                    <div>
                      <div className="font-semibold text-white text-sm">Aula Imersiva</div>
                      <div className="text-xs text-indigo-200">Professor real + voz neural + XP</div>
                    </div>
                  </button>
                </Link>
                <Link href="/ar-mode">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all text-left shadow-md">
                    <span className="text-xl">✨</span>
                    <div>
                      <div className="font-semibold text-white text-sm">Modo Imersivo AR</div>
                      <div className="text-xs text-violet-200">IA Avançada + AR + Voz Neural</div>
                    </div>
                  </button>
                </Link>
                <Link href="/ar-teacher">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 hover:from-purple-100 hover:to-blue-100 transition-all text-left">
                    <span className="text-xl">🥽</span>
                    <div>
                      <div className="font-semibold text-purple-800 text-sm">Realidade Aumentada</div>
                      <div className="text-xs text-gray-500">Professor em AR</div>
                    </div>
                  </button>
                </Link>
                <Link href="/pricing-assistencial">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all text-left">
                    <span className="text-xl">🏛️</span>
                    <div>
                      <div className="font-semibold text-green-800 text-sm">Planos Assistenciais</div>
                      <div className="text-xs text-gray-500">Descontos fiscais federais</div>
                    </div>
                  </button>
                </Link>
                <Link href="/chat">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 hover:from-blue-100 hover:to-cyan-100 transition-all text-left">
                    <span className="text-xl">🤖</span>
                    <div>
                      <div className="font-semibold text-blue-800 text-sm">IA Conversacional</div>
                      <div className="text-xs text-gray-500">Pratique em tempo real</div>
                    </div>
                  </button>
                </Link>
                <Link href="/roleplay">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 hover:from-orange-100 hover:to-yellow-100 transition-all text-left">
                    <span className="text-xl">🎭</span>
                    <div>
                      <div className="font-semibold text-orange-800 text-sm">Roleplay Interativo</div>
                      <div className="text-xs text-gray-500">Simule conversas reais</div>
                    </div>
                  </button>
                </Link>
                <Link href="/sales-dashboard">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 hover:from-indigo-100 hover:to-purple-100 transition-all text-left">
                    <span className="text-xl">📊</span>
                    <div>
                      <div className="font-semibold text-indigo-800 text-sm">Painel de Vendas</div>
                      <div className="text-xs text-gray-500">CRM & Analytics interno</div>
                    </div>
                  </button>
                </Link>
              </CardContent>
            </Card>

            {/* Streak Card */}
            <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-6 w-6" />
                  Sequência Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold mb-2">{userProgress.currentStreak}</div>
                <div className="text-white/90">dias consecutivos</div>
              </CardContent>
            </Card>

            {/* XP Card */}
            <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6" />
                  Total de XP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold mb-2">{userProgress.totalXP}</div>
                <div className="text-white/90">pontos de experiência</div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Lições Completadas</span>
                  <span className="font-bold">{userProgress.lessonsCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Idiomas Ativos</span>
                  <span className="font-bold">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Nível</span>
                  <Badge variant="secondary" className={`${currentLevelOption.bgColor} ${currentLevelOption.color}`}>
                    {currentLevelOption.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Plano</span>
                  <Badge variant={isPremium ? "default" : "secondary"}>
                    {isPremium ? "Premium" : "Gratuito"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
