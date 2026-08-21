/**
 * ADMIN MODERATION DASHBOARD
 * 
 * Dashboard completo de moderação para o proprietário:
 * - Alertas de violações em tempo real
 * - Logs de conversas
 * - Gerenciamento de blacklist/whitelist
 * - Estatísticas de moderação
 * - Exportação de logs para auditoria
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle, XCircle, Clock, Shield, MessageSquare, Ban, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminModeration() {
  const { toast } = useToast();
  const [selectedAlert, setSelectedAlert] = useState<number | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [newBlockedWord, setNewBlockedWord] = useState("");

  // Queries
  const { data: stats } = trpc.moderation.getStats.useQuery();
  const { data: pendingAlerts } = trpc.moderation.getPendingAlerts.useQuery();
  const { data: recentLogs } = trpc.moderation.getRecentLogs.useQuery({ limit: 50 });
  const { data: blockedWords } = trpc.moderation.getBlockedWords.useQuery();

  // Mutations
  const reviewAlert = trpc.moderation.reviewAlert.useMutation({
    onSuccess: () => {
      toast.success("Alerta revisado com sucesso!");
      setSelectedAlert(null);
      setReviewNotes("");
    },
  });

  const addBlockedWord = trpc.moderation.addBlockedWord.useMutation({
    onSuccess: () => {
      toast.success("Palavra adicionada à blacklist!");
      setNewBlockedWord("");
    },
  });

  const removeBlockedWord = trpc.moderation.removeBlockedWord.useMutation({
    onSuccess: () => {
      toast.success("Palavra removida da blacklist!");
    },
  });

  const exportLogs = trpc.moderation.exportLogs.useMutation({
    onSuccess: (data) => {
      // Download CSV
      const blob = new Blob([data.csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `moderation-logs-${new Date().toISOString()}.csv`;
      a.click();
      toast.success("Resumo de moderação exportado com sucesso!");
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Moderação de Conteúdo</h1>
          <p className="text-muted-foreground">
            Controle total sobre segurança e compliance
          </p>
        </div>
        <Button
          onClick={() => exportLogs.mutate({ startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() })}
          disabled={exportLogs.isPending}
        >
          <FileText className="mr-2 h-4 w-4" />
          Exportar Resumo (30 dias)
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingAlerts || 0}</div>
            <p className="text-xs text-muted-foreground">Requerem revisão</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversas Hoje</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.conversationsToday || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.blockedToday || 0} bloqueadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Bloqueio</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.blockRate ? `${(stats.blockRate * 100).toFixed(1)}%` : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Palavras Bloqueadas</CardTitle>
            <Ban className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockedWords?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Na blacklist</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">
            Alertas Pendentes
            {(stats?.pendingAlerts || 0) > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats?.pendingAlerts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="logs">Resumo de Moderação</TabsTrigger>
          <TabsTrigger value="blacklist">Blacklist/Whitelist</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>

        {/* ALERTAS PENDENTES */}
        <TabsContent value="alerts" className="space-y-4">
          {!pendingAlerts || pendingAlerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                <p className="text-lg font-medium">Nenhum alerta pendente!</p>
                <p className="text-sm text-muted-foreground">
                  Todas violações foram revisadas
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingAlerts.map((alert: any) => (
              <Card key={alert.id} className="border-l-4 border-l-yellow-600">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Badge variant={
                          alert.severity === "critical" ? "destructive" :
                          alert.severity === "high" ? "destructive" :
                          alert.severity === "medium" ? "default" : "secondary"
                        }>
                          {alert.severity}
                        </Badge>
                        <span className="text-base">{alert.violationType.replace(/_/g, " ")}</span>
                      </CardTitle>
                      <CardDescription>{new Date(alert.createdAt).toLocaleString("pt-BR")}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAlert(alert.id)}
                      >
                        Revisar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedAlert === alert.id && (
                    <div className="space-y-3 pt-4 border-t">
                      <div>
                        <label className="text-sm font-medium">Notas de Revisão:</label>
                        <Textarea
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          placeholder="Adicione suas observações sobre esta violação..."
                          className="mt-2"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            reviewAlert.mutate({
                              alertId: alert.id,
                              status: "resolved",
                              actionTaken: "warning_sent",
                              reviewNotes,
                            });
                          }}
                          disabled={reviewAlert.isPending}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Aprovar (Enviar Aviso)
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            reviewAlert.mutate({
                              alertId: alert.id,
                              status: "resolved",
                              actionTaken: "user_suspended",
                              reviewNotes,
                            });
                          }}
                          disabled={reviewAlert.isPending}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Suspender Usuário
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            reviewAlert.mutate({
                              alertId: alert.id,
                              status: "dismissed",
                              actionTaken: "none",
                              reviewNotes,
                            });
                          }}
                          disabled={reviewAlert.isPending}
                        >
                          Descartar
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* RESUMO DE MODERAÇÃO */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registros Recentes de Moderação</CardTitle>
              <CardDescription>Últimas 50 interações, apresentadas sem conteúdo de conversa ou identificação do aluno</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLogs?.map((log: any, index: number) => (
                  <div
                    key={`${String(log.createdAt)}-${index}`}
                    className={`p-4 rounded-lg border ${
                      log.wasBlocked ? "bg-red-50 border-red-200" :
                      log.wasReformulated ? "bg-yellow-50 border-yellow-200" :
                      "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {log.conversationType.replace(/_/g, " ")}
                        </Badge>
                        <Badge variant="secondary">
                          {log.userAgeGroup}
                        </Badge>
                        {log.wasBlocked && (
                          <Badge variant="destructive">BLOQUEADO</Badge>
                        )}
                        {log.wasReformulated && (
                          <Badge variant="default">REFORMULADO</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString("pt-BR")}
                      </span>
                    </div>

                    {log.moderationScore != null && log.moderationScore > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs">
                          Score de Moderação: <strong>{log.moderationScore?.toFixed(1)}</strong>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BLACKLIST/WHITELIST */}
        <TabsContent value="blacklist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Palavras Bloqueadas</CardTitle>
              <CardDescription>
                Adicione palavras customizadas à blacklist global
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite a palavra a bloquear..."
                  value={newBlockedWord}
                  onChange={(e) => setNewBlockedWord(e.target.value)}
                />
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Faixa etária" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="infantil">Infantil</SelectItem>
                    <SelectItem value="adolescente">Adolescente</SelectItem>
                    <SelectItem value="adulto">Adulto</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => {
                    if (newBlockedWord.trim()) {
                      addBlockedWord.mutate({
                        word: newBlockedWord.trim(),
                        ageGroups: ["all"],
                        severity: "medium",
                        reason: "Adicionado manualmente pelo proprietário",
                      });
                    }
                  }}
                  disabled={!newBlockedWord.trim() || addBlockedWord.isPending}
                >
                  Adicionar
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Palavras Bloqueadas ({blockedWords?.length || 0}):</p>
                <div className="flex flex-wrap gap-2">
                  {blockedWords?.map((word: any) => (
                    <Badge key={word.id} variant="secondary" className="gap-2">
                      {word.content}
                      <button
                        onClick={() => removeBlockedWord.mutate({ wordId: word.id })}
                        className="hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ESTATÍSTICAS */}
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Moderação</CardTitle>
              <CardDescription>Métricas dos últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Total de Conversas</p>
                    <p className="text-3xl font-bold">{stats?.totalConversations || 0}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Bloqueadas</p>
                    <p className="text-3xl font-bold text-red-600">
                      {stats?.totalBlocked || 0}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Reformuladas</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {stats?.totalReformulated || 0}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Violações por Tipo:</p>
                  <div className="space-y-2">
                    {stats?.violationsByType?.map((item: any) => (
                      <div key={item.type} className="flex items-center justify-between">
                        <span className="text-sm">{item.type.replace(/_/g, " ")}</span>
                        <Badge>{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
