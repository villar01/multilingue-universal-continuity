/**
 * DevicePerformanceTip — Detecta o dispositivo do usuário e mostra
 * dicas específicas para melhorar o desempenho do app em cada plataforma.
 * Suporta: Android, iOS, Windows, Mac, Linux
 */
import { useState, useEffect } from "react";
import { X, Cpu, Wifi, Volume2, Smartphone, Monitor, Zap, Info } from "lucide-react";

interface DeviceInfo {
  platform: "android" | "ios" | "windows" | "mac" | "linux" | "unknown";
  isMobile: boolean;
  isLowEnd: boolean;
  connectionType: string;
  hardwareConcurrency: number;
  deviceMemory: number | null;
  browser: string;
}

function detectDevice(): DeviceInfo {
  const ua = navigator.userAgent.toLowerCase();
  const isMobile = /android|iphone|ipad|ipod|mobile/i.test(ua);

  let platform: DeviceInfo["platform"] = "unknown";
  if (/android/.test(ua)) platform = "android";
  else if (/iphone|ipad|ipod/.test(ua)) platform = "ios";
  else if (/windows/.test(ua)) platform = "windows";
  else if (/macintosh|mac os x/.test(ua)) platform = "mac";
  else if (/linux/.test(ua)) platform = "linux";

  let browser = "Outro";
  if (/edg\//.test(ua)) browser = "Edge";
  else if (/chrome\//.test(ua)) browser = "Chrome";
  else if (/firefox\//.test(ua)) browser = "Firefox";
  else if (/safari\//.test(ua) && !/chrome/.test(ua)) browser = "Safari";

  const cores = navigator.hardwareConcurrency || 2;
  const memory = (navigator as any).deviceMemory ?? null;
  const isLowEnd = cores <= 2 || (memory !== null && memory <= 2);

  const conn = (navigator as any).connection;
  const connectionType = conn?.effectiveType || conn?.type || "desconhecido";

  return { platform, isMobile, isLowEnd, connectionType, hardwareConcurrency: cores, deviceMemory: memory, browser };
}

interface PlatformTip {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  tips: { icon: string; text: string }[];
  voiceTip: string;
}

const PLATFORM_TIPS: Record<string, PlatformTip> = {
  android: {
    icon: "🤖",
    title: "Android detectado",
    subtitle: "Dicas para melhor desempenho no seu celular",
    color: "from-green-900/80 to-teal-900/80",
    voiceTip: "Chrome no Android tem as melhores vozes neurais em português",
    tips: [
      { icon: "🌐", text: "Use o Chrome como navegador — melhor suporte a voz e IA" },
      { icon: "🔇", text: "Verifique se o volume está no máximo e o modo silencioso desligado" },
      { icon: "📶", text: "Wi-Fi é mais estável que dados móveis para o professor de IA" },
      { icon: "🧹", text: "Feche outros apps em segundo plano para liberar memória RAM" },
      { icon: "🔋", text: "Desative o modo economia de bateria — ele limita o processador" },
      { icon: "🎧", text: "Fones de ouvido melhoram muito o reconhecimento de voz" },
      { icon: "⚙️", text: "Configurações → Apps → Chrome → Limpar cache se travar" },
    ],
  },
  ios: {
    icon: "🍎",
    title: "iPhone / iPad detectado",
    subtitle: "Dicas para melhor desempenho no iOS",
    color: "from-gray-800/90 to-slate-900/80",
    voiceTip: "Safari no iOS tem as melhores vozes Siri para aprendizado",
    tips: [
      { icon: "🧭", text: "Use o Safari — melhor suporte a voz e Web Speech API no iOS" },
      { icon: "🔔", text: "Verifique o botão lateral: modo silencioso DESLIGADO para ouvir o professor" },
      { icon: "🗣️", text: "Ajustes → Acessibilidade → Fala → Vozes → baixe vozes premium em PT" },
      { icon: "📶", text: "Wi-Fi estável garante respostas mais rápidas do professor de IA" },
      { icon: "🔋", text: "Desative Modo de Baixo Consumo para melhor desempenho da IA" },
      { icon: "🎧", text: "AirPods ou fones com microfone melhoram o reconhecimento de voz" },
      { icon: "📱", text: "Mantenha o iOS atualizado para as melhores vozes neurais" },
    ],
  },
  windows: {
    icon: "🪟",
    title: "Windows detectado",
    subtitle: "Dicas para melhor desempenho no seu PC",
    color: "from-blue-900/80 to-indigo-900/80",
    voiceTip: "Edge no Windows tem vozes Microsoft Neural de alta qualidade",
    tips: [
      { icon: "🌐", text: "Use Chrome ou Edge — ambos têm excelente suporte a voz neural" },
      { icon: "🗣️", text: "Edge: Configurações → Acessibilidade → Leitura em Voz Alta → vozes Microsoft" },
      { icon: "🔊", text: "Painel de Controle → Som → verifique se o microfone está ativado" },
      { icon: "⚡", text: "Feche abas desnecessárias — cada aba consome RAM e CPU" },
      { icon: "🔌", text: "Cabo de rede (ethernet) é mais estável que Wi-Fi para aulas ao vivo" },
      { icon: "🛡️", text: "Desative temporariamente antivírus se o microfone não funcionar" },
      { icon: "🔄", text: "Windows Update: mantenha atualizado para melhor desempenho de IA" },
    ],
  },
  mac: {
    icon: "🍏",
    title: "Mac detectado",
    subtitle: "Dicas para melhor desempenho no macOS",
    color: "from-slate-800/90 to-gray-900/80",
    voiceTip: "Safari no Mac usa vozes Siri de alta qualidade para aprendizado",
    tips: [
      { icon: "🧭", text: "Safari tem as melhores vozes neurais (Siri) no macOS" },
      { icon: "🗣️", text: "Ajustes do Sistema → Acessibilidade → Fala → instale vozes premium PT" },
      { icon: "🎙️", text: "Preferências → Segurança → Privacidade → libere acesso ao microfone" },
      { icon: "⚡", text: "Feche apps pesados (Photoshop, etc.) para liberar memória" },
      { icon: "📶", text: "Wi-Fi 5GHz ou cabo ethernet para melhor latência do professor de IA" },
      { icon: "🎧", text: "AirPods Pro têm cancelamento de ruído — ideal para praticar pronúncia" },
      { icon: "🔄", text: "macOS atualizado = melhores vozes neurais e desempenho de IA" },
    ],
  },
  linux: {
    icon: "🐧",
    title: "Linux detectado",
    subtitle: "Dicas para melhor desempenho no Linux",
    color: "from-orange-900/80 to-yellow-900/80",
    voiceTip: "Chrome no Linux tem melhor suporte a Web Speech API",
    tips: [
      { icon: "🌐", text: "Use Chrome — melhor suporte a Web Speech API e vozes no Linux" },
      { icon: "🔊", text: "Verifique PulseAudio/PipeWire: pactl list sinks | grep -i state" },
      { icon: "🗣️", text: "Instale espeak-ng ou festival para vozes locais de fallback" },
      { icon: "🎙️", text: "Permissões de microfone: chrome://settings/content/microphone" },
      { icon: "⚡", text: "Feche processos pesados com htop para liberar CPU" },
      { icon: "📶", text: "NetworkManager: prefira conexão cabeada para menor latência" },
      { icon: "🔧", text: "Firefox pode ter limitações de voz — Chrome é mais compatível" },
    ],
  },
  unknown: {
    icon: "💻",
    title: "Dispositivo detectado",
    subtitle: "Dicas gerais para melhor desempenho",
    color: "from-purple-900/80 to-blue-900/80",
    voiceTip: "Chrome ou Edge têm as melhores vozes neurais para aprendizado",
    tips: [
      { icon: "🌐", text: "Use Chrome, Edge ou Safari para melhor suporte a voz neural" },
      { icon: "📶", text: "Wi-Fi estável ou cabo ethernet para o professor de IA responder rápido" },
      { icon: "🧹", text: "Feche outros programas para liberar memória e CPU" },
      { icon: "🔊", text: "Volume no máximo e microfone liberado para praticar pronúncia" },
      { icon: "🎧", text: "Fones de ouvido melhoram muito a experiência de aprendizado" },
      { icon: "🔄", text: "Mantenha o navegador atualizado para as melhores vozes de IA" },
    ],
  },
};

const CONNECTION_INFO: Record<string, { color: string; label: string; quality: number; msg: string }> = {
  "4g":        { color: "text-green-400",  label: "4G",       quality: 4, msg: "Ótima — professor de IA responde em tempo real" },
  "3g":        { color: "text-yellow-400", label: "3G",       quality: 3, msg: "Boa — pequenas pausas na voz são normais" },
  "2g":        { color: "text-orange-400", label: "2G",       quality: 2, msg: "Lenta — use Wi-Fi para melhor experiência" },
  "slow-2g":   { color: "text-red-400",    label: "Muito lenta", quality: 1, msg: "Crítica — Wi-Fi necessário para o professor de IA" },
  "wifi":      { color: "text-green-400",  label: "Wi-Fi",    quality: 4, msg: "Ótima — ideal para aulas ao vivo" },
  "ethernet":  { color: "text-green-400",  label: "Cabo",     quality: 5, msg: "Excelente — conexão mais estável possível" },
  "desconhecido": { color: "text-blue-400", label: "Verificando...", quality: 3, msg: "Verifique sua conexão para melhor desempenho" },
};

const STORAGE_KEY = "device_tip_dismissed_v3";

export default function DevicePerformanceTip() {
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (dismissed) return;
    const info = detectDevice();
    setDevice(info);
    const t = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible || !device) return null;

  const tipData = PLATFORM_TIPS[device.platform] || PLATFORM_TIPS.unknown;
  const connInfo = CONNECTION_INFO[device.connectionType] || CONNECTION_INFO["desconhecido"];
  const perfColor = device.isLowEnd ? "text-orange-400" : device.hardwareConcurrency >= 8 ? "text-green-400" : "text-yellow-400";
  const perfLabel = device.isLowEnd ? "Limitado" : device.hardwareConcurrency >= 8 ? "Alto" : "Médio";

  return (
    <div className="fixed bottom-4 right-4 z-[40] max-w-xs w-full"
      style={{ animation: "slideInUp 0.4s cubic-bezier(0.23,1,0.32,1)" }}>
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="bg-gray-950 border border-white/15 rounded-2xl overflow-hidden shadow-2xl">

        {/* Header com gradiente por plataforma */}
        <div className={`flex items-center justify-between px-4 py-3 bg-gradient-to-r ${tipData.color} border-b border-white/10`}>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{tipData.icon}</span>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{tipData.title}</p>
              <p className="text-white/60 text-xs">{tipData.subtitle}</p>
            </div>
          </div>
          <button onClick={dismiss}
            className="text-white/40 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10 shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Barra de status do dispositivo */}
        <div className="flex items-center gap-3 px-4 py-2 bg-black/40 border-b border-white/10 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-white/40" />
            <span className="text-white/50 text-xs">CPU:</span>
            <span className={`text-xs font-bold ${perfColor}`}>{perfLabel}</span>
            <span className="text-white/30 text-xs">({device.hardwareConcurrency} núcleos)</span>
          </div>
          <div className="w-px h-3 bg-white/15" />
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-white/40" />
            <span className={`text-xs font-bold ${connInfo.color}`}>{connInfo.label}</span>
          </div>
          {device.deviceMemory && (
            <>
              <div className="w-px h-3 bg-white/15" />
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-white/40" />
                <span className="text-white/50 text-xs">{device.deviceMemory}GB RAM</span>
              </div>
            </>
          )}
          <div className="w-px h-3 bg-white/15" />
          <span className="text-white/40 text-xs">{device.browser}</span>
        </div>

        {/* Status da conexão */}
        <div className="px-4 py-2 bg-black/20 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connInfo.quality >= 4 ? "bg-green-400" : connInfo.quality >= 3 ? "bg-yellow-400" : "bg-red-400"} animate-pulse`} />
            <p className="text-white/70 text-xs">{connInfo.msg}</p>
          </div>
        </div>

        {/* Aviso dispositivo fraco */}
        {device.isLowEnd && (
          <div className="mx-3 mt-2 px-3 py-2 bg-orange-500/15 border border-orange-500/30 rounded-xl">
            <p className="text-orange-300 text-xs font-semibold">⚠️ Dispositivo com recursos limitados</p>
            <p className="text-orange-200/60 text-xs mt-0.5">
              Feche outros apps para garantir que o professor de IA funcione sem travamentos.
            </p>
          </div>
        )}

        {/* Dica de voz rápida */}
        <div className="px-4 py-2.5 flex items-start gap-2">
          <Volume2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <p className="text-white/80 text-xs leading-relaxed">{tipData.voiceTip}</p>
        </div>

        {/* Toggle de dicas completas */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 transition-colors border-t border-white/10">
          <span className="flex items-center gap-2 text-xs font-semibold">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            Ver todas as dicas para {tipData.title.split(" ")[0]}
          </span>
          <span className="text-white/30 text-xs">{expanded ? "▲ fechar" : "▼ ver"}</span>
        </button>

        {expanded && (
          <div className="px-4 pb-3 space-y-2 border-t border-white/10 bg-black/20">
            <div className="pt-2 space-y-1.5">
              {tipData.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-sm shrink-0 mt-0.5">{tip.icon}</span>
                  <p className="text-white/70 text-xs leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center gap-1.5">
              {device.isMobile
                ? <Smartphone className="w-3 h-3 text-white/30" />
                : <Monitor className="w-3 h-3 text-white/30" />}
              <span className="text-white/30 text-xs">
                {device.isMobile ? "Dispositivo móvel" : "Computador"} · {device.platform} · {device.browser}
              </span>
            </div>
          </div>
        )}

        {/* Fechar */}
        <div className="px-4 py-2 border-t border-white/10">
          <button onClick={dismiss}
            className="w-full text-center text-xs text-white/25 hover:text-white/50 transition-colors py-0.5">
            Não mostrar novamente nesta sessão
          </button>
        </div>
      </div>
    </div>
  );
}
