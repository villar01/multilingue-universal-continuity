import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LeaderboardEntry {
  rank: number;
  userName: string;
  totalXP: number;
  lessonsCompleted: number;
  currentStreak: number;
  badge: string;
}

export default function Leaderboard() {
  const [entries] = useState<LeaderboardEntry[]>([
    {
      rank: 1,
      userName: 'João Silva',
      totalXP: 5420,
      lessonsCompleted: 45,
      currentStreak: 28,
      badge: '🥇',
    },
    {
      rank: 2,
      userName: 'Maria Santos',
      totalXP: 5120,
      lessonsCompleted: 42,
      currentStreak: 25,
      badge: '🥈',
    },
    {
      rank: 3,
      userName: 'Carlos Oliveira',
      totalXP: 4890,
      lessonsCompleted: 40,
      currentStreak: 22,
      badge: '🥉',
    },
    {
      rank: 4,
      userName: 'Ana Costa',
      totalXP: 4650,
      lessonsCompleted: 38,
      currentStreak: 20,
      badge: '⭐',
    },
    {
      rank: 5,
      userName: 'Pedro Martins',
      totalXP: 4420,
      lessonsCompleted: 36,
      currentStreak: 18,
      badge: '⭐',
    },
  ]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">🏆 Leaderboard Global</h2>
      <div className="space-y-2">
        {entries?.map((entry: LeaderboardEntry) => (
          <Card key={entry.rank} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl">{entry.badge}</span>
              <div>
                <p className="font-semibold">{entry.rank}. {entry.userName}</p>
                <p className="text-sm text-gray-500">
                  {entry.lessonsCompleted} lições • {entry.currentStreak} dias
                </p>
              </div>
            </div>
            <Badge className="text-lg">{entry.totalXP} XP</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
