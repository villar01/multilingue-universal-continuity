import { Volume2, Play, Video, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect, useState, useRef, useCallback } from "react";

interface MuseTalkTeacherProps {
  teacherId?: number;
  imageUrl?: string;
  teacherName?: string;
  gender?: string;
  size?: "sm" | "md" | "lg";
  isTeaching?: boolean;
  currentText?: string;
  audioUrl?: string | null;
  languageCode?: string;
  hideNameLabel?: boolean;
}

export default function MuseTalkTeacher({
  imageUrl,
  teacherName = "Professor",
  gender = "male",
  size = "lg",
  isTeaching = false,
  currentText = "",
  audioUrl,
  hideNameLabel = false,
}: MuseTalkTeacherProps) {
  // Check if MuseTalk is available
  const { data: museStatus } = trpc.musetalk.status.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // MuseTalk video generation mutation
  const generateVideoMutation = trpc.musetalk.generateLipSync.useMutation();

  // State
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pendingAudioUrl, setPendingAudioUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTextRef = useRef<string>("");
  const lastAudioUrlRef = useRef<string | null>(null);

  // Fallback avatar
  const fallbackImageUrl =
    imageUrl ||
    (gender === "female"
      ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face"
      : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face");

  // Play audio
  const playAudio = useCallback(async (url: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      const audio = new Audio(url);
      audio.crossOrigin = "anonymous";
      audio.volume = 1.0;
      audioRef.current = audio;

      await audio.play();
      setIsSpeaking(true);
      setPendingAudioUrl(null);
    } catch {
      setPendingAudioUrl(url);
    }
  }, []);

  // Generate MuseTalk video
  const generateMuseTalkVideo = useCallback(async (text: string, imgUrl: string, audioUrl: string) => {
    if (!text || !imgUrl || !audioUrl) return;
    if (lastTextRef.current === text && lastAudioUrlRef.current === audioUrl) return;

    lastTextRef.current = text;
    lastAudioUrlRef.current = audioUrl;
    setIsGenerating(true);
    setShowVideo(false);

    try {
      const result = await generateVideoMutation.mutateAsync({
        sourceVideoUrl: imgUrl,
        audioUrl: audioUrl,
      });
      setVideoUrl(result.videoUrl);
      setShowVideo(true);
    } catch (err) {
      console.warn("MuseTalk video generation failed:", err);
      setShowVideo(false);
    } finally {
      setIsGenerating(false);
    }
  }, [generateVideoMutation]);

  // Main effect
  useEffect(() => {
    if (!isTeaching) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      setShowVideo(false);
      setIsSpeaking(false);
      setPendingAudioUrl(null);
      return;
    }

    // Generate MuseTalk video if available
    if (
      museStatus?.available &&
      currentText &&
      audioUrl &&
      fallbackImageUrl &&
      !showVideo &&
      !isGenerating
    ) {
      generateMuseTalkVideo(currentText, fallbackImageUrl, audioUrl);
    }

    // Play audio if new URL
    if (audioUrl && audioUrl !== lastAudioUrlRef.current) {
      lastAudioUrlRef.current = audioUrl;
      playAudio(audioUrl);
    }
  }, [audioUrl, isTeaching, currentText, museStatus?.available, showVideo, isGenerating, generateMuseTalkVideo, playAudio, fallbackImageUrl]);

  const sizePx = size === "sm" ? 160 : size === "md" ? 220 : 280;

  return (
    <div className="relative flex flex-col items-center gap-3" style={{ width: sizePx + 40 }}>
      <div
        className="relative"
        style={{
          width: sizePx,
          height: sizePx,
        }}
      >
        <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl border-4 border-white">
          {/* MuseTalk Video */}
          {showVideo && videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay
              playsInline
              className="w-full h-full object-cover object-top"
              onEnded={() => {
                setShowVideo(false);
                setIsSpeaking(false);
              }}
              onPlay={() => setIsSpeaking(true)}
            />
          ) : (
            <img
              src={fallbackImageUrl}
              alt={teacherName}
              className="w-full h-full object-cover object-top"
              style={{
                filter: isSpeaking ? "brightness(1.07) contrast(1.04)" : "brightness(1)",
                transition: "filter 0.3s ease",
              }}
            />
          )}

          {/* Status indicators */}
          {isGenerating && (
            <div className="absolute top-3 right-3 bg-purple-600 rounded-full p-1.5 shadow-lg">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
          )}
          {showVideo && (
            <div className="absolute top-3 right-3 bg-purple-600 rounded-full p-1.5 shadow-lg">
              <Video className="w-4 h-4 text-white" />
            </div>
          )}
          {isSpeaking && !isGenerating && !showVideo && (
            <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1.5 shadow-lg">
              <Volume2 className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Pulse ring */}
        {isSpeaking && (
          <div
            className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping"
            style={{ opacity: 0.35 }}
          />
        )}
      </div>

      {/* Manual play button */}
      {pendingAudioUrl && (
        <button
          onClick={() => playAudio(pendingAudioUrl)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold shadow-lg transition-all animate-bounce"
        >
          <Play className="w-4 h-4" />
          Ouvir professor
        </button>
      )}

      <div className="text-center space-y-0.5">
        {!hideNameLabel && <h3 className="text-lg font-bold text-gray-900">{teacherName}</h3>}
        {isGenerating && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-purple-600 font-semibold mt-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Gerando vídeo IA...
          </div>
        )}
        {showVideo && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-purple-600 font-semibold mt-1">
            <Video className="w-3 h-3" />
            Vídeo IA Real
          </div>
        )}
        {isSpeaking && !isGenerating && !showVideo && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-green-600 font-semibold mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Falando...
          </div>
        )}
      </div>
    </div>
  );
}
