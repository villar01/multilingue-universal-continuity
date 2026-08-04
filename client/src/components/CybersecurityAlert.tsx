import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, ShieldAlert, ShieldCheck, Power, Eye, Bug, Zap, Activity, AlertTriangle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

type ThreatLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical';

interface ThreatInfo {
  level: ThreatLevel;
  title: string;
  description: string;
  action: string;
  icon: typeof Shield;
}

const THREAT_INFO: Record<ThreatLevel, ThreatInfo> = {
  safe: { level: 'safe', title: 'Sistema Seguro', description: 'Nenhuma ameaça cibernética detectada. Seu dispositivo está protegido.', action: 'Continue usando o aplicativo normalmente.', icon: ShieldCheck },
  low: { level: 'low', title: 'Ameaça de Baixo Nível', description: 'Atividade suspeita detectada. Monitorando continuamente.', action: 'Mantenha o aplicativo aberto para monitoramento automático.', icon: Eye },
  medium: { level: 'medium', title: 'Ameaça Moderada', description: 'Possível tentativa de invasão detectada. Recomenda-se cautela.', action: 'Feche outros aplicativos desnecessários e evite sites desconhecidos.', icon: ShieldAlert },
  high: { level: 'high', title: 'Ameaça Alta', description: 'Ataque cibernético ativo detectado! Ação imediata recomendada.', action: 'Desligue o notebook imediatamente para desestabilizar qualquer ameaça externa.', icon: ShieldAlert },
  critical: { level: 'critical', title: 'AMEAÇA CRÍTICA', description: 'Invasão em andamento detectada! Proteja seus dados imediatamente.', action: 'DESLIGUE O NOTEBOOK AGORA! Desligue o Wi-Fi e reinicie somente após 30 segundos.', icon: Power },
};

const LEVEL_COLORS: Record<ThreatLevel, string> = {
  safe: 'text-green-400 border-green-500/30 bg-green-950/30',
  low: 'text-blue-400 border-blue-500/30 bg-blue-950/30',
  medium: 'text-yellow-400 border-yellow-500/30 bg-yellow-950/30',
  high: 'text-orange-400 border-orange-500/30 bg-orange-950/30',
  critical: 'text-red-400 border-red-500/30 bg-red-950/50',
};

const LEVEL_BADGE: Record<ThreatLevel, string> = {
  safe: 'bg-green-600', low: 'bg-blue-600', medium: 'bg-yellow-600', high: 'bg-orange-600', critical: 'bg-red-600',
};

export default function CybersecurityAlert() {
  const [currentLevel, setCurrentLevel] = useState<ThreatLevel>('safe');
  const [showPowerOffDialog, setShowPowerOffDialog] = useState(false);
  const [monitoringActive, setMonitoringActive] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: stats } = trpc.parentalControl.getSecurityStats.useQuery(undefined, { refetchInterval: 30000 });
  const { data: threats } = trpc.parentalControl.listCyberThreats.useQuery({ onlyUnresolved: true, limit: 10 });
  const reportThreat = trpc.parentalControl.reportCyberThreat.useMutation();
  const resolveThreat = trpc.parentalControl.resolveCyberThreat.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!threats?.threats) return;
    const unresolved = threats.threats as unknown as Array<{ severity: string }>;
    if (unresolved.length === 0) { setCurrentLevel('safe'); return; }
    if (unresolved.some(t => t.severity === 'critical')) setCurrentLevel('critical');
    else if (unresolved.some(t => t.severity === 'high')) setCurrentLevel('high');
    else if (unresolved.some(t => t.severity === 'medium')) setCurrentLevel('medium');
    else setCurrentLevel('low');
  }, [threats]);

  useEffect(() => {
    if (!monitoringActive) return;
    intervalRef.current = setInterval(() => {
      setScanProgress(prev => prev >= 100 ? 0 : prev + 2);
    }, 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [monitoringActive]);

  useEffect(() => {
    if (!monitoringActive) return;
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            if (el.tagName === 'SCRIPT' && !el.hasAttribute('data-safe')) {
              reportThreat.mutate({
                threatType: 'dom_injection', severity: 'critical', source: 'DOM Observer',
                description: 'Tentativa de injeção de script detectada', recommendedAction: 'DESLIGUE O NOTEBOOK',
                deviceInfo: navigator.userAgent,
              });
              setCurrentLevel('critical');
              setShowPowerOffDialog(true);
            }
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitoringActive]);

  useEffect(() => {
    if (currentLevel === 'critical' || currentLevel === 'high') setShowPowerOffDialog(true);
  }, [currentLevel]);

  const handleResolveThreat = useCallback((threatId: number) => {
    resolveThreat.mutate({ threatId, resolvedAction: 'resolved_by_user' }, {
      onSuccess: () => {
        utils.parentalControl.listCyberThreats.invalidate();
        utils.parentalControl.getSecurityStats.invalidate();
      },
    });
  }, [resolveThreat, utils]);

  const handlePowerOff = useCallback(() => {
    reportThreat.mutate({
      threatType: 'user_power_off', severity: currentLevel === 'critical' ? 'critical' : 'high',
      source: 'user_action', description: 'Usuário optou por desligar o notebook',
      recommendedAction: 'Desligar, aguardar 30s, reiniciar e verificar',
      deviceInfo: navigator.userAgent,
    });
    setShowPowerOffDialog(false);
    alert('INSTRUÇÕES DE EMERGÊNCIA:\n\n1. Salve seus trabalhos\n2. Desligue o notebook\n3. Desconecte Wi-Fi\n4. Aguarde 30 segundos\n5. Ligue novamente\n6. Abra o app para verificação');
  }, [reportThreat, currentLevel]);

  const info = THREAT_INFO[currentLevel];
  const Icon = info.icon;

  return (
    <div className="space-y-4">
      <Card className={`border-2 ${LEVEL_COLORS[currentLevel]} transition-all duration-300`}>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Icon className={`w-5 h-5 ${currentLevel === 'critical' ? 'animate-pulse' : ''}`} />
              {info.title}
            </span>
            <Badge className={`${LEVEL_BADGE[currentLevel]} text-white`}>
              {currentLevel === 'safe' ? 'PROTEGIDO' : currentLevel.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-300">{info.description}</p>

          {monitoringActive && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-400"><Activity className="w-3 h-3" /> Monitoramento ativo</span>
                <span className="text-slate-400">{scanProgress}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-100" style={{ width: `${scanProgress}%` }} />
              </div>
            </div>
          )}

          {currentLevel !== 'safe' && (
            <Alert className={`${LEVEL_COLORS[currentLevel]} border-2`}>
              <AlertTriangle className="w-4 h-4" />
              <AlertTitle className="text-sm">Ação Recomendada</AlertTitle>
              <AlertDescription className="text-sm">{info.action}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
              <Shield className="w-4 h-4 text-blue-400" />
              <div><p className="text-xs text-slate-400">Total</p><p className="text-sm font-bold">{stats?.totalThreats || 0}</p></div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <div><p className="text-xs text-slate-400">Não Resolvidas</p><p className="text-sm font-bold">{stats?.unresolvedThreats || 0}</p></div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
              <Zap className="w-4 h-4 text-red-400" />
              <div><p className="text-xs text-slate-400">Críticas</p><p className="text-sm font-bold">{stats?.criticalThreats || 0}</p></div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
              <Bug className="w-4 h-4 text-yellow-400" />
              <div><p className="text-xs text-slate-400">Altas</p><p className="text-sm font-bold">{stats?.highThreats || 0}</p></div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setMonitoringActive(!monitoringActive)} className="flex-1">
              <Activity className="w-3 h-3 mr-1" />{monitoringActive ? 'Pausar' : 'Ativar'}
            </Button>
            {(currentLevel === 'high' || currentLevel === 'critical') && (
              <Button variant="destructive" size="sm" onClick={handlePowerOff} className="flex-1 animate-pulse">
                <Power className="w-3 h-3 mr-1" /> Desligar Notebook
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {threats?.threats && (threats.threats as unknown as Array<{ id: number }>).length > 0 && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bug className="w-5 h-5 text-orange-400" /> Ameaças Recentes</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(threats.threats as unknown as Array<Record<string, unknown>>).slice(0, 5).map((threat) => (
              <div key={threat.id as number} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${threat.severity === 'critical' ? 'bg-red-500' : threat.severity === 'high' ? 'bg-orange-500' : threat.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                  <div>
                    <p className="text-sm font-medium">{String(threat.threat_type || 'unknown')}</p>
                    <p className="text-xs text-slate-400">{String(threat.description || 'Sem descrição')}</p>
                    <p className="text-xs text-slate-500">{new Date(Number(threat.created_at)).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleResolveThreat(threat.id as number)}>
                  <ShieldCheck className="w-3 h-3 mr-1" /> Resolver
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {showPowerOffDialog && (currentLevel === 'high' || currentLevel === 'critical') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <Card className="max-w-md w-full mx-4 border-2 border-red-500/50 bg-red-950/90">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-red-400">
                <Power className="w-6 h-6 animate-pulse" /> EMERGÊNCIA DE SEGURANÇA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-red-500/50 bg-red-900/30">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <AlertTitle className="text-red-400">Ameaça {currentLevel === 'critical' ? 'Crítica' : 'Alta'} Detectada</AlertTitle>
                <AlertDescription className="text-sm text-slate-200">
                  Possível invasão cibernética. Para proteger seus dados e desestabilizar ameaças externas (internet ou infecções nativas do notebook):
                </AlertDescription>
              </Alert>
              <div className="space-y-2 text-sm text-slate-200">
                <p>1. Salve seus trabalhos</p>
                <p>2. Desligue o notebook</p>
                <p>3. Desconecte Wi-Fi/cabo de rede</p>
                <p>4. Aguarde 30 segundos</p>
                <p>5. Abra o app para nova verificação</p>
              </div>
              <div className="flex gap-2">
                <Button variant="destructive" className="flex-1" onClick={handlePowerOff}>
                  <Power className="w-4 h-4 mr-1" /> Confirmar
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowPowerOffDialog(false)}>Ignorar</Button>
              </div>
              <p className="text-xs text-slate-400 text-center">A IA de segurança continua protegendo seus dados.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
