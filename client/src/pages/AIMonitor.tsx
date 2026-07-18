/**
 * Painel de IA de Autoaperfeiçoamento — MultiLingue Universal
 * Mostra insights gerados pela IA, telemetria e permite acionar análise manual.
 * 
 * SEGURANÇA: Recomendações de segurança são marcadas com 🔴 e requerem aprovação do admin.
 * A IA NUNCA aplica mudanças de segurança automaticamente.
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";

interface Recommendation {
  action: string;
  priority: "low" | "medium" | "high" | "critical";
  isSecurity: boolean;
  estimatedImpact: string;
}

interface AiInsight {
  id: number;
  insight_type: string;
  title: string;
  description: string;
  recommendations: string; // JSON
  severity: "info" | "warning" | "critical";
  status: "new" | "reviewed" | "in_progress" | "resolved" | "dismissed";
  created_at: string;
}

const SEVERITY_COLOR: Record<string, string> = {
  info: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  critical: "bg-red-500/20 text-red-300 border-red-500/30",
};

const PRIORITY_COLOR: Record<string, string> = {
  low: "bg-gray-500/20 text-gray-300",
  medium: "bg-blue-500/20 text-blue-300",
  high: "bg-orange-500/20 text-orange-300",
  critical: "bg-red-500/20 text-red-300",
};

export default function AIMonitor() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<string>("");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  async function fetchInsights() {
    try {
      const res = await fetch("/api/ai-insights");
      const data = await res.json();
      setInsights(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Erro ao carregar insights:", e);
    } finally {
      setLoading(false);
    }
  }

  async function runAnalysis() {
    setRunning(true);
    setLastResult("");
    try {
      const res = await fetch("/api/scheduled/ai-self-improve", { method: "POST" });
      const data = await res.json();
      setLastResult(data.message || "Análise concluída.");
      await fetchInsights();
    } catch (e) {
      setLastResult("Erro ao executar análise.");
    } finally {
      setRunning(false);
    }
  }

  function parseRecommendations(raw: string): Recommendation[] {
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-white text-xl mb-2">Acesso restrito ao admin</p>
          <Link href="/dashboard">
            <Button variant="outline" className="mt-4">Voltar ao Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/dashboard">
                <button className="text-gray-400 hover:text-white text-sm">← Dashboard</button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              🤖 IA de Autoaperfeiçoamento
            </h1>
            <p className="text-gray-400 mt-1">
              Monitora o app, detecta erros e gera recomendações. Mudanças de segurança requerem sua aprovação.
            </p>
          </div>
          <Button
            onClick={runAnalysis}
            disabled={running}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 text-base"
          >
            {running ? "⏳ Analisando..." : "▶ Executar Análise Agora"}
          </Button>
        </div>

        {/* Resultado da última análise */}
        {lastResult && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300">
            ✅ {lastResult}
          </div>
        )}

        {/* Aviso de segurança */}
        <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <p className="text-yellow-300 text-sm">
            🔒 <strong>Política de Segurança:</strong> A IA nunca aplica mudanças de segurança automaticamente.
            Recomendações marcadas com 🔴 requerem sua aprovação antes de qualquer ação.
          </p>
        </div>

        {/* Insights */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Carregando insights...</div>
        ) : insights.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-400 text-lg">Nenhuma análise ainda.</p>
            <p className="text-gray-500 text-sm mt-2">Clique em "Executar Análise Agora" para gerar o primeiro relatório.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => {
              const recs = parseRecommendations(insight.recommendations);
              const securityRecs = recs.filter(r => r.isSecurity);
              const normalRecs = recs.filter(r => !r.isSecurity);
              const isExpanded = expanded === insight.id;

              return (
                <div
                  key={insight.id}
                  className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden"
                >
                  {/* Header do insight */}
                  <button
                    className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-gray-800/50 transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : insight.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full border ${SEVERITY_COLOR[insight.severity] || SEVERITY_COLOR.info}`}>
                          {insight.severity === "critical" ? "🔴 Crítico" : insight.severity === "warning" ? "🟡 Atenção" : "🔵 Info"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(insight.created_at).toLocaleString("pt-BR")}
                        </span>
                        {securityRecs.length > 0 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                            🔒 {securityRecs.length} alerta(s) de segurança
                          </span>
                        )}
                      </div>
                      <h3 className="text-white font-semibold text-base">{insight.title}</h3>
                    </div>
                    <span className="text-gray-400 text-lg mt-1">{isExpanded ? "▲" : "▼"}</span>
                  </button>

                  {/* Detalhes expandidos */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-gray-800 pt-4">
                      <p className="text-gray-300 text-sm leading-relaxed mb-4">{insight.description}</p>

                      {/* Alertas de segurança — requerem aprovação */}
                      {securityRecs.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-red-400 font-semibold text-sm mb-2">
                            🔴 Alertas de Segurança — Requerem Sua Aprovação
                          </h4>
                          <div className="space-y-2">
                            {securityRecs.map((r, i) => (
                              <div key={i} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-red-200 text-sm">{r.action}</p>
                                  <Badge className={PRIORITY_COLOR[r.priority]}>{r.priority}</Badge>
                                </div>
                                <p className="text-red-400/70 text-xs mt-1">Impacto: {r.estimatedImpact}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recomendações normais */}
                      {normalRecs.length > 0 && (
                        <div>
                          <h4 className="text-gray-400 font-semibold text-sm mb-2">
                            💡 Recomendações de Melhoria
                          </h4>
                          <div className="space-y-2">
                            {normalRecs.map((r, i) => (
                              <div key={i} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-gray-200 text-sm">{r.action}</p>
                                  <Badge className={PRIORITY_COLOR[r.priority]}>{r.priority}</Badge>
                                </div>
                                <p className="text-gray-500 text-xs mt-1">Impacto: {r.estimatedImpact}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
