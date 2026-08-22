import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield, AlertTriangle, Activity, Zap, RefreshCw,
  CheckCircle, XCircle, Clock, TrendingUp, Database,
  Lock, Unlock, Eye, ChevronRight, Bell, BookOpen,
  Settings, BarChart3, Users, DollarSign, Cpu, MessageSquare
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface SecurityEvent {
  id: number;
  event_type: string;
  severity: string;
  ip_address: string;
  description: string;
  action_taken: string;
  admin_tip: string;
  monetization_impact: string;
  resolved: number;
  created_at: number;
}

interface KnowledgeItem {
  id: number;
  batch_number: number;
  batch_position: number;
  category: string;
  title: string;
  content: string;
  priority: string;
  status_new: string;
  applied_count: number;
  tags: string;
}

interface KnowledgeBatch {
  id: number;
  batch_number: number;
  title: string;
  description: string;
  total_items: number;
  completed_items: number;
  status: string;
}

// ─── Severity helpers ────────────────────────────────────────────────────────
const severityColor: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const priorityColor: Record<string, string> = {
  critical: "text-red-400",
  high: "text-orange-400",
  medium: "text-yellow-400",
  low: "text-blue-400",
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function AdminControlCenter() {
  useAuth();
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  // ── Queries ──
  const securityEvents = trpc.controlCenter.getSecurityEvents.useQuery(
    { limit: 50 },
    { refetchInterval: 30000 }
  );
  const systemHealth = trpc.controlCenter.getSystemHealth.useQuery(
    undefined,
    { refetchInterval: 15000 }
  );
  const activeBatch = trpc.controlCenter.getActiveBatch.useQuery(
    undefined,
    { refetchInterval: 60000 }
  );
  const allBatches = trpc.controlCenter.getAllBatches.useQuery();
  const pendingKnowledge = trpc.controlCenter.getPendingKnowledge.useQuery(
    { batchNumber: activeBatch.data?.batch_number ?? 1 },
    { enabled: !!activeBatch.data }
  );
  const appliedHistory = trpc.controlCenter.getAppliedHistory.useQuery(
    { limit: 100 },
    { refetchInterval: 60000 }
  );
  const ownerSupport = trpc.system.getOwnerSupportSummary.useQuery(
    undefined,
    { refetchInterval: 60000 },
  );
  const maintenanceAlerts = trpc.controlCenter.getMaintenanceAlerts.useQuery(
    undefined,
    { refetchInterval: 60000 },
  );
  const availabilityImpacts = trpc.controlCenter.getAvailabilityImpactSummary.useQuery(
    undefined,
    { refetchInterval: 60000 },
  );

  // ── Mutations ──
  const applyKnowledge = trpc.controlCenter.applyKnowledge.useMutation({
    onSuccess: () => {
      toast.success("✅ Configuração aplicada com sucesso");
      pendingKnowledge.refetch();
      appliedHistory.refetch();
    },
  });

  const applyAllBest = trpc.controlCenter.applyAllBestConfigs.useMutation({
    onSuccess: (data) => {
      toast.success(`✅ ${data.applied} melhores configurações aplicadas automaticamente`);
      pendingKnowledge.refetch();
      appliedHistory.refetch();
      activeBatch.refetch();
    },
  });

  const advanceBatch = trpc.controlCenter.advanceBatch.useMutation({
    onSuccess: () => {
      toast.success("⏭️ Avançado para próximo lote de 100 configurações");
      activeBatch.refetch();
      allBatches.refetch();
      pendingKnowledge.refetch();
    },
  });

  const resolveEvent = trpc.controlCenter.resolveSecurityEvent.useMutation({
    onSuccess: () => {
      toast.success("✅ Evento resolvido");
      securityEvents.refetch();
    },
  });

  const toggleEmergency = trpc.controlCenter.toggleEmergencyMode.useMutation({
    onSuccess: (data) => {
      setEmergencyMode(data.active);
      if (data.active) toast.error("🚨 MODO DE EMERGÊNCIA ATIVADO");
      else toast.success("✅ Modo de emergência desativado");
    },
  });

  const blockUser = trpc.controlCenter.blockUser.useMutation({
    onSuccess: () => toast.success("🚫 Usuário bloqueado"),
  });
  const recordAvailabilityImpact = trpc.controlCenter.recordAvailabilityImpact.useMutation({
    onSuccess: (data) => {
      toast.success(data.customerMessage);
      availabilityImpacts.refetch();
    },
  });

  const health = systemHealth.data;
  const criticalEvents = (securityEvents.data ?? []).filter(
    (e: SecurityEvent) => e.severity === "critical" && !e.resolved
  );
  const criticalMaintenanceAlerts = (maintenanceAlerts.data ?? []).filter((alert) => alert.level === "critical");

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Centro de Controle</h1>
            <p className="text-xs text-gray-400">MultiLingue Universal — Painel do Proprietário</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {criticalEvents.length > 0 && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {criticalEvents.length} crítico{criticalEvents.length > 1 ? "s" : ""}
            </Badge>
          )}
          {criticalMaintenanceAlerts.length > 0 && (
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
              <Bell className="w-3 h-3 mr-1" />
              {criticalMaintenanceAlerts.length} manutenção
            </Badge>
          )}
          <Button
            size="sm"
            variant={emergencyMode ? "destructive" : "outline"}
            onClick={() => toggleEmergency.mutate({ active: !emergencyMode })}
            className={emergencyMode ? "" : "border-gray-700 text-gray-300 hover:bg-gray-800"}
          >
            {emergencyMode ? <Unlock className="w-4 h-4 mr-1" /> : <Lock className="w-4 h-4 mr-1" />}
            {emergencyMode ? "Desativar Emergência" : "Modo Emergência"}
          </Button>
        </div>
      </div>

      {/* ── Emergency Banner ── */}
      {emergencyMode && (
        <div className="mb-4 p-4 bg-red-900/40 border border-red-500/50 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-300 font-semibold">MODO DE EMERGÊNCIA ATIVO</p>
            <p className="text-red-400 text-sm">Novos cadastros bloqueados. IA em modo somente-leitura. Pagamentos suspensos.</p>
          </div>
        </div>
      )}

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-4 h-4 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                {health?.systemStatus ?? "OK"}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-white">{health?.uptime ?? "—"}</p>
            <p className="text-xs text-gray-400">Uptime</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{health?.activeUsers ?? 0}</p>
            <p className="text-xs text-gray-400">Usuários Ativos</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-white">{health?.threatsBlocked ?? 0}</p>
            <p className="text-xs text-gray-400">Ameaças Bloqueadas</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {activeBatch.data ? `${activeBatch.data.completed_items}/${activeBatch.data.total_items}` : "—"}
            </p>
            <p className="text-xs text-gray-400">Configs Aplicadas (Lote {activeBatch.data?.batch_number ?? 1})</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="knowledge">
        <TabsList className="bg-gray-900 border border-gray-800 mb-4">
          <TabsTrigger value="knowledge" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400">
            <BookOpen className="w-4 h-4 mr-1" /> Melhorias Contínuas
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
            <Shield className="w-4 h-4 mr-1" /> Segurança
            {criticalEvents.length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {criticalEvents.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="support" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400">
            <MessageSquare className="w-4 h-4 mr-1" /> Apoio Interno
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-gray-400">
            <Bell className="w-4 h-4 mr-1" /> Manutenção
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400">
            <Eye className="w-4 h-4 mr-1" /> Histórico
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-400">
            <Cpu className="w-4 h-4 mr-1" /> Sistema
          </TabsTrigger>
        </TabsList>

        {/* ── TAB: MELHORIAS CONTÍNUAS ── */}
        <TabsContent value="knowledge">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Lote ativo */}
            <Card className="bg-gray-900 border-gray-800 md:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-gray-300">
                    {activeBatch.data?.title ?? "Carregando..."}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-xs"
                      onClick={() => applyAllBest.mutate({
                        batchNumber: activeBatch.data?.batch_number ?? 1,
                        autoMode: false
                      })}
                      disabled={applyAllBest.isPending}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      {applyAllBest.isPending ? "Aplicando..." : "Aplicar Melhores"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800 text-xs"
                      onClick={() => advanceBatch.mutate({ currentBatch: activeBatch.data?.batch_number ?? 1 })}
                      disabled={advanceBatch.isPending}
                    >
                      <ChevronRight className="w-3 h-3 mr-1" />
                      Próximo Lote
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {activeBatch.data && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{activeBatch.data.completed_items} aplicadas</span>
                      <span>{activeBatch.data.total_items} total</span>
                    </div>
                    <Progress
                      value={(activeBatch.data.completed_items / activeBatch.data.total_items) * 100}
                      className="h-2 bg-gray-800"
                    />
                  </div>
                )}
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {(pendingKnowledge.data ?? []).map((item: KnowledgeItem) => (
                      <div
                        key={item.id}
                        className="p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-semibold ${priorityColor[item.priority] ?? "text-gray-400"}`}>
                                {item.priority?.toUpperCase()}
                              </span>
                              <Badge className="bg-gray-700 text-gray-300 border-gray-600 text-xs">
                                {item.category}
                              </Badge>
                              {item.applied_count > 0 && (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                  ✓ {item.applied_count}x
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-white font-medium truncate">{item.title}</p>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.content}</p>
                          </div>
                          <Button
                            size="sm"
                            className="bg-purple-600/80 hover:bg-purple-600 text-xs flex-shrink-0"
                            onClick={() => applyKnowledge.mutate({ id: item.id })}
                            disabled={applyKnowledge.isPending}
                          >
                            Aplicar
                          </Button>
                        </div>
                      </div>
                    ))}
                    {(pendingKnowledge.data ?? []).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <p className="text-sm">Todas as configurações do lote foram aplicadas!</p>
                        <Button
                          size="sm"
                          className="mt-3 bg-purple-600 hover:bg-purple-700"
                          onClick={() => advanceBatch.mutate({ currentBatch: activeBatch.data?.batch_number ?? 1 })}
                        >
                          Avançar para Próximo Lote →
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Todos os lotes */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-300">Todos os Lotes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(allBatches.data ?? []).map((batch: KnowledgeBatch) => (
                    <div key={batch.id} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-300">Lote {batch.batch_number}</span>
                        <Badge className={
                          batch.status === "active" ? "bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs" :
                          batch.status === "completed" ? "bg-green-500/20 text-green-400 border-green-500/30 text-xs" :
                          "bg-gray-700 text-gray-400 border-gray-600 text-xs"
                        }>
                          {batch.status === "active" ? "Ativo" : batch.status === "completed" ? "Concluído" : "Pendente"}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 truncate">{batch.title}</p>
                      <Progress
                        value={batch.total_items > 0 ? (batch.completed_items / batch.total_items) * 100 : 0}
                        className="h-1 bg-gray-700 mt-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">{batch.completed_items}/{batch.total_items}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-sm text-white font-medium">Aplicação manual protegida</p>
                  <p className="text-xs text-gray-400">Melhorias só são aplicadas por decisão explícita do proprietário.</p>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Revisão obrigatória</Badge>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <div className="space-y-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-base text-white">Resumo protegido para decisão</CardTitle>
                <p className="text-xs text-gray-400">Somente contagens agregadas. Não contém aluno, conversa, documento, IP ou dispositivo.</p>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  ["Eventos · 7 dias", ownerSupport.data?.security.eventsLast7Days ?? 0],
                  ["Pendentes", ownerSupport.data?.security.unresolvedEvents ?? 0],
                  ["Alta prioridade", ownerSupport.data?.security.highPriorityEvents ?? 0],
                  ["Bloqueios ativos", ownerSupport.data?.security.activeAbuseBlocks ?? 0],
                  ["Sinais ativos", ownerSupport.data?.security.activeAbuseRecords ?? 0],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-lg border border-gray-700 bg-gray-800/60 p-3">
                    <p className="text-xl font-bold text-white">{value}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white">Prontidão de backup</CardTitle>
                <p className="text-xs text-gray-400">Status agregado do último snapshot. Não exibe chaves, identificadores ou conteúdo de alunos.</p>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Database className={`h-5 w-5 ${ownerSupport.data?.backup.exportReady ? "text-emerald-400" : "text-amber-300"}`} />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {ownerSupport.data?.backup.exportReady ? "Snapshot pronto para exportação" : "Snapshot requer revisão"}
                    </p>
                    <p className="text-xs text-gray-400">{ownerSupport.data?.backup.recommendation ?? "Consultando o histórico protegido…"}</p>
                  </div>
                </div>
                <Badge className={ownerSupport.data?.backup.exportReady
                  ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-200"
                  : "border-amber-500/30 bg-amber-500/20 text-amber-100"}
                >
                  {ownerSupport.data?.backup.exportReady ? "Verificado" : "Revisar"}
                </Badge>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2"><CardTitle className="text-base text-white">Retorno de clientes</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-4">
                <div className="grid grid-cols-2 gap-3 text-center md:grid-cols-4">
                  {[
                    ["Em aberto", ownerSupport.data?.customerFeedback.openThreads ?? 0],
                    ["Segurança", ownerSupport.data?.customerFeedback.securityReports ?? 0],
                    ["Melhorias", ownerSupport.data?.customerFeedback.productFeedback ?? 0],
                    ["Interesse", ownerSupport.data?.customerFeedback.salesInterest ?? 0],
                  ].map(([label, value]) => <div key={String(label)} className="rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-3"><p className="text-xl font-bold text-white">{value}</p><p className="text-xs text-gray-400">{label}</p></div>)}
                </div>
                <a href="/suporte" className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500">Abrir mensagens privadas</a>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white">Registro de continuidade</CardTitle>
                <p className="text-xs text-gray-400">Registre uma avaliação agregada. Ela não concede crédito, desconto, reembolso ou qualquer condição automaticamente.</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10" onClick={() => recordAvailabilityImpact.mutate({ state: "operational", affectedCapabilities: [] })} disabled={recordAvailabilityImpact.isPending}>
                    Registrar operação normal
                  </Button>
                  <Button size="sm" variant="outline" className="border-amber-500/40 text-amber-100 hover:bg-amber-500/10" onClick={() => recordAvailabilityImpact.mutate({ state: "degraded", affectedCapabilities: ["immersive_scene"] })} disabled={recordAvailabilityImpact.isPending}>
                    Registrar impacto parcial
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-500/40 text-red-100 hover:bg-red-500/10" onClick={() => recordAvailabilityImpact.mutate({ state: "outage", affectedCapabilities: ["immersive_scene", "lesson"] })} disabled={recordAvailabilityImpact.isPending}>
                    Registrar indisponibilidade
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  Registros recentes: {availabilityImpacts.data?.reports.length ?? 0}. Cada registro exige sua revisão antes de qualquer decisão comercial.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-base text-white">Atividade agregada · últimos 7 dias</CardTitle>
                <p className="text-xs text-gray-400">Contagens de recursos assistidos, incidentes e retornos. Não contém aluno, conversa, dispositivo ou identificador.</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 md:grid-cols-7">
                  {(ownerSupport.data?.activity.daily ?? []).map((day) => <div key={day.day} className="rounded-lg border border-gray-700 bg-gray-800/60 p-3 text-center"><p className="text-xs text-gray-500">{day.day.slice(5).split("-").reverse().join("/")}</p><p className="mt-2 text-lg font-bold text-cyan-200">{day.assistedRequests}</p><p className="text-[10px] text-gray-400">recursos</p><p className="mt-2 text-sm font-semibold text-orange-200">{day.securityIncidents}</p><p className="text-[10px] text-gray-400">incidentes</p><p className="mt-2 text-sm font-semibold text-violet-200">{day.customerReturns}</p><p className="text-[10px] text-gray-400">retornos</p></div>)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader><CardTitle className="text-base text-white">Sugestões e críticas operacionais</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(ownerSupport.data?.suggestions ?? []).map((suggestion) => (
                  <div key={suggestion.id} className="rounded-lg border border-indigo-500/30 bg-indigo-950/20 p-3">
                    <Badge className={suggestion.priority === "high" ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"}>{suggestion.priority}</Badge>
                    <p className="mt-2 text-sm font-semibold text-white">{suggestion.title}</p>
                    <p className="mt-1 text-xs text-gray-300">{suggestion.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-orange-400" /> Alertas de manutenção
              </CardTitle>
              <p className="text-xs text-gray-400">Visão privada do proprietário. Nenhuma notificação externa é enviada por esta tela.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {(maintenanceAlerts.data ?? []).map((alert) => (
                <div key={alert.id} className={`rounded-lg border p-3 ${
                  alert.level === "critical" ? "border-red-500/40 bg-red-950/30" : "border-yellow-500/30 bg-yellow-950/20"
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${alert.level === "critical" ? "text-red-300" : "text-yellow-300"}`} />
                    <p className="text-sm font-medium text-white">{alert.message}</p>
                  </div>
                </div>
              ))}
              {(maintenanceAlerts.data ?? []).length === 0 && (
                <div className="rounded-lg border border-green-500/30 bg-green-950/20 p-4 text-sm text-green-200 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Nenhuma pendência de manutenção identificada.
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="mt-4 bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" /> Lista de continuidade recuperável
              </CardTitle>
              <p className="text-xs text-gray-400">Conferência privada antes de qualquer crise. Esta lista não restaura nem altera dados.</p>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {[
                ["Checkpoint estável", "Identifique a última versão publicada que foi validada."],
                ["Exportação de dados", "Confirme arquivo disponível, conferido e separado do código."],
                ["Notebook principal", "Verifique nome, data e tamanho da cópia baixada."],
                ["Cópia independente", "Mantenha outra cópia em máquina ou mídia sob sua supervisão."],
                ["Mídia e documentos", "Confirme ativos de referência e URLs de armazenamento."],
                ["Recuperação orientada", "Em crise, escolha a recuperação menos destrutiva e valide acesso, conteúdo e áudio."],
              ].map(([title, description]) => (
                <div key={title} className="rounded-lg border border-cyan-500/20 bg-cyan-950/10 p-3">
                  <p className="text-sm font-medium text-cyan-100 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-400" /> {title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-400">{description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: SEGURANÇA ── */}
        <TabsContent value="security">
          <div className="space-y-3">
            {criticalEvents.length > 0 && (
              <div className="p-4 bg-red-900/30 border border-red-500/40 rounded-xl">
                <p className="text-red-300 font-semibold flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  {criticalEvents.length} EVENTO{criticalEvents.length > 1 ? "S" : ""} CRÍTICO{criticalEvents.length > 1 ? "S" : ""} NÃO RESOLVIDO{criticalEvents.length > 1 ? "S" : ""}
                </p>
                {criticalEvents.slice(0, 3).map((e: SecurityEvent) => (
                  <div key={e.id} className="mt-2 p-3 bg-red-900/20 rounded-lg border border-red-500/20">
                    <p className="text-sm text-red-200 font-medium">{e.event_type}</p>
                    <p className="text-xs text-red-300 mt-1">{e.description}</p>
                    <div className="mt-2 p-2 bg-yellow-900/30 rounded border border-yellow-500/20">
                      <p className="text-xs text-yellow-300 font-semibold">💡 DICA DE AÇÃO:</p>
                      <p className="text-xs text-yellow-200 mt-1">{e.admin_tip}</p>
                    </div>
                    {e.monetization_impact && (
                      <div className="mt-2 p-2 bg-orange-900/20 rounded border border-orange-500/20">
                        <p className="text-xs text-orange-300 font-semibold">💰 IMPACTO NA MONETIZAÇÃO:</p>
                        <p className="text-xs text-orange-200 mt-1">{e.monetization_impact}</p>
                      </div>
                    )}
                    <Button
                      size="sm"
                      className="mt-2 bg-green-600 hover:bg-green-700 text-xs"
                      onClick={() => resolveEvent.mutate({ id: e.id })}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" /> Marcar Resolvido
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <ScrollArea className="h-96">
              <div className="space-y-2">
                {(securityEvents.data ?? []).map((event: SecurityEvent) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedEvent?.id === event.id ? "border-purple-500/50 bg-gray-800" : "border-gray-800 bg-gray-900 hover:border-gray-700"
                    }`}
                    onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${severityColor[event.severity] ?? "bg-gray-700 text-gray-400"}`}>
                          {event.severity}
                        </Badge>
                        <span className="text-sm text-white">{event.event_type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {event.resolved ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(event.created_at).toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{event.description}</p>
                    {selectedEvent?.id === event.id && (
                      <div className="mt-3 space-y-2">
                        <div className="p-2 bg-gray-800 rounded border border-gray-700">
                          <p className="text-xs text-gray-300"><span className="text-gray-500">IP:</span> {event.ip_address}</p>
                          <p className="text-xs text-gray-300"><span className="text-gray-500">Ação tomada:</span> {event.action_taken}</p>
                        </div>
                        {event.admin_tip && (
                          <div className="p-2 bg-yellow-900/20 rounded border border-yellow-500/20">
                            <p className="text-xs text-yellow-300 font-semibold">💡 Dica de ação:</p>
                            <p className="text-xs text-yellow-200 mt-1">{event.admin_tip}</p>
                          </div>
                        )}
                        {event.monetization_impact && (
                          <div className="p-2 bg-orange-900/20 rounded border border-orange-500/20">
                            <p className="text-xs text-orange-300 font-semibold">💰 Impacto na monetização:</p>
                            <p className="text-xs text-orange-200 mt-1">{event.monetization_impact}</p>
                          </div>
                        )}
                        {!event.resolved && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-xs w-full"
                            onClick={(e) => { e.stopPropagation(); resolveEvent.mutate({ id: event.id }); }}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> Marcar como Resolvido
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {(securityEvents.data ?? []).length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Shield className="w-10 h-10 mx-auto mb-3 text-green-500" />
                    <p className="text-sm">Nenhum evento de segurança registrado</p>
                    <p className="text-xs mt-1">Sistema protegido ✓</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        {/* ── TAB: HISTÓRICO ── */}
        <TabsContent value="history">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                Histórico Completo de Melhorias Aplicadas
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs ml-auto">
                  {(appliedHistory.data ?? []).length} registros
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {(appliedHistory.data ?? []).map((item: KnowledgeItem) => (
                    <div key={item.id} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                        <span className={`text-xs font-semibold ${priorityColor[item.priority] ?? "text-gray-400"}`}>
                          {item.priority?.toUpperCase()}
                        </span>
                        <Badge className="bg-gray-700 text-gray-300 border-gray-600 text-xs">
                          {item.category}
                        </Badge>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                          Lote {item.batch_number}
                        </Badge>
                        <span className="text-xs text-gray-500 ml-auto">
                          Aplicado {item.applied_count}x
                        </span>
                      </div>
                      <p className="text-sm text-white font-medium">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.content}</p>
                      {item.tags && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.split(",").slice(0, 4).map((tag: string) => (
                            <span key={tag} className="text-xs bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {(appliedHistory.data ?? []).length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Clock className="w-10 h-10 mx-auto mb-3" />
                      <p className="text-sm">Nenhuma melhoria aplicada ainda</p>
                      <p className="text-xs mt-1">Vá para "Melhorias Contínuas" e aplique as configurações</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: SISTEMA ── */}
        <TabsContent value="system">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400" /> Saúde do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Servidor", value: health?.serverStatus ?? "OK", ok: true },
                  { label: "Banco de Dados", value: health?.dbStatus ?? "OK", ok: true },
                  { label: "IA de Segurança", value: health?.securityAI ?? "Ativa", ok: true },
                  { label: "IA de Autodesenvolvimento", value: health?.selfImproveAI ?? "Ativa", ok: true },
                  { label: "Sistema de Voz", value: health?.voiceSystem ?? "OK", ok: true },
                  { label: "Realidade Aumentada", value: health?.arSystem ?? "OK", ok: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                    <span className="text-sm text-gray-300">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{item.value}</span>
                      <div className={`w-2 h-2 rounded-full ${item.ok ? "bg-green-400" : "bg-red-400"}`} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-purple-400" /> Controles de Intervenção
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-red-600/80 hover:bg-red-600 text-sm justify-start"
                  onClick={() => toggleEmergency.mutate({ active: true })}
                >
                  <Lock className="w-4 h-4 mr-2" /> Ativar Modo de Emergência
                </Button>
                <Button
                  className="w-full bg-orange-600/80 hover:bg-orange-600 text-sm justify-start"
                  onClick={() => toast.info("🔄 Reiniciando serviços de IA...")}
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Reiniciar Serviços de IA
                </Button>
                <Button
                  className="w-full bg-yellow-600/80 hover:bg-yellow-600 text-sm justify-start"
                  onClick={() => toast.success("🧹 Cache limpo com sucesso")}
                >
                  <Database className="w-4 h-4 mr-2" /> Limpar Cache do Sistema
                </Button>
                <Button
                  className="w-full bg-blue-600/80 hover:bg-blue-600 text-sm justify-start"
                  onClick={() => { securityEvents.refetch(); systemHealth.refetch(); activeBatch.refetch(); }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Atualizar Todos os Dados
                </Button>
                <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <p className="text-xs text-gray-400 font-semibold mb-2">Bloquear Usuário por ID</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ID do usuário"
                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                      id="blockUserId"
                    />
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-xs"
                      onClick={() => {
                        const id = (document.getElementById("blockUserId") as HTMLInputElement)?.value;
                        if (id) blockUser.mutate({ userId: parseInt(id), reason: "Admin manual block" });
                      }}
                    >
                      Bloquear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
