/**
 * Ranking Global — Leaderboard com XP, streak, conversações e palavras
 * Filtros: Semanal / Mensal / Todos os tempos
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

type Period = "weekly" | "monthly" | "alltime";

const PERIOD_LABELS: Record<Period, string> = {
  weekly: "Esta Semana",
  monthly: "Este Mês",
  alltime: "Todos os Tempos",
};

const RANK_COLORS = ["🥇", "🥈", "🥉"];
const LEVEL_NAMES = ["Iniciante", "Aprendiz", "Intermediário", "Avançado", "Fluente", "Mestre", "Lendário"];

function getLevel(xp: number) {
  const lvl = Math.floor(xp / 500) + 1;
  return { level: lvl, name: LEVEL_NAMES[Math.min(lvl - 1, LEVEL_NAMES.length - 1)], progress: (xp % 500) / 5 };
}

export default function Ranking() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>("weekly");

  const { data: leaderboard, isLoading } = trpc.ranking.getLeaderboard.useQuery({ period, limit: 50 });
  const { data: myStats } = trpc.ranking.myStats.useQuery(undefined, { enabled: !!user });

  const myLevel = myStats ? getLevel(myStats.totalXp || 0) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate("/ar-mode")} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 text-sm">← Voltar ao Hub</button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🏆</div>
          <h1 className="text-3xl font-bold text-white mb-2">Ranking Global</h1>
          <p className="text-slate-400 text-sm">Compete com estudantes do mundo inteiro</p>
        </div>

        {/* Meu perfil */}
        {user && myStats && myLevel && (
          <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-indigo-700 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-700 flex items-center justify-center text-2xl font-bold text-white">
                {(user.name || "?")[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-white font-bold">{user.name || "Você"}</div>
                <div className="text-indigo-300 text-sm">Nível {myLevel.level} · {myLevel.name}</div>
                <div className="mt-1.5 bg-slate-700 rounded-full h-2 w-full">
                  <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${myLevel.progress}%` }} />
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{myStats.totalXp || 0} XP total</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-400">⚡{myStats.weeklyXp || 0}</div>
                <div className="text-xs text-slate-400">XP esta semana</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 mt-4">
              <div className="bg-black/20 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-orange-400">🔥{myStats.currentStreak || 0}</div>
                <div className="text-xs text-slate-400">Streak</div>
              </div>
              <div className="bg-black/20 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-blue-400">💬{myStats.conversationsCompleted || 0}</div>
                <div className="text-xs text-slate-400">Conversas</div>
              </div>
              <div className="bg-black/20 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-green-400">📚{myStats.wordsLearned || 0}</div>
                <div className="text-xs text-slate-400">Palavras</div>
              </div>
              <div className="bg-black/20 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-purple-400">⭐{myStats.perfectScores || 0}</div>
                <div className="text-xs text-slate-400">Perfeitos</div>
              </div>
            </div>
          </div>
        )}

        {!user && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 mb-6 text-center">
            <div className="text-3xl mb-2">🔒</div>
            <p className="text-slate-300 text-sm">Faça login para aparecer no ranking e acompanhar seu progresso</p>
          </div>
        )}

        {/* Period tabs */}
        <div className="flex gap-2 mb-4 bg-slate-800/50 p-1.5 rounded-xl">
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${period === p ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}>
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400">⏳ Carregando ranking...</div>
          ) : !leaderboard || leaderboard.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">🌱</div>
              <p className="text-slate-400 text-sm">Nenhum estudante no ranking ainda.<br />Seja o primeiro! Complete uma conversa ou jogo de palavras.</p>
            </div>
          ) : (
            <div>
              {leaderboard.map((entry: any, i: number) => {
                const isMe = user && entry.userId === (user as any).id;
                const lvl = getLevel(entry.totalXp || 0);
                const xp = period === "weekly" ? entry.weeklyXp : period === "monthly" ? entry.monthlyXp : entry.totalXp;
                return (
                  <div key={entry.userId}
                    className={`flex items-center gap-4 px-5 py-4 border-b border-slate-700/50 last:border-0 transition-all ${isMe ? "bg-indigo-900/30" : i < 3 ? "bg-yellow-900/10" : ""}`}>
                    {/* Rank */}
                    <div className="w-8 text-center text-xl font-bold">
                      {i < 3 ? RANK_COLORS[i] : <span className="text-slate-400 text-sm">#{i + 1}</span>}
                    </div>
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${isMe ? "bg-indigo-600" : "bg-slate-700"}`}>
                      {(entry.userName || "?")[0].toUpperCase()}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm truncate ${isMe ? "text-indigo-300" : "text-white"}`}>
                        {entry.userName || "Estudante"} {isMe && <span className="text-xs text-indigo-400">(você)</span>}
                      </div>
                      <div className="text-xs text-slate-400">Nível {lvl.level} · {lvl.name}</div>
                    </div>
                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>🔥{entry.currentStreak || 0}</span>
                      <span>💬{entry.conversationsCompleted || 0}</span>
                    </div>
                    {/* XP */}
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold text-sm">⚡{xp || 0}</div>
                      <div className="text-xs text-slate-500">XP</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={() => navigate("/vr-conversation")}
            className="py-4 bg-indigo-700 hover:bg-indigo-600 rounded-xl text-white font-bold text-sm transition-all">
            🎭 Ganhar XP em Conversas
          </button>
          <button onClick={() => navigate("/word-game")}
            className="py-4 bg-purple-700 hover:bg-purple-600 rounded-xl text-white font-bold text-sm transition-all">
            🧠 Ganhar XP em Jogos
          </button>
        </div>
      </div>
    </div>
  );
}
