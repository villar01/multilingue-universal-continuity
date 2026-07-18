/**
 * ═══════════════════════════════════════════════════════════════════
 * client/src/pages/StudentProgress.tsx
 * Dashboard de Progresso com Estatísticas e Badges
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";



interface StudentProgressData {
  totalLessonsCompleted: number;
  totalXP: number;
  languagesLearned: string[];
  currentStreak: number;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: "common" | "rare" | "epic" | "legendary";
  }>;
  estimatedLevel: "beginner" | "intermediate" | "advanced" | "expert";
}

export default function StudentProgress() {
  const [progress, setProgress] = useState<StudentProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    // Simular carregamento de progresso
    const mockProgress: StudentProgressData = {
      totalLessonsCompleted: 45,
      totalXP: 2850,
      languagesLearned: ["Português", "Inglês", "Espanhol", "Francês"],
      currentStreak: 12,
      badges: [
        {
          id: "first_steps",
          name: "Primeiros Passos",
          description: "Complete sua primeira lição",
          icon: "👣",
          rarity: "common",
        },
        {
          id: "polyglot",
          name: "Poliglota",
          description: "Aprenda 3 idiomas",
          icon: "🌍",
          rarity: "rare",
        },
        {
          id: "master",
          name: "Mestre Aprendiz",
          description: "Acumule 2000 XP",
          icon: "🏆",
          rarity: "epic",
        },
      ],
      estimatedLevel: "intermediate",
    };

    setProgress(mockProgress);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!progress) {
    return <div className="text-center py-12">Nenhum progresso encontrado</div>;
  }

  const xpPercentage = Math.min((progress.totalXP / 5000) * 100, 100);
  const levelColors = {
    beginner: "bg-blue-500",
    intermediate: "bg-purple-500",
    advanced: "bg-orange-500",
    expert: "bg-red-500",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Seu Progresso de Aprendizado
          </h1>
          <p className="text-slate-600">
            Acompanhe seu desenvolvimento e desbloqueie novas conquistas
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* XP Card */}
          <Card className="bg-white shadow-lg hover:shadow-xl transition">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Experiência Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {progress.totalXP.toLocaleString()}
              </div>
              <Progress value={xpPercentage} className="mt-3" />
              <p className="text-xs text-slate-500 mt-2">
                {xpPercentage.toFixed(0)}% para próximo nível
              </p>
            </CardContent>
          </Card>

          {/* Lessons Card */}
          <Card className="bg-white shadow-lg hover:shadow-xl transition">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Lições Completas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {progress.totalLessonsCompleted}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                +5 esta semana
              </p>
            </CardContent>
          </Card>

          {/* Streak Card */}
          <Card className="bg-white shadow-lg hover:shadow-xl transition">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Sequência Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {progress.currentStreak}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                dias consecutivos 🔥
              </p>
            </CardContent>
          </Card>

          {/* Level Card */}
          <Card className="bg-white shadow-lg hover:shadow-xl transition">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Nível Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`inline-block px-4 py-2 rounded-full text-white font-bold ${
                  levelColors[progress.estimatedLevel]
                }`}
              >
                {progress.estimatedLevel.charAt(0).toUpperCase() +
                  progress.estimatedLevel.slice(1)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Languages Section */}
        <Card className="bg-white shadow-lg mb-8">
          <CardHeader>
            <CardTitle>Idiomas em Aprendizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {progress.languagesLearned.map((lang) => (
                <div
                  key={lang}
                  className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 text-center"
                >
                  <p className="font-semibold text-slate-900">{lang}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {Math.floor(Math.random() * 50) + 10} lições
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Conquistas Desbloqueadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {progress.badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-6 rounded-lg border-2 text-center transition transform hover:scale-105 ${
                    badge.rarity === "common"
                      ? "bg-gray-50 border-gray-300"
                      : badge.rarity === "rare"
                        ? "bg-blue-50 border-blue-300"
                        : badge.rarity === "epic"
                          ? "bg-purple-50 border-purple-300"
                          : "bg-yellow-50 border-yellow-300"
                  }`}
                >
                  <div className="text-5xl mb-3">{badge.icon}</div>
                  <h3 className="font-bold text-slate-900">{badge.name}</h3>
                  <p className="text-sm text-slate-600 mt-2">
                    {badge.description}
                  </p>
                  <Badge
                    className="mt-3"
                    variant={
                      badge.rarity === "common"
                        ? "secondary"
                        : badge.rarity === "rare"
                          ? "default"
                          : "destructive"
                    }
                  >
                    {badge.rarity.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Goals */}
        <Card className="bg-white shadow-lg mt-8">
          <CardHeader>
            <CardTitle>Próximas Metas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    Atingir 5000 XP
                  </p>
                  <p className="text-sm text-slate-600">
                    {5000 - progress.totalXP} XP restantes
                  </p>
                </div>
                <Progress
                  value={(progress.totalXP / 5000) * 100}
                  className="w-32"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    Aprender 10 Idiomas
                  </p>
                  <p className="text-sm text-slate-600">
                    {10 - progress.languagesLearned.length} idiomas restantes
                  </p>
                </div>
                <Progress
                  value={(progress.languagesLearned.length / 10) * 100}
                  className="w-32"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
