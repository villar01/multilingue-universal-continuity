import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Award, BookOpen, Flame, Globe, Mic, Star, Target, Trophy, Zap } from "lucide-react";

type AchievementRecord = {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  requirement_type?: string;
  requirementType?: string;
  requirement_value?: number;
  requirementValue?: number;
  xp_reward?: number;
  pointsReward?: number;
};

const CATEGORY_LABELS: Record<string, string> = {
  lessons: "lições",
  exercises: "exercícios",
  streak: "sequência",
  words: "vocabulário",
  pronunciation: "pronúncia",
  points: "XP",
};

function requirementType(achievement: AchievementRecord) {
  return achievement.requirement_type || achievement.requirementType || achievement.category || "other";
}

function requirementValue(achievement: AchievementRecord) {
  return achievement.requirement_value ?? achievement.requirementValue ?? 0;
}

function reward(achievement: AchievementRecord) {
  return achievement.xp_reward ?? achievement.pointsReward ?? 0;
}

function iconFor(type: string) {
  const className = "w-7 h-7";
  if (type === "lessons") return <BookOpen className={className} />;
  if (type === "exercises") return <Target className={className} />;
  if (type === "streak") return <Flame className={className} />;
  if (type === "words") return <Globe className={className} />;
  if (type === "pronunciation") return <Mic className={className} />;
  if (type === "points") return <Zap className={className} />;
  return <Award className={className} />;
}

function metricFor(type: string, stats: Record<string, number>) {
  if (type === "lessons") return stats.lessons_completed || 0;
  if (type === "exercises") return stats.exercises_completed || 0;
  if (type === "streak") return stats.streak_days || 0;
  if (type === "words") return stats.words_learned || 0;
  if (type === "pronunciation") return stats.pronunciation_avg_score || 0;
  if (type === "points") return stats.total_xp || 0;
  return 0;
}

export default function Achievements() {
  const { user, loading: authLoading } = useAuth();
  const [filter, setFilter] = useState("todos");
  const enabled = !!user;
  const { data: catalogue, isLoading: catalogueLoading, isError: catalogueError } = trpc.gamification.listAchievements.useQuery(undefined, { enabled });
  const { data: unlocked, isLoading: unlockedLoading, isError: unlockedError } = trpc.gamification.getUserAchievements.useQuery(undefined, { enabled });
  const { data: stats, isLoading: statsLoading, isError: statsError } = trpc.gamification.getStats.useQuery(undefined, { enabled });

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6 flex items-center justify-center">
        <Card className="max-w-md p-8 text-center space-y-4">
          <Trophy className="w-10 h-10 text-yellow-500 mx-auto" />
          <h1 className="text-2xl font-bold">Entre para ver suas conquistas</h1>
          <p className="text-sm text-gray-600">Conquistas e progresso são exibidos somente a partir das atividades registradas na sua conta.</p>
          <Button asChild><a href={getLoginUrl()}>Entrar</a></Button>
        </Card>
      </div>
    );
  }

  if (catalogueLoading || unlockedLoading || statsLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (catalogueError || unlockedError || statsError || !catalogue || !unlocked || !stats) return <div className="min-h-screen flex items-center justify-center p-6 text-center text-gray-600">Não foi possível carregar as conquistas agora. Tente novamente em instantes.</div>;

  const achievements = catalogue as unknown as AchievementRecord[];
  const unlockedIds = new Set((unlocked as unknown as AchievementRecord[]).map((achievement) => achievement.id));
  const statistics = stats as unknown as Record<string, number>;
  const categories = ["todos", ...Array.from(new Set(achievements.map((achievement) => requirementType(achievement))))];
  const filtered = filter === "todos" ? achievements : achievements.filter((achievement) => requirementType(achievement) === filter);
  const unlockedCount = achievements.filter((achievement) => unlockedIds.has(achievement.id)).length;
  const completion = achievements.length ? Math.round((unlockedCount / achievements.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center"><h1 className="text-4xl font-bold mb-2">🏆 Conquistas</h1><p className="text-gray-600">Progresso calculado somente com atividades registradas na sua conta.</p></div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"><div className="text-3xl font-bold text-yellow-600">{unlockedCount}/{achievements.length}</div><div className="text-sm text-gray-600">Desbloqueadas</div></Card>
          <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200"><div className="text-3xl font-bold text-blue-600">{statistics.total_xp || 0}</div><div className="text-sm text-gray-600">XP registrado</div></Card>
          <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-teal-50 border-green-200"><div className="text-3xl font-bold text-green-600">{completion}%</div><div className="text-sm text-gray-600">Catálogo concluído</div></Card>
        </div>

        {achievements.length === 0 ? (
          <Card className="p-8 text-center"><Trophy className="w-10 h-10 text-gray-400 mx-auto mb-3" /><h2 className="font-bold text-lg">Nenhuma conquista disponível ainda</h2><p className="text-sm text-gray-600 mt-2">O catálogo será exibido aqui quando as conquistas forem configuradas pelo sistema.</p></Card>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">{categories.map((category) => <Button key={category} variant={filter === category ? "default" : "outline"} size="sm" onClick={() => setFilter(category)}>{category === "todos" ? "todas" : CATEGORY_LABELS[category] || category}</Button>)}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((achievement) => {
                const type = requirementType(achievement);
                const target = requirementValue(achievement);
                const progress = Math.min(metricFor(type, statistics), target || 0);
                const isUnlocked = unlockedIds.has(achievement.id);
                const progressPercent = target ? Math.min((progress / target) * 100, 100) : 0;
                return (
                  <Card key={achievement.id} className={`p-4 border-2 transition-all ${isUnlocked ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300" : "bg-gray-50 border-gray-200"}`}>
                    <div className="space-y-3"><div className="flex items-start justify-between"><div className={isUnlocked ? "text-yellow-600" : "text-gray-400"}>{achievement.icon || iconFor(type)}</div><div className="flex flex-col items-end gap-1"><Badge variant="secondary">{CATEGORY_LABELS[type] || type}</Badge>{reward(achievement) > 0 && <span className="text-sm font-bold text-orange-500">+{reward(achievement)} XP</span>}</div></div><div><h3 className={`font-bold ${isUnlocked ? "" : "text-gray-500"}`}>{isUnlocked ? "✅ " : "🔒 "}{achievement.name}</h3><p className="text-sm text-gray-600">{achievement.description || "Conquista registrada pelo seu progresso."}</p></div>{!isUnlocked && target > 0 && <div className="space-y-1"><div className="flex justify-between text-xs text-gray-500"><span>Progresso</span><span>{progress}/{target}</span></div><Progress value={progressPercent} className="h-2" /></div>}</div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
