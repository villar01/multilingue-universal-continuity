/**
 * Desafio Diário — 1 conversa + 1 jogo de palavras por dia
 * Bônus de XP ao completar ambos · Streak diário · 69 idiomas
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function DailyChallenge() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: challenge, isLoading } = trpc.dailyChallenge.getToday.useQuery(undefined, { enabled: !!user });
  const { data: myStats } = trpc.ranking.myStats.useQuery(undefined, { enabled: !!user });

  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

  const SCENARIO_LABELS: Record<string, string> = {
    restaurante: "🍽️ Restaurante", hotel: "🏨 Hotel", aeroporto: "✈️ Aeroporto",
    táxi: "🚕 Táxi", médico: "🏥 Médico", banco: "🏦 Banco", loja: "🛍️ Loja",
    emergência: "🆘 Emergência", escola: "🏫 Escola", parque: "🌳 Parque",
    cinema: "🎬 Cinema", farmácia: "💊 Farmácia",
  };

  const LANG_LABELS: Record<string, string> = {
    "en-US": "🇺🇸 Inglês", "es-ES": "🇪🇸 Espanhol", "fr-FR": "🇫🇷 Francês", "de-DE": "🇩🇪 Alemão",
  };

  if (!user) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-orange-950 flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-white mb-2">Faça Login</h2>
        <p className="text-slate-400 text-sm mb-6">O Desafio Diário requer uma conta para salvar seu progresso e streak.</p>
        <Button onClick={() => navigate("/")} className="bg-orange-600 hover:bg-orange-500 text-white w-full">Fazer Login</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-orange-950 to-red-950 p-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate("/ar-mode")} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 text-sm">← Voltar ao Hub</button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🌟</div>
          <h1 className="text-3xl font-bold text-white mb-1">Desafio Diário</h1>
          <p className="text-orange-300 text-sm">{todayCapitalized}</p>
        </div>

        {/* Streak */}
        {myStats && (
          <div className="bg-gradient-to-r from-orange-900/60 to-red-900/60 border border-orange-700 rounded-2xl p-5 mb-6 text-center">
            <div className="text-5xl mb-2">🔥</div>
            <div className="text-4xl font-bold text-orange-400">{myStats.currentStreak || 0}</div>
            <div className="text-orange-300 text-sm">dias consecutivos</div>
            {(myStats.longestStreak || 0) > 0 && (
              <div className="text-slate-400 text-xs mt-1">Recorde: {myStats.longestStreak} dias</div>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="text-center text-slate-400 py-12">⏳ Carregando desafio...</div>
        ) : challenge ? (
          <>
            {/* Desafio de hoje */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-4">
              <h3 className="text-white font-bold text-lg mb-4">📋 Desafio de Hoje</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">🌍</div>
                  <div className="text-white font-medium text-sm">{LANG_LABELS[challenge.targetLanguage] || challenge.targetLanguage}</div>
                  <div className="text-slate-400 text-xs">Idioma do dia</div>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">🎭</div>
                  <div className="text-white font-medium text-sm">{SCENARIO_LABELS[challenge.scenario] || challenge.scenario}</div>
                  <div className="text-slate-400 text-xs">Cenário do dia</div>
                </div>
              </div>

              {/* Progresso */}
              <div className="space-y-3">
                <div className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${challenge.conversationCompleted ? "border-green-600 bg-green-900/30" : "border-slate-600 bg-slate-700/30"}`}>
                  <div className="text-2xl">{challenge.conversationCompleted ? "✅" : "🎭"}</div>
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">Conversação Imersiva</div>
                    <div className="text-slate-400 text-xs">Complete 1 conversa no cenário do dia · +100 XP</div>
                    {challenge.conversationCompleted && (challenge.pronunciationScore ?? 0) > 0 && (
                      <div className="text-green-400 text-xs mt-0.5">Pronúncia: {challenge.pronunciationScore}%</div>
                    )}
                  </div>
                  {!challenge.conversationCompleted && (
                    <button onClick={() => navigate("/vr-conversation")}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-xs font-bold">
                      Iniciar
                    </button>
                  )}
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${challenge.wordGameCompleted ? "border-green-600 bg-green-900/30" : "border-slate-600 bg-slate-700/30"}`}>
                  <div className="text-2xl">{challenge.wordGameCompleted ? "✅" : "🧠"}</div>
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">Jogo de Palavras</div>
                    <div className="text-slate-400 text-xs">Complete 1 rodada de Flash Cards ou Quiz · +50 XP</div>
                  </div>
                  {!challenge.wordGameCompleted && (
                    <button onClick={() => navigate("/word-game")}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-xs font-bold">
                      Iniciar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bônus */}
            <div className={`rounded-2xl p-5 mb-6 border-2 transition-all ${challenge.bonusEarned ? "border-yellow-500 bg-yellow-900/30" : "border-slate-600 bg-slate-800/30"}`}>
              <div className="flex items-center gap-3">
                <div className="text-3xl">{challenge.bonusEarned ? "🏆" : "🎁"}</div>
                <div className="flex-1">
                  <div className="text-white font-bold">Bônus Diário</div>
                  <div className="text-slate-400 text-sm">Complete ambas as tarefas para ganhar +200 XP bônus</div>
                </div>
                <div className={`text-2xl font-bold ${challenge.bonusEarned ? "text-yellow-400" : "text-slate-500"}`}>
                  +200 XP
                </div>
              </div>
              {challenge.bonusEarned && (
                <div className="mt-3 text-center text-yellow-300 text-sm font-bold">🎉 Bônus conquistado! +{challenge.xpEarned} XP total hoje!</div>
              )}
              {!challenge.bonusEarned && (
                <div className="mt-3">
                  <Progress value={((challenge.conversationCompleted ? 1 : 0) + (challenge.wordGameCompleted ? 1 : 0)) * 50} className="h-2" />
                  <div className="text-xs text-slate-400 mt-1 text-center">
                    {challenge.conversationCompleted && challenge.wordGameCompleted ? "Aguardando confirmação..." : `${(challenge.conversationCompleted ? 1 : 0) + (challenge.wordGameCompleted ? 1 : 0)}/2 tarefas concluídas`}
                  </div>
                </div>
              )}
            </div>

            {/* XP do dia */}
            {(challenge.xpEarned || 0) > 0 && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-center mb-6">
                <div className="text-3xl font-bold text-yellow-400">⚡{challenge.xpEarned} XP</div>
                <div className="text-slate-400 text-sm">ganhos hoje</div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-slate-400 py-12">Erro ao carregar desafio. Tente novamente.</div>
        )}

        {/* Dica */}
        <div className="bg-blue-900/20 border border-blue-800 rounded-2xl p-4 text-center">
          <div className="text-blue-300 text-sm">
            💡 <strong>Dica:</strong> Complete o desafio todos os dias para manter seu streak e subir no ranking global!
          </div>
        </div>
      </div>
    </div>
  );
}
