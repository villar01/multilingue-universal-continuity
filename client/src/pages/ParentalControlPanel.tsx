import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, Clock, Bell, Plus, Trash2, Lock, TrendingUp, BookOpen, Timer, AlertCircle, CheckCircle2 } from 'lucide-react';
import CybersecurityAlert from '@/components/CybersecurityAlert';

const DAY_NAMES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const EMOJI_OPTIONS = ['👧', '👦', '🧒', '👶', '🧑', '👨', '👩'];

export default function ParentalControlPanel() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  // Queries
  const { data: children, isLoading: childrenLoading } = trpc.parentalControl.listChildren.useQuery();
  const { data: alerts } = trpc.parentalControl.listAlerts.useQuery({ childId: 0 });

  // Mutations
  const createChild = trpc.parentalControl.createChild.useMutation({
    onSuccess: () => utils.parentalControl.listChildren.invalidate(),
  });
  const deleteChild = trpc.parentalControl.deleteChild.useMutation({
    onSuccess: () => utils.parentalControl.listChildren.invalidate(),
  });
  const updateSettings = trpc.parentalControl.updateSettings.useMutation();
  const verifyPin = trpc.parentalControl.verifyPin.useMutation();
  const markAlertRead = trpc.parentalControl.markAlertRead.useMutation({
    onSuccess: () => utils.parentalControl.listAlerts.invalidate(),
  });

  // State
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildEmoji, setNewChildEmoji] = useState('👧');
  const [newChildLevel, setNewChildLevel] = useState<'infantil' | 'adolescente' | 'adulto'>('infantil');
  const [pinInput, setPinInput] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [pinError, setPinError] = useState('');

  // Auto-select first child
  useEffect(() => {
    if (children && children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const selectedChild = children?.find((c: any) => c.id === selectedChildId);

  const handleAddChild = useCallback(async () => {
    if (!newChildName.trim()) return;
    await createChild.mutateAsync({
      name: newChildName,
      emoji: newChildEmoji,
      level: newChildLevel,
    });
    setNewChildName('');
    setShowAddChild(false);
  }, [newChildName, newChildEmoji, newChildLevel, createChild]);

  const handleVerifyPin = useCallback(async () => {
    if (!selectedChildId) return;
    const result = await verifyPin.mutateAsync({ childId: selectedChildId, pin: pinInput });
    if (result.valid) {
      setPinVerified(true);
      setPinError('');
    } else {
      setPinError('PIN incorreto. Tente novamente.');
    }
  }, [selectedChildId, pinInput, verifyPin]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-400">Faça login para acessar o Painel de Controle Parental</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold">Painel de Controle Parental</h1>
              <p className="text-xs text-slate-400">Monitore e gerencie o aprendizado em tempo real</p>
            </div>
          </div>
          <Dialog open={showAddChild} onOpenChange={setShowAddChild}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-1" /> Adicionar Criança
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Perfil de Criança</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="child-name">Nome da Criança</Label>
                  <Input
                    id="child-name"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    placeholder="Ex: Maria"
                  />
                </div>
                <div>
                  <Label>Emoji</Label>
                  <div className="flex gap-2 flex-wrap">
                    {EMOJI_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setNewChildEmoji(emoji)}
                        className={`text-2xl p-2 rounded-lg border-2 transition-all ${
                          newChildEmoji === emoji ? 'border-blue-500 bg-blue-500/20' : 'border-slate-700'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Nível</Label>
                  <Select value={newChildLevel} onValueChange={(v) => setNewChildLevel(v as 'infantil' | 'adolescente' | 'adulto')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="infantil">Infantil (até 10 anos)</SelectItem>
                      <SelectItem value="adolescente">Adolescente (11-17 anos)</SelectItem>
                      <SelectItem value="adulto">Adulto (18+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddChild(false)}>Cancelar</Button>
                <Button onClick={handleAddChild} disabled={!newChildName.trim() || createChild.isPending}>
                  {createChild.isPending ? 'Criando...' : 'Criar Perfil'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {childrenLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : !children || children.length === 0 ? (
          <Card className="max-w-md mx-auto mt-20 bg-slate-900/50 border-slate-800">
            <CardContent className="pt-6 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h2 className="text-lg font-semibold mb-2">Nenhum perfil de criança ainda</h2>
              <p className="text-slate-400 mb-4">Crie um perfil para cada criança e monitore o progresso de aprendizado.</p>
              <Button onClick={() => setShowAddChild(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-1" /> Criar Primeiro Perfil
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Children List Sidebar */}
            <div className="lg:col-span-1 space-y-2">
              <h2 className="text-sm font-semibold text-slate-400 uppercase mb-3">Crianças</h2>
              {children.map((child: any) => (
                <button
                  key={child.id}
                  onClick={() => { setSelectedChildId(child.id); setPinVerified(false); setPinInput(''); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    selectedChildId === child.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl">{child.emoji}</span>
                  <div className="text-left flex-1">
                    <p className="font-medium text-sm">{child.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{child.level}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {selectedChild && (
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-slate-900/50">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
                      <TrendingUp className="w-4 h-4 mr-1" /> Visão Geral
                    </TabsTrigger>
                    <TabsTrigger value="limits" className="data-[state=active]:bg-blue-600">
                      <Clock className="w-4 h-4 mr-1" /> Limites
                    </TabsTrigger>
                    <TabsTrigger value="alerts" className="data-[state=active]:bg-blue-600">
                      <Bell className="w-4 h-4 mr-1" /> Alertas
                    </TabsTrigger>
                    <TabsTrigger value="security" className="data-[state=active]:bg-blue-600">
                      <Lock className="w-4 h-4 mr-1" /> Segurança
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="mt-4 space-y-4">
                    <UsageOverview childId={selectedChild.id} childName={selectedChild.name} />
                  </TabsContent>

                  {/* Limits Tab */}
                  <TabsContent value="limits" className="mt-4 space-y-4">
                    <LimitsTab childId={selectedChild.id} />
                  </TabsContent>

                  {/* Alerts Tab */}
                  <TabsContent value="alerts" className="mt-4 space-y-4">
                    <AlertsTab alerts={alerts?.filter((a: any) => a.childId === selectedChild.id) || []} onMarkRead={(id) => markAlertRead.mutate({ alertId: id })} />
                  </TabsContent>

                  {/* Security Tab */}
                  <TabsContent value="security" className="mt-4 space-y-4">
                    <SecurityTab
                      childId={selectedChild.id}
                      pinVerified={pinVerified}
                      pinInput={pinInput}
                      setPinInput={setPinInput}
                      onVerify={handleVerifyPin}
                      pinError={pinError}
                      onDelete={() => { deleteChild.mutate({ childId: selectedChild.id }); setSelectedChildId(null); }}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Usage Overview Component ──────────────────────────────────
function UsageOverview({ childId, childName }: { childId: number; childName: string }) {
  const { data: todayUsage, isLoading } = trpc.parentalControl.getTodayUsage.useQuery({ childId });
  const { data: weeklyUsage } = trpc.parentalControl.getWeeklyUsage.useQuery({ childId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const today = todayUsage || { totalMinutes: 0, totalLessons: 0, avgAccuracy: 0, sessionsCount: 0 };
  const week = weeklyUsage || { totalMinutes: 0, totalLessons: 0, sessions: [] };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-400">Hoje</span>
            </div>
            <p className="text-2xl font-bold">{today.totalMinutes}<span className="text-sm text-slate-400 ml-1">min</span></p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-green-400" />
              <span className="text-xs text-slate-400">Lições Hoje</span>
            </div>
            <p className="text-2xl font-bold">{today.totalLessons}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-slate-400">Precisão</span>
            </div>
            <p className="text-2xl font-bold">{Math.round(today.avgAccuracy)}<span className="text-sm text-slate-400 ml-1">%</span></p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-slate-400">Esta Semana</span>
            </div>
            <p className="text-2xl font-bold">{week.totalMinutes}<span className="text-sm text-slate-400 ml-1">min</span></p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Sessions */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-base">Sessões Recentes de {childName}</CardTitle>
        </CardHeader>
        <CardContent>
          {week.sessions && week.sessions.length > 0 ? (
            <div className="space-y-2">
              {week.sessions.slice(0, 10).map((session: any) => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(session.sessionStart).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(session.sessionStart).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-slate-400">
                        {session.minutesUsed} min · {session.lessonsCompleted} lições · {Math.round(session.accuracyScore)}% precisão
                      </p>
                    </div>
                  </div>
                  {session.sessionEnd ? (
                    <Badge variant="outline" className="text-green-400 border-green-500/30">Concluída</Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">Em andamento</Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-4">Nenhuma sessão registrada esta semana</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Limits Tab ───────────────────────────────────────────────
function LimitsTab({ childId }: { childId: number }) {
  const utils = trpc.useUtils();
  const { data: settings } = trpc.parentalControl.getSettings.useQuery({ childId });
  const updateSettings = trpc.parentalControl.updateSettings.useMutation({
    onSuccess: () => utils.parentalControl.getSettings.invalidate({ childId }),
  });

  const [timeLimit, setTimeLimit] = useState(60);
  const [allowedDays, setAllowedDays] = useState<boolean[]>([true, true, true, true, true, false, false]);
  const [levels, setLevels] = useState<string[]>(['beginner']);

  useEffect(() => {
    if (settings) {
      setTimeLimit(settings.timeLimitMinutes || 60);
      setAllowedDays(settings.allowedDays || [true, true, true, true, true, false, false]);
      setLevels(settings.levelsAllowed || ['beginner']);
    }
  }, [settings]);

  const handleSave = useCallback(() => {
    updateSettings.mutate({
      childId,
      timeLimitMinutes: timeLimit,
      allowedDays,
      levelsAllowed: levels,
    });
  }, [childId, timeLimit, allowedDays, levels, updateSettings]);

  return (
    <div className="space-y-4">
      {/* Time Limit */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" /> Limite de Tempo Diário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Minutos por dia</Label>
              <span className="text-2xl font-bold text-blue-400">{timeLimit}</span>
            </div>
            <input
              type="range"
              min="15"
              max="240"
              step="15"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>15 min</span>
              <span>4 horas</span>
            </div>
          </div>
          <Progress value={(timeLimit / 240) * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Allowed Days */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-400" /> Dias Permitidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {DAY_NAMES.map((day, idx) => (
              <button
                key={day}
                onClick={() => {
                  const newDays = [...allowedDays];
                  newDays[idx] = !newDays[idx];
                  setAllowedDays(newDays);
                }}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  allowedDays[idx]
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-slate-700 bg-slate-800/30 text-slate-500'
                }`}
              >
                <span className="text-sm font-medium">{day}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Level Access */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" /> Níveis Liberados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['beginner', 'intermediate', 'advanced'].map(level => (
              <div key={level} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <div>
                  <p className="font-medium capitalize">{level === 'beginner' ? 'Iniciante' : level === 'intermediate' ? 'Intermediário' : 'Avançado'}</p>
                  <p className="text-xs text-slate-400">
                    {level === 'beginner' ? 'Lições básicas e vocabulário' : level === 'intermediate' ? 'Conversação e gramática' : 'Fluência e textos complexos'}
                  </p>
                </div>
                <Switch
                  checked={levels.includes(level)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setLevels([...levels, level]);
                    } else {
                      setLevels(levels.filter(l => l !== level));
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={updateSettings.isPending} className="w-full bg-blue-600 hover:bg-blue-700">
        {updateSettings.isPending ? 'Salvando...' : 'Salvar Configurações'}
      </Button>
    </div>
  );
}

// ── Alerts Tab ───────────────────────────────────────────────
function AlertsTab({ alerts, onMarkRead }: { alerts: any[]; onMarkRead: (id: number) => void }) {
  if (!alerts || alerts.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="pt-6 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
          <p className="text-slate-400">Nenhum alerta. Tudo funcionando bem!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map(alert => (
        <Alert key={alert.id} className={`bg-slate-900/50 border-slate-800 ${!alert.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{alert.icon}</span>
            <div className="flex-1">
              <AlertTitle className="text-sm font-semibold">{alert.title}</AlertTitle>
              <AlertDescription className="text-xs text-slate-400 mt-1">
                {alert.detail || ''}
              </AlertDescription>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(alert.createdAt).toLocaleString('pt-BR')}
              </p>
            </div>
            {!alert.isRead && (
              <Button size="sm" variant="ghost" onClick={() => onMarkRead(alert.id)}>
                Marcar lida
              </Button>
            )}
          </div>
        </Alert>
      ))}
    </div>
  );
}

// ── Security Tab ─────────────────────────────────────────────
function SecurityTab({
  childId,
  pinVerified,
  pinInput,
  setPinInput,
  onVerify,
  pinError,
  onDelete,
}: {
  childId: number;
  pinVerified: boolean;
  pinInput: string;
  setPinInput: (v: string) => void;
  onVerify: () => void;
  pinError: string;
  onDelete: () => void;
}) {
  const utils = trpc.useUtils();
  const { data: settings } = trpc.parentalControl.getSettings.useQuery({ childId });
  const updateSettings = trpc.parentalControl.updateSettings.useMutation({
    onSuccess: () => utils.parentalControl.getSettings.invalidate({ childId }),
  });
  const [newPin, setNewPin] = useState('');

  return (
    <div className="space-y-4">
      {/* PIN Verification */}
      {!pinVerified ? (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-400" /> Verificação de PIN
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-400">Digite o PIN de 4 dígitos para acessar as configurações de segurança.</p>
            <Input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              placeholder="****"
              className="text-center text-2xl tracking-widest"
              onKeyDown={(e) => { if (e.key === 'Enter') onVerify(); }}
            />
            {pinError && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {pinError}
              </p>
            )}
            <Button onClick={onVerify} disabled={pinInput.length !== 4} className="w-full bg-blue-600 hover:bg-blue-700">
              Verificar PIN
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Change PIN */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-5 h-5 text-green-400" /> Alterar PIN
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="new-pin">Novo PIN (4 dígitos)</Label>
                <Input
                  id="new-pin"
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="****"
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              <Button
                onClick={() => {
                  if (newPin.length === 4) {
                    updateSettings.mutate({ childId, pinCode: newPin });
                    setNewPin('');
                  }
                }}
                disabled={newPin.length !== 4 || updateSettings.isPending}
                className="w-full"
              >
                {updateSettings.isPending ? 'Atualizando...' : 'Atualizar PIN'}
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-red-950/30 border-red-900/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" /> Zona de Perigo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 mb-4">
                Remover este perfil de criança apagará todos os dados, sessões e configurações associadas.
              </p>
              <Button variant="destructive" onClick={onDelete} className="w-full">
                <Trash2 className="w-4 h-4 mr-1" /> Excluir Perfil
              </Button>
            </CardContent>
          </Card>

          {/* Cybersecurity Alert System */}
          <CybersecurityAlert />
        </>
      )}
    </div>
  );
}
