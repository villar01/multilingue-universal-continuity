/**
 * TalkingTeacher - Avatar Fotorrealista Falante com D-ID
 * Lip-sync perfeito via D-ID API para todos os 57 professores
 * Fallback: TTS nativo do browser + animação CSS
 */
import React, { useState, useRef, useCallback, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { TEACHERS_57, type Teacher57 } from "@/data/teachers57";
import { speakText as speakNaturalVoice } from "@/hooks/useNaturalVoice";
import { onLipSyncAmplitude, stopEdgeTTS } from "@/lib/edgeTTSClient";
import { ADVANCED_VISEME_MAP, useTTSVisemeSync, type VisemeData } from "@/lib/tts-viseme-sync";

// Fotos fotorrealistas por professor (Unsplash - domínio público)
const TEACHER_PHOTOS: Record<string, string> = {
  "prof-pt-br": "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=300&h=300&fit=crop&crop=face&auto=format",
  "prof-en-us": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face&auto=format",
  "prof-en-gb": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face&auto=format",
  "prof-es-es": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face&auto=format",
  "prof-es-mx": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face&auto=format",
  "prof-fr":    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face&auto=format",
  "prof-de":    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face&auto=format",
  "prof-it":    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=300&fit=crop&crop=face&auto=format",
  "prof-ja":    "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=300&h=300&fit=crop&crop=face&auto=format",
  "prof-ko":    "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=300&h=300&fit=crop&crop=face&auto=format",
  "prof-zh":    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face&auto=format",
  "prof-ar":    "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=300&h=300&fit=crop&crop=face&auto=format",
  "prof-ru":    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face&auto=format",
  "prof-hi":    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face&auto=format",
  "prof-pt-pt": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face&auto=format",
  "prof-nl":    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&crop=face&auto=format",
  "prof-pl":    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face&auto=format",
  "prof-sv":    "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=300&h=300&fit=crop&crop=face&auto=format",
  "prof-tr":    "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=300&h=300&fit=crop&crop=face&auto=format",
  "prof-id":    "https://images.unsplash.com/photo-1548142813-c348350df52b?w=300&h=300&fit=crop&crop=face&auto=format",
};

const DEFAULT_PHOTO = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face&auto=format";

interface TalkingTeacherProps {
  teacher: Teacher57;
  text?: string;
  autoPlay?: boolean;
  externalAudioUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  showName?: boolean;
  showControls?: boolean;
  onVideoReady?: (url: string) => void;
  className?: string;
}

type TeacherState = "idle" | "loading" | "speaking" | "error";

const SIZE_MAP = {
  sm: { container: "w-24 h-24", video: "w-24 h-24" },
  md: { container: "w-40 h-40", video: "w-40 h-40" },
  lg: { container: "w-56 h-56", video: "w-56 h-56" },
  xl: { container: "w-72 h-72", video: "w-72 h-72" },
};

export const TalkingTeacher: React.FC<TalkingTeacherProps> = ({
  teacher,
  text,
  autoPlay = false,
  externalAudioUrl = null,
  size = "md",
  showName = true,
  showControls = true,
  onVideoReady,
  className = "",
}) => {
  const [state, setState] = useState<TeacherState>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lipAmplitude, setLipAmplitude] = useState(0);
  const [audioViseme, setAudioViseme] = useState<VisemeData>(ADVANCED_VISEME_MAP.X);
  const videoRef = useRef<HTMLVideoElement>(null);
  const externalAudioRef = useRef<HTMLAudioElement | null>(null);
  const photoUrl = TEACHER_PHOTOS[teacher.id] || DEFAULT_PHOTO;
  const sizes = SIZE_MAP[size];

  const generateVideoMutation = trpc.livePortrait.generateTeacherVideo.useMutation();
  const audioVisemeSync = useTTSVisemeSync(setAudioViseme);

  // A queda para TTS neural preserva movimento reativo ao áudio real, em vez
  // de um ciclo visual fixo de fala.
  useEffect(() => {
    onLipSyncAmplitude(setLipAmplitude);
    return () => onLipSyncAmplitude(null);
  }, []);

  useEffect(() => {
    if (!externalAudioUrl) return;
    stopEdgeTTS();
    const audio = new Audio(externalAudioUrl);
    externalAudioRef.current = audio;
    const finish = () => {
      audioVisemeSync.stop();
      setAudioViseme(ADVANCED_VISEME_MAP.X);
      setIsSpeaking(false);
      setState("idle");
    };
    audio.onplay = () => {
      setIsSpeaking(true);
      setState("speaking");
      audioVisemeSync.syncWithAudio(audio, text || teacher.greeting, teacher.voiceLang || "en-US");
    };
    audio.onended = finish;
    audio.onerror = finish;
    audio.play().catch(finish);
    return () => {
      audio.pause();
      audio.currentTime = 0;
      audioVisemeSync.stop();
      if (externalAudioRef.current === audio) externalAudioRef.current = null;
    };
  }, [externalAudioUrl, text, teacher.greeting, teacher.voiceLang]);

  // Gerar vídeo D-ID
  const generateVideo = useCallback(async (speechText: string) => {
    if (!speechText.trim()) return;
    setState("loading");
    try {
      const result = await generateVideoMutation.mutateAsync({
        imageUrl: photoUrl,
        text: speechText.substring(0, 500),
        languageCode: teacher.voiceLang || "en-US",
      });
      if (result.videoUrl) {
        setVideoUrl(result.videoUrl);
        setState("speaking");
        onVideoReady?.(result.videoUrl);
      }
    } catch (err) {
      console.warn("D-ID unavailable, using browser TTS fallback");
      setState("error");
      // Fallback: usar TTS do browser
      speakWithBrowserTTS(speechText);
    }
  }, [teacher, photoUrl, generateVideoMutation, onVideoReady]);

  // Fallback: TTS nativo do browser
  const speakWithBrowserTTS = useCallback((speechText: string) => {
    stopEdgeTTS();
    setIsSpeaking(true);
    setState("speaking");
    speakNaturalVoice(speechText, teacher.voiceLang || "en-US", {
      rate: 0.9,
      onEnd: () => {
        setLipAmplitude(0);
        setIsSpeaking(false);
        setState("idle");
      },
    });
  }, [teacher.voiceLang]);

  // Auto-play quando text muda
  useEffect(() => {
    if (!externalAudioUrl && autoPlay && text) {
      generateVideo(text);
    }
  }, [autoPlay, externalAudioUrl, text]);

  // Reproduzir vídeo quando URL disponível
  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.src = videoUrl;
      videoRef.current.play().catch(() => {});
    }
  }, [videoUrl]);

  const handleSpeak = () => {
    if (text) {
      generateVideo(text);
    } else {
      speakWithBrowserTTS(teacher.greeting);
    }
  };

  const handleStop = () => {
    stopEdgeTTS();
    externalAudioRef.current?.pause();
    externalAudioRef.current = null;
    audioVisemeSync.stop();
    setAudioViseme(ADVANCED_VISEME_MAP.X);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
    setLipAmplitude(0);
    setState("idle");
    setVideoUrl(null);
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Avatar container */}
      <div
        className={`relative ${sizes.container} rounded-full overflow-hidden border-4 transition-all duration-300`}
        style={{
          borderColor: isSpeaking || state === "speaking" ? teacher.color : `${teacher.color}44`,
          boxShadow: isSpeaking || state === "speaking"
            ? `0 0 20px ${teacher.color}88, 0 0 40px ${teacher.color}44`
            : `0 0 10px ${teacher.color}22`,
        }}
      >
        {/* Video D-ID (quando disponível) */}
        {videoUrl && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            playsInline
            onEnded={() => { setState("idle"); setVideoUrl(null); }}
          />
        )}

        {/* Foto estática (fallback) */}
        {!videoUrl && (
          <img
            src={photoUrl}
            alt={teacher.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect fill='${encodeURIComponent(teacher.color)}' width='300' height='300'/><text x='150' y='160' font-size='120' text-anchor='middle' fill='white'>${encodeURIComponent(teacher.avatar)}</text></svg>`;
            }}
          />
        )}

        {/* Visible facial mouth driven by the live neural-audio amplitude */}
        {(isSpeaking || state === "speaking") && !videoUrl && (
          <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 pointer-events-none">
            <div
              className="relative overflow-hidden border-2 border-rose-950/80 bg-rose-950 shadow-[0_1px_3px_rgba(0,0,0,0.65)] transition-[width,height,border-radius] duration-75"
              style={{
                width: externalAudioUrl ? `${18 + audioViseme.mouthWidth * 0.42}px` : `${34 + lipAmplitude * 15}px`,
                height: externalAudioUrl ? `${4 + audioViseme.mouthHeight * 1.1}px` : `${5 + lipAmplitude * 23}px`,
                borderRadius: `${externalAudioUrl ? (audioViseme.lipRound > 0.35 ? 45 : 70) : (lipAmplitude > 0.58 ? 45 : 70)}%`,
                transform: `translateY(${externalAudioUrl ? (audioViseme.jawDrop > 5 ? 1 : 0) : (lipAmplitude > 0.58 ? 1 : 0)}px)`,
              }}
            >
              {(externalAudioUrl ? audioViseme.mouthHeight > 13 : lipAmplitude > 0.52) && (
                <div className="absolute inset-x-1 top-0 h-[32%] rounded-b bg-white/95" />
              )}
              {(externalAudioUrl ? audioViseme.tongueVisible : lipAmplitude > 0.76) && (
                <div className="absolute bottom-0 left-1/2 h-[40%] w-[55%] -translate-x-1/2 rounded-t-full bg-rose-400/90" />
              )}
            </div>
          </div>
        )}

        {/* Loading spinner */}
        {state === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Flag badge */}
        <div className="absolute top-1 right-1 text-base leading-none">{teacher.flag}</div>
      </div>

      {/* Name */}
      {showName && (
        <div className="text-center">
          <div className="font-bold text-sm" style={{ color: teacher.color }}>
            {teacher.name}
          </div>
          <div className="text-xs text-gray-500">{teacher.language}</div>
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="flex gap-2">
          {state !== "speaking" && state !== "loading" ? (
            <button
              onClick={handleSpeak}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white transition-all hover:scale-105"
              style={{ background: teacher.color }}
            >
              🎙️ Falar
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-red-500 text-white transition-all hover:scale-105"
            >
              ⏹️ Parar
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
// TalkingTeacherPanel - Painel completo com seletor de professor
// ============================================================
interface TalkingTeacherPanelProps {
  defaultTeacherId?: string;
  text?: string;
  autoPlay?: boolean;
  onTeacherChange?: (teacher: Teacher57) => void;
}

export const TalkingTeacherPanel: React.FC<TalkingTeacherPanelProps> = ({
  defaultTeacherId,
  text,
  autoPlay = false,
  onTeacherChange,
}) => {
  const [selectedId, setSelectedId] = useState(defaultTeacherId || "prof-en-us");
  const [search, setSearch] = useState("");

  const teacher = TEACHERS_57.find(t => t.id === selectedId) || TEACHERS_57[0];

  const filtered = TEACHERS_57.filter(t =>
    !search || t.language.toLowerCase().includes(search.toLowerCase()) ||
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (t: Teacher57) => {
    setSelectedId(t.id);
    onTeacherChange?.(t);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Selected teacher */}
      <TalkingTeacher
        teacher={teacher}
        text={text}
        autoPlay={autoPlay}
        size="lg"
        showName
        showControls
      />

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="🔍 Buscar professor..."
        className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
        style={{ borderColor: teacher.color + "66" }}
      />

      {/* Teacher grid */}
      <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
        {filtered.map(t => (
          <button
            key={t.id}
            onClick={() => handleSelect(t)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all text-xs ${
              t.id === selectedId ? "scale-105 shadow-md" : "hover:bg-gray-50"
            }`}
            style={{
              borderColor: t.id === selectedId ? t.color : "transparent",
              background: t.id === selectedId ? t.color + "11" : undefined,
            }}
            title={t.name}
          >
            <span className="text-xl">{t.flag}</span>
            <span className="truncate w-full text-center" style={{ color: t.color }}>
              {t.language.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TalkingTeacher;
