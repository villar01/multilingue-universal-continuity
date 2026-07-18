import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Eye, EyeOff, Gauge } from 'lucide-react';

interface VirtualTeacher3DProps {
  expression?: 'neutral' | 'happy' | 'thinking' | 'excited' | 'encouraging';
  message?: string;
  audioUrl?: string;
  autoPlay?: boolean;
  showSpeedControl?: boolean;
}

/**
 * Avatar de Professor Virtual 3D com aparência realista e animações naturais
 * Inclui controles de áudio, velocidade e texto sincronizado estilo karaokê
 */
export default function VirtualTeacher3D({
  expression = 'neutral',
  message = '',
  audioUrl,
  autoPlay = false,
  showSpeedControl = true,
}: VirtualTeacher3DProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [showText, setShowText] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [blinkState, setBlinkState] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(0); // 0-1 para abertura gradual
  const [headTilt, setHeadTilt] = useState(0); // -2 a 2 graus
  const [breathe, setBreathe] = useState(0); // 0-1 para respiração

  // Palavras do texto para sincronização
  const words = message.split(' ').filter(w => w.trim());

  // Animação de piscar natural
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 120);
    }, 3500 + Math.random() * 2500);
    return () => clearInterval(blinkInterval);
  }, []);

  // Animação de respiração sutil
  useEffect(() => {
    const breatheInterval = setInterval(() => {
      setBreathe(prev => (prev + 0.1) % (Math.PI * 2));
    }, 100);
    return () => clearInterval(breatheInterval);
  }, []);

  // Movimento sutil da cabeça
  useEffect(() => {
    const headInterval = setInterval(() => {
      setHeadTilt(Math.sin(Date.now() / 3000) * 1.5);
    }, 100);
    return () => clearInterval(headInterval);
  }, []);

  // Animação da boca quando fala (mais natural)
  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(0);
      return;
    }
    
    const mouthInterval = setInterval(() => {
      // Abertura variável para parecer mais natural
      setMouthOpen(0.3 + Math.random() * 0.5);
    }, 100 + Math.random() * 50);
    
    return () => clearInterval(mouthInterval);
  }, [isSpeaking]);

  // Auto-play quando audioUrl muda
  useEffect(() => {
    if (audioUrl && autoPlay) {
      const timer = setTimeout(() => {
        playAudio();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [audioUrl, autoPlay]);

  // Sincronização de texto com áudio
  useEffect(() => {
    if (!isPlaying || !audioRef.current || words.length === 0) return;

    const audio = audioRef.current;
    
    const updateProgress = () => {
      if (audio.duration > 0) {
        const progress = audio.currentTime / audio.duration;
        setAudioProgress(progress * 100);
        const wordIndex = Math.floor(progress * words.length);
        setCurrentWordIndex(Math.min(wordIndex, words.length - 1));
      }
    };

    const interval = setInterval(updateProgress, 50);
    return () => clearInterval(interval);
  }, [isPlaying, words.length]);

  const playAudio = async () => {
    if (!audioUrl) return;

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.playbackRate = playbackRate;
        
        audioRef.current.onplay = () => {
          setIsPlaying(true);
          setIsSpeaking(true);
          setCurrentWordIndex(0);
        };
        
        audioRef.current.onpause = () => {
          setIsPlaying(false);
          setIsSpeaking(false);
        };
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
          setIsSpeaking(false);
          setCurrentWordIndex(-1);
          setAudioProgress(0);
        };
      }

      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      }
    } catch (error) {
      console.log('Erro ao reproduzir áudio:', error);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const changeSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const newRate = speeds[nextIndex];
    
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  const restartAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentWordIndex(0);
      setAudioProgress(0);
      audioRef.current.play();
    }
  };

  const getSpeedLabel = () => {
    switch (playbackRate) {
      case 0.5: return 'Muito Lento';
      case 0.75: return 'Lento';
      case 1: return 'Normal';
      case 1.25: return 'Rápido';
      case 1.5: return 'Muito Rápido';
      case 2: return 'Ultra Rápido';
      default: return 'Normal';
    }
  };

  // Expressões faciais mais naturais
  const getEyeScale = () => {
    if (blinkState) return 0.05;
    switch (expression) {
      case 'happy':
      case 'excited':
        return 0.88;
      default:
        return 1;
    }
  };

  const breatheScale = 1 + Math.sin(breathe) * 0.008; // Respiração muito sutil

  const getMouthPath = () => {
    const openAmount = isSpeaking ? mouthOpen : 0;
    const baseY = 62;
    const openY = baseY + (openAmount * 8);
    
    switch (expression) {
      case 'happy':
      case 'excited':
        return `M 35 ${baseY - 2} Q 50 ${baseY + 12 + openAmount * 4} 65 ${baseY - 2}`; // Sorriso grande
      case 'encouraging':
        return `M 38 ${baseY} Q 50 ${baseY + 8 + openAmount * 4} 62 ${baseY}`; // Sorriso médio
      case 'thinking':
        return `M 42 ${baseY + 2} Q 50 ${baseY - 2 + openAmount * 4} 58 ${baseY + 2}`; // Boca pensativa
      default:
        return `M 40 ${baseY} Q 50 ${baseY + 6 + openAmount * 4} 60 ${baseY}`; // Sorriso leve
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Container do Avatar */}
      <div className="flex-1 relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-[280px]">
        
        {/* Avatar SVG Animado com transformações suaves */}
        <div 
          className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
          style={{
            transform: `rotate(${headTilt}deg) scale(${breatheScale})`,
          }}
        >
          <svg
            width="240"
            height="300"
            viewBox="0 0 100 140"
            className="drop-shadow-2xl"
            style={{ 
              filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.2))',
              transition: 'all 0.3s ease-out'
            }}
          >
            {/* Definições de gradientes realistas */}
            <defs>
              {/* Pele com tom mais natural */}
              <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F5D5C0" />
                <stop offset="50%" stopColor="#F0C8A8" />
                <stop offset="100%" stopColor="#E8B89A" />
              </linearGradient>
              
              {/* Cabelo com profundidade */}
              <linearGradient id="hairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5D4037" />
                <stop offset="50%" stopColor="#4A3428" />
                <stop offset="100%" stopColor="#3E2723" />
              </linearGradient>
              
              {/* Roupa profissional */}
              <linearGradient id="blazerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2C5F8D" />
                <stop offset="50%" stopColor="#1E4A6F" />
                <stop offset="100%" stopColor="#163A56" />
              </linearGradient>
              
              {/* Sombras suaves */}
              <radialGradient id="faceShadow" cx="50%" cy="60%" r="50%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.08" />
              </radialGradient>
              
              {/* Rubor natural */}
              <radialGradient id="cheekGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFB6C1" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#FFB6C1" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Sombra do corpo */}
            <ellipse cx="50" cy="135" rx="35" ry="4" fill="black" opacity="0.15" />

            {/* Pescoço */}
            <rect x="42" y="80" width="16" height="18" rx="4" fill="url(#skinGradient)" />
            
            {/* Corpo/Blazer */}
            <path
              d="M 30 98 L 35 90 Q 50 85 65 90 L 70 98 Q 72 115 70 130 L 30 130 Q 28 115 30 98"
              fill="url(#blazerGradient)"
            />
            
            {/* Camisa branca */}
            <path
              d="M 42 90 Q 50 88 58 90 L 58 105 L 42 105 Z"
              fill="#FFFFFF"
              opacity="0.95"
            />

            {/* Cabelo traseiro com volume */}
            <ellipse cx="50" cy="36" rx="37" ry="35" fill="url(#hairGradient)" />
            
            {/* Orelhas com detalhes */}
            <g>
              <ellipse cx="15" cy="50" rx="6" ry="8" fill="url(#skinGradient)" />
              <ellipse cx="16" cy="50" rx="3" ry="4" fill="#E8B89A" opacity="0.6" />
              <ellipse cx="85" cy="50" rx="6" ry="8" fill="url(#skinGradient)" />
              <ellipse cx="84" cy="50" rx="3" ry="4" fill="#E8B89A" opacity="0.6" />
            </g>
            
            {/* Rosto com sombra */}
            <ellipse cx="50" cy="50" rx="33" ry="37" fill="url(#skinGradient)" />
            <ellipse cx="50" cy="50" rx="33" ry="37" fill="url(#faceShadow)" />
            
            {/* Cabelo frontal estilizado */}
            <path
              d="M 16 38 Q 18 16 50 10 Q 82 16 84 38 Q 80 28 68 23 Q 50 20 32 23 Q 20 28 16 38"
              fill="url(#hairGradient)"
            />
            
            {/* Franja com volume natural */}
            <path d="M 24 34 Q 30 20 38 32 Q 32 18 26 28 Z" fill="#6D4C41" opacity="0.9" />
            <path d="M 62 32 Q 70 20 76 34 Q 73 28 67 18 Z" fill="#6D4C41" opacity="0.9" />
            <path d="M 38 28 Q 50 16 62 28 Q 50 22 38 28 Z" fill="#6D4C41" opacity="0.9" />
            <path d="M 45 26 Q 50 20 55 26 Q 50 23 45 26 Z" fill="#5D4037" opacity="0.7" />

            {/* Sobrancelhas naturais */}
            <path
              d="M 29 37 Q 36 34 43 37"
              stroke="#4A3428"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              opacity="0.85"
              style={{ transition: 'all 0.3s ease' }}
            />
            <path
              d="M 57 37 Q 64 34 71 37"
              stroke="#4A3428"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              opacity="0.85"
              style={{ transition: 'all 0.3s ease' }}
            />

            {/* Olhos realistas com brilho */}
            <g style={{ transition: 'all 0.15s ease-out' }}>
              {/* Olho esquerdo */}
              <ellipse
                cx="37"
                cy="48"
                rx="9"
                ry={10 * getEyeScale()}
                fill="white"
              />
              <ellipse
                cx="37"
                cy="48"
                rx="5.5"
                ry={6.5 * getEyeScale()}
                fill="#3E2723"
              />
              <ellipse
                cx="37"
                cy="48"
                rx="3"
                ry={3.5 * getEyeScale()}
                fill="#1A1A1A"
              />
              {/* Brilho nos olhos */}
              <ellipse
                cx="35"
                cy="46"
                rx="2"
                ry={2.2 * getEyeScale()}
                fill="white"
                opacity="0.9"
              />
              <ellipse
                cx="39"
                cy="49"
                rx="1"
                ry={1.2 * getEyeScale()}
                fill="white"
                opacity="0.6"
              />

              {/* Olho direito */}
              <ellipse
                cx="63"
                cy="48"
                rx="9"
                ry={10 * getEyeScale()}
                fill="white"
              />
              <ellipse
                cx="63"
                cy="48"
                rx="5.5"
                ry={6.5 * getEyeScale()}
                fill="#3E2723"
              />
              <ellipse
                cx="63"
                cy="48"
                rx="3"
                ry={3.5 * getEyeScale()}
                fill="#1A1A1A"
              />
              {/* Brilho nos olhos */}
              <ellipse
                cx="61"
                cy="46"
                rx="2"
                ry={2.2 * getEyeScale()}
                fill="white"
                opacity="0.9"
              />
              <ellipse
                cx="65"
                cy="49"
                rx="1"
                ry={1.2 * getEyeScale()}
                fill="white"
                opacity="0.6"
              />
            </g>

            {/* Nariz com sombra */}
            <path
              d="M 50 52 Q 48 58 46 60 Q 50 62 54 60 Q 52 58 50 52"
              fill="#E8B89A"
              opacity="0.6"
            />
            <ellipse cx="47" cy="60" rx="1.5" ry="2" fill="#D4A088" opacity="0.5" />
            <ellipse cx="53" cy="60" rx="1.5" ry="2" fill="#D4A088" opacity="0.5" />

            {/* Rubor nas bochechas */}
            <ellipse cx="30" cy="56" rx="8" ry="6" fill="url(#cheekGlow)" />
            <ellipse cx="70" cy="56" rx="8" ry="6" fill="url(#cheekGlow)" />

            {/* Boca com animação natural */}
            <path
              d={getMouthPath()}
              stroke="#C97064"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              style={{ transition: 'all 0.1s ease-out' }}
            />
            
            {/* Lábio inferior quando fala */}
            {isSpeaking && mouthOpen > 0.3 && (
              <path
                d={`M 40 ${62 + mouthOpen * 6} Q 50 ${64 + mouthOpen * 8} 60 ${62 + mouthOpen * 6}`}
                fill="#C97064"
                opacity="0.4"
              />
            )}

            {/* Queixo com contorno */}
            <path
              d="M 25 65 Q 50 82 75 65"
              stroke="#E8B89A"
              strokeWidth="1"
              fill="none"
              opacity="0.3"
            />
          </svg>
        </div>

        {/* Badge de status ONLINE */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          ONLINE
        </div>
      </div>

      {/* Controles de áudio */}
      {audioUrl && (
        <div className="mt-4 space-y-3">
          {/* Barra de progresso */}
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100"
              style={{ width: `${audioProgress}%` }}
            />
          </div>

          {/* Botões de controle */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={playAudio}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span className="text-sm font-medium">{isPlaying ? 'Pausar' : 'Ouvir'}</span>
            </button>

            <button
              onClick={restartAudio}
              className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              title="Reiniciar"
            >
              <RotateCcw className="h-4 w-4 text-gray-700" />
            </button>

            <button
              onClick={toggleMute}
              className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              title={isMuted ? 'Ativar som' : 'Silenciar'}
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-gray-700" /> : <Volume2 className="h-4 w-4 text-gray-700" />}
            </button>

            {showSpeedControl && (
              <button
                onClick={changeSpeed}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                title="Velocidade"
              >
                <Gauge className="h-4 w-4 text-gray-700" />
                <span className="text-xs font-medium text-gray-700">{playbackRate}x</span>
              </button>
            )}

            <button
              onClick={() => setShowText(!showText)}
              className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              title={showText ? 'Ocultar texto' : 'Mostrar texto'}
            >
              {showText ? <Eye className="h-4 w-4 text-gray-700" /> : <EyeOff className="h-4 w-4 text-gray-700" />}
            </button>
          </div>

          {/* Indicador de velocidade */}
          {showSpeedControl && (
            <div className="text-center text-xs text-gray-500">
              {getSpeedLabel()}
            </div>
          )}
        </div>
      )}

      {/* Texto sincronizado estilo karaokê */}
      {showText && message && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-wrap gap-1.5 text-base leading-relaxed">
            {words.map((word, index) => (
              <span
                key={index}
                className={`transition-all duration-200 ${
                  index === currentWordIndex
                    ? 'text-blue-600 font-bold scale-110'
                    : index < currentWordIndex
                    ? 'text-gray-400'
                    : 'text-gray-700'
                }`}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
