/**
 * AnimatedTeacher — Componente de professor animado
 * 
 * Fluxo:
 *  1. Recebe texto + professor
 *  2. Chama TTS (Google Studio) → URL do áudio
 *  3. Chama D-ID (foto + áudio) → URL do vídeo MP4 animado
 *  4. Exibe vídeo com rosto animado e lip-sync perfeito
 *  5. Fallback: foto estática + CSS lip-sync se D-ID não disponível
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Play, Volume2, VolumeX, Loader2, RefreshCw } from "lucide-react";

interface AnimatedTeacherProps {
  teacherId?: number;
  teacherName?: string;
  teacherImageUrl?: string;
  teacherGender?: "male" | "female";
  text?: string;           // Texto para o professor falar
  audioUrl?: string;       // URL do áudio já gerado (opcional)
  languageCode?: string;   // Código do idioma para TTS
  isTeaching?: boolean;    // Se o professor está ensinando
  onSpeakEnd?: () => void; // Callback quando termina de falar
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_MAP = {
  sm: { container: "w-32 h-32", video: "w-32 h-32" },
  md: { container: "w-48 h-48", video: "w-48 h-48" },
  lg: { container: "w-64 h-64", video: "w-64 h-64" },
  xl: { container: "w-80 h-80", video: "w-80 h-80" },
};

// Voice wave bars component
function VoiceWaves({ isActive, size }: { isActive: boolean; size: number }) {
  const bars = 8;
  return (
    <svg
      className="absolute pointer-events-none"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: "rotate(-90deg)" }}
    >
      {Array.from({ length: bars }).map((_, i) => {
        const angle = (i / bars) * Math.PI * 2;
        const innerR = size * 0.42;
        const barLen = isActive ? size * 0.08 : size * 0.02;
        const cx = size / 2, cy = size / 2;
        const x1 = cx + Math.cos(angle) * innerR;
        const y1 = cy + Math.sin(angle) * innerR;
        const x2 = cx + Math.cos(angle) * (innerR + barLen);
        const y2 = cy + Math.sin(angle) * (innerR + barLen);
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={isActive ? `hsl(${200 + i * 20}, 80%, 65%)` : "rgba(100,150,255,0.25)"}
            strokeWidth={isActive ? 3 : 2}
            strokeLinecap="round"
            style={{
              transition: "all 0.08s ease",
              animation: isActive ? `waveBar${i % 4} ${0.4 + i * 0.07}s ease-in-out infinite alternate` : "none",
            }}
          />
        );
      })}
    </svg>
  );
}

export function AnimatedTeacher({
  teacherId,
  teacherName = "Professor",
  teacherImageUrl,
  teacherGender = "male",
  text,
  audioUrl: propAudioUrl,
  languageCode = "en",
  isTeaching = false,
  onSpeakEnd,
  size = "lg",
  className = "",
}: AnimatedTeacherProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(propAudioUrl || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mouthOpen, setMouthOpen] = useState(0);
  const [lipSyncActive, setLipSyncActive] = useState(false);
  const [expression, setExpression] = useState<"idle" | "smile" | "thinking">("idle");
  const [expressionProgress, setExpressionProgress] = useState(0); // 0→1 transition progress
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastTextRef = useRef<string>("");

  // Fetch teacher data if only ID provided
  const { data: teacherData } = trpc.teachers.getById.useQuery(
    { teacherId: teacherId ?? 0 },
    { enabled: !!teacherId && !teacherImageUrl, staleTime: 10 * 60 * 1000 }
  );

  const resolvedImageUrl = teacherImageUrl || teacherData?.photoUrl || undefined;
  const resolvedName = teacherName !== "Professor" ? teacherName : (teacherData?.name || teacherName);

  // Mutation para gerar vídeo animado (D-ID)
  const animateMutation = trpc.livePortrait.animate.useMutation({
    onSuccess: (data) => {
      if (data?.videoUrl) {
        setVideoUrl(data.videoUrl);
        setIsGenerating(false);
      }
    },
    onError: (err) => {
      console.warn("[AnimatedTeacher] D-ID failed, using CSS fallback:", err.message);
      setIsGenerating(false);
      setError(null); // Silencioso — usa fallback CSS
    },
  });

  // Mutation para TTS
  const ttsMutation = trpc.ttsGoogle.generate.useMutation({
    onSuccess: (data) => {
      if (data?.audioUrl) {
        setAudioUrl(data.audioUrl);
      }
    },
    onError: (err) => {
      console.error("[AnimatedTeacher] TTS failed:", err.message);
    },
  });

  // Smooth expression transition: animate from current to target expression
  const transitionExpression = useCallback((target: "idle" | "smile" | "thinking") => {
    setExpression(target);
    setExpressionProgress(0);
    const startTime = Date.now();
    const duration = 400; // 400ms smooth transition
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setExpressionProgress(progress);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  // Auto-cycle expressions when idle (not speaking)
  useEffect(() => {
    if (isPlaying || lipSyncActive || isGenerating) return;
    const interval = setInterval(() => {
      // Cycle: idle → smile → idle → thinking → idle
      setExpression((prev) => {
        if (prev === "idle") return "smile";
        if (prev === "smile") return "idle";
        if (prev === "thinking") return "idle";
        return "idle";
      });
      setExpressionProgress(0);
      const startTime = Date.now();
      const duration = 600;
      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setExpressionProgress(progress);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 4000); // Change expression every 4s when idle
    return () => clearInterval(interval);
  }, [isPlaying, lipSyncActive, isGenerating]);

  // Set expression based on speaking state
  useEffect(() => {
    if (isGenerating) transitionExpression("thinking");
    else if (isPlaying || lipSyncActive) transitionExpression("smile");
    else transitionExpression("idle");
  }, [isPlaying, lipSyncActive, isGenerating, transitionExpression]);

  // Iniciar lip-sync via AudioContext
  const startLipSync = useCallback((url: string) => {
    if (!url) return;
    
    const audio = new Audio(url);
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const analyser = ctx.createAnalyser();
    analyserRef.current = analyser;
    analyser.fftSize = 256;

    const source = ctx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(ctx.destination);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const animate = () => {
      analyser.getByteFrequencyData(dataArray);
      // Pegar frequências de voz (300-3000 Hz)
      const voiceBins = dataArray.slice(3, 30);
      const avg = voiceBins.reduce((a, b) => a + b, 0) / voiceBins.length;
      const normalized = Math.min(avg / 80, 1);
      setMouthOpen(normalized);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    audio.addEventListener("play", () => {
      setIsPlaying(true);
      setLipSyncActive(true);
      ctx.resume();
      animate();
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setLipSyncActive(false);
      setMouthOpen(0);
      cancelAnimationFrame(animFrameRef.current);
      onSpeakEnd?.();
    });

    audio.play().catch((e) => {
      console.warn("[AnimatedTeacher] Autoplay blocked:", e.message);
      // Mostrar botão de play manual
    });
  }, [onSpeakEnd]);

  // Quando texto muda e professor está ensinando
  useEffect(() => {
    if (!text || !isTeaching || text === lastTextRef.current) return;
    lastTextRef.current = text;

    setVideoUrl(null);
    setIsGenerating(true);
    setError(null);

    // 1. Gerar TTS se não tiver audioUrl
    if (!propAudioUrl) {
      ttsMutation.mutate({ text, languageCode });
    }
  }, [text, isTeaching]);

  // Quando audioUrl fica disponível, gerar vídeo D-ID
  useEffect(() => {
    if (!audioUrl || !resolvedImageUrl || !isTeaching) return;

    // Tentar D-ID para vídeo animado
    animateMutation.mutate({
      imageUrl: resolvedImageUrl,
      audioUrl: audioUrl,
    });

    // Também iniciar lip-sync CSS como fallback imediato
    startLipSync(audioUrl);
  }, [audioUrl, resolvedImageUrl]);

  // Quando propAudioUrl muda externamente
  useEffect(() => {
    if (propAudioUrl && propAudioUrl !== audioUrl) {
      setAudioUrl(propAudioUrl);
    }
  }, [propAudioUrl]);

  const handleManualPlay = () => {
    if (audioRef.current) {
      audioCtxRef.current?.resume();
      audioRef.current.play().catch(console.error);
    } else if (audioUrl) {
      startLipSync(audioUrl);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const sizes = SIZE_MAP[size];

  // Visema SVG — 7 formas de boca baseadas na amplitude (0-1)
  const getViseme = (amp: number) => {
    if (amp < 0.04) return { upper: 'M 36 50 Q 44 49 50 49.5 Q 56 49 64 50', lower: 'M 36 50 Q 44 51 50 50.5 Q 56 51 64 50', fill: 'none', cavity: null };
    if (amp < 0.12) return { upper: 'M 37 49 Q 44 47.5 50 47.5 Q 56 47.5 63 49', lower: 'M 37 49 Q 44 52 50 52.5 Q 56 52 63 49', fill: '#2a0808', cavity: 'M 40 49.5 Q 50 51.5 60 49.5 Q 50 51 40 49.5' };
    if (amp < 0.25) return { upper: 'M 37 48 Q 44 45.5 50 45.5 Q 56 45.5 63 48', lower: 'M 37 48 Q 44 54 50 55 Q 56 54 63 48', fill: '#1a0505', cavity: 'M 40 49 Q 50 53 60 49' };
    if (amp < 0.40) return { upper: 'M 37 47 Q 44 44 50 43.5 Q 56 44 63 47', lower: 'M 37 47 Q 44 55.5 50 57 Q 56 55.5 63 47', fill: '#150303', cavity: 'M 39 49 Q 50 54.5 61 49' };
    if (amp < 0.55) return { upper: 'M 37 46 Q 44 42.5 50 42 Q 56 42.5 63 46', lower: 'M 37 46 Q 44 57 50 59 Q 56 57 63 46', fill: '#100202', cavity: 'M 39 48.5 Q 50 55.5 61 48.5' };
    if (amp < 0.75) return { upper: 'M 37 45 Q 44 41 50 40.5 Q 56 41 63 45', lower: 'M 37 45 Q 44 58.5 50 61 Q 56 58.5 63 45', fill: '#0d0101', cavity: 'M 39 48 Q 50 56.5 61 48' };
    return { upper: 'M 37 44 Q 44 40 50 39.5 Q 56 40 63 44', lower: 'M 37 44 Q 44 60 50 62.5 Q 56 60 63 44', fill: '#0a0101', cavity: 'M 39 47.5 Q 50 57 61 47.5' };
  };
  const lipAmp = Math.max(0, Math.min(1, mouthOpen));
  const viseme = getViseme(lipAmp);
  const lipColor = teacherGender === "female" ? "#c0607a" : "#8b4513";
  const fallbackPortraitUrl = teacherGender === "female"
    ? "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face"
    : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face";

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Container do professor */}
      <div className={`relative ${sizes.container} rounded-full overflow-hidden border-4 ${isPlaying || lipSyncActive ? "border-green-400 shadow-lg shadow-green-200" : "border-gray-200"} transition-all duration-300`}>
        
        {/* Vídeo D-ID animado (quando disponível) */}
        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            autoPlay
            playsInline
            muted={isMuted}
            onEnded={() => { setIsPlaying(false); onSpeakEnd?.(); }}
            onPlay={() => setIsPlaying(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Foto estática com lip-sync CSS (fallback) */}
        {!videoUrl && resolvedImageUrl && (
          <div className="relative w-full h-full">
            <img
              src={resolvedImageUrl}
              alt={resolvedName}
              className="w-full h-full object-cover"
              style={{
                filter: expression === "smile"
                  ? `brightness(${1 + 0.08 * expressionProgress}) saturate(${1 + 0.1 * expressionProgress})`
                  : expression === "thinking"
                  ? `brightness(${1 - 0.05 * expressionProgress}) contrast(${1 + 0.05 * expressionProgress})`
                  : "brightness(1) saturate(1)",
                transition: "filter 0.4s ease",
              }}
              onError={(event) => {
                const image = event.currentTarget;
                if (image.src !== fallbackPortraitUrl) image.src = fallbackPortraitUrl;
              }}
            />
            {/* Expression overlay: cheek blush when smiling */}
            {expression === "smile" && expressionProgress > 0.1 && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 30% 20% at 30% 60%, rgba(255,150,150,${0.15 * expressionProgress}), transparent), radial-gradient(ellipse 30% 20% at 70% 60%, rgba(255,150,150,${0.15 * expressionProgress}), transparent)`,
                  transition: "opacity 0.3s ease",
                  zIndex: 5,
                }}
              />
            )}
            {/* Expression overlay: thinking dimming at edges */}
            {expression === "thinking" && expressionProgress > 0.1 && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 60% 50% at 50% 40%, transparent, rgba(0,0,0,${0.15 * expressionProgress}))`,
                  transition: "opacity 0.3s ease",
                  zIndex: 5,
                }}
              />
            )}
            
            {/* Overlay de visema SVG sobre a foto (lip-sync real) */}
            {lipSyncActive && (
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ zIndex: 10 }}
              >
                {viseme.cavity && <path d={viseme.cavity} fill="#8b2020" opacity={0.5} />}
                {viseme.fill !== 'none' && (
                  <path d={`${viseme.upper} ${viseme.lower.replace('M', 'L')}`} fill={viseme.fill} />
                )}
                <path d={viseme.upper} fill="none" stroke={lipColor} strokeWidth="1.2" strokeLinecap="round" style={{ transition: 'd 0.04s ease' }} />
                <path d={viseme.lower} fill="none" stroke={lipColor} strokeWidth="1.2" strokeLinecap="round" style={{ transition: 'd 0.04s ease' }} />
              </svg>
            )}
          </div>
        )}

        {/* Avatar SVG fallback quando não há foto */}
        {!videoUrl && !resolvedImageUrl && (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-4/5 h-4/5">
              {/* Cabeça */}
              <ellipse cx="50" cy="38" rx="22" ry="26" fill={teacherGender === "female" ? "#f4c2a1" : "#e8b89a"} />
              {/* Olhos — com transição de expressão */}
              {(() => {
                // Eye shapes vary by expression
                const eyeOffset = expression === "smile" ? -0.5 * expressionProgress : expression === "thinking" ? 0.8 * expressionProgress : 0;
                const eyeRy = expression === "smile" ? 3.5 - 0.8 * expressionProgress : expression === "thinking" ? 3.5 + 0.5 * expressionProgress : 3.5;
                return (
                  <>
                    <ellipse cx="41" cy={34 + eyeOffset} rx="3.5" ry={eyeRy} fill="white" />
                    <ellipse cx="59" cy={34 + eyeOffset} rx="3.5" ry={eyeRy} fill="white" />
                    <circle cx="42" cy={35 + eyeOffset} r="2" fill="#2d1b00" />
                    <circle cx="60" cy={35 + eyeOffset} r="2" fill="#2d1b00" />
                  </>
                );
              })()}
              {/* Sobrancelhas — expressão */}
              {(() => {
                const browY = expression === "thinking" ? 27 - 1.5 * expressionProgress : expression === "smile" ? 28 + 0.5 * expressionProgress : 28;
                const browRotate = expression === "thinking" ? -5 * expressionProgress : 0;
                return (
                  <>
                    <path d={`M 35 ${browY} Q 41 ${browY - 2} 47 ${browY + 0.5}`} fill="none" stroke={teacherGender === "female" ? "#8b4513" : "#3b1c00"} strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${browRotate} 41 ${browY})`} style={{ transition: "d 0.3s ease, transform 0.3s ease" }} />
                    <path d={`M 53 ${browY + 0.5} Q 59 ${browY - 2} 65 ${browY}`} fill="none" stroke={teacherGender === "female" ? "#8b4513" : "#3b1c00"} strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${-browRotate} 59 ${browY})`} style={{ transition: "d 0.3s ease, transform 0.3s ease" }} />
                  </>
                );
              })()}
              {/* Nariz */}
              <ellipse cx="50" cy="42" rx="2" ry="1.5" fill="#c9956f" />
              {/* Boca — visemas SVG reais */}
              {viseme.cavity && <path d={viseme.cavity} fill="#8b2020" opacity={0.8} />}
              {viseme.fill !== 'none' && (
                <path d={`${viseme.upper} ${viseme.lower.replace('M', 'L')}`} fill={viseme.fill} style={{ transition: 'd 0.04s ease' }} />
              )}
              <path d={viseme.upper} fill="none" stroke={lipColor} strokeWidth="1.4" strokeLinecap="round" style={{ transition: 'd 0.04s ease' }} />
              <path d={viseme.lower} fill="none" stroke={lipColor} strokeWidth="1.4" strokeLinecap="round" style={{ transition: 'd 0.04s ease' }} />
              {/* Corpo */}
              <rect x="28" y="66" width="44" height="34" rx="8" fill={teacherGender === "female" ? "#6366f1" : "#1e40af"} />
              {/* Bochechas — aparecem ao sorrir */}
              {expression === "smile" && expressionProgress > 0.1 && (
                <>
                  <ellipse cx="35" cy="44" rx="3" ry="2" fill="#ff9999" opacity={0.3 * expressionProgress} style={{ transition: "opacity 0.3s ease" }} />
                  <ellipse cx="65" cy="44" rx="3" ry="2" fill="#ff9999" opacity={0.3 * expressionProgress} style={{ transition: "opacity 0.3s ease" }} />
                </>
              )}
            </svg>
          </div>
        )}

        {/* Indicador de carregamento */}
        {isGenerating && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-full">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        {/* Indicador de falando */}
        {(isPlaying || lipSyncActive) && !isGenerating && (
          <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        )}
      </div>

      {/* Nome do professor */}
      <div className="text-center">
        <p className="font-bold text-gray-900 text-sm">{resolvedName}</p>
        {(isPlaying || lipSyncActive) && (
          <p className="text-xs text-green-600 font-medium">● Falando...</p>
        )}
        {isGenerating && (
          <p className="text-xs text-blue-500 font-medium">Preparando...</p>
        )}
      </div>

      {/* Controles */}
      <div className="flex gap-2">
        {/* Botão play manual (quando autoplay bloqueado) */}
        {audioUrl && !isPlaying && !lipSyncActive && !isGenerating && (
          <button
            onClick={handleManualPlay}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold shadow transition-all"
          >
            <Play className="w-3 h-3" />
            Ouvir
          </button>
        )}

        {/* Mute toggle */}
        {(isPlaying || videoUrl) && (
          <button
            onClick={toggleMute}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-all"
          >
            {isMuted ? <VolumeX className="w-3 h-3 text-gray-600" /> : <Volume2 className="w-3 h-3 text-gray-600" />}
          </button>
        )}

        {/* Repetir */}
        {audioUrl && !isPlaying && !isGenerating && (
          <button
            onClick={handleManualPlay}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-all"
            title="Repetir"
          >
            <RefreshCw className="w-3 h-3 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
}

export default AnimatedTeacher;
