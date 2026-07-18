import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Zap, Globe, Mic, BookOpen, Flame, Target, Award } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  xp: number;
  unlocked: boolean;
  progress: number;
  target: number;
  category: 'lições' | 'vocabulário' | 'pronúncia' | 'streak' | 'social' | 'idiomas';
  rarity: 'comum' | 'raro' | 'épico' | 'lendário';
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-lesson',
    title: 'Primeira Lição',
    description: 'Complete sua primeira lição',
    icon: <BookOpen className="w-8 h-8" />,
    xp: 50,
    unlocked: true,
    progress: 1,
    target: 1,
    category: 'lições',
    rarity: 'comum',
  },
  {
    id: 'lesson-10',
    title: 'Estudante Dedicado',
    description: 'Complete 10 lições',
    icon: <Star className="w-8 h-8" />,
    xp: 150,
    unlocked: true,
    progress: 10,
    target: 10,
    category: 'lições',
    rarity: 'comum',
  },
  {
    id: 'lesson-50',
    title: 'Mestre das Lições',
    description: 'Complete 50 lições',
    icon: <Trophy className="w-8 h-8" />,
    xp: 500,
    unlocked: false,
    progress: 23,
    target: 50,
    category: 'lições',
    rarity: 'raro',
  },
  {
    id: 'lesson-100',
    title: 'Lendário',
    description: 'Complete 100 lições',
    icon: <Award className="w-8 h-8" />,
    xp: 1000,
    unlocked: false,
    progress: 23,
    target: 100,
    category: 'lições',
    rarity: 'lendário',
  },
  {
    id: 'vocab-100',
    title: 'Vocabulário Inicial',
    description: 'Aprenda 100 palavras',
    icon: <BookOpen className="w-8 h-8" />,
    xp: 200,
    unlocked: true,
    progress: 100,
    target: 100,
    category: 'vocabulário',
    rarity: 'comum',
  },
  {
    id: 'vocab-500',
    title: 'Vocabulário Avançado',
    description: 'Aprenda 500 palavras',
    icon: <Globe className="w-8 h-8" />,
    xp: 600,
    unlocked: false,
    progress: 247,
    target: 500,
    category: 'vocabulário',
    rarity: 'raro',
  },
  {
    id: 'streak-7',
    title: 'Semana Perfeita',
    description: 'Estude 7 dias seguidos',
    icon: <Flame className="w-8 h-8" />,
    xp: 300,
    unlocked: true,
    progress: 7,
    target: 7,
    category: 'streak',
    rarity: 'raro',
  },
  {
    id: 'streak-30',
    title: 'Mês de Dedicação',
    description: 'Estude 30 dias seguidos',
    icon: <Flame className="w-8 h-8" />,
    xp: 1000,
    unlocked: false,
    progress: 12,
    target: 30,
    category: 'streak',
    rarity: 'épico',
  },
  {
    id: 'pronunciation-perfect',
    title: 'Pronúncia Perfeita',
    description: 'Obtenha 100% em 10 exercícios de pronúncia',
    icon: <Mic className="w-8 h-8" />,
    xp: 400,
    unlocked: false,
    progress: 4,
    target: 10,
    category: 'pronúncia',
    rarity: 'épico',
  },
  {
    id: 'multilingual',
    title: 'Multilíngue',
    description: 'Estude 3 idiomas diferentes',
    icon: <Globe className="w-8 h-8" />,
    xp: 800,
    unlocked: false,
    progress: 1,
    target: 3,
    category: 'idiomas',
    rarity: 'épico',
  },
  {
    id: 'speed-learner',
    title: 'Aprendiz Veloz',
    description: 'Complete 5 lições em um dia',
    icon: <Zap className="w-8 h-8" />,
    xp: 250,
    unlocked: false,
    progress: 2,
    target: 5,
    category: 'lições',
    rarity: 'raro',
  },
  {
    id: 'social-referral',
    title: 'Embaixador',
    description: 'Convide 5 amigos',
    icon: <Target className="w-8 h-8" />,
    xp: 500,
    unlocked: false,
    progress: 2,
    target: 5,
    category: 'social',
    rarity: 'épico',
  },
];

const RARITY_COLORS: Record<string, string> = {
  comum: 'bg-gray-100 border-gray-300 text-gray-700',
  raro: 'bg-blue-50 border-blue-300 text-blue-700',
  épico: 'bg-purple-50 border-purple-300 text-purple-700',
  lendário: 'bg-yellow-50 border-yellow-400 text-yellow-700',
};

const RARITY_BADGE: Record<string, string> = {
  comum: 'bg-gray-200 text-gray-700',
  raro: 'bg-blue-200 text-blue-700',
  épico: 'bg-purple-200 text-purple-700',
  lendário: 'bg-yellow-200 text-yellow-700',
};

export default function Achievements() {
  const [filter, setFilter] = useState<string>('todos');

  const categories = ['todos', 'lições', 'vocabulário', 'pronúncia', 'streak', 'social', 'idiomas'];
  const filtered = filter === 'todos' ? ACHIEVEMENTS : ACHIEVEMENTS.filter(a => a.category === filter);
  const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked).length;
  const totalXP = ACHIEVEMENTS.filter(a => a.unlocked).reduce((sum, a) => sum + a.xp, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">🏆 Conquistas</h1>
          <p className="text-gray-600">Desbloqueie badges e ganhe XP completando desafios</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <div className="text-3xl font-bold text-yellow-600">{unlockedCount}/{ACHIEVEMENTS.length}</div>
            <div className="text-sm text-gray-600">Conquistas</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <div className="text-3xl font-bold text-blue-600">{totalXP}</div>
            <div className="text-sm text-gray-600">XP Total</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
            <div className="text-3xl font-bold text-green-600">
              {Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Completo</div>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={filter === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(cat)}
              className="capitalize"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((achievement) => (
            <Card
              key={achievement.id}
              className={`p-4 border-2 transition-all ${
                achievement.unlocked
                  ? RARITY_COLORS[achievement.rarity]
                  : 'bg-gray-50 border-gray-200 opacity-70'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${achievement.unlocked ? 'text-current' : 'text-gray-400'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={`text-xs ${RARITY_BADGE[achievement.rarity]}`}>
                      {achievement.rarity}
                    </Badge>
                    <span className="text-sm font-bold text-orange-500">+{achievement.xp} XP</span>
                  </div>
                </div>

                <div>
                  <h3 className={`font-bold ${achievement.unlocked ? '' : 'text-gray-500'}`}>
                    {achievement.unlocked ? '✅ ' : '🔒 '}{achievement.title}
                  </h3>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>

                {!achievement.unlocked && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Progresso</span>
                      <span>{achievement.progress}/{achievement.target}</span>
                    </div>
                    <Progress value={(achievement.progress / achievement.target) * 100} className="h-2" />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
