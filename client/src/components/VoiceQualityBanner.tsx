import { useState, useEffect } from 'react';
import { loadVoices } from '@/lib/localTTS';

// Re-export detectVoiceQuality for use in this file
function getOverallQuality(lang: string): Promise<'neural' | 'enhanced' | 'standard' | 'none'> {
  return loadVoices().then(voices => {
    const langBase = lang.split('-')[0].toLowerCase();
    const langVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langBase));
    if (langVoices.length === 0) return 'none';
    
    const NEURAL_KEYWORDS = ['neural', 'natural', 'enhanced', 'premium', 'wavenet', 'google', 'apple', 'microsoft', 'aria', 'jenny', 'emma', 'brian', 'andrew', 'ava'];
    const hasNeural = langVoices.some(v => {
      const n = v.name.toLowerCase();
      const u = v.voiceURI.toLowerCase();
      return NEURAL_KEYWORDS.some(k => n.includes(k) || u.includes(k)) ||
        n.includes('google') || u.includes('google') ||
        n.includes('apple') || u.includes('com.apple');
    });
    if (hasNeural) return 'neural';
    
    const hasEnhanced = langVoices.some(v => {
      const n = v.name.toLowerCase();
      return n.includes('microsoft') && !n.includes('desktop');
    });
    if (hasEnhanced) return 'enhanced';
    return 'standard';
  });
}

function detectPlatform(): 'android' | 'ios' | 'windows' | 'mac' | 'other' {
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return 'android';
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/windows/.test(ua)) return 'windows';
  if (/mac/.test(ua)) return 'mac';
  return 'other';
}

const PLATFORM_INSTRUCTIONS: Record<string, { title: string; steps: string[]; link?: string }> = {
  android: {
    title: '📱 Melhorar voz no Android',
    steps: [
      'Abra Configurações → Acessibilidade → Texto para fala',
      'Selecione "Google Text-to-Speech" como motor preferido',
      'Toque em ⚙️ ao lado do Google TTS',
      'Baixe o pacote de idioma para o idioma que está aprendendo',
      'Reinicie o aplicativo',
    ],
    link: 'https://play.google.com/store/apps/details?id=com.google.android.tts',
  },
  ios: {
    title: '🍎 Melhorar voz no iPhone/iPad',
    steps: [
      'Abra Ajustes → Acessibilidade → Conteúdo falado',
      'Toque em "Vozes"',
      'Selecione o idioma que está aprendendo',
      'Escolha uma voz e toque em "Baixar" (vozes Premium são melhores)',
      'Reinicie o aplicativo',
    ],
  },
  windows: {
    title: '🖥️ Melhorar voz no Windows',
    steps: [
      'Abra Configurações → Hora e idioma → Fala',
      'Em "Vozes", clique em "Adicionar vozes"',
      'Instale o pacote de idioma desejado',
      'Ou use o Chrome/Edge que incluem vozes neurais da Microsoft',
      'Reinicie o navegador após instalar',
    ],
  },
  mac: {
    title: '🍎 Melhorar voz no Mac',
    steps: [
      'Abra Preferências do Sistema → Acessibilidade → Fala',
      'Clique em "Voz do sistema" e selecione "Personalizar"',
      'Baixe vozes de alta qualidade para o idioma desejado',
      'Reinicie o aplicativo',
    ],
  },
  other: {
    title: '🔊 Melhorar qualidade de voz',
    steps: [
      'Use o Google Chrome ou Microsoft Edge para melhor qualidade',
      'Instale pacotes de idioma no seu sistema operacional',
      'Reinicie o navegador após instalar',
    ],
  },
};

interface VoiceQualityBannerProps {
  lang: string;
  className?: string;
}

export function VoiceQualityBanner({ lang, className = '' }: VoiceQualityBannerProps) {
  const [quality, setQuality] = useState<'neural' | 'enhanced' | 'standard' | 'none' | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const platform = detectPlatform();

  useEffect(() => {
    const key = `voice_banner_dismissed_${lang}`;
    if (localStorage.getItem(key)) {
      setDismissed(true);
      return;
    }
    getOverallQuality(lang).then(q => setQuality(q));
  }, [lang]);

  const handleDismiss = () => {
    localStorage.setItem(`voice_banner_dismissed_${lang}`, '1');
    setDismissed(true);
  };

  if (dismissed || quality === null || quality === 'neural') return null;

  const instructions = PLATFORM_INSTRUCTIONS[platform] || PLATFORM_INSTRUCTIONS.other;

  return (
    <div className={`rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <span className="text-lg">🔊</span>
          <div>
            <p className="font-medium text-amber-300">
              {quality === 'none'
                ? 'Voz não disponível para este idioma'
                : 'Voz básica detectada — qualidade pode ser melhorada'}
            </p>
            <p className="text-amber-200/70 text-xs mt-0.5">
              Para voz natural como Teacher Poli e Mondly, instale vozes neurais gratuitas no seu dispositivo.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-amber-400/60 hover:text-amber-300 text-lg leading-none flex-shrink-0"
          title="Fechar"
        >
          ×
        </button>
      </div>

      <button
        onClick={() => setShowInstructions(!showInstructions)}
        className="mt-2 text-xs text-amber-400 hover:text-amber-300 underline"
      >
        {showInstructions ? 'Ocultar instruções' : '▶ Como instalar vozes melhores (gratuito)'}
      </button>

      {showInstructions && (
        <div className="mt-3 rounded bg-amber-900/30 p-3 space-y-1">
          <p className="font-semibold text-amber-200 text-xs">{instructions.title}</p>
          <ol className="space-y-1 ml-4 list-decimal">
            {instructions.steps.map((step, i) => (
              <li key={i} className="text-amber-100/80 text-xs">{step}</li>
            ))}
          </ol>
          {instructions.link && (
            <a
              href={instructions.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
            >
              Baixar Google TTS →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
