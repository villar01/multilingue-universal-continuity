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
  safe: { level: 'safe', title: 'Sem eventos críticos no app', description: 'Nenhum evento crítico foi registrado pelo aplicativo. Este painel não substitui antivírus, atualizações ou diagnóstico do dispositivo.', action: 'Mantenha o sistema, navegador e aplicativo atualizados.', icon: ShieldCheck },
  low: { level: 'low', title: 'Evento de Baixa Prioridade', description: 'O aplicativo registrou uma atividade que merece revisão.', action: 'Revise a origem do evento e evite links, extensões ou downloads desconhecidos.', icon: Eye },
  medium: { level: 'medium', title: 'Evento de Segurança', description: 'O aplicativo registrou uma atividade incomum que requer atenção.', action: 'Atualize o navegador e o sistema, revise extensões e execute a verificação do antivírus instalado.', icon: ShieldAlert },
  high: { level: 'high', title: 'Evento de Alta Prioridade', description: 'Um evento de alta prioridade foi registrado pelo aplicativo. Isso não confirma, por si só, comprometimento do dispositivo.', action: 'Interrompa atividades sensíveis; se houver sinais reais de comprometimento, desconecte a rede e procure suporte de segurança.', icon: ShieldAlert },
  critical: { level: 'critical', title: 'Evento Crítico Registrado', description: 'Um evento crítico foi registrado no aplicativo. Trate-o como incidente até revisão, sem presumir diagnóstico completo do dispositivo.', action: 'Desconecte a rede se houver indícios de comprometimento, use uma ferramenta de segurança confiável e altere credenciais por outro dispositivo seguro.', icon: Power },
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
                threatType: 'dom_injection', severity: 'medium', source: 'DOM Observer',
                description: 'Elemento de script inesperado observado pelo aplicativo; revisão necessária', recommendedAction: 'Revisar navegador, extensões e origem do conteúdo antes de continuar',
                deviceInfo: navigator.userAgent,
              });
              setCurrentLevel('medium');
            }
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitoringActive]);

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
      recommendedAction: 'Usuário recebeu orientação para isolar a rede se houver indícios reais e buscar verificação de segurança',
      deviceInfo: navigator.userAgent,
    });
    setShowPowerOffDialog(false);
    alert('ORIENTAÇÕES DE SEGURANÇA:\n\n1. Interrompa atividades sensíveis, como pagamentos e troca de senhas.\n2. Se houver indícios reais de comprometimento, desconecte Wi-Fi/cabo de rede.\n3. Atualize o sistema e execute a verificação do antivírus instalado.\n4. Para credenciais sensíveis, use outro dispositivo confiável.\n5. Procure suporte técnico se o alerta persistir.');
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
                <Power className="w-3 h-3 mr-1" /> Ver medidas urgentes
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
                  Este painel registrou um evento de alta prioridade. Ele não diagnostica sozinho o dispositivo. Siga medidas proporcionais e procure suporte se houver indícios reais de comprometimento:
                </AlertDescription>
              </Alert>
              <div className="space-y-2 text-sm text-slate-200">
                <p>1. Interrompa pagamentos e alterações de senha.</p>
                <p>2. Se houver indícios reais, desconecte Wi-Fi/cabo de rede.</p>
                <p>3. Atualize o sistema e execute a verificação do antivírus instalado.</p>
                <p>4. Use outro dispositivo confiável para alterar credenciais sensíveis.</p>
                <p>5. Procure suporte técnico se o alerta persistir.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="destructive" className="flex-1" onClick={handlePowerOff}>
                  <Power className="w-4 h-4 mr-1" /> Registrar orientação
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowPowerOffDialog(false)}>Ignorar</Button>
              </div>
              <p className="text-xs text-slate-400 text-center">O alerta registra eventos do aplicativo; a segurança do dispositivo também depende de atualizações, proteção local e suporte especializado.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
