import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

interface TalkingHeadAvatarProps {
  avatarId?: string;
  gender: 'male' | 'female';
  language: 'pt-BR' | 'en-US';
  onReady?: () => void;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
}

export interface TalkingHeadAvatarRef {
  speakWithAudio: (audioUrl: string, text?: string) => Promise<void>;
  stopSpeaking: () => void;
}

/**
 * TalkingHead 3D Avatar Component (Offline Fallback)
 * 
 * Renderiza avatar 3D com sincronização labial usando biblioteca TalkingHead
 * Carregado via CDN para operação offline após carregamento inicial
 * 
 * NOTA: Este componente é usado como FALLBACK quando não há conexão internet
 * Para avatar fotorrealista online, use LivePortrait API
 */
const TalkingHeadAvatar = forwardRef<TalkingHeadAvatarRef, TalkingHeadAvatarProps>(({
  avatarId = 'default',
  gender,
  language,
  onReady,
  onSpeakStart,
  onSpeakEnd
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const headInstanceRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initializeTalkingHead() {
      if (!containerRef.current) return;

      try {
        // Load TalkingHead library via CDN
        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = `
          import { TalkingHead } from 'https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@1.7/modules/talkinghead.mjs';
          window.TalkingHead = TalkingHead;
        `;
        document.head.appendChild(script);

        // Wait for library to load
        await new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if ((window as any).TalkingHead) {
              clearInterval(checkInterval);
              resolve(true);
            }
          }, 100);
        });

        if (!mounted) return;

        const TalkingHead = (window as any).TalkingHead;

        // Create TalkingHead instance
        const head = new TalkingHead(containerRef.current, {
          ttsEndpoint: 'none',
          lipsyncModules: ['en', 'fi', 'pt'],
          cameraView: 'head'
        });

        // Configure avatar based on gender
        const avatarConfig = {
          url: gender === 'male' 
            ? 'https://models.readyplayer.me/65f2a7c4c2c3c3e4f8a9b1c2.glb'
            : 'https://models.readyplayer.me/65f2a7c4c2c3c3e4f8a9b1c3.glb',
          body: gender === 'male' ? 'M' : 'F',
          avatarMood: 'neutral',
          ttsLang: language,
          ttsVoice: language === 'pt-BR' 
            ? 'pt-BR-Wavenet-B'
            : 'en-US-Neural2-F',
          lipsyncLang: language === 'pt-BR' ? 'pt' : 'en'
        };

        await head.showAvatar(avatarConfig);

        if (!mounted) return;

        headInstanceRef.current = head;
        setIsLoading(false);
        onReady?.();

      } catch (err) {
        console.error('[TalkingHeadAvatar] Erro ao inicializar:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Erro desconhecido');
          setIsLoading(false);
        }
      }
    }

    initializeTalkingHead();

    return () => {
      mounted = false;
      if (headInstanceRef.current) {
        headInstanceRef.current.stop();
        headInstanceRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [gender, language, onReady]);

  /**
   * Fazer avatar falar com áudio URL
   */
  const speakWithAudio = async (audioUrl: string, text?: string) => {
    if (!headInstanceRef.current) {
      console.warn('[TalkingHeadAvatar] Instância não inicializada');
      return;
    }

    try {
      onSpeakStart?.();
      
      // Play audio manually and sync with avatar
      audioRef.current = new Audio(audioUrl);
      audioRef.current.play();
      
      // Trigger avatar lip-sync animation
      await headInstanceRef.current.speakAudio(audioUrl, { text: text || '' });
      
      onSpeakEnd?.();
    } catch (err) {
      console.error('[TalkingHeadAvatar] Erro ao falar:', err);
      onSpeakEnd?.();
    }
  };

  /**
   * Parar fala
   */
  const stopSpeaking = () => {
    if (headInstanceRef.current) {
      headInstanceRef.current.stop();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    onSpeakEnd?.();
  };

  // Expor métodos via ref
  useImperativeHandle(ref, () => ({
    speakWithAudio,
    stopSpeaking
  }));

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-red-50 rounded-lg">
        <p className="text-red-600 font-semibold mb-2">⚠️ Avatar 3D indisponível</p>
        <p className="text-sm text-red-500">{error}</p>
        <p className="text-xs text-gray-500 mt-4">
          Modo offline requer carregamento inicial com internet
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-sm text-gray-700 font-medium">Carregando avatar 3D...</p>
          <p className="text-xs text-gray-500 mt-2">
            {gender === 'male' ? '👨‍🏫 Prof. Ricardo' : '👩‍🏫 Professora de Inglês'}
          </p>
          <p className="text-xs text-orange-500 mt-4">
            🔄 Modo Offline Ativo
          </p>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
});

TalkingHeadAvatar.displayName = 'TalkingHeadAvatar';

export default TalkingHeadAvatar;
