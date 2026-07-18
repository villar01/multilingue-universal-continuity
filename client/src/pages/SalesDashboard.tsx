/**
 * SalesDashboard — Painel de Análise de Vendas Interno
 * CRM integrado com dados reais: KPIs, funil, receita, leads, pipeline, metas
 */
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp, TrendingDown, Users, DollarSign, Target, Activity,
  BarChart3, ArrowUpRight, ArrowDownRight, RefreshCw,
  UserPlus, Handshake, CheckCircle2, Clock, Zap, ArrowLeft,
  Globe, Star, Award, Flame, ShoppingCart, Eye, MousePointer,
  MessageSquare, Phone, Mail, Calendar, Filter,
} from "lucide-react";
import Chart from "chart.js/auto";

type Period = "7d" | "30d" | "90d" | "1y";
type Tab = "overview" | "pipeline" | "activities" | "targets";

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  title, value, subtitle, icon: Icon, trend, trendValue, color, prefix = "", suffix = "", loading = false,
}: {
  title: string; value: string | number; subtitle?: string;
  icon: React.ElementType; trend?: "up" | "down" | "neutral"; trendValue?: string;
  color: string; prefix?: string; suffix?: string; loading?: boolean;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) {
  return (
    <Card className="relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
      <div className={`absolute top-0 left-0 right-0 h-1 ${color}`} />
      <CardContent className="pt-5 pb-4">
        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-3/4" />
            <div className="h-8 bg-white/10 rounded w-1/2" />
            <div className="h-3 bg-white/10 rounded w-2/3" />
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-slate-400 leading-tight">{title}</p>
              <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
                {/* @ts-expect-error dynamic icon */}
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">
              {prefix}{typeof value === "number" ? value.toLocaleString("pt-BR") : value}{suffix}
            </p>
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
            {trend && trendValue && (
              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/10">
                {trend === "up" ? (
                  <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                ) : trend === "down" ? (
                  <ArrowDownRight className="w-3 h-3 text-red-400" />
                ) : (
                  <Activity className="w-3 h-3 text-slate-400" />
                )}
                <span className={`text-xs font-medium ${
                  trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-slate-400"
                }`}>
                  {trendValue}
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Funnel Stage ─────────────────────────────────────────────────────────────
function FunnelStage({ stage, count, value, maxCount, color }: {
  stage: string; count: number; value: number; maxCount: number; color: string;
}) {
  const stageLabels: Record<string, string> = {
    lead: "Lead", qualified: "Qualificado", proposal: "Proposta",
    negotiation: "Negociação", won: "Ganho", lost: "Perdido",
  };
  const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300 font-medium">{stageLabels[stage] || stage}</span>
        <div className="flex items-center gap-3">
          <span className="text-white font-bold">{count}</span>
          <span className="text-slate-400 text-xs">
            R$ {value.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
          </span>
        </div>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Activity Item ────────────────────────────────────────────────────────────
function ActivityItem({ activity }: { activity: Record<string, unknown> }) {
  const typeIcons: Record<string, React.ElementType> = {
    call: Phone, email: Mail, meeting: Calendar, whatsapp: MessageSquare,
    demo: Eye, proposal_sent: ShoppingCart, follow_up: Clock, note: MessageSquare, task: CheckCircle2,
  };
  const typeColors: Record<string, string> = {
    call: "text-blue-400", email: "text-purple-400", meeting: "text-emerald-400",
    whatsapp: "text-green-400", demo: "text-amber-400", proposal_sent: "text-indigo-400",
    follow_up: "text-orange-400", note: "text-slate-400", task: "text-teal-400",
  };
  const type = String(activity.type || "note");
  const Icon: React.ElementType = typeIcons[type] || Activity;
  const color: string = typeColors[type] || "text-slate-400";
  const rawDate = activity.created_at ?? activity.createdAt ?? Date.now();
  const date = new Date(typeof rawDate === "number" ? rawDate : String(rawDate));
  const diff = Date.now() - date.getTime();
  const timeAgo =
    diff < 60000 ? "agora" :
    diff < 3600000 ? `${Math.floor(diff / 60000)}min atrás` :
    diff < 86400000 ? `${Math.floor(diff / 3600000)}h atrás` :
    `${Math.floor(diff / 86400000)}d atrás`;

  return (
    <div className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
      <div className="mt-0.5 p-1.5 rounded-lg bg-white/5">
        {/* @ts-expect-error dynamic icon */}
        <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">
          {String(activity.title || activity.type || "Atividade")}
        </p>
        {activity.contact_name != null && (
          <p className="text-xs text-slate-400 truncate">{String(activity.contact_name)}</p>
        )}
      </div>
      <span className="text-xs text-slate-500 whitespace-nowrap">{timeAgo}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SalesDashboard() {
  const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [period, setPeriod] = useState<Period>("30d");
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const revenueChartRef = useRef<HTMLCanvasElement>(null);
  const sourceChartRef = useRef<HTMLCanvasElement>(null);
  const planChartRef = useRef<HTMLCanvasElement>(null);
  const conversionChartRef = useRef<HTMLCanvasElement>(null);
  const revenueChartInst = useRef<Chart | null>(null);
  const sourceChartInst = useRef<Chart | null>(null);
  const planChartInst = useRef<Chart | null>(null);
  const conversionChartInst = useRef<Chart | null>(null);

  const { data: metrics, isLoading, refetch } = trpc.crm.metrics.useQuery(
    { period },
    { enabled: !!user, retry: false }
  );
  const { data: contacts } = trpc.crm.contacts.list.useQuery(
    { limit: 5 },
    { enabled: !!user, retry: false }
  );
  const { data: deals } = trpc.crm.deals.list.useQuery(
    {},
    { enabled: !!user, retry: false }
  );
  const { data: targets } = trpc.crm.targets.getCurrent.useQuery(
    undefined,
    { enabled: !!user, retry: false }
  );

  const seedMutation = trpc.crm.seedDemo.useMutation({ onSuccess: () => refetch() });

  // ── Revenue Chart ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!metrics?.revenueByMonth?.length || !revenueChartRef.current) return;
    revenueChartInst.current?.destroy();
    const ctx = revenueChartRef.current.getContext("2d");
    if (!ctx) return;
    const labels = metrics.revenueByMonth.map(r => {
      const [year, month] = r.month.split("-");
      return new Date(Number(year), Number(month) - 1).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    });
    revenueChartInst.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Receita (R$)",
            data: metrics.revenueByMonth.map(r => r.revenue),
            backgroundColor: "rgba(99,102,241,0.85)",
            borderColor: "rgb(99,102,241)",
            borderWidth: 0,
            borderRadius: 6,
            yAxisID: "y",
          },
          {
            label: "Assinaturas",
            data: metrics.revenueByMonth.map(r => r.subscriptions),
            type: "line" as const,
            borderColor: "rgb(16,185,129)",
            backgroundColor: "rgba(16,185,129,0.15)",
            borderWidth: 2.5,
            pointRadius: 5,
            pointBackgroundColor: "rgb(16,185,129)",
            fill: true,
            tension: 0.4,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top", labels: { color: "#94a3b8", font: { size: 11 } } },
          tooltip: {
            backgroundColor: "rgba(15,23,42,0.95)",
            titleColor: "#f1f5f9",
            bodyColor: "#94a3b8",
            borderColor: "rgba(255,255,255,0.1)",
            borderWidth: 1,
            callbacks: {
              label: (c) =>
                c.datasetIndex === 0
                  ? `Receita: R$ ${Number(c.raw).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                  : `Assinaturas: ${c.raw}`,
            },
          },
        },
        scales: {
          x: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#64748b" } },
          y: {
            type: "linear", position: "left",
            grid: { color: "rgba(255,255,255,0.05)" },
            ticks: { color: "#64748b", callback: (v) => `R$ ${Number(v).toLocaleString("pt-BR")}` },
          },
          y1: {
            type: "linear", position: "right",
            grid: { drawOnChartArea: false },
            ticks: { color: "#64748b" },
          },
        },
      },
    });
    return () => revenueChartInst.current?.destroy();
  }, [metrics?.revenueByMonth]);

  // ── Source Chart ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!metrics?.leadsBySource?.length || !sourceChartRef.current) return;
    sourceChartInst.current?.destroy();
    const ctx = sourceChartRef.current.getContext("2d");
    if (!ctx) return;
    const COLORS = ["#6366f1","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#ec4899","#84cc16","#f97316"];
    const sourceLabels: Record<string, string> = {
      website: "Website", referral: "Indicação", social_media: "Redes Sociais",
      google_ads: "Google Ads", facebook_ads: "Facebook Ads", instagram: "Instagram",
      whatsapp: "WhatsApp", email_campaign: "Email", organic: "Orgânico",
      partner: "Parceiro", event: "Evento", other: "Outros",
    };
    sourceChartInst.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: metrics.leadsBySource.map(s => sourceLabels[s.source] || s.source),
        datasets: [{
          data: metrics.leadsBySource.map(s => s.count),
          backgroundColor: COLORS.slice(0, metrics.leadsBySource.length),
          borderWidth: 2,
          borderColor: "rgba(15,23,42,0.8)",
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "right", labels: { color: "#94a3b8", font: { size: 11 }, padding: 12 } },
          tooltip: { backgroundColor: "rgba(15,23,42,0.95)", titleColor: "#f1f5f9", bodyColor: "#94a3b8" },
        },
        cutout: "65%",
      },
    });
    return () => sourceChartInst.current?.destroy();
  }, [metrics?.leadsBySource]);

  // ── Plan Chart ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!metrics?.subsByPlan?.length || !planChartRef.current) return;
    planChartInst.current?.destroy();
    const ctx = planChartRef.current.getContext("2d");
    if (!ctx) return;
    const COLORS = ["#6366f1","#10b981","#f59e0b","#8b5cf6","#06b6d4"];
    const planLabels: Record<string, string> = {
      biennial: "Bienal", annual: "Anual", monthly: "Mensal", lifetime: "Vitalício", trial: "Trial",
    };
    planChartInst.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: metrics.subsByPlan.map(p => planLabels[p.type] || p.type),
        datasets: [
          {
            label: "Assinaturas",
            data: metrics.subsByPlan.map(p => p.count),
            backgroundColor: COLORS.slice(0, metrics.subsByPlan.length).map(c => c + "cc"),
            borderColor: COLORS.slice(0, metrics.subsByPlan.length),
            borderWidth: 1,
            borderRadius: 6,
            yAxisID: "y",
          },
          {
            label: "Receita (R$)",
            data: metrics.subsByPlan.map(p => p.revenue),
            backgroundColor: "rgba(16,185,129,0.2)",
            borderColor: "rgb(16,185,129)",
            borderWidth: 2,
            borderRadius: 6,
            type: "bar" as const,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top", labels: { color: "#94a3b8", font: { size: 11 } } },
          tooltip: { backgroundColor: "rgba(15,23,42,0.95)", titleColor: "#f1f5f9", bodyColor: "#94a3b8" },
        },
        scales: {
          x: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#64748b" } },
          y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#64748b" } },
          y1: {
            position: "right",
            grid: { drawOnChartArea: false },
            ticks: { color: "#64748b", callback: (v) => `R$ ${Number(v).toLocaleString("pt-BR")}` },
          },
        },
      },
    });
    return () => planChartInst.current?.destroy();
  }, [metrics?.subsByPlan]);

  // ── Conversion Chart ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!metrics?.leadsByStatus?.length || !conversionChartRef.current) return;
    conversionChartInst.current?.destroy();
    const ctx = conversionChartRef.current.getContext("2d");
    if (!ctx) return;
    const statusLabels: Record<string, string> = {
      new: "Novo", contacted: "Contactado", qualified: "Qualificado",
      proposal: "Proposta", negotiation: "Negociação", won: "Convertido",
      lost: "Perdido", inactive: "Inativo",
    };
    const statusColors: Record<string, string> = {
      new: "#6366f1", contacted: "#06b6d4", qualified: "#10b981",
      proposal: "#f59e0b", negotiation: "#f97316", won: "#22c55e",
      lost: "#ef4444", inactive: "#64748b",
    };
    conversionChartInst.current = new Chart(ctx, {
      type: "polarArea",
      data: {
        labels: metrics.leadsByStatus.map(s => statusLabels[s.status] || s.status),
        datasets: [{
          data: metrics.leadsByStatus.map(s => s.count),
          backgroundColor: metrics.leadsByStatus.map(s => (statusColors[s.status] || "#6366f1") + "99"),
          borderColor: metrics.leadsByStatus.map(s => statusColors[s.status] || "#6366f1"),
          borderWidth: 1.5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "right", labels: { color: "#94a3b8", font: { size: 11 }, padding: 10 } },
          tooltip: { backgroundColor: "rgba(15,23,42,0.95)", titleColor: "#f1f5f9", bodyColor: "#94a3b8" },
        },
        scales: {
          r: {
            grid: { color: "rgba(255,255,255,0.05)" },
            ticks: { color: "#64748b", backdropColor: "transparent" },
          },
        },
      },
    });
    return () => conversionChartInst.current?.destroy();
  }, [metrics?.leadsByStatus]);

  const periodLabels: Record<Period, string> = {
    "7d": "7 dias", "30d": "30 dias", "90d": "90 dias", "1y": "1 ano",
  };

  const funnelColors: Record<string, string> = {
    lead: "bg-blue-500", qualified: "bg-indigo-500", proposal: "bg-purple-500",
    negotiation: "bg-amber-500", won: "bg-emerald-500", lost: "bg-red-500",
  };

  const stageOrder = ["lead", "qualified", "proposal", "negotiation", "won", "lost"];
  const sortedFunnel = [...(metrics?.funnelData || [])].sort(
    (a, b) => stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage)
  );
  const maxFunnelCount = sortedFunnel.reduce((m, f) => Math.max(m, f.count), 1);

    const hasData = Boolean(metrics?.kpis.newLeads || metrics?.kpis.wonDeals || metrics?.kpis.totalRevenue);
  const tabItems: { id: Tab; label: string }[] = [
    { id: "overview", label: "Visão Geral" },
    { id: "pipeline", label: "Pipeline" },
    { id: "activities", label: "Atividades" },
    { id: "targets", label: "Metas" },
  ];

  // Mostrar loading de autenticação enquanto verifica sessão
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não autenticado (redirectOnUnauthenticated já redireciona, mas por segurança)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Faça login para acessar o painel de vendas</p>
          <a href="/" className="text-indigo-400 hover:text-indigo-300 underline">Ir para o início</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/10 p-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Painel de Vendas</h1>
              <p className="text-xs text-slate-400">MultiLingue Universal — CRM & Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <SelectTrigger className="w-36 bg-white/10 border-white/20 text-white text-sm h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/20">
                {Object.entries(periodLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k} className="text-white hover:bg-white/10">
                    Últimos {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline" size="sm" onClick={() => refetch()}
              className="border-white/20 text-slate-300 hover:bg-white/10 hover:text-white h-8 px-3"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Atualizar
            </Button>
            <Button
              size="sm" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 h-8 px-3"
            >
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              {seedMutation.isPending ? "Gerando..." : "Dados Demo"}
            </Button>
            <Link href="/crm">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8 px-3">
                <Users className="w-3.5 h-3.5 mr-1.5" /> CRM
              </Button>
            </Link>
          </div>
        </div>
        {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {tabItems.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* ── Loading ───────────────────────────────────────────────────────────── */}
        {isLoading && (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Carregando métricas do CRM...</p>
            </div>
          </div>
        )}

        {/* ── Empty State ───────────────────────────────────────────────────────── */}
        {!isLoading && !hasData && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Sem dados ainda</h3>
            <p className="text-slate-400 mb-6 max-w-sm">
              Clique em "Dados Demo" para popular o CRM com dados de exemplo e visualizar o painel completo.
            </p>
            <Button
              onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              {seedMutation.isPending ? "Gerando dados..." : "Gerar Dados Demo"}
            </Button>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            OVERVIEW TAB
        ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && !isLoading && (
          <>
            {/* KPIs Row 1 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <KpiCard
                title="Receita Total" loading={isLoading}
                value={metrics?.kpis.totalRevenue?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) ?? "0,00"}
                prefix="R$ " icon={DollarSign} color="bg-emerald-500"
                trend="up" trendValue={`Últimos ${periodLabels[period]}`}
              />
              <KpiCard
                title="Novos Leads" loading={isLoading}
                value={metrics?.kpis.newLeads ?? 0}
                subtitle={`${metrics?.kpis.newUsers ?? 0} novos usuários`}
                icon={UserPlus} color="bg-blue-500"
                trend="up" trendValue="Período selecionado"
              />
              <KpiCard
                title="Negócios Ganhos" loading={isLoading}
                value={metrics?.kpis.wonDeals ?? 0}
                subtitle={`R$ ${(metrics?.kpis.wonValue ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                icon={Handshake} color="bg-indigo-500"
                trend={metrics?.kpis.wonDeals ? "up" : "neutral"}
                trendValue={`${metrics?.kpis.conversionRate ?? 0}% conversão`}
              />
              <KpiCard
                title="Pipeline Ativo" loading={isLoading}
                value={(metrics?.kpis.pipeline ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                prefix="R$ "
                subtitle={`${metrics?.kpis.activeDeals ?? 0} negócios em aberto`}
                icon={Target} color="bg-amber-500"
                trend="neutral" trendValue="Em andamento"
              />
            </div>

            {/* KPIs Row 2 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <KpiCard
                title="Taxa de Conversão" loading={isLoading}
                value={`${metrics?.kpis.conversionRate ?? 0}%`}
                subtitle="Leads → Clientes"
                icon={TrendingUp} color="bg-purple-500"
                trend={Number(metrics?.kpis.conversionRate) > 10 ? "up" : "down"}
                trendValue="Meta: 15%"
              />
              <KpiCard
                title="Negócios Perdidos" loading={isLoading}
                value={metrics?.kpis.lostDeals ?? 0}
                subtitle="No período"
                icon={TrendingDown} color="bg-red-500"
                trend="down" trendValue="Analisar motivos"
              />
              <KpiCard
                title="Ticket Médio" loading={isLoading}
                value={
                  metrics?.kpis.wonDeals
                    ? (metrics.kpis.wonValue / metrics.kpis.wonDeals).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                    : "0,00"
                }
                prefix="R$ "
                subtitle="Por negócio ganho"
                icon={Star} color="bg-yellow-500"
                trend="neutral" trendValue="Por negócio"
              />
              <KpiCard
                title="Novos Usuários" loading={isLoading}
                value={metrics?.kpis.newUsers ?? 0}
                subtitle="Cadastros no período"
                icon={Globe} color="bg-teal-500"
                trend="up" trendValue="Crescimento orgânico"
              />
            </div>

            {/* Charts Row 1: Revenue + Funnel + Conversion */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card className="lg:col-span-2 bg-white/5 border-white/10 shadow-xl" style={{ minHeight: '320px' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    Receita & Assinaturas por Mês
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: 260 }}>
                    {metrics?.revenueByMonth?.length ? (
                      <canvas ref={revenueChartRef} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                        Sem dados de receita no período
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 shadow-xl" style={{ minHeight: '320px' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Filter className="w-4 h-4 text-purple-400" />
                    Funil de Vendas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sortedFunnel.length ? (
                    <>
                      {sortedFunnel.map(f => (
                        <FunnelStage
                          key={f.stage} stage={f.stage} count={f.count}
                          value={f.value} maxCount={maxFunnelCount}
                          color={funnelColors[f.stage] || "bg-slate-500"}
                        />
                      ))}
                      <div className="pt-2 border-t border-white/10">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Total pipeline</span>
                          <span className="text-white font-semibold">
                            R$ {sortedFunnel.reduce((s, f) => s + f.value, 0).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
                      Sem negócios no funil
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/5 border-white/10 shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <MousePointer className="w-4 h-4 text-blue-400" />
                    Origem dos Leads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: 220 }}>
                    {metrics?.leadsBySource?.length ? (
                      <canvas ref={sourceChartRef} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                        Sem dados de origem
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    Planos Vendidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: 220 }}>
                    {metrics?.subsByPlan?.length ? (
                      <canvas ref={planChartRef} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                        Sem assinaturas
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Status dos Leads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: 220 }}>
                    {metrics?.leadsByStatus?.length ? (
                      <canvas ref={conversionChartRef} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                        Sem leads cadastrados
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row: Contacts + Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10 shadow-xl">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    Últimos Leads
                  </CardTitle>
                  <Link href="/crm">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white text-xs h-7 px-2">
                      Ver todos →
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-1">
                  {(contacts as any)?.contacts?.length ? (
                    (contacts as any).contacts.map((c: Record<string, unknown>) => (
                      <div key={String(c.id)} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {String(c.name || "?")[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">{String(c.name || "—")}</p>
                          <p className="text-xs text-slate-400 truncate">{String(c.email || c.company || "—")}</p>
                        </div>
                        <Badge className={`text-xs flex-shrink-0 border ${
                          c.status === "won" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                          c.status === "new" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                          c.status === "qualified" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" :
                          "bg-slate-500/20 text-slate-400 border-slate-500/30"
                        }`}>
                          {String(c.status || "—")}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
                      Nenhum lead cadastrado
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    Atividades Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics?.recentActivities?.length ? (
                    <div>
                      {(metrics.recentActivities as Record<string, unknown>[]).slice(0, 8).map((a, i) => (
                        <ActivityItem key={i} activity={a} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
                      Nenhuma atividade registrada
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            PIPELINE TAB
        ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "pipeline" && !isLoading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Pipeline de Negócios</h2>
              <Link href="/crm">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  <UserPlus className="w-4 h-4 mr-2" /> Novo Lead
                </Button>
              </Link>
            </div>
            {(deals as any)?.deals?.length ? (
              <div className="grid gap-3">
                {((deals as any).deals as Record<string, unknown>[]).map((deal) => (
                  <Card key={String(deal.id)} className="bg-white/5 border-white/10 hover:bg-white/8 transition-colors">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate">{String(deal.title || "—")}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{String(deal.contact_name || "—")}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-emerald-400 font-bold text-sm">
                            R$ {(Number(deal.value) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                          <Badge className={`text-xs border ${
                            deal.stage === "won" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                            deal.stage === "lost" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                            deal.stage === "negotiation" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                            "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                          }`}>
                            {String(deal.stage || "—")}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Handshake className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-slate-400">Nenhum negócio no pipeline</p>
                <Button onClick={() => seedMutation.mutate()} className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                  <Zap className="w-4 h-4 mr-2" /> Gerar Dados Demo
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            ACTIVITIES TAB
        ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "activities" && !isLoading && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Histórico de Atividades</h2>
            {metrics?.recentActivities?.length ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-4">
                  {(metrics.recentActivities as Record<string, unknown>[]).map((a, i) => (
                    <div key={i} className="py-1">
                      <ActivityItem activity={a} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Activity className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-slate-400">Nenhuma atividade registrada</p>
                <Button onClick={() => seedMutation.mutate()} className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                  <Zap className="w-4 h-4 mr-2" /> Gerar Dados Demo
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            TARGETS TAB
        ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "targets" && !isLoading && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Metas de Vendas</h2>
            {targets && (targets as unknown[]).length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {(targets as Record<string, unknown>[]).map((t) => {
                  const current = Number(t.current ?? 0);
                  const target = Number(t.target ?? 1);
                  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
                  return (
                    <Card key={String(t.id)} className="bg-white/5 border-white/10">
                      <CardContent className="py-4 px-5">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-white font-semibold">
                              {t.metric === "revenue" ? "Receita" : t.metric === "leads" ? "Leads" : String(t.metric)}
                            </p>
                            <p className="text-xs text-slate-400">
                              {t.period === "monthly" ? "Mensal" : t.period === "quarterly" ? "Trimestral" : "Anual"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">{pct}%</p>
                            <p className="text-xs text-slate-400">
                              {current.toLocaleString("pt-BR")} / {target.toLocaleString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <Progress value={pct} className="h-2" />
                        <div className="flex items-center gap-1 mt-2">
                          {pct >= 100 ? (
                            <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs text-emerald-400">Meta atingida!</span></>
                          ) : pct >= 75 ? (
                            <><Flame className="w-3.5 h-3.5 text-amber-400" /><span className="text-xs text-amber-400">Quase lá!</span></>
                          ) : (
                            <><Target className="w-3.5 h-3.5 text-slate-400" /><span className="text-xs text-slate-400">Em progresso</span></>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Target className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-slate-400 mb-2">Nenhuma meta configurada</p>
                <p className="text-slate-500 text-sm mb-6">Use o botão "Dados Demo" para gerar metas de exemplo</p>
                <Button onClick={() => seedMutation.mutate()} className="bg-indigo-600 hover:bg-indigo-700">
                  <Zap className="w-4 h-4 mr-2" /> Gerar Dados Demo
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
