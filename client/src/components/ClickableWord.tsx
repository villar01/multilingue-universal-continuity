import { useState, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

interface ClickableWordProps {
  word: string;
  translation?: string;
  languageCode?: string;
  className?: string;
}

/**
 * Componente de palavra clicável estilo EWA
 * Ao clicar, pronuncia a palavra e mostra a tradução
 */
export default function ClickableWord({
  word,
  translation,
  languageCode = 'en',
  className = '',
}: ClickableWordProps) {
  const { isAuthenticated } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [translatedText, setTranslatedText] = useState(translation || '');
  const [isLoading, setIsLoading] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Mutation para gerar áudio TTS
  const generateAudio = trpc.tts.generateAudio.useMutation();

  // Mutation para traduzir palavra
  const translateWord = trpc.ai.translateWord.useMutation();

  const handleClick = async () => {
    setShowTooltip(true);
    if (!isAuthenticated) {
      setAuthNotice('Entre para ouvir e consultar esta palavra.');
      return;
    }

    setAuthNotice(null);
    setIsLoading(true);

    try {
      // Gerar áudio da palavra
      const audioResult = await generateAudio.mutateAsync({
        text: word,
        languageCode: languageCode,
      });

      if (audioResult.audioUrl) {
        // Criar e reproduzir áudio
        const audio = new Audio(audioResult.audioUrl);
        audioRef.current = audio;
        
        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);
        
        await audio.play();
      }

      // Se não tem tradução, buscar
      if (!translatedText) {
        const translateResult = await translateWord.mutateAsync({
          word: word,
          fromLanguage: languageCode,
          toLanguage: 'pt',
        });
        setTranslatedText(translateResult.translation);
      }
    } catch (error) {
      console.log('Erro ao processar palavra:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseLeave = () => {
    // Esconder tooltip após um delay
    setTimeout(() => {
      if (!isPlaying) {
        setShowTooltip(false);
      }
    }, 1500);
  };

  return (
    <span className="relative inline-block">
      <span
        onClick={handleClick}
        onMouseLeave={handleMouseLeave}
        className={`
          cursor-pointer 
          transition-all 
          duration-200
          hover:bg-blue-100 
          dark:hover:bg-blue-900
          hover:text-blue-600 
          dark:hover:text-blue-400
          px-0.5 
          rounded
          border-b-2 
          border-dotted 
          border-blue-300
          dark:border-blue-600
          ${isPlaying ? 'bg-blue-200 dark:bg-blue-800 scale-105' : ''}
          ${className}
        `}
      >
        {word}
        {isPlaying && (
          <span className="ml-1 inline-block animate-pulse">
            🔊
          </span>
        )}
      </span>

      {/* Tooltip com tradução */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-xl min-w-max">
            <div className="flex items-center gap-2">
              {isLoading ? (
                <span className="text-sm">Carregando...</span>
              ) : authNotice ? (
                <span className="text-sm text-amber-300 dark:text-amber-600">{authNotice}</span>
              ) : (
                <>
                  <span className="font-bold text-blue-400 dark:text-blue-600">{word}</span>
                  <span className="text-gray-400 dark:text-gray-500">=</span>
                  <span className="text-green-400 dark:text-green-600 font-medium">
                    {translatedText || '...'}
                  </span>
                </>
              )}
            </div>
            {/* Seta do tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-gray-900 dark:border-t-gray-100" />
            </div>
          </div>
        </div>
      )}
    </span>
  );
}

/**
 * Componente que transforma um texto em palavras clicáveis
 */
export function ClickableText({
  text,
  languageCode = 'en',
  translations = {},
  className = '',
}: {
  text: string;
  languageCode?: string;
  translations?: Record<string, string>;
  className?: string;
}) {
  // Separar palavras mantendo pontuação
  const parts = text.split(/(\s+|[.,!?;:'"()[\]{}])/);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Se é espaço ou pontuação, renderiza normal
        if (/^\s+$/.test(part) || /^[.,!?;:'"()[\]{}]$/.test(part)) {
          return <span key={index}>{part}</span>;
        }

        // Se é uma palavra, torna clicável
        if (part.trim()) {
          const cleanWord = part.toLowerCase().replace(/[^a-zA-Z]/g, '');
          return (
            <ClickableWord
              key={index}
              word={part}
              translation={translations[cleanWord]}
              languageCode={languageCode}
            />
          );
        }

        return null;
      })}
    </span>
  );
}
