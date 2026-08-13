import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { Shield, Clock, Bell, Plus, Trash2, Lock, TrendingUp, BookOpen, Timer, AlertCircle, CheckCircle2, HelpCircle, ExternalLink } from 'lucide-react';
import CybersecurityAlert from '@/components/CybersecurityAlert';
import { hasAudibleParentalAlert, playParentalAlertSound } from '@/lib/parentalAlertSound';
import UserGuide from '@/components/UserGuide';
import { normalizeParentalCefrLevels, PARENTAL_CEFR_LEVEL_DETAILS, PARENTAL_CEFR_LEVELS, type ParentalCefrLevel } from '@shared/parental-cefr';

const DAY_NAMES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const EMOJI_OPTIONS = ['👧', '👦', '🧒', '👶', '🧑', '👨', '👩'];

export default function ParentalControlPanel() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  // Queries
  const { data: children, isLoading: childrenLoading } = trpc.parentalControl.listChildren.useQuery();

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
  const [newChildPin, setNewChildPin] = useState('');
  const [confirmChildPin, setConfirmChildPin] = useState('');
  const [newChildConsent, setNewChildConsent] = useState(false);
  const [newChildPinError, setNewChildPinError] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [pinError, setPinError] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newSetupPin, setNewSetupPin] = useState('');
  const [confirmSetupPin, setConfirmSetupPin] = useState('');
  const [setupError, setSetupError] = useState('');
  const selectedChildAlertsInput = useMemo(
    () => selectedChildId ? { childId: selectedChildId } : {},
    [selectedChildId],
  );
  const { data: alerts } = trpc.parentalControl.listAlerts.useQuery(
    selectedChildAlertsInput,
    { enabled: !!selectedChildId },
  );

  // Auto-select first child
  useEffect(() => {
    if (children && children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const { data: settings } = trpc.parentalControl.getSettings.useQuery(
    { childId: selectedChildId || 0 },
    { enabled: !!selectedChildId }
  );

  const handleSetupPin = useCallback(async () => {
    if (!selectedChildId) return;
    if (newSetupPin.length !== 4) {
      setSetupError('PIN deve ter 4 digitos.');
      return;
    }
    if (newSetupPin !== confirmSetupPin) {
      setSetupError('Os PINs nao coincidem.');
      return;
    }
    if (newSetupPin === '1234') {
      setSetupError('Escolha um PIN diferente do padrao.');
      return;
    }
    await updateSettings.mutateAsync({ childId: selectedChildId, pinCode: newSetupPin });
    setShowPinSetup(false);
    setNewSetupPin('');
    setConfirmSetupPin('');
    setSetupError('');
    setPinVerified(true);
  }, [selectedChildId, newSetupPin, confirmSetupPin, updateSettings]);

  const selectedChild = children?.find((c: any) => c.id === selectedChildId);

  const handleAddChild = useCallback(async () => {
    if (!newChildName.trim()) return;
    if (!/^\d{4}$/.test(newChildPin)) {
      setNewChildPinError('Defina um PIN numérico de 4 dígitos.');
      return;
    }
    if (newChildPin !== confirmChildPin) {
      setNewChildPinError('Os PINs não coincidem.');
      return;
    }
    if (!newChildConsent) {
      setNewChildPinError('Confirme que é o responsável legal e autoriza este perfil infantil.');
      return;
    }
    await createChild.mutateAsync({
      name: newChildName,
      emoji: newChildEmoji,
      level: newChildLevel,
      pin: newChildPin,
      parentalConsent: true,
    });
    setNewChildName('');
    setNewChildPin('');
    setConfirmChildPin('');
    setNewChildConsent(false);
    setNewChildPinError('');
    setShowAddChild(false);
  }, [newChildName, newChildEmoji, newChildLevel, newChildPin, confirmChildPin, newChildConsent, createChild]);

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
          <div className="flex items-center gap-2">
            <UserGuide nativeLang="pt-BR" compact triggerClassName="text-sm text-slate-200 hover:text-white font-medium transition-colors px-2 py-1" />
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
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="child-pin">PIN do responsável</Label>
                    <Input id="child-pin" type="password" inputMode="numeric" maxLength={4} value={newChildPin} onChange={(e) => { setNewChildPin(e.target.value.replace(/\D/g, '')); setNewChildPinError(''); }} placeholder="4 dígitos" />
                  </div>
                  <div>
                    <Label htmlFor="child-pin-confirm">Confirmar PIN</Label>
                    <Input id="child-pin-confirm" type="password" inputMode="numeric" maxLength={4} value={confirmChildPin} onChange={(e) => { setConfirmChildPin(e.target.value.replace(/\D/g, '')); setNewChildPinError(''); }} placeholder="Repita o PIN" />
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3">
                  <Switch id="child-parental-consent" checked={newChildConsent} onCheckedChange={setNewChildConsent} className="mt-0.5" />
                  <Label htmlFor="child-parental-consent" className="cursor-pointer text-sm leading-relaxed text-emerald-50">
                    Confirmo que sou o responsável legal e autorizo a criação deste perfil infantil, incluindo os controles de segurança e a supervisão aplicáveis.
                  </Label>
                </div>
                {newChildPinError ? <p className="text-sm text-red-400">{newChildPinError}</p> : null}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddChild(false)}>Cancelar</Button>
                <Button onClick={handleAddChild} disabled={!newChildName.trim() || newChildPin.length !== 4 || confirmChildPin.length !== 4 || !newChildConsent || createChild.isPending}>
                  {createChild.isPending ? 'Criando...' : 'Criar Perfil'}
                </Button>
              </DialogFooter>
            </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-5">
        <Alert className="border-emerald-500/40 bg-emerald-950/30">
          <Shield className="h-4 w-4 text-emerald-300" />
          <AlertTitle className="text-emerald-200">Proteção com acompanhamento responsável</AlertTitle>
          <AlertDescription className="text-emerald-50/90">
            Este painel reúne controles de tempo, filtros, alertas e histórico supervisionável para apoiar a proteção do menor. Configure as salvaguardas, acompanhe os alertas e oriente o uso: nenhuma ferramenta substitui o dever contínuo de cuidado do responsável legal.
          </AlertDescription>
        </Alert>
      </div>

      {/* PIN Setup Dialog - Obrigatorio no primeiro acesso */}
      <Dialog open={showPinSetup} onOpenChange={() => {}}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-400">
              <Lock className="w-5 h-5" /> Configuracao Obrigatoria de PIN
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert className="bg-amber-950/50 border-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <AlertTitle>Seguranca Prioritaria</AlertTitle>
              <AlertDescription>
                Por segurança, e obrigatorio definir um PIN personalizado antes de acessar o painel. O PIN padrao (1234) nao e permitido.
              </AlertDescription>
            </Alert>
            <div>
              <Label htmlFor="setup-pin">Novo PIN (4 digitos)</Label>
              <Input
                id="setup-pin"
                type="password"
                maxLength={4}
                value={newSetupPin}
                onChange={(e) => setNewSetupPin(e.target.value.replace(/\D/g, ''))}
                placeholder="****"
                className="text-center text-2xl tracking-widest"
              />
            </div>
            <div>
              <Label htmlFor="confirm-pin">Confirmar PIN</Label>
              <Input
                id="confirm-pin"
                type="password"
                maxLength={4}
                value={confirmSetupPin}
                onChange={(e) => setConfirmSetupPin(e.target.value.replace(/\D/g, ''))}
                placeholder="****"
                className="text-center text-2xl tracking-widest"
              />
            </div>
            {setupError && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {setupError}
              </p>
            )}
            <Button onClick={handleSetupPin} disabled={newSetupPin.length !== 4 || confirmSetupPin.length !== 4} className="w-full bg-blue-600 hover:bg-blue-700">
              Definir PIN e Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                    <TabsList className="grid w-full grid-cols-6 bg-slate-900/50">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
                      <TrendingUp className="w-4 h-4 mr-1" /> Visão Geral
                    </TabsTrigger>
                    <TabsTrigger value="limits" className="data-[state=active]:bg-blue-600">
                      <Clock className="w-4 h-4 mr-1" /> Limites
                    </TabsTrigger>
                    <TabsTrigger value="alerts" className="data-[state=active]:bg-blue-600">
                      <Bell className="w-4 h-4 mr-1" /> Alertas
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="data-[state=active]:bg-blue-600">
                      <BookOpen className="w-4 h-4 mr-1" /> Atividades
                    </TabsTrigger>
                    <TabsTrigger value="security" className="data-[state=active]:bg-blue-600">
                      <Lock className="w-4 h-4 mr-1" /> Segurança
                    </TabsTrigger>
                    <TabsTrigger value="quiz" className="data-[state=active]:bg-blue-600">
                      <HelpCircle className="w-4 h-4 mr-1" /> Perguntas
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
                    <AlertsTab childId={selectedChild.id} alerts={alerts || []} onMarkRead={(id) => markAlertRead.mutate({ alertId: id })} />
                  </TabsContent>

                  <TabsContent value="activity" className="mt-4 space-y-4">
                    <SupervisedActivityTab childId={selectedChild.id} />
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

                  {/* Interactive Questions Tab */}
                  <TabsContent value="quiz" className="mt-4 space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-blue-400">Perguntas Interativas</h3>
                      <p className="text-sm text-slate-400">Perguntas sobre o aprendizado da criança para acompanhar o progresso</p>
                      <div className="space-y-3">
                        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                          <p className="font-medium text-slate-200 mb-2">1. Qual idioma seu filho mais gosta de aprender?</p>
                          <div className="flex gap-2 flex-wrap">
                            {['Inglês', 'Espanhol', 'Francês', 'Alemão', 'Italiano', 'Japonês'].map(lang => (
                              <button key={lang} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-sm transition-all">{lang}</button>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                          <p className="font-medium text-slate-200 mb-2">2. Quantas lições por dia são adequadas?</p>
                          <div className="flex gap-2 flex-wrap">
                            {['1 lição', '2 lições', '3 lições', '5 lições', 'Sem limite'].map(opt => (
                              <button key={opt} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-sm transition-all">{opt}</button>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                          <p className="font-medium text-slate-200 mb-2">3. Seu filho prefere aprender com:</p>
                          <div className="flex gap-2 flex-wrap">
                            {['Professor virtual', 'Voz e áudio', 'Jogos e quiz', 'Leitura'].map(opt => (
                              <button key={opt} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-sm transition-all">{opt}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
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
  const { data: interactionPatterns } = trpc.parentalControl.getUsagePatterns.useQuery({ childId });

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

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-base">Padrões de Interação</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg bg-slate-800/50 p-3">
            <p className="text-slate-400 text-xs">Atividades registradas</p>
            <p className="mt-1 text-xl font-bold">{interactionPatterns?.totalInteractions || 0}</p>
            <p className="text-xs text-slate-500">em {interactionPatterns?.activeDays || 0} dias ativos</p>
          </div>
          <div className="rounded-lg bg-slate-800/50 p-3">
            <p className="text-slate-400 text-xs">Idiomas mais praticados</p>
            <p className="mt-1 font-medium">{interactionPatterns?.topLanguages?.length
              ? interactionPatterns.topLanguages.map((item) => `${item.languageCode.toUpperCase()} (${item.count})`).join(" · ")
              : "Ainda sem dados"}</p>
            <p className="mt-1 text-xs text-slate-500">{interactionPatterns?.peakHour === null || interactionPatterns?.peakHour === undefined
              ? "Horário preferido ainda indisponível"
              : `Maior atividade por volta de ${String(interactionPatterns.peakHour).padStart(2, "0")}:00`}</p>
          </div>
          <div className="rounded-lg bg-slate-800/50 p-3">
            <p className="text-slate-400 text-xs">Interações sinalizadas</p>
            <p className={`mt-1 text-xl font-bold ${(interactionPatterns?.flaggedInteractions || 0) > 0 ? "text-amber-400" : "text-green-400"}`}>
              {interactionPatterns?.flaggedInteractions || 0}
            </p>
            <p className="text-xs text-slate-500">conteúdos exigindo atenção</p>
          </div>
        </CardContent>
      </Card>

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

// ── Supervised Activity Tab ──────────────────────────────────
function SupervisedActivityTab({ childId }: { childId: number }) {
  const { data, isLoading } = trpc.parentalControl.listSupervisedInteractions.useQuery({ childId, limit: 20 });
  const interactions = data?.interactions || [];

  const activityLabel: Record<string, string> = {
    bilingual_conversation: 'Conversa bilíngue',
    live_teacher: 'Professor ao vivo',
    lesson_chat: 'Conversa da lição',
    scene_chat: 'Interação na cena',
    free_chat: 'Conversa livre',
    roleplay: 'Prática de situação',
  };

  return (
    <div className="space-y-4">
      <Alert className="border-blue-500/40 bg-blue-950/30">
        <Shield className="h-4 w-4 text-blue-300" />
        <AlertTitle className="text-blue-200">Histórico supervisionável e minimizado</AlertTitle>
        <AlertDescription className="text-blue-50/90">
          Mostra somente horário, idioma, tipo de atividade e indicação de atenção. Mensagens, respostas e transcrições não são exibidas neste painel.
        </AlertDescription>
      </Alert>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader><CardTitle className="text-base">Atividades recentes</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" /></div>
          ) : interactions.length ? (
            <div className="space-y-2">
              {interactions.map((interaction: any, index: number) => (
                <div key={`${interaction.createdAt}-${index}`} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-800/50 p-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-100">{activityLabel[interaction.interactionType] || 'Atividade de aprendizagem'}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {(interaction.languageCode || '—').toUpperCase()} · {interaction.createdAt ? new Date(interaction.createdAt).toLocaleString('pt-BR') : 'Horário indisponível'}
                    </p>
                  </div>
                  <Badge variant="outline" className={interaction.isFlagged ? 'border-amber-500/40 text-amber-300' : 'border-green-500/40 text-green-300'}>
                    {interaction.isFlagged ? 'Requer atenção' : 'Sem alerta'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-slate-400">Ainda não há atividades supervisionáveis para este perfil.</p>
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
  const [levels, setLevels] = useState<ParentalCefrLevel[]>(['A1']);

  useEffect(() => {
    if (settings) {
      setTimeLimit(settings.timeLimitMinutes || 60);
      setAllowedDays(settings.allowedDays || [true, true, true, true, true, false, false]);
      setLevels(normalizeParentalCefrLevels(settings.levelsAllowed));
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
            {PARENTAL_CEFR_LEVELS.map(level => (
              <div key={level} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <div>
                  <p className="font-medium">{PARENTAL_CEFR_LEVEL_DETAILS[level].label}</p>
                  <p className="text-xs text-slate-400">{PARENTAL_CEFR_LEVEL_DETAILS[level].description}</p>
                </div>
                <Switch
                  checked={levels.includes(level)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setLevels((current) => normalizeParentalCefrLevels([...current, level]));
                    } else {
                      setLevels((current) => current.filter((item) => item !== level));
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
function AlertsTab({ childId, alerts, onMarkRead }: { childId: number; alerts: any[]; onMarkRead: (id: number) => void }) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const soundedAlertIds = useRef(new Set<number>());
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [decisionPin, setDecisionPin] = useState('');
  const [decisionError, setDecisionError] = useState('');
  const utils = trpc.useUtils();
  const { data: decisions } = trpc.parentalControl.listContentDecisions.useQuery({ childId });
  const decideContentAlert = trpc.parentalControl.decideContentAlert.useMutation({
    onSuccess: () => {
      utils.parentalControl.listAlerts.invalidate();
      utils.parentalControl.listContentDecisions.invalidate({ childId });
      setSelectedAlert(null);
      setDecisionPin('');
      setDecisionError('');
    },
    onError: (error) => setDecisionError(error.message),
  });
  useEffect(() => {
    if (!soundEnabled || !hasAudibleParentalAlert(alerts)) return;
    const unreadSafetyAlert = alerts.find((alert) => !alert.isRead && ["inappropriate_content", "age_content_review", "child_safety", "content_blocked", "country_compliance_blocked"].includes(alert.alertType));
    if (!unreadSafetyAlert || soundedAlertIds.current.has(unreadSafetyAlert.id)) return;
    soundedAlertIds.current.add(unreadSafetyAlert.id);
    playParentalAlertSound();
  }, [alerts, soundEnabled]);

  const soundControl = (
    <Alert className="border-amber-500/40 bg-amber-950/30">
      <Bell className="h-4 w-4 text-amber-300" />
      <AlertTitle className="text-amber-200">Alerta sonoro do responsável</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center justify-between gap-3 text-amber-50/90">
        <span>Ative um sinal sonoro para novos alertas de conteúdo e segurança. O som só é ativado após sua confirmação.</span>
        <Button size="sm" variant="outline" onClick={() => { setSoundEnabled(true); playParentalAlertSound(); }}>
          {soundEnabled ? 'Som ativado' : 'Ativar e testar som'}
        </Button>
      </AlertDescription>
    </Alert>
  );

  const canReviewAlert = (alert: any) => alert.alertType === 'age_content_review';
  const absoluteBlockAlertTypes = ['inappropriate_content', 'child_safety', 'content_blocked'];
  const safeAlertReason: Record<string, { title: string; detail: string }> = {
    age_content_review: { title: 'Conteúdo incompatível com a faixa etária', detail: 'A proteção do perfil pediu uma decisão do responsável. Nenhum texto da interação é exibido.' },
    inappropriate_content: { title: 'Conteúdo bloqueado pela proteção infantil', detail: 'O bloqueio permanece obrigatório para este tipo de risco. Nenhum texto da interação é exibido.' },
    child_safety: { title: 'Proteção infantil acionada', detail: 'Foi identificado um risco que exige bloqueio. Nenhum texto da interação é exibido.' },
    content_blocked: { title: 'Interação bloqueada pelo filtro de proteção', detail: 'A mensagem ou resposta foi interrompida com segurança. Nenhum texto da interação é exibido.' },
    country_compliance_blocked: { title: 'Interação bloqueada pela proteção regional', detail: 'A regra aplicável ao perfil bloqueou a interação. Nenhum texto da interação é exibido.' },
    daily_time_limit_reached: { title: 'Limite diário de uso atingido', detail: 'A conversa foi pausada conforme o limite definido pelo responsável. Nenhum conteúdo foi armazenado.' },
    adult_content: { title: 'Conteúdo adulto sinalizado', detail: 'A categoria requer atenção do responsável. Nenhum texto da interação é exibido.' },
    violence: { title: 'Conteúdo sensível sinalizado', detail: 'A categoria requer atenção do responsável. Nenhum texto da interação é exibido.' },
    drugs: { title: 'Conteúdo sensível sinalizado', detail: 'A categoria requer atenção do responsável. Nenhum texto da interação é exibido.' },
    cyberbullying: { title: 'Risco de convivência inadequada sinalizado', detail: 'A categoria requer atenção do responsável. Nenhum texto da interação é exibido.' },
    phishing: { title: 'Pedido de dado sensível sinalizado', detail: 'A categoria requer atenção do responsável. Nenhum texto da interação é exibido.' },
    grooming: { title: 'Comportamento de contato de risco sinalizado', detail: 'A categoria requer atenção do responsável. Nenhum texto da interação é exibido.' },
    cyber_threat: { title: 'Alerta de segurança cibernética', detail: 'A categoria requer atenção do responsável. Nenhum texto da interação é exibido.' },
  };
  const getSafeAlertReason = (alertType: string) => safeAlertReason[alertType] || {
    title: 'Alerta de proteção registrado',
    detail: 'O sistema registrou a categoria de proteção sem exibir ou armazenar o texto da interação neste painel.',
  };

  const submitDecision = (decision: 'allow_temporarily' | 'keep_blocked') => {
    if (!selectedAlert) return;
    if (decisionPin.length !== 4) {
      setDecisionError('Digite o PIN de 4 dígitos do responsável.');
      return;
    }
    decideContentAlert.mutate({
      childId,
      alertId: selectedAlert.id,
      pin: decisionPin,
      decision,
      durationMinutes: 15,
    });
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="space-y-3">
        {soundControl}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p className="text-slate-400">Nenhum alerta. Tudo funcionando bem!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {soundControl}
      <Dialog open={!!selectedAlert} onOpenChange={(open) => {
        if (!open && !decideContentAlert.isPending) {
          setSelectedAlert(null);
          setDecisionPin('');
          setDecisionError('');
        }
      }}>
        <DialogContent className="bg-slate-900 border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle>Decisão supervisionada do responsável</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Alert className="border-amber-500/40 bg-amber-950/30">
              <AlertCircle className="h-4 w-4 text-amber-300" />
              <AlertTitle className="text-amber-200">Autorização limitada</AlertTitle>
              <AlertDescription className="text-amber-50/90">
                Esta opção é oferecida apenas para conteúdo incompatível com a faixa etária, mas não ilegal. A liberação dura 15 minutos e fica registrada. Conteúdo ilegal ou de alto risco continua bloqueado.
              </AlertDescription>
            </Alert>
            <div>
              <Label htmlFor="content-decision-pin">PIN do responsável</Label>
              <Input
                id="content-decision-pin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={decisionPin}
                onChange={(event) => setDecisionPin(event.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="mt-2 text-center text-2xl tracking-widest"
              />
            </div>
            {decisionError && <p className="text-sm text-red-300">{decisionError}</p>}
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => submitDecision('keep_blocked')} disabled={decideContentAlert.isPending}>
              Manter bloqueio
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => submitDecision('allow_temporarily')} disabled={decideContentAlert.isPending}>
              Liberar por 15 min
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {alerts.map(alert => (
        <Alert key={alert.id} className={`bg-slate-900/50 border-slate-800 ${!alert.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
          {(() => {
            const safeReason = getSafeAlertReason(alert.alertType);
            return (
          <div className="flex items-start gap-3">
            <span className="text-2xl">{alert.icon}</span>
            <div className="flex-1">
              <AlertTitle className="text-sm font-semibold">{safeReason.title}</AlertTitle>
              <AlertDescription className="text-xs text-slate-400 mt-1">
                {safeReason.detail}
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
            {canReviewAlert(alert) && (
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => setSelectedAlert(alert)}>
                Decidir com PIN
              </Button>
            )}
            {absoluteBlockAlertTypes.includes(alert.alertType) && (
              <Badge variant="outline" className="border-red-500/40 text-red-300">Bloqueio obrigatório</Badge>
            )}
          </div>
            );
          })()}
        </Alert>
      ))}
      {decisions && decisions.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader><CardTitle className="text-base">Decisões registradas</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {decisions.slice(0, 5).map((decision: any) => (
              <div key={decision.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-800/50 p-3 text-sm">
                <span>{decision.decision === 'allow_temporarily' ? 'Liberação temporária' : 'Bloqueio mantido'}</span>
                <span className="text-xs text-slate-400">{new Date(decision.createdAt).toLocaleString('pt-BR')}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
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
  const [pairingCode, setPairingCode] = useState('');
  const [pairingExpiresAt, setPairingExpiresAt] = useState<Date | null>(null);
  const createChildLinkCode = trpc.parentalControl.createChildLinkCode.useMutation({
    onSuccess: (result) => {
      setPairingCode(result.code);
      setPairingExpiresAt(new Date(result.expiresAt));
    },
  });

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

          <Card className="bg-blue-950/30 border-blue-800/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-blue-200">
                <Shield className="w-5 h-5 text-blue-300" /> Vincular conta do menor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-300">
                Gere um código único para o menor vincular sua conta a este perfil. O código exige este PIN, expira em 10 minutos e só pode ser usado uma vez.
              </p>
              {pairingCode ? (
                <div className="rounded-lg border border-blue-500/40 bg-slate-950/60 p-3">
                  <p className="text-center font-mono text-2xl font-bold tracking-[0.3em] text-blue-200">{pairingCode}</p>
                  <p className="mt-2 text-center text-xs text-slate-400">
                    Válido até {pairingExpiresAt?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}. Compartilhe somente com o menor sob sua responsabilidade.
                  </p>
                </div>
              ) : null}
              <Button
                variant="outline"
                className="w-full border-blue-500/40 text-blue-100 hover:bg-blue-900/40"
                disabled={pinInput.length !== 4 || createChildLinkCode.isPending}
                onClick={() => createChildLinkCode.mutate({ childId, pin: pinInput })}
              >
                {createChildLinkCode.isPending ? 'Gerando código...' : pairingCode ? 'Gerar novo código' : 'Gerar código de vínculo'}
              </Button>
              {createChildLinkCode.error ? <p className="text-sm text-red-300">{createChildLinkCode.error.message}</p> : null}
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

          {/* Official reporting guide — human decision and official channels only */}
          <Card className="bg-amber-950/20 border-amber-800/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-amber-300">
                <Shield className="w-5 h-5" /> Orientação para denúncia oficial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p>Use esta orientação somente em casos graves identificados pelo sistema, como possível violência, exploração ou risco a crianças. A decisão e o envio da denúncia devem ser feitos por um adulto responsável ou pela equipe autorizada.</p>
              <ol className="list-decimal pl-5 space-y-1 text-slate-400">
                <li>Preserve os registros do incidente e o horário; não altere nem apague evidências.</li>
                <li>Proteja a criança: interrompa o contato e bloqueie a conta ou o dispositivo quando necessário.</li>
                <li>Em risco imediato, acione a emergência local. No Brasil, a Polícia Militar atende pelo <strong className="text-slate-200">190</strong>.</li>
                <li>Para violações de direitos de crianças e adolescentes no Brasil, registre a denúncia no canal oficial abaixo ou procure o Conselho Tutelar local.</li>
              </ol>
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <a href="https://www.gov.br/pt-br/servicos/denunciar-violacao-de-direitos-humanos" target="_blank" rel="noreferrer">
                  <Button variant="outline" className="border-amber-500/50 text-amber-200 hover:bg-amber-500/10">
                    <ExternalLink className="w-4 h-4 mr-2" /> Canal oficial Disque 100
                  </Button>
                </a>
                <a href="https://www.gov.br/mdh/pt-br/acesso-a-informacao/disque-100/disque-100" target="_blank" rel="noreferrer">
                  <Button variant="ghost" className="text-amber-200 hover:bg-amber-500/10">Como funciona o Disque 100</Button>
                </a>
              </div>
              <p className="text-xs text-slate-500">Esta tela fornece orientação e links oficiais; não substitui emergência, autoridade competente ou orientação jurídica.</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
