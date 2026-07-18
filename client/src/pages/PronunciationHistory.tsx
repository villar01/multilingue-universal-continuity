import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { LANGUAGES_57, type Language } from "@/lib/languages";
import LanguageSelector from "@/components/LanguageSelector";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default function PronunciationHistory() {
  const { user } = useAuth();
  const [selectedLang, setSelectedLang] = useState<Language>(LANGUAGES_57[0]);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const { data: history, isLoading } = trpc.pronunciation.getHistory.useQuery(
    { targetLanguage: selectedLang.code, limit: 30 },
    { enabled: !!user }
  );

  const langInfo = selectedLang;

  const stats = history && history.length > 0 ? {
    avgScore: Math.round(history.reduce((s, h) => s + (h.score || 0), 0) / history.length),
    bestScore: Math.max(...history.map(h => h.score || 0)),
    totalSessions: history.length,
    trend: history.length >= 2
      ? (history[0].score || 0) - (history[history.length - 1].score || 0)
      : 0,
  } : { avgScore: 0, bestScore: 0, totalSessions: 0, trend: 0 };

  useEffect(() => {
    if (!chartRef.current || !history || history.length === 0) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const reversed = [...history].reverse();
    const labels = reversed.map((_, i) => `#${i + 1}`);
    const scores = reversed.map(h => h.score || 0);

    // Moving average for trend line
    const movingAvg = scores.map((_, i) => {
      const window = scores.slice(Math.max(0, i - 4), i + 1);
      return Math.round(window.reduce((a, b) => a + b, 0) / window.length);
    });

    chartInstance.current = new Chart(chartRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Score de Pronúncia",
            data: scores,
            borderColor: "#6366f1",
            backgroundColor: "rgba(99,102,241,0.15)",
            tension: 0.3,
            fill: true,
            pointRadius: 5,
            pointHoverRadius: 8,
            pointBackgroundColor: scores.map(s => s >= 80 ? "#10b981" : s >= 60 ? "#f59e0b" : "#ef4444"),
          },
          {
            label: "Média Móvel",
            data: movingAvg,
            borderColor: "#f59e0b",
            backgroundColor: "transparent",
            tension: 0.4,
            fill: false,
            pointRadius: 0,
            borderDash: [5, 5],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top", labels: { color: "#e2e8f0", font: { size: 12 } } },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}%`,
            },
          },
        },
        scales: {
          y: {
            min: 0, max: 100,
            ticks: { color: "#94a3b8", callback: v => `${v}%` },
            grid: { color: "rgba(148,163,184,0.1)" },
          },
          x: { ticks: { color: "#94a3b8", maxTicksLimit: 15 }, grid: { color: "rgba(148,163,184,0.05)" } },
        },
      },
    });
    return () => { chartInstance.current?.destroy(); };
  }, [history]);

  const getScoreColor = (score: number) =>
    score >= 80 ? "text-green-400" : score >= 60 ? "text-yellow-400" : "text-red-400";

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: "Excelente 🌟", cls: "bg-green-600" };
    if (score >= 75) return { label: "Bom 👍", cls: "bg-blue-600" };
    if (score >= 60) return { label: "Regular 📚", cls: "bg-yellow-600" };
    return { label: "Treinar mais 💪", cls: "bg-red-600" };
  };

  // Score distribution for bar chart
  const distribution = [
    { label: "90-100%", count: history?.filter(h => (h.score || 0) >= 90).length || 0, color: "#10b981" },
    { label: "75-89%", count: history?.filter(h => (h.score || 0) >= 75 && (h.score || 0) < 90).length || 0, color: "#6366f1" },
    { label: "60-74%", count: history?.filter(h => (h.score || 0) >= 60 && (h.score || 0) < 75).length || 0, color: "#f59e0b" },
    { label: "< 60%", count: history?.filter(h => (h.score || 0) < 60).length || 0, color: "#ef4444" },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800/80 border-slate-700 p-8 text-center max-w-md">
          <div className="text-5xl mb-4">🎤</div>
          <h2 className="text-2xl font-bold text-white mb-2">Histórico de Pronúncia</h2>
          <p className="text-slate-400 mb-6">Faça login para ver sua evolução</p>
          <Link href="/"><Button className="bg-indigo-600 hover:bg-indigo-700">Entrar</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link href="/ar-mode">
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">← Voltar</Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">🎤 Histórico de Pronúncia</h1>
              <p className="text-slate-400 text-sm">Acompanhe sua evolução — {langInfo.flag} {langInfo.name}</p>
            </div>
          </div>
          <div className="w-64">
            <LanguageSelector value={selectedLang} onChange={setSelectedLang} />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Score Médio", value: `${stats.avgScore}%`, icon: "📊", color: "text-indigo-400" },
            { label: "Melhor Score", value: `${stats.bestScore}%`, icon: "🏆", color: "text-yellow-400" },
            { label: "Total Sessões", value: stats.totalSessions.toString(), icon: "🎯", color: "text-green-400" },
            {
              label: "Tendência",
              value: stats.trend > 0 ? `+${stats.trend}%` : `${stats.trend}%`,
              icon: stats.trend >= 0 ? "📈" : "📉",
              color: stats.trend >= 0 ? "text-green-400" : "text-red-400"
            },
          ].map((s, i) => (
            <Card key={i} className="bg-slate-800/60 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-1">{s.icon}</div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-slate-400 text-xs mt-1">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-slate-400">Carregando histórico...</p>
          </div>
        ) : !history || history.length === 0 ? (
          <Card className="bg-slate-800/60 border-slate-700">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🎤</div>
              <h3 className="text-xl font-bold text-white mb-2">Nenhuma sessão ainda</h3>
              <p className="text-slate-400 mb-6">
                Complete conversações em <strong>{langInfo.name}</strong> para ver sua evolução
              </p>
              <Link href="/vr-conversation">
                <Button className="bg-indigo-600 hover:bg-indigo-700">🎭 Iniciar Conversação</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Line Chart */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800/60 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">📈 Evolução da Pronúncia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: "300px" }}>
                    <canvas ref={chartRef} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Distribution */}
            <div>
              <Card className="bg-slate-800/60 border-slate-700 h-full">
                <CardHeader>
                  <CardTitle className="text-white text-lg">🎯 Distribuição</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {distribution.map((d, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{d.label}</span>
                        <span className="text-slate-400">{d.count} sessões</span>
                      </div>
                      <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${stats.totalSessions > 0 ? (d.count / stats.totalSessions) * 100 : 0}%`,
                            backgroundColor: d.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-slate-400 text-xs text-center">
                      {stats.avgScore >= 75
                        ? "🌟 Excelente progresso! Continue assim."
                        : stats.avgScore >= 60
                        ? "📚 Bom progresso. Pratique mais para melhorar."
                        : "💪 Continue praticando! A consistência é a chave."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Session Table */}
            <div className="lg:col-span-3">
              <Card className="bg-slate-800/60 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">📋 Sessões Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left text-slate-400 py-2 px-3">#</th>
                          <th className="text-left text-slate-400 py-2 px-3">Palavra / Frase</th>
                          <th className="text-left text-slate-400 py-2 px-3">Sua Pronúncia</th>
                          <th className="text-center text-slate-400 py-2 px-3">Score</th>
                          <th className="text-center text-slate-400 py-2 px-3">Avaliação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.slice(0, 20).map((h, i) => {
                          const badge = getScoreBadge(h.score || 0);
                          return (
                            <tr key={h.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                              <td className="py-2 px-3 text-slate-500">{i + 1}</td>
                              <td className="py-2 px-3 text-white font-medium max-w-xs truncate">
                                {h.expectedText || h.word || "—"}
                              </td>
                              <td className="py-2 px-3 text-slate-400 max-w-xs truncate italic">
                                {h.userTranscript || "—"}
                              </td>
                              <td className={`py-2 px-3 text-center font-bold text-lg ${getScoreColor(h.score || 0)}`}>
                                {h.score || 0}%
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span className={`text-xs px-2 py-1 rounded-full text-white ${badge.cls}`}>
                                  {badge.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Link href="/vr-conversation">
            <Button className="bg-indigo-600 hover:bg-indigo-700">🎭 Nova Conversação</Button>
          </Link>
          <Link href="/word-game">
            <Button variant="outline" className="border-slate-600 text-slate-300">🧠 Jogos de Palavras</Button>
          </Link>
          <Link href="/certificates">
            <Button variant="outline" className="border-slate-600 text-slate-300">🏅 Meus Certificados</Button>
          </Link>
          <Link href="/battle">
            <Button variant="outline" className="border-slate-600 text-slate-300">⚔️ Modo Batalha</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
