/**
 * ═══════════════════════════════════════════════════════════════════
 * PhotoAvatarTeacher.tsx
 * Avatar fotográfico com animação real D-ID + voz neural Edge TTS
 * 
 * Fluxo:
 *  1. speak(text) → tRPC tts.speak → Edge TTS → base64 MP3
 *  2. Toca áudio MP3 no browser (qualidade neural Microsoft)
 *  3. Enquanto fala → anima boca/olhos com CSS keyframes
 *  4. Se D-ID disponível → gera vídeo lip-sync fotorrealista
 * ═══════════════════════════════════════════════════════════════════
 */

import React, {
  useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle,
} from "react";
import { trpc } from "@/lib/trpc";

// ─── Fotos reais dos professores (Unsplash, domínio público) ──────────────────
export const TEACHER_PHOTOS: Record<string, string> = {
  "prof-pt-br": "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=400&h=400&fit=crop&crop=face",
  "prof-pt-pt": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face",
  "prof-en-us": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
  "prof-en-gb": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  "prof-en-au": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
  "prof-es-es": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
  "prof-es-mx": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
  "prof-es-ar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
  "prof-fr":    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face",
  "prof-fr-ca": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
  "prof-de":    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
  "prof-it":    "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400&h=400&fit=crop&crop=face",
  "prof-ja":    "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=face",
  "prof-ko":    "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop&crop=face",
  "prof-zh":    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
  "prof-zh-tw": "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=face",
  "prof-ar":    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
  "prof-ru":    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face",
  "prof-hi":    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
  "prof-nl":    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
  "prof-pl":    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
  "prof-sv":    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
  "prof-da":    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
  "prof-fi":    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face",
  "prof-nb":    "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400&h=400&fit=crop&crop=face",
  "prof-tr":    "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop&crop=face",
  "prof-id":    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
  "prof-ms":    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
  "prof-th":    "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=face",
  "prof-vi":    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
  "prof-he":    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  "default":    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
};

export interface PhotoAvatarTeacherHandle {
  speak: (text: string) => void;
  stop: () => void;
}

interface Props {
  teacherId: string;
  teacherName: string;
  voiceLang: string;
  photoUrl?: string;
  size?: number;
  showName?: boolean;
  accentColor?: string;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
  autoGreet?: boolean;
  greeting?: string;
}

const PhotoAvatarTeacher = forwardRef<PhotoAvatarTeacherHandle, Props>(
  (
    {
      teacherId,
      teacherName,
      voiceLang,
      photoUrl,
      size = 200,
      showName = true,
      accentColor = "#6366f1",
      onSpeakStart,
      onSpeakEnd,
      autoGreet = false,
      greeting,
    },
    ref
  ) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [didVideoUrl, setDidVideoUrl] = useState<string | null>(null);
    const [useDIDVideo, setUseDIDVideo] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const photo = photoUrl || TEACHER_PHOTOS[teacherId] || TEACHER_PHOTOS["default"];

    // tRPC mutations
    const ttsMutation = trpc.tts.speak.useMutation();
    const didMutation = trpc.livePortrait.generateTeacherVideo.useMutation();

    const stopSpeaking = useCallback(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setIsSpeaking(false);
      setUseDIDVideo(false);
      onSpeakEnd?.();
    }, [onSpeakEnd]);

    const speak = useCallback(
      async (text: string) => {
        if (!text.trim()) return;
        stopSpeaking();
        setIsLoading(true);

        try {
          // 1. Gerar áudio Edge TTS (voz neural Microsoft)
          const ttsResult = await ttsMutation.mutateAsync({
            text,
            voiceLang,
          });

          if (!ttsResult.success || !ttsResult.audioBase64) {
            throw new Error(ttsResult.error ?? "TTS falhou");
          }

          // 2. Converter base64 → Blob → URL
          const binary = atob(ttsResult.audioBase64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const blob = new Blob([bytes], { type: "audio/mp3" });
          const audioUrl = URL.createObjectURL(blob);

          // 3. Tocar áudio
          const audio = new Audio(audioUrl);
          audioRef.current = audio;

          audio.onplay = () => {
            setIsSpeaking(true);
            setIsLoading(false);
            onSpeakStart?.();
          };
          audio.onended = () => {
            setIsSpeaking(false);
            setUseDIDVideo(false);
            onSpeakEnd?.();
            URL.revokeObjectURL(audioUrl);
          };
          audio.onerror = () => {
            setIsSpeaking(false);
            setIsLoading(false);
            setUseDIDVideo(false);
          };

          await audio.play();

          // 4. Tentar gerar vídeo D-ID em paralelo (lip-sync fotorrealista)
          // Só se D-ID disponível e texto não muito longo
          // D-ID lip-sync fotorrealista (opcional, usa créditos D-ID)
          if (text.length < 300) {
            try {
              const didResult = await didMutation.mutateAsync({
                imageUrl: photo,
                text,
                languageCode: voiceLang,
              });
              if (didResult?.videoUrl) {
                setDidVideoUrl(didResult.videoUrl);
                setUseDIDVideo(true);
                if (videoRef.current) {
                  videoRef.current.src = didResult.videoUrl;
                  videoRef.current.play().catch(() => {});
                }
              }
            } catch {
              // D-ID falhou — continua com foto + animação CSS (sem custo)
            }
          }
        } catch (err) {
          console.error("PhotoAvatarTeacher speak error:", err);
          setIsLoading(false);
          setIsSpeaking(false);
        }
      },
      [voiceLang, photo, ttsMutation, didMutation, stopSpeaking, onSpeakStart, onSpeakEnd]
    );

    useImperativeHandle(ref, () => ({ speak, stop: stopSpeaking }), [speak, stopSpeaking]);

    // Auto-saudação
    useEffect(() => {
      if (autoGreet && greeting) {
        const timer = setTimeout(() => speak(greeting), 800);
        return () => clearTimeout(timer);
      }
    }, [autoGreet, greeting]); // eslint-disable-line react-hooks/exhaustive-deps

    const ringColor = isSpeaking ? accentColor : "transparent";
    const ringWidth = isSpeaking ? 3 : 0;

    return (
      <div className="flex flex-col items-center gap-2 select-none">
        {/* Container do avatar */}
        <div
          className="relative rounded-full overflow-hidden cursor-pointer"
          style={{
            width: size,
            height: size,
            boxShadow: isSpeaking
              ? `0 0 0 ${ringWidth}px ${ringColor}, 0 0 20px ${accentColor}55`
              : `0 4px 20px rgba(0,0,0,0.3)`,
            transition: "box-shadow 0.3s ease",
          }}
          onClick={() => !isSpeaking && greeting && speak(greeting)}
          title={isSpeaking ? "Falando..." : `Clique para ouvir ${teacherName}`}
        >
          {/* Vídeo D-ID (lip-sync real) */}
          {useDIDVideo && didVideoUrl ? (
            <video
              ref={videoRef}
              src={didVideoUrl}
              autoPlay
              playsInline
              muted={false}
              loop={false}
              className="w-full h-full object-cover"
              style={{ borderRadius: "50%" }}
            />
          ) : (
            <>
              {/* Foto estática com animação CSS durante fala */}
              <img
                src={photo}
                alt={teacherName}
                className="w-full h-full object-cover"
                style={{
                  borderRadius: "50%",
                  animation: isSpeaking ? "avatarTalk 0.15s ease-in-out infinite alternate" : "none",
                  filter: isSpeaking
                    ? "brightness(1.08) saturate(1.15)"
                    : "brightness(1.0) saturate(1.0)",
                  transition: "filter 0.3s ease",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = TEACHER_PHOTOS["default"];
                }}
              />

              {/* Overlay de boca animada durante fala */}
              {isSpeaking && (
                <div
                  className="absolute bottom-0 left-0 right-0 flex justify-center pb-3"
                  style={{ pointerEvents: "none" }}
                >
                  <div
                    style={{
                      width: size * 0.22,
                      height: size * 0.1,
                      background: "rgba(0,0,0,0.6)",
                      borderRadius: "0 0 50% 50%",
                      animation: "mouthOpen 0.12s ease-in-out infinite alternate",
                    }}
                  />
                </div>
              )}
            </>
          )}

          {/* Indicador de carregando */}
          {isLoading && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.4)", borderRadius: "50%" }}
            >
              <div
                className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"
                style={{ animation: "spin 0.8s linear infinite" }}
              />
            </div>
          )}

          {/* Ondas de áudio animadas */}
          {isSpeaking && (
            <div className="absolute inset-0 rounded-full pointer-events-none">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: `2px solid ${accentColor}`,
                    animation: `ripple 1.5s ease-out ${i * 0.4}s infinite`,
                    opacity: 0,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Nome do professor */}
        {showName && (
          <div className="text-center">
            <p
              className="font-semibold text-sm"
              style={{ color: accentColor }}
            >
              {teacherName}
            </p>
            {isSpeaking && (
              <div className="flex items-center justify-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="rounded-full"
                    style={{
                      width: 3,
                      height: 3 + Math.random() * 12,
                      background: accentColor,
                      animation: `soundBar 0.6s ease-in-out ${i * 0.1}s infinite alternate`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* CSS Animations */}
        <style>{`
          @keyframes avatarTalk {
            from { transform: scale(1.0) translateY(0px); }
            to   { transform: scale(1.01) translateY(-1px); }
          }
          @keyframes mouthOpen {
            from { height: 4px; }
            to   { height: 14px; }
          }
          @keyframes ripple {
            0%   { transform: scale(1);   opacity: 0.6; }
            100% { transform: scale(1.6); opacity: 0; }
          }
          @keyframes soundBar {
            from { transform: scaleY(0.4); }
            to   { transform: scaleY(1.6); }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
);

PhotoAvatarTeacher.displayName = "PhotoAvatarTeacher";
export default PhotoAvatarTeacher;
