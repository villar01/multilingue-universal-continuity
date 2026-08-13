/**
 * Painel de Progresso com estatísticas persistidas e estágio CEFR explícito.
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { CEFR_LEVELS, getLevelProgress, type CEFRLevel } from "@/lib/lesson-levels";

const CEFR_ORDER: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const CEFR_COLORS: Record<CEFRLevel, string> = {
  A1: "bg-green-600",
  A2: "bg-lime-600",
  B1: "bg-blue-600",
  B2: "bg-orange-600",
  C1: "bg-violet-600",
  C2: "bg-pink-600",
};

function formatStudyTime(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours}h ${remaining}min` : `${hours}h`;
}

export default function StudentProgress() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: stats, isLoading, isError } = trpc.progress.getStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full text-center shadow-lg">
          <CardHeader><CardTitle>Entre para ver seu progresso</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">As estatísticas, a sequência e a etapa CEFR são calculadas somente com atividades registradas na sua conta.</p>
            <Button asChild><a href={getLoginUrl()}>Entrar</a></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  }

  if (isError || !stats) {
    return <div className="min-h-screen flex items-center justify-center p-6 text-center text-slate-600">Não foi possível carregar o progresso agora. Tente novamente em instantes.</div>;
  }

  const cefrProgress = getLevelProgress(stats.totalXp);
  const cefr = CEFR_LEVELS[cefrProgress.level];
  const currentIndex = CEFR_ORDER.indexOf(cefrProgress.level);
  const nextLevel = currentIndex < CEFR_ORDER.length - 1 ? CEFR_ORDER[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Seu Progresso de Aprendizado</h1>
          <p className="text-slate-600">Dados registrados nas suas aulas, com evolução explícita de A1 a C2.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white shadow-lg"><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-600">Experiência Total</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-purple-600">{stats.totalXp.toLocaleString()}</div><p className="text-xs text-slate-500 mt-3">XP confirmado nas aulas concluídas</p></CardContent></Card>
          <Card className="bg-white shadow-lg"><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-600">Lições Completas</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-blue-600">{stats.totalLessonsCompleted}</div><p className="text-xs text-slate-500 mt-3">Somente lições efetivamente registradas</p></CardContent></Card>
          <Card className="bg-white shadow-lg"><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-600">Sequência Atual</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-orange-600">{stats.currentStreak}</div><p className="text-xs text-slate-500 mt-3">dias consecutivos · recorde: {stats.longestStreak}</p></CardContent></Card>
          <Card className="bg-white shadow-lg"><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-600">Estágio Atual</CardTitle></CardHeader><CardContent><div className={`inline-block px-4 py-2 rounded-full text-white font-bold ${CEFR_COLORS[cefrProgress.level]}`}>{cefrProgress.level} · {cefr.label}</div><p className="text-xs text-slate-500 mt-3">Baseado no XP persistido</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white shadow-lg"><CardHeader><CardTitle>Progresso no estágio {cefrProgress.level}</CardTitle></CardHeader><CardContent className="space-y-4"><div><div className="flex justify-between text-sm text-slate-600 mb-2"><span>{cefr.description}</span><span>{cefrProgress.progress}%</span></div><Progress value={cefrProgress.progress} /></div><p className="text-sm text-slate-600">{nextLevel ? `${cefrProgress.xpInLevel} de ${cefrProgress.xpNeeded} XP para avançar a ${nextLevel}.` : "C2 alcançado: mantenha a prática avançada e a precisão."}</p><div className="flex flex-wrap gap-2">{cefr.topics.slice(0, 5).map((topic) => <span key={topic} className="px-2.5 py-1 rounded-full bg-slate-100 text-xs text-slate-700">{topic}</span>)}</div></CardContent></Card>
          <Card className="bg-white shadow-lg"><CardHeader><CardTitle>Tempo de estudo confirmado</CardTitle></CardHeader><CardContent className="space-y-3"><div className="text-4xl font-bold text-teal-600">{formatStudyTime(stats.totalTimeMinutes)}</div><p className="text-sm text-slate-600">Tempo acumulado pelas lições concluídas, sem estimativas aleatórias.</p>{stats.lastStudyDate && <p className="text-xs text-slate-500">Último estudo registrado: {new Date(stats.lastStudyDate).toLocaleDateString("pt-BR")}</p>}</CardContent></Card>
        </div>

        <Card className="bg-white shadow-lg mt-8"><CardHeader><CardTitle>Próxima meta curricular</CardTitle></CardHeader><CardContent><div className="flex items-center justify-between gap-4"><div><p className="font-semibold text-slate-900">{nextLevel ? `Avançar de ${cefrProgress.level} para ${nextLevel}` : "Consolidar C2 com prática de alta precisão"}</p><p className="text-sm text-slate-600">{nextLevel ? `${cefrProgress.xpNeeded - cefrProgress.xpInLevel} XP restantes no estágio atual.` : "Use conversas, revisão e atividades avançadas para manter o domínio."}</p></div><Progress value={cefrProgress.progress} className="w-32 shrink-0" /></div></CardContent></Card>
      </div>
    </div>
  );
}
