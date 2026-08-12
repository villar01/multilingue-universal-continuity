import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Trophy, 
  Flame, 
  TrendingUp,
  Globe,
  Play,
  Lock,
  Star,
  Calendar,
  Target,
  Award,
  Clock,
  Sparkles,
  MessageCircle,
  CreditCard
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import NotificationBell from "@/components/NotificationBell";
import Leaderboard from "@/components/Leaderboard";
import WeeklyChallenges from "@/components/WeeklyChallenges";
import ReferralWidget from "@/components/ReferralWidget";
import { SocialShare } from "@/components/SocialShare";
import NotificationCenter from "@/components/NotificationCenter";
import { buildLessonProgression } from "@/lib/lessonProgression";
import { ImmersionModeToggle } from "@/components/ImmersionModeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { getUIStrings } from "@/lib/i18n";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { profile, immersionMode } = useLanguage();
  const targetStrings = getUIStrings(profile.targetCode);
  
  // Buscar estatísticas reais do usuário
  const { data: userStats, isLoading: loadingStats } = trpc.progress.getStats.useQuery(undefined, {
    enabled: !!user,
  });
  
  // Buscar conquistas do usuário
  const { data: userAchievements, isLoading: loadingAchievements } = trpc.achievements.getUserAchievements.useQuery(undefined, {
    enabled: !!user,
  });
  
  // Registros reais que determinam o avanço linear das aulas.
  const { data: completedLessonRows = [] } = trpc.progress.getCompletedLessons.useQuery(undefined, {
    enabled: !!user,
  });
  
  // Buscar idiomas disponíveis
  const { data: languages } = trpc.languages.list.useQuery();
  
  // Buscar idioma-alvo do perfil do usuário (salvo no Onboarding)
  const targetLanguageCode = (() => {
    try {
      const profile = JSON.parse(localStorage.getItem("ml_lang_profile") || "{}");
      return profile.targetCode || localStorage.getItem("ml_target_lang") || "en-US";
    } catch { return "en-US"; }
  })();

  const targetLangId = (() => {
    try {
      const stored = localStorage.getItem("ml_target_lang_id");
      if (stored) return parseInt(stored);
    } catch {}
    // Fallback: encontrar idioma-alvo pelo código
    const lang = languages?.find(l => l.code === targetLanguageCode || l.code === targetLanguageCode.split('-')[0]);
    return lang?.id || 1;
  })();

  const { data: courses } = trpc.courses.getByLanguage.useQuery(
    { languageId: targetLangId },
    { enabled: !!languages && languages.length > 0 }
  );
  
  const { data: lessons } = trpc.lessons.getByCourse.useQuery(
    { courseId: courses?.[0]?.id || 1 },
    { enabled: !!courses && courses.length > 0 }
  );

  const { data: adaptivePath } = trpc.adaptive.getPath.useQuery(
    { targetLanguage: targetLanguageCode },
    { enabled: !!user }
  );
  const { data: adaptiveRecommendation } = trpc.adaptive.getRecommendation.useQuery(
    { targetLanguage: targetLanguageCode },
    { enabled: !!user }
  );
  
  // Verificar se usuário tem plano premium
  const isPremium = user?.subscriptionType !== "free";
  const freeLessonsLimit = 5;
  const premiumLessonsTotal = 200;
  
  // Usar dados reais ou fallback
  const currentStreak = userStats?.currentStreak || 0;
  const totalXP = userStats?.totalXp || 0;
  const level = userStats?.level || 1;
  const lessonsCompleted = userStats?.totalLessonsCompleted || 0;
  const totalLessons = isPremium ? premiumLessonsTotal : freeLessonsLimit;
  
  // Avanço linear: o aluno pode revisar aulas concluídas e abrir somente a
  // primeira aula ainda não concluída. As seguintes permanecem bloqueadas.
  const nextLessons = buildLessonProgression(
    (lessons as any)?.lessons || [],
    (completedLessonRows as any[]).map((row: any) => row.lessonId),
    isPremium,
    freeLessonsLimit,
  ).map((lesson: any) => ({
    ...lesson,
    language: lesson.language || "Idioma selecionado",
    duration: "15 min",
  }));
  
  // Conquistas recentes (últimas 3)
  const recentAchievements = userAchievements?.slice(0, 3).map(ua => ({
    id: ua.achievement.id,
    name: ua.achievement.name,
    icon: ua.achievement.icon || "🏆",
    date: new Date(ua.unlockedAt).toLocaleDateString('pt-BR')
  })) || [];
  
  if (loadingStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seu progresso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <Globe className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold">MultiLingue Universal</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/chat">
                <Button variant="outline" size="sm" className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Chat IA
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="sm" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  Assinar
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-orange-600">
                <Flame className="h-5 w-5" />
                <span className="font-bold">{currentStreak} dias</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-600">
                <Trophy className="h-5 w-5" />
                <span className="font-bold">{totalXP} XP</span>
              </div>
              <ImmersionModeToggle compact />
              <NotificationBell />
              <Button variant="ghost" onClick={logout}>Sair</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section with Global Progress */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {immersionMode ? `${targetStrings.dashboard}, ${user?.name}!` : `Olá, ${user?.name}! 👋`}
          </h1>
          <p className="text-gray-600 mb-4">
            {immersionMode ? `${targetStrings.continue} ${targetStrings.lessons.toLowerCase()}.` : "Continue sua jornada de aprendizado hoje"}
          </p>
          {/* Global Progress Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">{immersionMode ? targetStrings.progress : "Progresso do curso"}</span>
              <span className="text-sm font-bold text-indigo-600">
                {Math.round((lessonsCompleted / Math.max(totalLessons, 1)) * 100)}%
              </span>
            </div>
            <Progress
              value={(lessonsCompleted / Math.max(totalLessons, 1)) * 100}
              className="h-3"
            />
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>{immersionMode ? `${lessonsCompleted}/${totalLessons} ${targetStrings.lessons}` : `${lessonsCompleted} de ${totalLessons} lições completas`}</span>
              <span>{immersionMode ? `${targetStrings.level} ${level}` : `Nível ${level}`} · {level <= 2 ? 'A1-A2' : level <= 4 ? 'B1-B2' : 'C1-C2'}</span>
            </div>
          </div>
          {adaptiveRecommendation && (
            <Card className="mt-4 border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50">
              <CardContent className="p-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <div className="mt-0.5 rounded-xl bg-indigo-600 p-2 h-fit"><Target className="h-5 w-5 text-white" /></div>
                  <div>
                    <p className="font-semibold text-indigo-950">Próximo passo personalizado</p>
                    <p className="text-sm text-slate-600">{adaptiveRecommendation.reason}</p>
                    {adaptivePath && (
                      <p className="text-xs text-slate-500 mt-1">
                        Nível recomendado: {adaptivePath.level} · Pontos a reforçar: {adaptivePath.weakAreas.length ? adaptivePath.weakAreas.join(", ") : "nenhum no momento"}
                      </p>
                    )}
                  </div>
                </div>
                {adaptiveRecommendation.type === "review" && (
                  <Link href="/smart-review"><Button size="sm" variant="outline" className="border-indigo-200 text-indigo-700">Revisar agora</Button></Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Premium Upgrade Banner - Only for free users */}
            {!isPremium && (
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">🎁 Versão Gratuita - 5 Lições</h3>
                      <p className="text-gray-700 mb-4">
                        Você está usando a versão gratuita com <strong>5 lições de demonstração</strong>. 
                        Desbloqueie <strong>200 lições completas</strong>, <strong>todos os 69 idiomas</strong> e 
                        recursos premium com o plano pago. Novas lições são adicionadas regularmente!
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary" className="bg-white">✅ 200 lições por idioma</Badge>
                        <Badge variant="secondary" className="bg-white">✅ 69 idiomas desbloqueados</Badge>
                        <Badge variant="secondary" className="bg-white">✅ Conteúdo infinito futuro</Badge>
                        <Badge variant="secondary" className="bg-white">✅ Modo offline</Badge>
                      </div>
              <Link href="/checkout">
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                  ⭐ Upgrade para Premium - R$ 59,00/mês
                </Button>
              </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Languages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Seus Idiomas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🇺🇸</span>
                      <div>
                        <div className="font-semibold">Inglês</div>
                        <div className="text-sm text-gray-500">Nível {level}</div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {lessonsCompleted} de {totalLessons} lições
                    </Badge>
                  </div>
                  <Progress 
                    value={(lessonsCompleted / totalLessons) * 100} 
                    className="h-2" 
                  />
                  {!isPremium && lessonsCompleted >= 4 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-gray-700">
                        🎉 <strong>Parabéns!</strong> Você completou {lessonsCompleted} de 5 lições gratuitas. 
                        Faça upgrade para continuar aprendendo!
                      </p>
                    </div>
                  )}
                </div>
                
                <Button variant="outline" className="w-full mt-4" disabled={!isPremium}>
                  <Globe className="mr-2 h-4 w-4" />
                  {isPremium ? 'Adicionar Novo Idioma' : '🔒 Desbloqueie 56 idiomas com Premium'}
                </Button>
              </CardContent>
            </Card>

            {/* Next Lessons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Próximas Lições
                </CardTitle>
                <CardDescription>
                  Continue de onde parou
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Level A1-A2: Iniciante */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e' }} />
                    <h4 className="font-bold text-sm text-gray-700">Nível A1-A2 · Iniciante</h4>
                    <span className="text-xs text-gray-400">(Lições 1-10)</span>
                  </div>
                  <div className="space-y-2">
                    {nextLessons.filter((l: any) => (l.orderIndex || 1) <= 10).map((lesson: any) => (
                      <div key={lesson.id} className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${(lesson.locked || lesson.progressLocked) ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200 hover:border-green-400 cursor-pointer'}`}>
                        <div className="flex items-center gap-3">
                          {(lesson.locked || lesson.progressLocked) ? <Lock className="h-5 w-5 text-gray-400" /> : <Play className="h-5 w-5 text-green-600" />}
                          <div>
                            <div className="font-semibold text-sm">Aula {lesson.orderIndex}: {lesson.title}</div>
                            <div className="text-xs text-gray-500">{lesson.language}</div>
                          </div>
                        </div>
                        {(lesson.locked || lesson.progressLocked) ? <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs">{lesson.progressLocked ? '🔒 Conclua a aula anterior' : '🔒 Premium'}</Badge> : <Link href={`/complete-lesson/${lesson.id}`}><Button size="sm" variant="outline">Começar</Button></Link>}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Level B1-B2: Intermediário */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
                    <h4 className="font-bold text-sm text-gray-700">Nível B1-B2 · Intermediário</h4>
                    <span className="text-xs text-gray-400">(Lições 11-20)</span>
                  </div>
                  <div className="space-y-2">
                    {nextLessons.filter((l: any) => (l.orderIndex || 1) > 10 && (l.orderIndex || 1) <= 20).map((lesson: any) => (
                      <div key={lesson.id} className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${(lesson.locked || lesson.progressLocked) ? 'bg-gray-50 border-gray-200' : 'bg-amber-50 border-amber-200 hover:border-amber-400 cursor-pointer'}`}>
                        <div className="flex items-center gap-3">
                          {(lesson.locked || lesson.progressLocked) ? <Lock className="h-5 w-5 text-gray-400" /> : <Play className="h-5 w-5 text-amber-600" />}
                          <div>
                            <div className="font-semibold text-sm">Aula {lesson.orderIndex}: {lesson.title}</div>
                            <div className="text-xs text-gray-500">{lesson.language}</div>
                          </div>
                        </div>
                        {(lesson.locked || lesson.progressLocked) ? <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs">{lesson.progressLocked ? '🔒 Conclua a aula anterior' : '🔒 Premium'}</Badge> : <Link href={`/complete-lesson/${lesson.id}`}><Button size="sm" variant="outline">Começar</Button></Link>}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Level C1-C2: Avançado */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
                    <h4 className="font-bold text-sm text-gray-700">Nível C1-C2 · Avançado</h4>
                    <span className="text-xs text-gray-400">(Lições 21+)</span>
                  </div>
                  <div className="space-y-2">
                    {nextLessons.filter((l: any) => (l.orderIndex || 1) > 20).map((lesson: any) => (
                      <div key={lesson.id} className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${(lesson.locked || lesson.progressLocked) ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200 hover:border-red-400 cursor-pointer'}`}>
                        <div className="flex items-center gap-3">
                          {(lesson.locked || lesson.progressLocked) ? <Lock className="h-5 w-5 text-gray-400" /> : <Play className="h-5 w-5 text-red-600" />}
                          <div>
                            <div className="font-semibold text-sm">Aula {lesson.orderIndex}: {lesson.title}</div>
                            <div className="text-xs text-gray-500">{lesson.language}</div>
                          </div>
                        </div>
                        {(lesson.locked || lesson.progressLocked) ? <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs">{lesson.progressLocked ? '🔒 Conclua a aula anterior' : '🔒 Premium'}</Badge> : <Link href={`/complete-lesson/${lesson.id}`}><Button size="sm" variant="outline">Começar</Button></Link>}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Conquistas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {recentAchievements.length > 0 ? recentAchievements.map((achievement) => (
                    <div key={achievement.id} className="text-center">
                      <div className="text-4xl mb-2">{achievement.icon}</div>
                      <div className="font-semibold text-sm">{achievement.name}</div>
                      <div className="text-xs text-gray-500">{achievement.date}</div>
                    </div>
                  )) : (
                    <div className="col-span-3 text-center text-gray-500 py-8">
                      <Trophy className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p>Complete lições para desbloquear conquistas!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Streak Card */}
            <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-6 w-6" />
                  Sequência Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold mb-2">
                  {currentStreak}
                </div>
                <div className="text-white/90">
                  dias consecutivos
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="text-sm text-white/90 mb-2">
                    Continue assim! 🔥
                  </div>
                  <div className="text-xs text-white/80">
                    Estude hoje para manter sua sequência
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Goal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Meta Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {lessonsCompleted}/7
                    </span>
                    <Badge variant="secondary">
                      lições
                    </Badge>
                  </div>
                  <Progress 
                    value={(lessonsCompleted / 7) * 100} 
                    className="h-3"
                  />
                  <p className="text-sm text-gray-600">
                    Faltam {Math.max(0, 7 - lessonsCompleted)} lições para completar sua meta!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-sm">Lições Completas</span>
                  </div>
                  <span className="font-bold">{lessonsCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Trophy className="h-4 w-4" />
                    <span className="text-sm">Total XP</span>
                  </div>
                  <span className="font-bold">{totalXP}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Star className="h-4 w-4" />
                    <span className="text-sm">Nível Atual</span>
                  </div>
                  <span className="font-bold">{level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Dias Estudando</span>
                  </div>
                  <span className="font-bold">14</span>
                </div>
              </CardContent>
            </Card>

            {/* Study Time Card */}
            <Card className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Tempo de Estudo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-1">2h 15m</div>
                <div className="text-white/90 text-sm">esta semana</div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="text-sm text-white/90">
                    +30% que semana passada 📈
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Compartilhar nas Redes Sociais */}
        <div className="mt-8">
          <SocialShare />
        </div>
      </div>
    </div>
  );
}
