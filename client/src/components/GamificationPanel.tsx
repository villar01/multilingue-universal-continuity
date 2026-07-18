import { trpc } from "../lib/trpc";
import { Trophy, Star, Flame, TrendingUp, Award, Target } from "lucide-react";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";

export default function GamificationPanel() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = trpc.gamification.getStats.useQuery(undefined, { enabled: !!user, retry: false });
  const { data: achievements, isLoading: achievementsLoading } = trpc.gamification.getUserAchievements.useQuery(undefined, { enabled: !!user, retry: false });

  if (statsLoading || achievementsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!stats) return null;

  // Calcular progresso para próximo nível
  const currentLevelXP = ((stats as any).current_level - 1) * 100;
  const nextLevelXP = (stats as any).current_level * 100;
  const xpInCurrentLevel = (stats as any).total_xp - currentLevelXP;
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
  const progressPercent = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

  return (
    <div className="space-y-6">
      {/* Card Principal - Nível e XP */}
      <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-full">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Nível {(stats as any).current_level}</h3>
              <p className="text-sm opacity-90">{(stats as any).total_xp} XP Total</p>
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <Flame className="w-5 h-5 text-orange-300" />
            <span className="font-bold text-lg">{(stats as any).streak_days}</span>
            <span className="text-sm opacity-90">dias</span>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{xpInCurrentLevel} XP</span>
            <span>{xpNeededForNextLevel} XP para Nível {(stats as any).current_level + 1}</span>
          </div>
          <Progress value={progressPercent} className="h-3 bg-white/30" />
        </div>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-blue-100 p-3 rounded-full">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{(stats as any).lessons_completed}</p>
            <p className="text-sm text-gray-600">Lições</p>
          </div>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{(stats as any).exercises_completed}</p>
            <p className="text-sm text-gray-600">Exercícios</p>
          </div>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-purple-100 p-3 rounded-full">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{(stats as any).words_learned}</p>
            <p className="text-sm text-gray-600">Palavras</p>
          </div>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-orange-100 p-3 rounded-full">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{achievements?.length || 0}</p>
            <p className="text-sm text-gray-600">Conquistas</p>
          </div>
        </Card>
      </div>

      {/* Conquistas Recentes */}
      {achievements && achievements.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Conquistas Desbloqueadas ({achievements.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.slice(0, 6).map((achievement: any) => (
              <div
                key={achievement.id}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200"
              >
                <div className="bg-yellow-400 p-2 rounded-full flex-shrink-0">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{achievement.name}</p>
                  <p className="text-sm text-gray-600 truncate">{achievement.description}</p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    +{achievement.xp_reward} XP
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {achievements.length > 6 && (
            <button className="mt-4 text-blue-600 hover:text-blue-700 font-semibold text-sm">
              Ver todas as {achievements.length} conquistas →
            </button>
          )}
        </Card>
      )}

      {/* Pronúncia */}
      {(stats as any).pronunciation_avg_score > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Precisão de Pronúncia</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={(stats as any).pronunciation_avg_score} className="h-4" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {(stats as any).pronunciation_avg_score.toFixed(1)}%
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {(stats as any).pronunciation_avg_score >= 95
              ? "🎉 Pronúncia nativa! Excelente!"
              : (stats as any).pronunciation_avg_score >= 90
              ? "👏 Muito bom! Quase perfeito!"
              : (stats as any).pronunciation_avg_score >= 80
              ? "👍 Bom progresso! Continue praticando!"
              : "💪 Continue praticando para melhorar!"}
          </p>
        </Card>
      )}
    </div>
  );
}
