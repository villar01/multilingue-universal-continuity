import { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, Play, Video, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface EnhancedTeacherAvatarProps {
  teacherId?: number;
  imageUrl?: string;
  teacherName?: string;
  gender?: string;
  skinTone?: string;
  size?: "sm" | "md" | "lg";
  isTeaching?: boolean;
  currentText?: string;
  audioUrl?: string | null;
  syncOnly?: boolean;
  emotion?: "neutral" | "happy" | "thinking" | "surprised" | "encouraging" | "confused";
  languageCode?: string;
  hideNameLabel?: boolean;
}

// ─── Phoneme → mouth open (0–1) ───────────────────────────────────────────────
const PHONEME_MOUTH: Record<string, number> = {
  A: 0.95, E: 0.75, I: 0.50, O: 0.85, U: 0.68,
  B: 0.12, P: 0.12, M: 0.12, F: 0.30, V: 0.30,
  T: 0.38, D: 0.38, N: 0.33, L: 0.45, S: 0.26, Z: 0.26,
  R: 0.52, K: 0.55, G: 0.55, H: 0.50, W: 0.62, Y: 0.42,
  NEUTRAL: 0.04,
};

function buildTimeline(text: string): Array<{ ph: string; t: number }> {
  const tl: Array<{ ph: string; t: number }> = [];
  let ms = 0;
  const clean = text.toUpperCase().replace(/[^A-Z ]/g, "");
  for (const ch of clean) {
    tl.push({ ph: ch === " " ? "NEUTRAL" : ch, t: ms });
    ms += "AEIOU".includes(ch) ? 120 : ch === " " ? 80 : 65;
  }
  tl.push({ ph: "NEUTRAL", t: ms + 250 });
  return tl;
}

// ─── Fallback avatars ─────────────────────────────────────────────────────────
const FALLBACK_AVATARS: Record<string, { imageUrl: string }> = {
  female: { imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face" },
  male:   { imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face" },
};

// ─── Photo positions ──────────────────────────────────────────────────────────
interface PhotoPos { mouthX: number; mouthY: number; mouthScale: number; leftEyeX: number; leftEyeY: number; rightEyeX: number; rightEyeY: number; skinTone: string; }
const PHOTO_POSITIONS: Record<string, PhotoPos> = {
  "photo-1494790108377-be9c29b29330": { mouthX: 50, mouthY: 74, mouthScale: 0.88, leftEyeX: 37, leftEyeY: 38, rightEyeX: 63, rightEyeY: 38, skinTone: "#e8c4a0" },
  "photo-1438761681033-6461ffad8d80": { mouthX: 50, mouthY: 75, mouthScale: 0.90, leftEyeX: 37, leftEyeY: 39, rightEyeX: 63, rightEyeY: 39, skinTone: "#e0b898" },
  "photo-1472099645785-5658abf4ff4e": { mouthX: 50, mouthY: 73, mouthScale: 0.95, leftEyeX: 36, leftEyeY: 38, rightEyeX: 64, rightEyeY: 38, skinTone: "#c8956a" },
  "teacher-asian-female": { mouthX: 50, mouthY: 68, mouthScale: 0.88, leftEyeX: 38, leftEyeY: 38, rightEyeX: 62, rightEyeY: 38, skinTone: "#e8c8a0" },
  "teacher-asian-male":   { mouthX: 50, mouthY: 67, mouthScale: 1.0,  leftEyeX: 37, leftEyeY: 40, rightEyeX: 63, rightEyeY: 40, skinTone: "#d4a878" },
};
const DEFAULT_POS: PhotoPos = { mouthX: 50, mouthY: 73, mouthScale: 0.92, leftEyeX: 37, leftEyeY: 38, rightEyeX: 63, rightEyeY: 38, skinTone: "#d4956a" };

function getPhotoPositions(photoUrl: string | null, gender: string, dbSkinTone: string | null): PhotoPos {
  if (photoUrl) {
    for (const key of Object.keys(PHOTO_POSITIONS)) {
      if (photoUrl.includes(key)) return PHOTO_POSITIONS[key];
    }
  }
  return { ...DEFAULT_POS, skinTone: dbSkinTone || (gender === "female" ? "#e8c4a0" : "#c8956a") };
}

export default function EnhancedTeacherAvatar({
  teacherId,
  imageUrl: propImageUrl,
  teacherName: propTeacherName,
  gender: propGender,
  skinTone: propSkinTone,
  size = "lg",
  isTeaching = false,
  currentText = "",
  audioUrl,
  syncOnly = false,
  emotion = "neutral",
  languageCode = "en-US",
  hideNameLabel = false,
}: EnhancedTeacherAvatarProps) {
  // Fetch teacher from DB only if no direct props
  const needsFetch = !!teacherId && !propImageUrl;
  const { data: teacherData } = trpc.teachers.getById.useQuery(
    { teacherId: teacherId! },
    { enabled: needsFetch, staleTime: 10 * 60 * 1000, retry: false }
  );

  // Check if D-ID is configured
  const { data: didStatus } = trpc.livePortrait.didStatus.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // D-ID video generation mutation
  const generateVideoMutation = trpc.livePortrait.generateTeacherVideo.useMutation();

  // ─── Animation state ──────────────────────────────────────────────────────
  const [mO, setMO] = useState(0.04);   // mouth open 0–1
  const [mW, setMW] = useState(0.5);    // mouth width factor
  const [lR, setLR] = useState(0);      // lip round
  const [isBlinking, setIsBlinking] = useState(false);
  const [headTilt, setHeadTilt] = useState(0);
  const [headBob, setHeadBob] = useState(0);
  const [breathScale, setBreathScale] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pendingAudioUrl, setPendingAudioUrl] = useState<string | null>(null);

  // D-ID video state
  const [didVideoUrl, setDidVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastPlayedUrlRef = useRef<string | null>(null);
  const lastDidTextRef = useRef<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speakLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Derive display data
  const gender = propGender || (teacherData?.gender as string) || "male";
  const photoUrl = propImageUrl || (teacherData as any)?.photoUrl || (teacherData as any)?.photo_url || null;
  const dbSkinTone = propSkinTone || (teacherData as any)?.skinTone || (teacherData as any)?.skin_tone || null;
  const positions = getPhotoPositions(photoUrl, gender, dbSkinTone);
  const imageUrl = photoUrl || (FALLBACK_AVATARS[gender] || FALLBACK_AVATARS.male).imageUrl;
  const teacherName = propTeacherName || teacherData?.name || "Professor";
  const specialty = (teacherData as any)?.title || "";
  const skinTone = positions.skinTone;

  // ─── Auto-blink ───────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
    }, 3200 + Math.random() * 2000);
    return () => clearInterval(id);
  }, []);

  // ─── Breathing ────────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setBreathScale(1 + Math.sin(Date.now() / 2800) * 0.007);
    }, 50);
    return () => clearInterval(id);
  }, []);

  // ─── Head movement ────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      if (isTeaching || isSpeaking) {
        setHeadTilt(Math.sin(t / 1800) * 3.5 + Math.sin(t / 900) * 1.2);
        setHeadBob(Math.sin(t / 350) * 2.5 + Math.sin(t / 700) * 1.0);
      } else {
        setHeadTilt(Math.sin(t / 5000) * 1.2);
        setHeadBob(Math.sin(t / 3500) * 0.5);
      }
    }, 40);
    return () => clearInterval(id);
  }, [isTeaching, isSpeaking]);

  // ─── Clear timeouts ───────────────────────────────────────────────────────
  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  // ─── Phoneme lip-sync from text ───────────────────────────────────────────
  const runPhonemeLipSync = useCallback((text: string) => {
    if (!text || text.trim().length === 0) return;
    clearTimeouts();
    if (speakLoopRef.current) { clearInterval(speakLoopRef.current); speakLoopRef.current = null; }
    const timeline = buildTimeline(text);
    setIsSpeaking(true);
    timeline.forEach(({ ph, t }) => {
      const tid = setTimeout(() => {
        const o = PHONEME_MOUTH[ph] ?? 0.04;
        setMO(o);
        setMW(0.38 + o * 0.48);
        setLR("OU".includes(ph) ? 0.65 : 0);
      }, t);
      timeoutsRef.current.push(tid);
    });
    const last = timeline[timeline.length - 1];
    const endTid = setTimeout(() => {
      // After phoneme timeline ends, keep a subtle speaking loop if still teaching
      if (isTeaching) {
        speakLoopRef.current = setInterval(() => {
          const o = 0.15 + Math.sin(Date.now() / 180) * 0.12 + Math.random() * 0.08;
          setMO(Math.max(0.04, Math.min(0.45, o)));
          setMW(0.42 + o * 0.3);
          setLR(0);
        }, 60);
      } else {
        setMO(0.04); setMW(0.5); setLR(0);
        setIsSpeaking(false);
      }
    }, last.t + 200);
    timeoutsRef.current.push(endTid);
  }, [clearTimeouts, isTeaching]);

  // ─── Play audio with autoplay unlock ─────────────────────────────────────
  const playAudio = useCallback(async (url: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      const audio = new Audio(url);
      audio.crossOrigin = "anonymous";
      audio.muted = syncOnly;
      audio.volume = 1.0;
      audioRef.current = audio;
      audio.onplay = () => setIsSpeaking(true);
      audio.onpause = () => {
        setMO(0.04); setMW(0.5); setLR(0);
        setIsSpeaking(false);
      };

      // Try AudioContext for real-time amplitude lip-sync
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === "suspended") await ctx.resume();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.6;
          const src = ctx.createMediaElementSource(audio);
          src.connect(analyser);
          analyser.connect(ctx.destination);
          const buf = new Uint8Array(analyser.frequencyBinCount);
          // Stop phoneme loop — use real amplitude
          clearTimeouts();
          if (speakLoopRef.current) { clearInterval(speakLoopRef.current); speakLoopRef.current = null; }
          let rafId: number;
          const loop = () => {
            analyser.getByteFrequencyData(buf);
            const lo = 3, hi = Math.min(28, buf.length - 1);
            let sum = 0;
            for (let i = lo; i <= hi; i++) sum += buf[i];
            const avg = sum / (hi - lo + 1);
            const open = Math.min(1, avg / 70);
            setMO(open > 0.06 ? open : 0.04);
            setMW(0.38 + open * 0.52);
            setLR(open > 0.5 ? (open - 0.5) * 0.6 : 0);
            rafId = requestAnimationFrame(loop);
          };
          rafId = requestAnimationFrame(loop);
          audio.onended = () => {
            cancelAnimationFrame(rafId);
            ctx.close().catch(() => {});
            setMO(0.04); setMW(0.5); setLR(0);
            setIsSpeaking(false);
          };
        }
      } catch {
        // AudioContext failed — phoneme fallback already running
      }

      await audio.play();
      setIsSpeaking(true);
      setPendingAudioUrl(null);
    } catch {
      // Autoplay blocked — show manual play button
      setPendingAudioUrl(url);
    }
  }, [clearTimeouts]);

  // ─── Manual play button handler ───────────────────────────────────────────
  const handleManualPlay = useCallback(async () => {
    if (pendingAudioUrl) {
      await playAudio(pendingAudioUrl);
    }
  }, [pendingAudioUrl, playAudio]);

  // ─── Generate D-ID video ──────────────────────────────────────────────────
  const generateDIDVideo = useCallback(async (text: string, imgUrl: string) => {
    if (!text || text.trim().length === 0 || !imgUrl) return;
    if (lastDidTextRef.current === text) return;
    lastDidTextRef.current = text;
    setIsGeneratingVideo(true);
    setShowVideo(false);
    try {
      const result = await generateVideoMutation.mutateAsync({
        imageUrl: imgUrl,
        text: text.slice(0, 500),
        languageCode: languageCode || "en-US",
      });
      setDidVideoUrl(result.videoUrl);
      setShowVideo(true);
    } catch (err) {
      console.warn("D-ID video generation failed, using CSS lip-sync:", err);
      setShowVideo(false);
    } finally {
      setIsGeneratingVideo(false);
    }
  }, [generateVideoMutation, languageCode]);

  // ─── Main effect: isTeaching + text + audioUrl ────────────────────────────
  useEffect(() => {
    if (!isTeaching) {
      clearTimeouts();
      if (speakLoopRef.current) { clearInterval(speakLoopRef.current); speakLoopRef.current = null; }
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; audioRef.current = null; }
      setMO(0.04); setMW(0.5); setLR(0);
      setIsSpeaking(false);
      setPendingAudioUrl(null);
      setShowVideo(false);
      return;
    }
    // Start text timing as a resilient fallback. When the MP3 analyser is
    // available it clears this schedule and becomes the source of truth.
    if (currentText && currentText.trim().length > 0) {
      runPhonemeLipSync(currentText);
      // If D-ID is configured, generate real video
      if (didStatus?.configured && imageUrl && !showVideo && !isGeneratingVideo) {
        generateDIDVideo(currentText, imageUrl);
      }
    } else {
      // No text yet — start a subtle idle speaking loop
      setIsSpeaking(true);
      if (speakLoopRef.current) clearInterval(speakLoopRef.current);
      speakLoopRef.current = setInterval(() => {
        const o = 0.12 + Math.sin(Date.now() / 200) * 0.10 + Math.random() * 0.06;
        setMO(Math.max(0.04, Math.min(0.40, o)));
        setMW(0.42 + o * 0.28);
        setLR(0);
      }, 60);
    }

    // Play audio if new URL arrived
    if (audioUrl && audioUrl !== lastPlayedUrlRef.current) {
      lastPlayedUrlRef.current = audioUrl;
      playAudio(audioUrl);
    }

    return () => {
      clearTimeouts();
      if (speakLoopRef.current) { clearInterval(speakLoopRef.current); speakLoopRef.current = null; }
    };
  }, [audioUrl, isTeaching, currentText]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Render calculations ──────────────────────────────────────────────────
  const mw2 = 64 * positions.mouthScale + mW * 28 * positions.mouthScale;
  const mh2 = 10 * positions.mouthScale + mO * 60 * positions.mouthScale;
  const br = lR > 0.4 ? "50%" : `${4 + lR * 8}px ${4 + lR * 8}px ${mh2 * 0.5}px ${mh2 * 0.5}px`;
  const ic = mO > 0.10 ? "#1a0505" : skinTone;
  const activelySpeaking = isSpeaking;
  const sizePx = size === "sm" ? 160 : size === "md" ? 220 : 280;

  return (
    <div className="relative flex flex-col items-center gap-3" style={{ width: sizePx + 40 }}>
      <div
        className="relative"
        style={{
          width: sizePx, height: sizePx,
          transform: `rotate(${headTilt}deg) scale(${breathScale}) translateY(${headBob}px)`,
          transition: "transform 60ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl border-4 border-white">
          {/* ── D-ID Real Video (when available) ── */}
          {showVideo && didVideoUrl ? (
            <video
              ref={videoRef}
              src={didVideoUrl}
              autoPlay
              playsInline
              className="w-full h-full object-cover object-top"
              onEnded={() => {
                setShowVideo(false);
                setIsSpeaking(false);
                setMO(0.04);
              }}
              onPlay={() => setIsSpeaking(true)}
            />
          ) : (
            <img
              src={imageUrl}
              alt={teacherName}
              className="w-full h-full object-cover object-top"
              style={{
                filter: activelySpeaking ? "brightness(1.07) contrast(1.04)" : "brightness(1)",
                transition: "filter 0.3s ease",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = (FALLBACK_AVATARS[gender] || FALLBACK_AVATARS.male).imageUrl;
              }}
            />
          )}

          {/* ── Speaking glow — clean visual indicator, no overlay on face ── */}
          {activelySpeaking && !showVideo && (
            <div
              className="absolute inset-0 pointer-events-none rounded-full"
              style={{
                boxShadow: `inset 0 0 ${8 + mO * 18}px rgba(59,130,246,${0.12 + mO * 0.18})`,
                transition: "box-shadow 60ms linear",
              }}
            />
          )}

          {/* Blink overlay — only when not showing video */}
          {isBlinking && !showVideo && (
            <>
              <div className="absolute rounded-full" style={{
                left: `${positions.leftEyeX - 9}%`, top: `${positions.leftEyeY - 2}%`,
                width: "18%", height: "7%", background: skinTone,
              }} />
              <div className="absolute rounded-full" style={{
                left: `${positions.rightEyeX - 9}%`, top: `${positions.rightEyeY - 2}%`,
                width: "18%", height: "7%", background: skinTone,
              }} />
            </>
          )}

          {/* Status indicators */}
          {isGeneratingVideo && (
            <div className="absolute top-3 right-3 bg-purple-600 rounded-full p-1.5 shadow-lg">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
          )}
          {showVideo && (
            <div className="absolute top-3 right-3 bg-purple-600 rounded-full p-1.5 shadow-lg">
              <Video className="w-4 h-4 text-white" />
            </div>
          )}
          {activelySpeaking && !isGeneratingVideo && !showVideo && (
            <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1.5 shadow-lg">
              <Volume2 className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Pulse ring */}
        {activelySpeaking && (
          <div
            className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping"
            style={{ opacity: 0.35 }}
          />
        )}
      </div>

      {/* Manual play button when autoplay blocked */}
      {pendingAudioUrl && (
        <button
          onClick={handleManualPlay}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold shadow-lg transition-all animate-bounce"
        >
          <Play className="w-4 h-4" />
          Ouvir professor
        </button>
      )}

      <div className="text-center space-y-0.5">
        {!hideNameLabel && <h3 className="text-lg font-bold text-gray-900">{teacherName}</h3>}
        {specialty && <p className="text-sm text-gray-600">{specialty}</p>}
        {isGeneratingVideo && (
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
        {activelySpeaking && !isGeneratingVideo && !showVideo && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-green-600 font-semibold mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Falando...
          </div>
        )}
      </div>

      {emotion !== "neutral" && (
        <div className="absolute -top-1 -right-1 text-xl">
          {emotion === "happy" && "😊"}
          {emotion === "thinking" && "🤔"}
          {emotion === "surprised" && "😮"}
          {emotion === "encouraging" && "👏"}
          {emotion === "confused" && "🤨"}
        </div>
      )}
    </div>
  );
}
