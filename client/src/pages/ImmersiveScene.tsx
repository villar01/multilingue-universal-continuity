import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { audioBase64ToObjectUrl } from "@/lib/audioSource";
import { trackAggregateLearningEvent } from "@/lib/aggregateAnalytics";
import VoiceSelector from "../components/VoiceSelector";
import { useLocation } from "wouter";
import { FlyingSOSBook } from "@/components/FlyingSOSBook";
import Notebook, { NotebookButton } from "../components/Notebook";
import { addToNotebook, loadNotebook } from "@/lib/notebookStorage";
import ParetoPanel from "../components/ParetoPanel";
import { ParetoPracticeCycle } from "../components/ParetoPracticeCycle";
import { resolvePracticeCEFRLevel } from "@/lib/lesson-levels";
import type { ParetoWord } from "../lib/vocab-pareto";
import { getLessonStrings, getSelectedTeacherLang } from "../lib/lesson-i18n";
import { stopEdgeTTS } from "@/lib/edgeTTSClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { VoiceQualityBanner } from "@/components/VoiceQualityBanner";
import { getImmersiveHotspotSpeech } from "@/lib/immersiveHotspotSpeech";
import { createImmersiveHotspotInteraction } from "@/lib/immersiveHotspotInteraction";
import { getImmersiveDialogTeacherSpeech } from "@/lib/immersiveDialogSpeech";
import { getNativeDialogueTranslation, isPortugueseLocale } from "@/lib/immersiveDialogTranslation";
import { getNativeHelpSpeechRequest } from "@/lib/immersiveSpeechChannels";
import { type ImmersiveSpeechPurpose } from "@/lib/immersiveSpeechPolicy";
import { formatSceneTutorFeedback, getFreeDialogQuestionReply, shouldStartSceneTeacherAudio } from "@/lib/immersiveDialogFlow";
import { useVisemeSequence } from "@/hooks/useVisemeSequence";
import { useTTSVisemeSync, type VisemeData } from "@/lib/tts-viseme-sync";
import { ImmersionModeToggle } from "@/components/ImmersionModeToggle";
import { createAudioRecorder, microphoneErrorMessage, requestMicrophoneStream } from "@/lib/microphoneAccess";
import { findReferencedHotspotId, matchesImmersiveDialogAnswer } from "@/lib/immersiveDialogAnswer";
import { getSceneTutorReply } from "@/lib/immersiveSceneTutor";
import { getTargetLanguageTeachers } from "@/lib/sceneTeacherResolver";
import { resolveCanonicalTeacherResource } from "@/lib/teacherResourceResolver";
import { IMMERSIVE_SCENES, IMMERSIVE_VOICE_REFERENCE } from "@/lib/immersiveScenesCatalog";
import { selectTeacherMedia, selectTeacherPoseAudioCue } from "@shared/teacherMediaStrategy";
import type { DialogLine, Hotspot, Scene } from "@shared/immersiveSceneTypes";
export type { DialogLine, Hotspot, Scene } from "@shared/immersiveSceneTypes";
import { isInitialCommercialTargetLanguage } from "@shared/commercialLanguageBlocks";
import { JAMES_TROPICAL_PILOT_CLIPS, type JamesTropicalPilotClip, type JamesTropicalPilotClipId } from "@shared/jamesTropicalPilotClips";
import { SOPHIE_CAFE_PILOT_CLIPS, type SophieCafePilotClip, type SophieCafePilotClipId } from "@shared/sophieCafePilotClips";
import { Apple, BookOpen, Car, Cloud, Coffee, Dog, Home, Landmark, Mic, Plane, Shell, Shirt, Sparkles, Square, Star, Sun, TreePalm, Umbrella, Utensils, Waves, type LucideIcon } from "lucide-react";

type ScenePilotClip = JamesTropicalPilotClip | SophieCafePilotClip;

const JAMES_TROPICAL_INTRO_LINE = "Hello! My name is James. Welcome to this beautiful tropical beach!";
const JAMES_TROPICAL_INTRO_FALLBACK_URL = "/manus-storage/james-tropical-introduction-exact-fallback_2d892849.wav";
const JAMES_CANONICAL_PORTRAIT_URL = "/manus-storage/prof_james_b9f2fff7.png";

// Estas reservas curtas pronunciam apenas o vocabulário do cartão. Como não
// são a trilha sonora do clipe roteirizado completo, o retrato permanece
// estável durante sua reprodução; nenhum vídeo recebe áudio de outra frase.
const JAMES_TROPICAL_OBJECT_FALLBACKS = {
  "Look at the palm tree. Palm tree.": {
    audioUrl: "/manus-storage/james-palm-tree-fallback_b2eab131.wav",
    spokenText: "Palm tree.",
  },
  "Look at the wave. Wave.": {
    audioUrl: "/manus-storage/james-wave-fallback_b0f10757.wav",
    spokenText: "Wave.",
  },
  "This is the ocean. Ocean.": {
    audioUrl: "/manus-storage/james-ocean-fallback_597e69cc.wav",
    spokenText: "Ocean.",
  },
  "This is sand. Sand.": {
    audioUrl: "/manus-storage/james-sand-fallback_fba216c0.wav",
    spokenText: "Sand.",
  },
} as const;

function waitForSpeechResult<T>(task: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error("scene-dialogue-speech-timeout")), timeoutMs);
    task.then(
      (result) => {
        clearTimeout(timeoutId);
        resolve(result);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

const HOTSPOT_ICON_COMPONENTS: Array<[string, LucideIcon]> = [
  ["sun", Sun], ["wave", Waves], ["ocean", Waves], ["sea", Waves], ["palm", TreePalm],
  ["tree", TreePalm], ["shell", Shell], ["sand", Umbrella], ["umbrella", Umbrella],
  ["towel", Shirt],
  ["cloud", Cloud], ["coffee", Coffee], ["restaurant", Utensils], ["food", Utensils],
  ["airport", Plane], ["plane", Plane], ["car", Car], ["home", Home], ["house", Home],
  ["book", BookOpen], ["museum", Landmark], ["apple", Apple], ["dog", Dog], ["shirt", Shirt],
];

const DIALOG_SPEECH_RATES = [
  { value: 0.7, label: "Lento" },
  { value: 0.85, label: "Estudo" },
  { value: 1, label: "Normal" },
] as const;

const DIALOG_SPEECH_RATE_STORAGE_KEY = "multilingue_scene_speech_rate";

function isDialogSpeechRate(value: number): value is (typeof DIALOG_SPEECH_RATES)[number]["value"] {
  return DIALOG_SPEECH_RATES.some((rate) => rate.value === value);
}

function loadDialogSpeechRate(): number {
  if (typeof window === "undefined") return 0.85;
  try {
    const stored = Number(window.localStorage.getItem(DIALOG_SPEECH_RATE_STORAGE_KEY));
    return isDialogSpeechRate(stored) ? stored : 0.85;
  } catch {
    return 0.85;
  }
}

function HotspotVisual({ hotspot, size = 24 }: { hotspot: Hotspot; size?: number }) {
  const source = `${hotspot.id} ${hotspot.label}`.toLowerCase();
  const Icon = HOTSPOT_ICON_COMPONENTS.find(([key]) => source.includes(key))?.[1] || Sparkles;
  return <Icon size={size} strokeWidth={2.35} aria-hidden="true" />;
}

function audioBlobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error("Não foi possível ler o áudio gravado."));
    reader.onloadend = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(blob);
  });
}

function getSceneLocationDisclosure(scene: Scene): string {
  const declaredLocations: Record<string, string> = {
    paris: "This lesson is set in Paris, France.",
    tokyo: "This lesson is set in Tokyo, Japan.",
    newyork: "This lesson is set in New York City, United States.",
  };
  return declaredLocations[scene.id]
    || `This is a generic educational illustration called ${scene.nameEn}; it is not assigned to a real country or city.`;
}

function getSceneObjectGuidancePt(scene: Scene): string {
  return `A cena ${scene.name} está pronta para explorar os objetos.`;
}

type ImmersiveCEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

const IMMERSIVE_CEFR_LEVELS: Array<{ value: ImmersiveCEFRLevel; label: string }> = [
  { value: "A1", label: "A1 · Início" },
  { value: "A2", label: "A2 · Básico" },
  { value: "B1", label: "B1 · Independente" },
  { value: "B2", label: "B2 · Intermediário alto" },
  { value: "C1", label: "C1 · Avançado" },
  { value: "C2", label: "C2 · Domínio" },
];

const sceneCefrLevel = (scene: Scene): ImmersiveCEFRLevel => resolvePracticeCEFRLevel(scene.difficulty) as ImmersiveCEFRLevel;

// ─── Particle Component ───────────────────────────────────────────────────────
function Particles({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-50">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${30 + Math.random() * 40}%`,
            top: `${20 + Math.random() * 60}%`,
            width: `${6 + Math.random() * 10}px`,
            height: `${6 + Math.random() * 10}px`,
            borderRadius: "50%",
            background: `hsl(${Math.random() * 360}, 90%, 60%)`,
            animation: `particle-fly ${0.6 + Math.random() * 0.8}s ease-out forwards`,
            animationDelay: `${Math.random() * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
}

const IMMERSIVE_TEACHER_FACE_POSITIONS: Record<string, { mouthY: number; mouthWidth: number }> = {
  James: { mouthY: 53, mouthWidth: 0.88 },
  Sophie: { mouthY: 48, mouthWidth: 0.84 },
  Priya: { mouthY: 47, mouthWidth: 0.84 },
  Hans: { mouthY: 47, mouthWidth: 0.88 },
  Yuki: { mouthY: 52, mouthWidth: 0.78 },
  Carlos: { mouthY: 49, mouthWidth: 0.87 },
  Giulia: { mouthY: 49, mouthWidth: 0.82 },
  Omar: { mouthY: 46, mouthWidth: 0.89 },
};

// ─── Teacher Component ─────────────────────────────────────────────────────────
function TeacherAvatar({
  scene,
  greeting,
  showGreeting,
  isSpeaking,
  isPreparingAudio,
  spokenText,
  audioViseme,
  overrideName,
  overrideImage,
  activeClip,
  onClipFinished,
  onExactClipPlaying,
  onExactClipEnded,
  onExactClipFailed,
  hasPreparedSpeech,
  onReplaySpeech,
}: {
  scene: Scene;
  greeting: string;
  showGreeting: boolean;
  isSpeaking?: boolean;
  isPreparingAudio?: boolean;
  spokenText?: string;
  audioViseme?: VisemeData | null;
  overrideName?: string;
  overrideImage?: string;
  activeClip?: ScenePilotClip | null;
  onClipFinished?: () => void;
  onExactClipPlaying?: () => void;
  onExactClipEnded?: () => void;
  onExactClipFailed?: () => void;
  hasPreparedSpeech?: boolean;
  onReplaySpeech?: () => void;
}) {
  const { viseme } = useVisemeSequence(spokenText || greeting, Boolean(isSpeaking));
  const facePosition = IMMERSIVE_TEACHER_FACE_POSITIONS[overrideName || scene.teacherName] || { mouthY: 52, mouthWidth: 0.84 };
  const fallbackMouthOpen = ["A", "C", "D", "F"].includes(viseme);
  const synchronizedMouthStyle = audioViseme
    ? {
        width: `${Math.min(18, Math.max(11, audioViseme.mouthWidth * 0.3)) * facePosition.mouthWidth}%`,
        height: `${Math.min(7, Math.max(1.8, audioViseme.mouthHeight * 0.24))}%`,
        borderRadius: `${Math.max(38, Math.min(50, 44 + audioViseme.lipRound * 0.55))}%`,
      }
    : {
        width: `${(fallbackMouthOpen ? 16 : 12) * facePosition.mouthWidth}%`,
        height: fallbackMouthOpen ? "5.5%" : "1.8%",
        borderRadius: viseme === "F" ? "45%" : "50%",
      };
  const jawOffset = audioViseme ? Math.min(4, audioViseme.jawDrop * 0.16) : 0;
  const mouthOpen = audioViseme
    ? audioViseme.mouthHeight >= 14
    : ["A", "C", "D", "F"].includes(viseme);
  const tongueVisible = Boolean(audioViseme?.tongueVisible);
  const teethVisible = audioViseme
    ? !tongueVisible && audioViseme.mouthHeight >= 7 && audioViseme.mouthHeight < 22
    : ["C", "E", "G"].includes(viseme);
  // O retrato permanece sem boca sintética até haver mídia docente aprovada.
  const showSyntheticMouth = false;
  const activeClipHasExactAudioVideoPair = Boolean(activeClip?.audioVideoExactPair);
  const teacherMedia = selectTeacherMedia({
    kind: activeClip?.videoUrl ? "scripted" : "interactive",
    hasApprovedPreGeneratedVideo: Boolean(activeClip?.videoUrl),
    hasExactAudioVideoPair: activeClipHasExactAudioVideoPair,
    hasAudioTimedMotionVideo: Boolean(activeClip?.videoUrl && isSpeaking && !activeClipHasExactAudioVideoPair),
  });
  const teacherPoseCue = activeClip ? selectTeacherPoseAudioCue(activeClip.trigger) : null;
  const showPilotClip = Boolean(
    teacherMedia.mode === "pre_generated_video"
      && activeClip?.videoUrl
      && activeClip.sceneId === scene.id
      && activeClip.teacherName === (overrideName || scene.teacherName),
  );
  const visibleGreeting = isSpeaking && spokenText?.trim() ? spokenText.trim() : greeting;
  const showTeacherBubble = showGreeting || Boolean(isSpeaking && spokenText?.trim());
  return (
    <div
      className="immersive-teacher absolute bottom-0 right-4 flex flex-col items-center z-30"
      style={{ width: "clamp(120px, 18vw, 220px)" }}
    >
      {/* Speech bubble */}
      {showTeacherBubble && (
        <div
          className="relative mb-2 rounded-2xl px-3 py-2 text-sm font-medium shadow-2xl max-w-xs"
          style={{
            background: "rgba(255,255,255,0.97)",
            color: "#1e293b",
            border: "2px solid rgba(99,102,241,0.3)",
            maxWidth: "clamp(160px, 28vw, 300px)",
            fontSize: "clamp(11px, 1.2vw, 14px)",
          }}
        >
          <div className="font-bold text-indigo-600 mb-1" style={{ fontSize: "clamp(10px, 1vw, 12px)" }}>
            {overrideName || scene.teacherName}
          </div>
          <div>{visibleGreeting}</div>
          {isPreparingAudio && (
            <div className="mt-1 text-[10px] font-semibold text-indigo-500" aria-live="polite">
              Preparando voz neural…
            </div>
          )}
          {hasPreparedSpeech && onReplaySpeech && !isPreparingAudio && (
            <button
              type="button"
              onClick={onReplaySpeech}
              className="mt-2 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-extrabold text-white shadow-sm transition hover:bg-indigo-500"
              aria-label={`Ouvir ${overrideName || scene.teacherName}`}
            >
              Ouvir {overrideName || scene.teacherName}
            </button>
          )}
          {/* Arrow */}
          <div
            className="absolute -bottom-2 right-6 w-4 h-4 rotate-45"
            style={{ background: "rgba(255,255,255,0.97)", borderRight: "2px solid rgba(99,102,241,0.3)", borderBottom: "2px solid rgba(99,102,241,0.3)" }}
          />
        </div>
      )}

      {/* Teacher image with quality animations */}
      <div
        style={{
          position: "relative",
          width: "100%",
          // A foto permanece estável até existir um motor facial guiado por áudio.
          // Não simulamos gestos ou tremores como se fossem fala natural.
          animation: "none",
          filter: isSpeaking
            ? "drop-shadow(0 8px 40px rgba(99,102,241,0.7)) brightness(1.08)"
            : "drop-shadow(0 8px 32px rgba(0,0,0,0.5))",
          transformOrigin: "bottom center",
          transition: "filter 0.3s ease",
        }}
      >
        <img
          src={overrideImage || scene.teacherImage}
          alt={overrideName || scene.teacherName}
          style={{
            width: "100%",
            height: "auto",
            objectFit: "contain",
            borderRadius: "12px",
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }}
        />
        {showPilotClip && activeClip?.videoUrl && (
          <video
            key={activeClip.id}
            src={activeClip.videoUrl}
            autoPlay
            muted={!activeClipHasExactAudioVideoPair}
            playsInline
            loop={!activeClipHasExactAudioVideoPair}
            preload="auto"
            aria-label={`Clipe pedagógico de ${activeClip.teacherName}: ${activeClip.dialogue}`}
            data-teacher-pose={teacherPoseCue?.pose.id}
            data-teacher-audio-intent={teacherPoseCue?.audioIntent}
            onPlaying={() => {
              if (activeClipHasExactAudioVideoPair) onExactClipPlaying?.();
            }}
            onEnded={() => {
              if (activeClipHasExactAudioVideoPair) onExactClipEnded?.();
              else onClipFinished?.();
            }}
            onError={() => {
              if (activeClipHasExactAudioVideoPair) onExactClipFailed?.();
              else onClipFinished?.();
            }}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "12px",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        )}
        {/* A boca fica neutra no retrato até existir mídia facial aprovada. */}
        {showSyntheticMouth && isSpeaking && (
          <div
            style={{
              position: "absolute",
              top: `${facePosition.mouthY}%`,
              left: "50%",
              transform: `translate(-50%, -50%) translateY(${jawOffset}px)`,
              ...synchronizedMouthStyle,
              background: "radial-gradient(ellipse at 50% 48%, rgba(48,10,14,0.9) 0%, rgba(88,27,33,0.86) 62%, rgba(175,75,82,0.34) 82%, transparent 100%)",
              border: "1px solid rgba(82,24,30,0.45)",
              boxShadow: "0 1px 2px rgba(45,8,12,0.35), inset 0 1px 1px rgba(255,209,209,0.18)",
              opacity: audioViseme ? Math.min(0.9, Math.max(0.48, audioViseme.mouthHeight / 24)) : 0.72,
              mixBlendMode: "normal",
              overflow: "hidden",
              transition: "width 55ms linear, height 55ms linear, border-radius 55ms linear, transform 55ms linear",
              pointerEvents: "none",
            }}
            aria-label={audioViseme ? "Viseme sincronizado ao áudio" : `Viseme ${viseme}`}
          >
            {teethVisible && (
              <span
                aria-hidden="true"
                style={{
                  position: "absolute", top: "8%", left: "18%", width: "64%", height: "25%",
                  borderRadius: "50%", background: "rgba(255,240,225,0.68)",
                }}
              />
            )}
            {tongueVisible && (
              <span
                aria-hidden="true"
                style={{
                  position: "absolute", bottom: "3%", left: "22%", width: "56%", height: "54%",
                  borderRadius: "55% 55% 42% 42%", background: "rgba(224,93,108,0.72)",
                }}
              />
            )}
            {mouthOpen && !tongueVisible && (
              <span
                aria-hidden="true"
                style={{
                  position: "absolute", bottom: "4%", left: "24%", width: "52%", height: "30%",
                  borderRadius: "50%", background: "rgba(162,49,64,0.48)",
                }}
              />
            )}
          </div>
        )}
        {/* Glow ring when speaking */}
        {isSpeaking && (
          <div
            style={{
              position: "absolute",
              inset: "-6px",
              borderRadius: "16px",
              border: "2px solid rgba(167,139,250,0.6)",
              animation: "teacher-ring 1.5s ease-out infinite",
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Vocabulary Card ────────────────────────────────────────────
function VocabCard({
  hotspot,
  langCode,
  nativeLang,
  nativeLangFlag,
  onClose,
  onSpeak,
  onPractice,
}: {
  hotspot: Hotspot;
  langCode: string;
  nativeLang: string;
  nativeLangFlag: string;
  onClose: () => void;
  onSpeak: (text: string, lang: string, mode: "object" | "example" | "translation") => void;
  onPractice: () => void;
}) {
  return (
    <div
      className="absolute z-50 rounded-2xl shadow-2xl overflow-hidden"
      style={{
        left: `clamp(8px, ${hotspot.x > 60 ? hotspot.x - 32 : hotspot.x + 2}%, calc(100% - 280px))`,
        top: `clamp(8px, ${hotspot.y > 60 ? hotspot.y - 45 : hotspot.y + 6}%, calc(100% - 260px))`,
        width: "clamp(220px, 28vw, 280px)",
        background: "rgba(15, 15, 30, 0.97)",
        border: `2px solid ${hotspot.color}`,
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: `${hotspot.color}22` }}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex" style={{ color: hotspot.color }}><HotspotVisual hotspot={hotspot} size={25} /></span>
          <div>
            {/* Show the word in the target language (what student is learning) */}
            <div className="text-white font-bold" style={{ fontSize: "clamp(14px, 1.8vw, 18px)" }}>
              {hotspot.label}
            </div>
            {/* Show native language translation below */}
            <div style={{ color: hotspot.color, fontSize: "clamp(10px, 1.2vw, 13px)" }}>
              {hotspot.translation}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white rounded-full w-7 h-7 flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        {/* Pronunciation */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Como falar</div>
            <div className="text-yellow-300 font-semibold" style={{ fontSize: "clamp(12px, 1.4vw, 15px)" }}>
              {hotspot.pronunciation}
            </div>
          </div>
          <button
            onClick={() => {
              onSpeak(hotspot.label, langCode, "object");
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-white text-xs font-semibold active:scale-95 transition-transform"
            style={{ background: hotspot.color }}
          >
            🔊 {hotspot.label}
          </button>
        </div>

         {/* Example */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="text-gray-400 text-xs uppercase tracking-wider">Exemplo</div>
            <button
              onClick={() => onSpeak(hotspot.example, langCode, "example")}
              aria-label={`Ouvir a frase em ${langCode}`}
              className="text-xs px-2 py-0.5 rounded-full font-semibold transition hover:brightness-125 active:scale-95"
              style={{ background: hotspot.color + '33', color: hotspot.color }}
            >🔊 Ouvir frase em {getSpokenLanguageLabel(langCode)}</button>
          </div>
          <div className="text-white" style={{ fontSize: "clamp(11px, 1.3vw, 14px)" }}>
            {hotspot.example}
          </div>
        </div>
        {/* Translation in native language */}
        <div
          className="rounded-xl p-2"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center justify-between mb-1">
            {/* Idioma nativo: fundo branco, letra azul */}
            <div
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#ffffff", color: "#1d4ed8", border: "1px solid #93c5fd", display: "inline-flex", alignItems: "center", gap: 3 }}
            >
              <span>{nativeLangFlag}</span>
              <span style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>{nativeLang.split("-")[0].toUpperCase()}</span>
            </div>
            <button
              onClick={() => onSpeak(hotspot.examplePt, nativeLang, "translation")}
              className="text-xs px-2 py-0.5 rounded-full font-semibold text-green-400"
              style={{ background: 'rgba(34,197,94,0.15)' }}
            >🔊 Ouvir tradução</button>
          </div>
          <div className="text-gray-200" style={{ fontSize: "clamp(11px, 1.3vw, 14px)" }}>
            {hotspot.examplePt}
          </div>
        </div>
        <button
          type="button"
          onClick={onPractice}
          className="w-full rounded-xl bg-amber-400 px-3 py-2 text-sm font-black text-slate-950 transition hover:bg-amber-300"
        >
          🧠 Praticar e criar frase
        </button>
      </div>
    </div>
  );
}

// ─── Language code → BCP-47 map (for TTS) ───────────────────────────────────
const LANG_TO_BCP47: Record<string, string> = {
  "pt-BR": "pt-BR", "pt-PT": "pt-PT", "en-US": "en-US", "en-GB": "en-GB",
  "es-ES": "es-ES", "es-MX": "es-MX", "fr-FR": "fr-FR", "de-DE": "de-DE",
  "it-IT": "it-IT", "ja-JP": "ja-JP", "zh-CN": "zh-CN", "ko-KR": "ko-KR",
  "ru-RU": "ru-RU", "ar-SA": "ar-SA", "hi-IN": "hi-IN", "nl-NL": "nl-NL",
  "pl-PL": "pl-PL", "tr-TR": "tr-TR", "sv-SE": "sv-SE", "da-DK": "da-DK",
  "fi-FI": "fi-FI", "nb-NO": "nb-NO", "cs-CZ": "cs-CZ", "hu-HU": "hu-HU",
  "ro-RO": "ro-RO", "uk-UA": "uk-UA", "el-GR": "el-GR", "he-IL": "he-IL",
  "id-ID": "id-ID", "ms-MY": "ms-MY", "th-TH": "th-TH", "vi-VN": "vi-VN",
};

// ─── Native language label map (shows flag + name in VocabCard) ──────────────
const LANG_LABELS: Record<string, { flag: string; name: string }> = {
  "pt-BR": { flag: "🇧🇷", name: "Português" },
  "pt-PT": { flag: "🇵🇹", name: "Português" },
  "en-US": { flag: "🇺🇸", name: "English" },
  "en-GB": { flag: "🇬🇧", name: "English" },
  "es-ES": { flag: "🇪🇸", name: "Español" },
  "es-MX": { flag: "🇲🇽", name: "Español" },
  "fr-FR": { flag: "🇫🇷", name: "Français" },
  "de-DE": { flag: "🇩🇪", name: "Deutsch" },
  "it-IT": { flag: "🇮🇹", name: "Italiano" },
  "ja-JP": { flag: "🇯🇵", name: "日本語" },
  "zh-CN": { flag: "🇨🇳", name: "中文" },
  "ko-KR": { flag: "🇰🇷", name: "한국어" },
  "ru-RU": { flag: "🇷🇺", name: "Русский" },
  "ar-SA": { flag: "🇸🇦", name: "العربية" },
  "hi-IN": { flag: "🇮🇳", name: "हिन्दी" },
  "nl-NL": { flag: "🇳🇱", name: "Nederlands" },
  "pl-PL": { flag: "🇵🇱", name: "Polski" },
  "tr-TR": { flag: "🇹🇷", name: "Türkçe" },
  "sv-SE": { flag: "🇸🇪", name: "Svenska" },
  "id-ID": { flag: "🇮🇩", name: "Bahasa Indonesia" },
};

function getSpokenLanguageLabel(languageCode: string) {
  return LANG_LABELS[languageCode]?.name || languageCode.split("-")[0]?.toUpperCase() || "idioma selecionado";
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ImmersiveScene() {
  const [, setLocation] = useLocation();
  // ── Single source of truth: LanguageContext ──
  const { profile, setProfile, immersionMode } = useLanguage();
  const { isAuthenticated, loading: isAuthLoading } = useAuth();
  const sceneReturnTo = useMemo(() => {
    if (typeof window === "undefined") return "/";
    const destination = new URLSearchParams(window.location.search).get("returnTo");
    return destination?.startsWith("/") && !destination.startsWith("//") ? destination : "/";
  }, []);

  // Auto-select scene based on user's target language from LanguageContext profile
  const getInitialScene = (): Scene | null => {
    try {
      const requestedSceneId = new URLSearchParams(window.location.search).get("scene")?.trim();
      if (requestedSceneId) {
        const requestedScene = IMMERSIVE_SCENES.find((scene) => scene.id === requestedSceneId);
        if (requestedScene) return requestedScene;
      }
      // Priority 1: LanguageContext profile (already loaded from localStorage)
      let targetCode = profile.targetCode || "";
      // Priority 2: ml_lang_profile in localStorage
      if (!targetCode) {
        const saved = localStorage.getItem("ml_lang_profile");
        if (saved) { const parsed = JSON.parse(saved); targetCode = parsed.targetCode || ""; }
      }
      // Priority 3: ml_target_lang legacy key
      if (!targetCode) targetCode = localStorage.getItem("ml_target_lang") || "";
      if (targetCode) {
        const base = targetCode.split("-")[0].toLowerCase();
        // Prioriza a etapa A1 da língua escolhida ao iniciar a primeira lição.
        const beginnerMatch = IMMERSIVE_SCENES.find(s => (s.langCode === base || s.teacherLang.startsWith(base)) && sceneCefrLevel(s) === "A1");
        if (beginnerMatch) return beginnerMatch;
        // Fallback to any scene matching the language
        const match = IMMERSIVE_SCENES.find(s => s.langCode === base || s.teacherLang.startsWith(base));
        if (match) return match;
      }
    } catch {}
    return null;
  };

  const [selectedScene, setSelectedScene] = useState<Scene | null>(() => getInitialScene());
  useEffect(() => {
    trackAggregateLearningEvent("open_immersive_scene");
  }, []);
  const sceneStudyReturnPath = useMemo(() => {
    if (typeof window === "undefined") return "/immersive-scene";
    const params = new URLSearchParams(window.location.search);
    if (selectedScene?.id) params.set("scene", selectedScene.id);
    const search = params.toString();
    return `${window.location.pathname}${search ? `?${search}` : ""}`;
  }, [selectedScene?.id]);
  const openSceneReinforcement = useCallback((destination: "/base-de-estudos" | "/pareto-1000" | "/lessons" | "/free-talk") => {
    const params = new URLSearchParams({ returnTo: sceneStudyReturnPath });
    if (destination === "/pareto-1000" && selectedScene?.id) {
      params.set("scene", selectedScene.id);
    }
    setLocation(`${destination}?${params.toString()}`);
  }, [sceneStudyReturnPath, selectedScene?.id, setLocation]);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [activeJamesClipId, setActiveJamesClipId] = useState<JamesTropicalPilotClipId | null>(null);
  const [activeSophieClipId, setActiveSophieClipId] = useState<SophieCafePilotClipId | null>(null);
  const pendingJamesClipIdRef = useRef<JamesTropicalPilotClipId | null>(null);
  const pendingSophieClipIdRef = useRef<SophieCafePilotClipId | null>(null);
  const activeJamesClip = activeJamesClipId
    ? JAMES_TROPICAL_PILOT_CLIPS.find((clip) => clip.id === activeJamesClipId) || null
    : null;
  const activeSophieClip = activeSophieClipId
    ? SOPHIE_CAFE_PILOT_CLIPS.find((clip) => clip.id === activeSophieClipId) || null
    : null;
  const playJamesTropicalClip = useCallback((clipId: JamesTropicalPilotClipId) => {
    if (selectedScene?.id !== "beach" || selectedScene.teacherName !== "James") return null;
    const clip = JAMES_TROPICAL_PILOT_CLIPS.find((candidate) => candidate.id === clipId && candidate.videoUrl);
    if (!clip || !clip.audioVideoExactPair) return null;
    pendingJamesClipIdRef.current = clip.id;
    return clip;
  }, [selectedScene?.id, selectedScene?.teacherName]);
  const playSophieCafeClip = useCallback((clipId: SophieCafePilotClipId) => {
    if (selectedScene?.id !== "cafe" || selectedScene.teacherName !== "Sophie") return null;
    const clip = SOPHIE_CAFE_PILOT_CLIPS.find((candidate) => candidate.id === clipId && candidate.videoUrl);
    if (!clip) return null;
    pendingSophieClipIdRef.current = clip.id;
    return clip;
  }, [selectedScene?.id, selectedScene?.teacherName]);
  const sceneInitialized = useRef(false); // Track if scene was auto-initialized from targetLang

  useEffect(() => {
    const requestedSceneId = new URLSearchParams(window.location.search).get("scene")?.trim();
    if (!requestedSceneId) return;
    const requestedScene = IMMERSIVE_SCENES.find((scene) => scene.id === requestedSceneId);
    if (requestedScene && requestedScene.id !== selectedScene?.id) {
      setSelectedScene(requestedScene);
      sceneInitialized.current = true;
    }
  }, [selectedScene?.id]);

  // ── Native + Target from LanguageContext (single source of truth) ──
  const nativeLang = profile.nativeCode || "pt-BR";
  const nativeLangInfo = LANG_LABELS[nativeLang] || { flag: "🌐", name: "Nativo" };
  // Always derive targetLang from profile (reactive to LanguageContext changes)
  const profileTarget = profile.targetCode || localStorage.getItem("ml_target_lang") || "en-US";
  const [targetLang, setTargetLang] = useState<string>(() => profileTarget);
  const [selectedSceneTeacherId, setSelectedSceneTeacherId] = useState<string | null>(null);
  const [authorizedSceneMaterial, setAuthorizedSceneMaterial] = useState<{
    lessonKey: string;
    sceneId: string;
    targetLanguage: string;
    nativeLanguage: string;
  } | null>(null);

  // Keep targetLang in sync when LanguageContext profile changes (e.g. user changed language on Home)
  useEffect(() => {
    if (profile.targetCode && profile.targetCode !== targetLang) {
      const newCode = profile.targetCode;
      setTargetLang(newCode);
      // Also auto-switch to matching scene if currently in scene picker
      if (!selectedScene) {
        const base = newCode.split("-")[0].toLowerCase();
        const match = IMMERSIVE_SCENES.find(s => s.langCode === base || s.teacherLang.toLowerCase().startsWith(base));
        if (match) setSelectedScene(match);
      }
    }
  }, [profile.targetCode]);
  const [showLangPicker, setShowLangPicker] = useState(false);

  // Auto-enter the first scene matching the user's target language — only on mount or targetLang change
  // Uses sceneInitialized ref to prevent overriding user navigation
  useEffect(() => {
    if (sceneInitialized.current) return; // Already initialized — don't override user navigation
    if (!targetLang) return;
    const base = targetLang.split("-")[0].toLowerCase();
    const match = IMMERSIVE_SCENES.find(s => s.langCode === base || s.teacherLang.toLowerCase().startsWith(base));
    if (match) {
      setSelectedScene(match);
      sceneInitialized.current = true;
    }
  }, [targetLang]);

  // Effective language for hotspots: use targetLang short code (e.g. 'es' not 'es-ES')
  // hotspot-translations.ts uses short codes as keys
  const effectiveLang = (_scene: { teacherLang: string }) => {
    const code = targetLang || "en-US";
    return code.split("-")[0].toLowerCase();
  };
  // Full BCP-47 code for Web Speech API (e.g. 'es-ES', 'en-US')
  const effectiveSpeakLang = (_scene: { teacherLang: string }) => targetLang || "en-US";
  const sceneTeacherResource = useMemo(
    () => selectedScene
      ? resolveCanonicalTeacherResource(selectedScene, targetLang, profile.nativeCode)
      : null,
    [profile.nativeCode, selectedScene, targetLang],
  );
  const sceneTeacherResolution = sceneTeacherResource?.resolution || { teacher: null, materialIsInTargetLanguage: false, preserveScenePortrait: true };
  const compatibleSceneTeachers = useMemo(
    () => sceneTeacherResolution.materialIsInTargetLanguage && !sceneTeacherResolution.lockedToLanguagePair ? getTargetLanguageTeachers(targetLang) : [],
    [sceneTeacherResolution.lockedToLanguagePair, sceneTeacherResolution.materialIsInTargetLanguage, targetLang],
  );
  const selectedSceneTeacher = compatibleSceneTeachers.find((teacher) => teacher.id === selectedSceneTeacherId) || null;
  const activeSceneTeacher = selectedSceneTeacher || sceneTeacherResolution.teacher;
  const teachingScene = useMemo<Scene | null>(() => {
    if (!activeSceneTeacher || !sceneTeacherResolution.materialIsInTargetLanguage) return selectedScene;
    if (!selectedScene) return null;
    return {
      ...selectedScene,
      teacherName: activeSceneTeacher.name,
      teacherImage: activeSceneTeacher.photo || selectedScene.teacherImage,
      teacherLang: activeSceneTeacher.voiceLang,
      teacherGender: activeSceneTeacher.gender || selectedScene.teacherGender,
    };
  }, [activeSceneTeacher, sceneTeacherResolution.materialIsInTargetLanguage, selectedScene]);

  useEffect(() => {
    if (!selectedSceneTeacherId) return;
    if (!compatibleSceneTeachers.some((teacher) => teacher.id === selectedSceneTeacherId)) {
      setSelectedSceneTeacherId(null);
    }
  }, [compatibleSceneTeachers, selectedSceneTeacherId]);

  useEffect(() => {
    setAuthorizedSceneMaterial(null);
  }, [selectedScene?.id, targetLang, nativeLang]);

  const handleSelectTargetLang = (code: string) => {
    setTargetLang(code);
    setSelectedSceneTeacherId(null);
    localStorage.setItem("ml_target_lang", code);
    // Sync with LanguageContext (single source of truth for the whole app)
    const info = LANG_LABELS[code] || { flag: "🌐", name: code };
    setProfile({ ...profile, targetCode: code, targetName: info.name, targetFlag: info.flag });
    // Auto-switch to a scene matching the new language
    const base = code.split("-")[0].toLowerCase();
    const match = IMMERSIVE_SCENES.find(s => s.langCode === base || s.teacherLang.toLowerCase().startsWith(base));
    if (match) setSelectedScene(match);
    setShowLangPicker(false);
  };
  const currentLangInfo = targetLang
    ? (LANG_LABELS[targetLang] || { flag: "🌐", name: targetLang })
    : { flag: "🌐", name: "Idioma" };
  const targetLanguageBlockIsPlanned = Boolean(targetLang) && !isInitialCommercialTargetLanguage(targetLang);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechText, setActiveSpeechText] = useState("");
  const [isPreparingNeuralAudio, setIsPreparingNeuralAudio] = useState(false);
  const [dialogAudioSource, setDialogAudioSource] = useState<string | null>(null);
  const [dialogAudioDuration, setDialogAudioDuration] = useState<number | null>(null);
  const [dialogAudioPosition, setDialogAudioPosition] = useState(0);
  const [dialogAudioNeedsGesture, setDialogAudioNeedsGesture] = useState(false);
  const [dialogSpeechRate, setDialogSpeechRate] = useState<number>(loadDialogSpeechRate);
  const [dialogAuthRequired, setDialogAuthRequired] = useState(false);
  const [sceneMaterialTimedOut, setSceneMaterialTimedOut] = useState(false);
  const ttsMut = trpc.tts.speak.useMutation();
  const googleTtsMut = trpc.ttsGoogle.generate.useMutation();
  const sceneDialogueVoiceMut = trpc.sceneDialogueVoice.speak.useMutation();
  const authorizeLessonMut = trpc.trialAccess.authorizeLesson.useMutation();
  const authorizeSceneLessonRef = useRef(authorizeLessonMut.mutateAsync);
  useEffect(() => {
    authorizeSceneLessonRef.current = authorizeLessonMut.mutateAsync;
  }, [authorizeLessonMut.mutateAsync]);
  const authorizeSceneLesson = useCallback(
    (lessonKey: string) => authorizeSceneLessonRef.current({ lessonKey }),
    [],
  );
  const dialogTranscribeMut = trpc.voiceTranscription.transcribe.useMutation();
  const dialogTranslateMut = trpc.translate.dialogueText.useMutation();
  const immersiveSceneTutorMut = trpc.immersiveSceneTutor.chat.useMutation();
  const localizedSceneDialogueQuery = trpc.curriculum.localizedSceneDialogue.useQuery({
    lessonKey: authorizedSceneMaterial?.lessonKey || "scene:pending",
    sceneId: selectedScene?.id || "pending",
    targetLanguage: targetLang,
    nativeLanguage: nativeLang,
  }, {
    enabled: isAuthenticated
      && authorizedSceneMaterial?.sceneId === selectedScene?.id
      && authorizedSceneMaterial?.targetLanguage === targetLang
      && authorizedSceneMaterial?.nativeLanguage === nativeLang
      && isInitialCommercialTargetLanguage(targetLang),
    staleTime: 1000 * 60 * 30,
    retry: false,
  });
  const canonicalSceneMaterialQuery = trpc.curriculum.sceneCanonicalMaterial.useQuery({
    lessonKey: authorizedSceneMaterial?.lessonKey || "scene:pending",
    sceneId: selectedScene?.id || "pending",
    targetLanguage: targetLang,
    nativeLanguage: nativeLang,
  }, {
    enabled: isAuthenticated
      && (selectedScene?.id === "beach" || selectedScene?.id === "airport" || selectedScene?.id === "airport_family" || selectedScene?.id === "cafe" || selectedScene?.id === "cinema" || selectedScene?.id === "desert" || selectedScene?.id === "family_home" || selectedScene?.id === "farm" || selectedScene?.id === "forest" || selectedScene?.id === "garden" || selectedScene?.id === "gym" || selectedScene?.id === "hospital" || selectedScene?.id === "library" || selectedScene?.id === "medieval" || selectedScene?.id === "metro" || selectedScene?.id === "museum" || selectedScene?.id === "office" || selectedScene?.id === "park" || selectedScene?.id === "paris" || selectedScene?.id === "port" || selectedScene?.id === "spa" || selectedScene?.id === "tokyo" || selectedScene?.id === "newyork" || selectedScene?.id === "kitchen" || selectedScene?.id === "restaurant" || selectedScene?.id === "hotel" || selectedScene?.id === "supermarket" || selectedScene?.id === "school" || selectedScene?.id === "mountain")
      && authorizedSceneMaterial?.sceneId === selectedScene?.id
      && authorizedSceneMaterial?.targetLanguage === targetLang
      && authorizedSceneMaterial?.nativeLanguage === nativeLang,
    staleTime: 1000 * 60 * 30,
    retry: false,
  });
  const activeSceneDialog = canonicalSceneMaterialQuery.data?.dialog ?? [];
  const activeSceneHotspots = canonicalSceneMaterialQuery.data?.hotspots ?? [];
  const activeTeachingScene = useMemo<Scene | null>(() => {
    if (!teachingScene) return null;
    return {
      ...teachingScene,
      dialog: activeSceneDialog,
      hotspots: activeSceneHotspots,
    };
  }, [activeSceneDialog, activeSceneHotspots, teachingScene]);
  const selectedSceneRequiresProtectedMaterial = selectedScene?.id === "beach" || selectedScene?.id === "airport" || selectedScene?.id === "airport_family" || selectedScene?.id === "cafe" || selectedScene?.id === "cinema" || selectedScene?.id === "desert" || selectedScene?.id === "family_home" || selectedScene?.id === "farm" || selectedScene?.id === "forest" || selectedScene?.id === "garden" || selectedScene?.id === "gym" || selectedScene?.id === "hospital" || selectedScene?.id === "library" || selectedScene?.id === "medieval" || selectedScene?.id === "metro" || selectedScene?.id === "museum" || selectedScene?.id === "office" || selectedScene?.id === "park" || selectedScene?.id === "paris" || selectedScene?.id === "port" || selectedScene?.id === "spa" || selectedScene?.id === "tokyo" || selectedScene?.id === "newyork" || selectedScene?.id === "kitchen" || selectedScene?.id === "restaurant" || selectedScene?.id === "hotel" || selectedScene?.id === "supermarket" || selectedScene?.id === "school" || selectedScene?.id === "mountain";
  const sceneMaterialAccessFailed = Boolean(
    selectedSceneRequiresProtectedMaterial
      && activeSceneDialog.length === 0
      && (authorizeLessonMut.isError || canonicalSceneMaterialQuery.isError || sceneMaterialTimedOut),
  );
  const sceneMaterialIsPreparing = Boolean(
    selectedSceneRequiresProtectedMaterial
      && isAuthenticated
      && activeSceneDialog.length === 0
      && (authorizeLessonMut.isPending || canonicalSceneMaterialQuery.isPending)
      && !sceneMaterialAccessFailed,
  );
  const sceneMaterialRequiresLogin = Boolean(selectedSceneRequiresProtectedMaterial && !isAuthenticated);
  const sceneMaterialNeedsAccess = sceneMaterialRequiresLogin || sceneMaterialAccessFailed;
  const canUseAuthorizedSceneInteractions = isAuthenticated
    && !sceneMaterialNeedsAccess
    && !sceneMaterialIsPreparing
    && !dialogAuthRequired
    && activeSceneDialog.length > 0;
  const sceneMaterialActionLabel = isAuthenticated ? "Atualizar cena" : "Ativar acesso";

  useEffect(() => {
    if (!isAuthenticated || !selectedScene || !isInitialCommercialTargetLanguage(targetLang)) return;
    let cancelled = false;
    const lessonKey = `scene:${selectedScene.id}`;
    void authorizeSceneLesson(lessonKey)
      .then((access) => {
        if (!cancelled) {
          setAuthorizedSceneMaterial(access.allowed ? {
            lessonKey,
            sceneId: selectedScene.id,
            targetLanguage: targetLang,
            nativeLanguage: nativeLang,
          } : null);
        }
      })
      .catch(() => {
        if (!cancelled) setAuthorizedSceneMaterial(null);
      });
    return () => { cancelled = true; };
  }, [authorizeSceneLesson, isAuthenticated, nativeLang, selectedScene?.id, targetLang]);

  useEffect(() => {
    setSceneMaterialTimedOut(false);
    if (!selectedSceneRequiresProtectedMaterial || !isAuthenticated || activeSceneDialog.length > 0) return;
    const timeoutId = window.setTimeout(() => setSceneMaterialTimedOut(true), 8000);
    return () => window.clearTimeout(timeoutId);
  }, [activeSceneDialog.length, isAuthenticated, nativeLang, selectedScene?.id, selectedSceneRequiresProtectedMaterial, targetLang]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dialogAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const dialogAudioObjectUrlRef = useRef<string | null>(null);
  const localSpeechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const activeDialogLineRef = useRef<string | null>(null);
  const activeDialogWordCountRef = useRef(0);
  const dialogAudioContextRef = useRef<AudioContext | null>(null);
  const activeSpeechRequestRef = useRef<string | null>(null);
  const [audioViseme, setAudioViseme] = useState<VisemeData | null>(null);
  const handleAudioViseme = useCallback((viseme: VisemeData) => setAudioViseme(viseme), []);
  const { stop: stopVisemeSync, primeAudioContext: primeVisemeAudio } = useTTSVisemeSync(handleAudioViseme);

  useEffect(() => {
    if (dialogAudioElementRef.current) dialogAudioElementRef.current.playbackRate = dialogSpeechRate;
    if (nativeHelpAudioRef.current) nativeHelpAudioRef.current.playbackRate = dialogSpeechRate;
    try {
      window.localStorage.setItem(DIALOG_SPEECH_RATE_STORAGE_KEY, String(dialogSpeechRate));
    } catch {
      // A preferência continua válida para a sessão quando o armazenamento não está disponível.
    }
  }, [dialogSpeechRate]);

  const stopTeacherAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
      audioRef.current = null;
    }
    if (dialogAudioObjectUrlRef.current) {
      URL.revokeObjectURL(dialogAudioObjectUrlRef.current);
      dialogAudioObjectUrlRef.current = null;
    }
    setDialogAudioSource(null);
    setDialogAudioDuration(null);
    setDialogAudioPosition(0);
    if (localSpeechRef.current && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      localSpeechRef.current = null;
    }
    stopVisemeSync();
    setAudioViseme(null);
    setIsSpeaking(false);
    setActiveJamesClipId(null);
    setActiveSophieClipId(null);
    pendingJamesClipIdRef.current = null;
    pendingSophieClipIdRef.current = null;
    setIsPreparingNeuralAudio(false);
    setActiveSpeechText("");
    activeSpeechRequestRef.current = null;
  }, [stopVisemeSync]);

  const playLocalDialogFallback = useCallback((text: string, language: string, requestKey: string, gender?: 'male' | 'female') => {
    if (!("speechSynthesis" in window) || !text.trim()) return false;
    const synth = window.speechSynthesis;
    const startWithAvailableVoices = (retriesRemaining: number): boolean => {
      const voices = synth.getVoices();
      if (!voices.length) {
        if (retriesRemaining > 0) {
          window.setTimeout(() => {
            if (activeSpeechRequestRef.current === requestKey) startWithAvailableVoices(retriesRemaining - 1);
          }, retriesRemaining === 2 ? 280 : 700);
          return true;
        }
        setIsPreparingNeuralAudio(false);
        setIsSpeaking(false);
        setActiveSpeechText("");
        setDlgAudioNotice(`A voz em ${getSpokenLanguageLabel(language)} ainda está preparando neste navegador. Toque em Ouvir novamente.`);
        if (activeSpeechRequestRef.current === requestKey) activeSpeechRequestRef.current = null;
        return false;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = dialogSpeechRate;
      utterance.pitch = 1;
      const languagePrefix = language.toLowerCase().split("-")[0];
      const regionalVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith(languagePrefix));
      const maleVoicePattern = /(^|\s)(david|mark|guy|daniel|george|james|ryan|andrew|matthew|eric|brian|michael|christopher|male)(\s|$)/i;
      const femaleVoicePattern = /(^|\s)(zira|hazel|susan|aria|jenny|sara|samantha|female)(\s|$)/i;
      // Alguns navegadores não identificam gênero no nome da voz. Para James,
      // priorizamos homem nomeado e, se não existir, uma voz regional sem rótulo
      // feminino explícito em vez de deixar a cena sem áudio.
      const nonFemaleRegionalVoice = regionalVoices.find((voice) => !femaleVoicePattern.test(voice.name));
      const preferredVoice = gender === "male"
        ? regionalVoices.find((voice) => maleVoicePattern.test(voice.name)) || nonFemaleRegionalVoice
        : gender === "female"
          ? regionalVoices.find((voice) => femaleVoicePattern.test(voice.name))
          : regionalVoices[0];
      if (gender && !preferredVoice) return false;
      if (preferredVoice) utterance.voice = preferredVoice;
      const releaseRequest = () => {
        if (activeSpeechRequestRef.current === requestKey) activeSpeechRequestRef.current = null;
      };
      const finish = () => {
        stopVisemeSync();
        setAudioViseme(null);
        setIsSpeaking(false);
        setIsPreparingNeuralAudio(false);
        setActiveJamesClipId(null);
        setActiveSophieClipId(null);
        pendingJamesClipIdRef.current = null;
        pendingSophieClipIdRef.current = null;
        if (localSpeechRef.current === utterance) {
          localSpeechRef.current = null;
          setActiveSpeechText("");
        }
        releaseRequest();
      };
      utterance.onstart = () => {
        setIsPreparingNeuralAudio(false);
        setIsSpeaking(true);
        // A reserva local também tem um evento real de início de áudio. Assim,
        // o movimento lateral já aprovado só aparece quando a fala de fato
        // começou — nunca no clique, na preparação ou no silêncio.
        if (teachingScene?.id === "beach" && teachingScene.teacherName === "James" && pendingJamesClipIdRef.current) {
          setActiveJamesClipId(pendingJamesClipIdRef.current);
          pendingJamesClipIdRef.current = null;
        }
        if (teachingScene?.id === "cafe" && teachingScene.teacherName === "Sophie" && pendingSophieClipIdRef.current) {
          setActiveSophieClipId(pendingSophieClipIdRef.current);
          pendingSophieClipIdRef.current = null;
        }
        if (activeDialogLineRef.current === text) setDlgAudioClock(false);
      };
      utterance.onend = finish;
      utterance.onerror = () => {
        finish();
        setDlgAudioNotice(`Não foi possível iniciar o áudio neste navegador. Leia a fala em ${getSpokenLanguageLabel(language)} e tente novamente.`);
      };
      localSpeechRef.current = utterance;
      synth.cancel();
      synth.speak(utterance);
      return true;
    };
    return startWithAvailableVoices(2);
  }, [dialogSpeechRate, stopVisemeSync, teachingScene?.id, teachingScene?.teacherName]);

  useEffect(() => () => stopTeacherAudio(), [stopTeacherAudio]);

  const playTeacherAudio = useCallback(async (source: string, phrase: string, _language: string, requestKey: string, revokeOnEnd = false, autoPlay = false) => {
    const audio = dialogAudioElementRef.current;
    if (!audio) throw new Error("dialogue-audio-control-unavailable");
    if (dialogAudioObjectUrlRef.current && dialogAudioObjectUrlRef.current !== source) {
      URL.revokeObjectURL(dialogAudioObjectUrlRef.current);
      dialogAudioObjectUrlRef.current = null;
    }
    if (source.startsWith("blob:")) dialogAudioObjectUrlRef.current = source;
    audio.pause();
    audio.currentTime = 0;
    audio.src = source;
    audio.preload = "auto";
    audio.setAttribute("playsinline", "");
    audio.muted = false;
    audio.volume = 1;
    audio.playbackRate = dialogSpeechRate;
    audio.load();
    const reportAudioEvent = (event: "loaded" | "play" | "play-rejected" | "error", reason?: string) => {
      console.info("[immersive-audio]", {
        event,
        source: source.startsWith("blob:") ? "blob" : "remote",
        muted: audio.muted,
        volume: audio.volume,
        readyState: audio.readyState,
        duration: Number.isFinite(audio.duration) ? audio.duration : null,
        reason: reason ?? null,
      });
    };
    setDialogAudioSource(source);
    setDialogAudioDuration(null);
    setDialogAudioPosition(0);
    setDialogAudioNeedsGesture(false);
    audioRef.current = audio;
    const releaseRequest = () => {
      if (activeSpeechRequestRef.current === requestKey) activeSpeechRequestRef.current = null;
    };
    const updatesActiveDialog = () => activeDialogLineRef.current === phrase && activeDialogWordCountRef.current > 0;
    const updateDialogWordsFromAudio = () => {
      if (!updatesActiveDialog() || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
      const wordCount = activeDialogWordCountRef.current;
      const nextWord = Math.min(wordCount, Math.floor((audio.currentTime / audio.duration) * wordCount));
      setDlgWordIdx((current) => Math.max(current, nextWord));
    };
    let invalidTrackHandled = false;
    let invalidTrackTimeout: number | null = null;
    let objectPlaybackAttempted = false;
    const hasPlayableDuration = () => Number.isFinite(audio.duration) && audio.duration > 0;
    const isObjectPronunciation = requestKey.startsWith("hotspot:");
    const useFallbackForInvalidTrack = () => {
      if (invalidTrackHandled || audio.src !== source) return;
      invalidTrackHandled = true;
      if (invalidTrackTimeout !== null) window.clearTimeout(invalidTrackTimeout);
      audio.pause();
      if (updatesActiveDialog()) setDlgAudioClock(false);
      stopVisemeSync();
      setAudioViseme(null);
      setDialogAudioSource(null);
      setDialogAudioDuration(null);
      setDialogAudioPosition(0);
      if (audioRef.current === audio) audioRef.current = null;
      if (dialogAudioObjectUrlRef.current === source) {
        URL.revokeObjectURL(source);
        dialogAudioObjectUrlRef.current = null;
      }
      // James continua exclusivamente masculino: o resolvedor local já exclui
      // nomes explicitamente femininos e prioriza uma voz regional masculina.
      // Assim uma faixa neural inválida não deixa a pergunta do aluno silenciosa.
      if (playLocalDialogFallback(phrase, _language, requestKey, teachingScene?.teacherGender)) {
        setDlgAudioNotice(`Sua frase está pronta para repetir. Toque em Ouvir ${getSpokenLanguageLabel(_language)} para continuar.`);
        return;
      }
      setIsPreparingNeuralAudio(false);
      setIsSpeaking(false);
      setActiveSpeechText("");
      releaseRequest();
      setDlgAudioNotice(`Toque em Ouvir ${getSpokenLanguageLabel(_language)} para continuar a prática de pronúncia.`);
    };
    audio.onplaying = () => {
      reportAudioEvent("play");
      setIsPreparingNeuralAudio(false);
      setIsSpeaking(true);
      setDialogAudioNeedsGesture(false);
      if (activeDialogLineRef.current === phrase) setDlgOpen(true);
      const confirmedJamesClipId = pendingJamesClipIdRef.current
        || (requestKey === "james-tropical-introduction" ? "james-tropical-greeting" : null);
      if (teachingScene?.id === "beach" && teachingScene.teacherName === "James" && confirmedJamesClipId) {
        setActiveJamesClipId(confirmedJamesClipId);
        pendingJamesClipIdRef.current = null;
      }
      if (teachingScene?.id === "cafe" && teachingScene.teacherName === "Sophie" && pendingSophieClipIdRef.current) {
        setActiveSophieClipId(pendingSophieClipIdRef.current);
        pendingSophieClipIdRef.current = null;
      }
      if (updatesActiveDialog()) setDlgAudioClock(true);
    };
    const acceptPlayableTrack = () => {
      if (!hasPlayableDuration()) return false;
      if (invalidTrackTimeout !== null) {
        window.clearTimeout(invalidTrackTimeout);
        invalidTrackTimeout = null;
      }
      setDialogAudioDuration(audio.duration);
      reportAudioEvent("loaded");
      updateDialogWordsFromAudio();
      return true;
    };
    audio.onloadedmetadata = () => {
      if (acceptPlayableTrack()) return;
      // Alguns navegadores anunciam metadata antes de calcular a duração do
      // Blob MP3. Só rejeitamos a faixa se ela continuar inválida após a
      // janela de decodificação, nunca no primeiro evento transitório.
      invalidTrackTimeout = window.setTimeout(() => {
        if (!hasPlayableDuration()) useFallbackForInvalidTrack();
      }, 1800);
    };
    audio.ondurationchange = acceptPlayableTrack;
    audio.oncanplay = () => {
      if (!acceptPlayableTrack() || !isObjectPronunciation || objectPlaybackAttempted) return;
      objectPlaybackAttempted = true;
      // A pronúncia foi pedida pelo botão explícito do cartão. Tentamos tocar
      // no mesmo fluxo; se o navegador exigir outro gesto, o aluno repete o
      // mesmo botão do cartão, sem uma barra nativa sobrepondo o conteúdo.
      void audio.play().catch(() => {
        setDlgAudioNotice("Pronúncia pronta. Toque novamente no botão de áudio do cartão para ouvir.");
      });
    };
    audio.ontimeupdate = () => {
      setDialogAudioPosition(audio.currentTime);
      updateDialogWordsFromAudio();
    };
    audio.onended = () => {
      if (updatesActiveDialog()) {
        setDlgWordIdx(activeDialogWordCountRef.current);
        setDlgAudioClock(false);
      }
      if (Number.isFinite(audio.duration) && audio.duration > 0) setDialogAudioPosition(audio.duration);
      stopVisemeSync();
      setAudioViseme(null);
      setIsSpeaking(false);
      setActiveJamesClipId(null);
      setActiveSophieClipId(null);
      pendingJamesClipIdRef.current = null;
      pendingSophieClipIdRef.current = null;
      if (audioRef.current === audio) {
        audioRef.current = null;
        setActiveSpeechText("");
      }
      releaseRequest();
      if (invalidTrackTimeout !== null) window.clearTimeout(invalidTrackTimeout);
      if (revokeOnEnd) URL.revokeObjectURL(source);
    };
    audio.onpause = () => {
      if (audio.ended) return;
      stopVisemeSync();
      setAudioViseme(null);
      setIsSpeaking(false);
      setActiveJamesClipId(null);
      setActiveSophieClipId(null);
      pendingJamesClipIdRef.current = null;
      pendingSophieClipIdRef.current = null;
    };
    audio.onerror = () => {
      reportAudioEvent("error", audio.error?.message || String(audio.error?.code ?? "unknown"));
      useFallbackForInvalidTrack();
    };
    // A fala só inicia após gesto explícito: envio de escrita ou botão Ouvir.
    setIsPreparingNeuralAudio(false);
    setIsSpeaking(false);
    if (autoPlay) {
      void audio.play().catch((error) => {
        reportAudioEvent("play-rejected", error instanceof Error ? error.name : "unknown");
        if (updatesActiveDialog()) {
          setDlgOpen(true);
          setDialogAudioNeedsGesture(true);
        }
        setDlgAudioNotice(`Resposta pronta. Toque em Ouvir ${teachingScene?.teacherName || "professor"} para ouvir.`);
      });
      return;
    }
    setDlgAudioNotice(`Voz de ${teachingScene?.teacherName || "professor"} pronta. Toque em Ouvir ${teachingScene?.teacherName || "professor"} para iniciar.`);
  }, [dialogSpeechRate, playLocalDialogFallback, stopVisemeSync, teachingScene?.teacherGender, teachingScene?.teacherName]);

  const replayVisibleDialogAudio = useCallback(async () => {
    const audio = dialogAudioElementRef.current;
    if (!audio || !dialogAudioSource) {
      setDlgAudioNotice("A voz ainda está sendo preparada. Tente novamente em alguns instantes.");
      return;
    }
    try {
      if (teachingScene?.id === "beach" && teachingScene.teacherName === "James") {
        setActiveJamesClipId(null);
        playJamesTropicalClip("james-tropical-greeting");
      }
      audio.muted = false;
      audio.volume = 1;
      audio.playbackRate = dialogSpeechRate;
      audio.currentTime = 0;
      setDialogAudioPosition(0);
      await audio.play();
      // Alguns navegadores resolvem play() sem emitir onplaying no elemento
      // visualmente oculto. A promessa resolvida também confirma reprodução;
      // só então promovemos o clipe lateral pendente.
      if (teachingScene?.id === "beach" && teachingScene.teacherName === "James" && pendingJamesClipIdRef.current) {
        setActiveJamesClipId(pendingJamesClipIdRef.current);
        pendingJamesClipIdRef.current = null;
      }
      setDlgAudioNotice("");
      setDialogAudioNeedsGesture(false);
    } catch {
      setDialogAudioNeedsGesture(true);
      setDlgAudioNotice(`Toque em Ouvir ${getSpokenLanguageLabel(teachingScene?.teacherLang || targetLang)} para escutar a frase e continuar a prática.`);
    }
  }, [dialogAudioSource, dialogSpeechRate, playJamesTropicalClip, targetLang, teachingScene?.id, teachingScene?.teacherGender, teachingScene?.teacherLang, teachingScene?.teacherName]);

  const primeDialogAudioFromGesture = useCallback(() => {
    try {
      const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextConstructor) return;
      const context = dialogAudioContextRef.current || new AudioContextConstructor();
      dialogAudioContextRef.current = context;
      // Resume happens synchronously in the visitor's click. The actual neural
      // MP3 arrives asynchronously, so this preserves playback eligibility for
      // the first scripted line instead of relying on a later autoplay attempt.
      void context.resume();
    } catch {
      // O controle visível para ouvir permanece disponível como nova tentativa explícita.
    }
  }, []);

  const playPublicSceneDialogue = useCallback(async (text: string, language: string, gender: 'male' | 'female', requestKey: string, autoPlay = false) => {
    const result = await waitForSpeechResult(
      sceneDialogueVoiceMut.mutateAsync({ text: text.slice(0, 500), language, gender }),
      12_000,
    );
    if (!result.success || !("audioBase64" in result) || !result.audioBase64.trim()) return false;
    const source = audioBase64ToObjectUrl(result.audioBase64, "audio/mpeg");
    await playTeacherAudio(source, text, language, requestKey, false, autoPlay);
    return true;
  }, [playTeacherAudio, sceneDialogueVoiceMut]);

  // Neural speech only: object pronunciation must never use a system/browser voice.
  const speak = useCallback(async (text: string, lang: string, _rate?: number, gender?: 'male' | 'female', purpose: ImmersiveSpeechPurpose = "teacher", autoPlay = false) => {
    if (!text?.trim()) return;
    const teacherGender = teachingScene?.teacherName === "James"
      ? "male"
      : gender || (teachingScene?.teacherGender === 'male' ? 'male' : 'female');
    const requestKey = `${purpose}:${lang}:${teacherGender}:${text}`;
    // A mesma linha pode ser solicitada por clique e atualização visual quase ao
    // mesmo tempo. Mantemos um único pedido até o áudio encerrar ou falhar.
    if (activeSpeechRequestRef.current === requestKey) return;
    // A troca de fala deve também encerrar o relógio de visemas anterior.
    stopTeacherAudio();
    stopEdgeTTS();
    activeSpeechRequestRef.current = requestKey;
    setActiveSpeechText(text);
    setIsPreparingNeuralAudio(true);
    setDlgAudioNotice("Preparando voz natural…");

    const playEdgeNeural = async () => {
      const edgeAudio = await waitForSpeechResult(
        ttsMut.mutateAsync({ text: text.slice(0, 500), voiceLang: lang, gender: teacherGender }),
        6_000,
      );
      if (!edgeAudio.success || !edgeAudio.audioBase64) return false;
      const source = audioBase64ToObjectUrl(edgeAudio.audioBase64, "audio/mpeg");
      await playTeacherAudio(source, text, lang, requestKey, false, autoPlay);
      return true;
    };

    // A faixa Edge chega diretamente como MP3 base64 válido. Ela é a primeira
    // opção para todas as cenas, evitando uma URL remota indisponível depois
    // de a resposta escrita já ter sido apresentada ao aluno.
    try {
      if (await playEdgeNeural()) return;
    } catch { /* Try the secondary neural provider below. */ }
    try {
      if (await playPublicSceneDialogue(text, lang, teacherGender, requestKey, autoPlay)) return;
    } catch { /* Try the remote neural provider below. */ }
    try {
      const googleAudio = await waitForSpeechResult(
        googleTtsMut.mutateAsync({
          text: text.slice(0, 500),
          languageCode: lang,
          gender: teacherGender === "male" ? "MALE" : "FEMALE",
        }),
        6_000,
      );
      if (googleAudio.audioUrl) {
        await playTeacherAudio(googleAudio.audioUrl, text, lang, requestKey, false, autoPlay);
        return;
      }
    } catch { /* Preserve the existing neural-TTS fallback. */ }
    if (
      teachingScene?.id === "beach"
      && teachingScene.teacherName === "James"
      && text.trim() === JAMES_TROPICAL_INTRO_LINE
    ) {
      await playTeacherAudio(
        JAMES_TROPICAL_INTRO_FALLBACK_URL,
        JAMES_TROPICAL_INTRO_LINE,
        "en-US",
        requestKey,
        false,
        autoPlay,
      );
      return;
    }
    const jamesObjectFallback = teachingScene?.id === "beach" && teachingScene.teacherName === "James"
      ? JAMES_TROPICAL_OBJECT_FALLBACKS[text.trim() as keyof typeof JAMES_TROPICAL_OBJECT_FALLBACKS]
      : undefined;
    if (jamesObjectFallback) {
      // A faixa curta é deliberadamente diferente do diálogo inteiro do clipe.
      // Por isso removemos o clipe pendente antes do evento onplaying e mantemos
      // a foto original durante a pronúncia de reserva.
      pendingJamesClipIdRef.current = null;
      setActiveJamesClipId(null);
      setActiveSpeechText(jamesObjectFallback.spokenText);
      await playTeacherAudio(
        jamesObjectFallback.audioUrl,
        jamesObjectFallback.spokenText,
        "en-US",
        requestKey,
        false,
        autoPlay,
      );
      return;
    }
    if (playLocalDialogFallback(text, lang, requestKey, teachingScene?.teacherGender)) {
      setDlgAudioNotice(`Toque em Ouvir ${getSpokenLanguageLabel(lang)} para repetir a frase e continuar praticando.`);
      return;
    }
    if (activeDialogLineRef.current === text) setDlgAudioClock(false);
    setGreetingText(`Toque em Ouvir ${getSpokenLanguageLabel(lang)} para escutar a pronúncia e continuar a prática.`);
    setIsPreparingNeuralAudio(false);
    setIsSpeaking(false);
    setActiveSpeechText("");
    if (activeSpeechRequestRef.current === requestKey) activeSpeechRequestRef.current = null;
  }, [googleTtsMut, playLocalDialogFallback, playTeacherAudio, stopTeacherAudio, teachingScene?.teacherGender, teachingScene?.id, teachingScene?.teacherName, ttsMut]);

  const requestSpeechSafely = useCallback((text: string, language: string, gender?: 'male' | 'female', purpose: ImmersiveSpeechPurpose = "teacher", autoPlay = false) => {
    if (isAuthLoading) return;
    const effectiveGender = teachingScene?.teacherName === "James"
      ? "male"
      : gender || teachingScene?.teacherGender || "female";
    if (!isAuthenticated) {
      setDialogAuthRequired(true);
      stopTeacherAudio();
      activeSpeechRequestRef.current = null;
      setGreetingText("Ative o acesso protegido para ouvir a fala do professor nesta cena.");
      setShowGreeting(true);
      setIsPreparingNeuralAudio(false);
      setIsSpeaking(false);
      setActiveSpeechText("");
      if (activeDialogLineRef.current === text) setDlgAudioClock(false);
      setDlgFeedback("Ative o acesso para praticar a fala com o professor nesta cena.");
      return;
    }
    primeVisemeAudio();
    const requestKey = `dialog-recovery:${language}:${effectiveGender}:${text}`;
    void speak(text, language, undefined, effectiveGender, purpose, autoPlay).catch(() => {
      if (activeDialogLineRef.current === text) setDlgAudioClock(false);
      stopTeacherAudio();
      activeSpeechRequestRef.current = requestKey;
      setIsPreparingNeuralAudio(true);
      void playPublicSceneDialogue(text, language, effectiveGender, requestKey, autoPlay)
        .then((played) => {
          if (played || playLocalDialogFallback(text, language, requestKey, effectiveGender)) return;
          setIsPreparingNeuralAudio(false);
          setIsSpeaking(false);
          setActiveSpeechText("");
          setDlgFeedback((feedback) => feedback || "A resposta está visível. A voz não ficou disponível nesta tentativa; use o controle de áudio ou pergunte novamente.");
        })
        .catch(() => {
          if (playLocalDialogFallback(text, language, requestKey, effectiveGender)) return;
          setIsPreparingNeuralAudio(false);
          setIsSpeaking(false);
          setActiveSpeechText("");
          setDlgFeedback((feedback) => feedback || "A resposta está visível. A voz não ficou disponível nesta tentativa; use o controle de áudio ou pergunte novamente.");
        });
    });
  }, [isAuthenticated, isAuthLoading, playLocalDialogFallback, playPublicSceneDialogue, primeVisemeAudio, speak, stopTeacherAudio, teachingScene?.teacherGender, teachingScene?.teacherName]);

  const [showGreeting, setShowGreeting] = useState(true);
  const [greetingText, setGreetingText] = useState("");
  const [practiceHotspot, setPracticeHotspot] = useState<Hotspot | null>(null);
  const [particles, setParticles] = useState(false);
  const [score, setScore] = useState(0);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(() => new Set<string>());
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<"correct" | "wrong" | null>(null);
  const [quizHintVisible, setQuizHintVisible] = useState(false);
  const sceneXpMut = trpc.gamification.addXP.useMutation();
  const [filter, setFilter] = useState<"all" | ImmersiveCEFRLevel>("all");
  const [search, setSearch] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  // Notebook state
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [notebookCount, setNotebookCount] = useState(() => loadNotebook().length);
  // Pareto Panel state
  const [paretoOpen, setParetoOpen] = useState(false);
  const quizHotspots = activeSceneHotspots;
  const quizQuestion = quizHotspots.length ? quizHotspots[quizIndex % quizHotspots.length] : null;
  const quizOptions = quizQuestion
    ? [quizQuestion.translation, ...quizHotspots
        .filter((hotspot) => hotspot.id !== quizQuestion.id && hotspot.translation !== quizQuestion.translation)
        .map((hotspot) => hotspot.translation)
        .slice(0, 3)]
    : [];
  const handleQuizAnswer = (answer: string) => {
    if (!quizQuestion || quizFeedback) return;
    const correct = answer === quizQuestion.translation;
    setQuizFeedback(correct ? "correct" : "wrong");
    setQuizHintVisible(!correct);
    if (correct) {
      setScore((current) => current + 10);
      sceneXpMut.mutate({ xp: 10, type: "exercise" });
    }
  };
  const advanceSceneGuess = () => {
    setQuizFeedback(null);
    setQuizHintVisible(false);
    setQuizIndex((current) => current + 1);
  };
  // ── Native language label for dialog panel ──
  const nativeLangLabel = (() => {
    const code = (nativeLang || 'pt-BR').split('-')[0].toLowerCase();
    const labels: Record<string, string> = { pt: 'PT', en: 'EN', es: 'ES', fr: 'FR', de: 'DE', it: 'IT', ja: 'JA', zh: 'ZH', ko: 'KO', ru: 'RU', ar: 'AR' };
    return labels[code] || code.toUpperCase();
  })();
  // ── Dialog Panel (scrolling text + exercises) ──
  const [dlgOpen, setDlgOpen] = useState(false);
  const [dlgExpanded, setDlgExpanded] = useState(false);
  const [dlgStep, setDlgStep] = useState(0);
  const [dlgWords, setDlgWords] = useState<string[]>([]);
  const [dlgWordIdx, setDlgWordIdx] = useState(0);
  const [dlgAudioClock, setDlgAudioClock] = useState(false);
  const [dlgAnswer, setDlgAnswer] = useState<number | null>(null);
  const [dlgWrittenAnswer, setDlgWrittenAnswer] = useState("");
  const [dlgFeedback, setDlgFeedback] = useState("");
  const [dlgTutorSpokenText, setDlgTutorSpokenText] = useState("");
  const [dlgAudioNotice, setDlgAudioNotice] = useState("");
  const [dlgTutorHistory, setDlgTutorHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [dlgTutorLoading, setDlgTutorLoading] = useState(false);
  const [dlgNativeTranslation, setDlgNativeTranslation] = useState("");
  const [dlgTranslationLoading, setDlgTranslationLoading] = useState(false);
  const [dlgSuggestedHotspot, setDlgSuggestedHotspot] = useState<Hotspot | null>(null);
  const [dlgIsRecording, setDlgIsRecording] = useState(false);
  const [dlgIsProcessingSpeech, setDlgIsProcessingSpeech] = useState(false);
  const dlgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const greetingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nativeHelpAudioRef = useRef<HTMLAudioElement | null>(null);
  const dlgRecorderRef = useRef<MediaRecorder | null>(null);
  const dlgRecordingStreamRef = useRef<MediaStream | null>(null);
  const dlgRecordingSessionRef = useRef(0);
  const dlgTutorRequestRef = useRef(0);
  const dlgFeedbackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!dlgFeedback) return;
    dlgFeedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [dlgFeedback]);

  const getDlgTranslation = (line: DialogLine): string =>
    getNativeDialogueTranslation(line, nativeLang, dlgNativeTranslation);

  useEffect(() => {
    const line = activeSceneDialog[dlgStep];
    if (!line || isPortugueseLocale(nativeLang)) {
      setDlgNativeTranslation("");
      setDlgTranslationLoading(false);
      return;
    }

    let active = true;
    setDlgNativeTranslation("");
    setDlgTranslationLoading(true);
    void dialogTranslateMut.mutateAsync({
      text: line.text,
      sourceLanguage: teachingScene?.teacherLang || targetLang,
      targetLanguage: nativeLang || "pt-BR",
    }).then((result) => {
      if (active) setDlgNativeTranslation(result.translation);
    }).catch(() => {
      if (active) setDlgNativeTranslation("");
    }).finally(() => {
      if (active) setDlgTranslationLoading(false);
    });
    return () => { active = false; };
  }, [activeSceneDialog, dlgStep, nativeLang, targetLang, teachingScene?.teacherLang]);

  const speakNativeHelp = useCallback(async (text: string) => {
    const helpText = text.trim();
    if (!helpText) return;
    nativeHelpAudioRef.current?.pause();
    nativeHelpAudioRef.current = null;
    const nativeSpeech = getNativeHelpSpeechRequest(helpText, nativeLang);
    const activeHelpGender = teachingScene?.teacherName === "James"
      ? "male"
      : teachingScene?.teacherGender || selectedScene?.teacherGender || "female";
    const helpGender = activeHelpGender === "male" ? "MALE" : "FEMALE";
    const playHelpAudio = async (source: string, revokeOnEnd = false) => {
      const audio = new Audio(source);
      audio.playbackRate = dialogSpeechRate;
      nativeHelpAudioRef.current = audio;
      const clear = () => {
        if (nativeHelpAudioRef.current === audio) nativeHelpAudioRef.current = null;
        if (revokeOnEnd) URL.revokeObjectURL(source);
      };
      audio.onended = clear;
      audio.onerror = clear;
      await audio.play();
    };
    try {
      const neural = await googleTtsMut.mutateAsync({ text: nativeSpeech.text.slice(0, 500), languageCode: nativeSpeech.language, gender: helpGender });
      if (neural.audioUrl) {
        await playHelpAudio(neural.audioUrl);
        return;
      }
    } catch { /* Use the other neural provider below. */ }
    try {
      const neural = await ttsMut.mutateAsync({ text: nativeSpeech.text.slice(0, 500), voiceLang: nativeSpeech.language, gender: activeHelpGender });
      if (neural.success && neural.audioBase64) {
        const bytes = Uint8Array.from(atob(neural.audioBase64), (char) => char.charCodeAt(0));
        await playHelpAudio(URL.createObjectURL(new Blob([bytes], { type: "audio/mp3" })), true);
        return;
      }
    } catch { /* Do not use browser speech for native guidance either. */ }
    setDlgAudioNotice("A explicação está pronta abaixo. Leia no seu ritmo e toque em Ouvir novamente quando quiser continuar.");
  }, [dialogSpeechRate, googleTtsMut, nativeLang, ttsMut]);

  // Scene selection is the sole boundary for a teaching session. Reset every
  // coupled visual/audio state together so no prior scene can bleed into it.
  useEffect(() => {
    if (!selectedScene) return;
    stopTeacherAudio();
    setDlgOpen(false);
    setDlgStep(0);
    setDlgWords([]);
    setDlgWordIdx(0);
    setDlgAudioClock(false);
    activeDialogLineRef.current = null;
    activeDialogWordCountRef.current = 0;
    setDlgAnswer(null);
    setDlgWrittenAnswer("");
    setDlgFeedback("");
    setDlgTutorSpokenText("");
    setDlgAudioNotice("");
    setDlgTutorHistory([]);
    setDlgTutorLoading(false);
    setDlgSuggestedHotspot(null);
    setDlgIsRecording(false);
    setDlgIsProcessingSpeech(false);
    dlgRecordingSessionRef.current += 1;
    setActiveHotspot(null);
    setActiveJamesClipId(null);
    setActiveSophieClipId(null);
    pendingJamesClipIdRef.current = null;
    pendingSophieClipIdRef.current = null;
    setLearnedWords(new Set());
    setQuizIndex(0);
    setQuizFeedback(null);
    setGreetingText(getSceneObjectGuidancePt(selectedScene));
    setShowGreeting(true);
    if (greetingTimerRef.current) clearTimeout(greetingTimerRef.current);
    greetingTimerRef.current = setTimeout(() => setShowGreeting(false), 6000);
    return () => {
      if (greetingTimerRef.current) clearTimeout(greetingTimerRef.current);
      nativeHelpAudioRef.current?.pause();
      nativeHelpAudioRef.current = null;
      dlgRecordingSessionRef.current += 1;
      if (dlgRecorderRef.current?.state === "recording") dlgRecorderRef.current.stop();
      dlgRecordingStreamRef.current?.getTracks().forEach((track) => track.stop());
      dlgRecordingStreamRef.current = null;
    };
  }, [selectedScene?.id, stopTeacherAudio]);

  const startDialog = useCallback((scene: Scene) => {
    const dialogueScene = activeTeachingScene ?? scene;
    // O cartão de objeto não pode ficar sobre o diálogo nem manter seu áudio
    // ativo quando o aluno inicia a fala principal do professor.
    setActiveHotspot(null);
    setPracticeHotspot(null);
    stopTeacherAudio();
    setDialogAuthRequired(false);
    // Toda nova abertura recomeça compacta para não encobrir professor, hotspots ou controles.
    setDlgExpanded(false);
    setDlgOpen(true); setDlgStep(0); setDlgAnswer(null); setDlgWrittenAnswer(""); setDlgFeedback(""); setDlgTutorSpokenText(""); setDlgAudioNotice(""); setDlgSuggestedHotspot(null); setDlgTutorHistory([]); setDlgTutorLoading(false);
    if (dialogueScene.id === "cafe" && dialogueScene.teacherName === "Sophie") playSophieCafeClip("sophie-cafe-greeting");
    const line = activeSceneDialog[0];
    if (!line) return;
    if (shouldStartSceneTeacherAudio(line)) {
      const words = line.text.split(' ');
      setDlgWords(words); setDlgWordIdx(words.length);
      activeDialogLineRef.current = line.text;
      activeDialogWordCountRef.current = words.length;
      setDlgAudioClock(false);
      const teacherSpeech = getImmersiveDialogTeacherSpeech(line.text, dialogueScene);
      primeDialogAudioFromGesture();
      if (dialogueScene.id === "beach" && dialogueScene.teacherName === "James" && teacherSpeech.text === JAMES_TROPICAL_INTRO_LINE) {
        // Restaura a rota que já funcionava: a fala masculina é o relógio
        // real e libera a gravação lateral apenas em audio.onplaying.
        // O MP4 experimental não pode substituir esta rota sem validação
        // humana positiva na cena publicada.
        playJamesTropicalClip("james-tropical-greeting");
        void playTeacherAudio(
          JAMES_TROPICAL_INTRO_FALLBACK_URL,
          JAMES_TROPICAL_INTRO_LINE,
          "en-US",
          "james-tropical-introduction",
          false,
          true,
        );
      } else {
        requestSpeechSafely(teacherSpeech.text, teacherSpeech.language, teacherSpeech.gender, teacherSpeech.purpose, true);
      }
    } else {
      activeDialogLineRef.current = null;
      activeDialogWordCountRef.current = 0;
      setDlgAudioClock(false);
      setDlgWords([]); setDlgWordIdx(0);
    }
  }, [activeSceneDialog, activeTeachingScene, playJamesTropicalClip, playSophieCafeClip, playTeacherAudio, primeDialogAudioFromGesture, requestSpeechSafely, stopTeacherAudio]);
  useEffect(() => {
    if (isSpeaking && activeDialogLineRef.current && !dlgOpen) {
      setDlgOpen(true);
    }
  }, [dlgOpen, isSpeaking]);
  useEffect(() => {
    if (!dlgOpen || dlgAudioClock || dlgWords.length === 0 || dlgWordIdx >= dlgWords.length) return;
    dlgTimerRef.current = setTimeout(() => setDlgWordIdx(i => i + 1), Math.round(300 / dialogSpeechRate));
    return () => { if (dlgTimerRef.current) clearTimeout(dlgTimerRef.current); };
  }, [dialogSpeechRate, dlgAudioClock, dlgOpen, dlgWords, dlgWordIdx]);
  const dlgNext = useCallback(() => {
    if (!selectedScene) return;
    const dialogueScene = activeTeachingScene ?? selectedScene;
    const next = dlgStep + 1;
    if (next >= activeSceneDialog.length) {
      activeDialogLineRef.current = null;
      activeDialogWordCountRef.current = 0;
      setDlgAudioClock(false);
      setDlgOpen(false);
      return;
    }
    setDlgStep(next); setDlgAnswer(null); setDlgWrittenAnswer(""); setDlgFeedback(""); setDlgTutorSpokenText(""); setDlgAudioNotice(""); setDlgSuggestedHotspot(null); setDlgIsRecording(false); setDlgIsProcessingSpeech(false); setDlgTutorLoading(false);
    const line = activeSceneDialog[next];
    if (shouldStartSceneTeacherAudio(line)) {
      const words = line.text.split(' ');
      setDlgWords(words); setDlgWordIdx(words.length);
      activeDialogLineRef.current = line.text;
      activeDialogWordCountRef.current = words.length;
      setDlgAudioClock(false);
      const teacherSpeech = getImmersiveDialogTeacherSpeech(line.text, dialogueScene);
      primeDialogAudioFromGesture();
      requestSpeechSafely(teacherSpeech.text, teacherSpeech.language, teacherSpeech.gender, teacherSpeech.purpose, true);
    } else {
      activeDialogLineRef.current = null;
      activeDialogWordCountRef.current = 0;
      setDlgAudioClock(false);
      setDlgWords([]); setDlgWordIdx(0);
    }
  }, [activeSceneDialog, activeTeachingScene, dlgStep, primeDialogAudioFromGesture, requestSpeechSafely, selectedScene]);

  const askImmersiveTutor = useCallback(async (answer: string) => {
    const scene = activeTeachingScene ?? selectedScene;
    const question = answer.trim();
    if (!scene || !question) return;
    const requestId = ++dlgTutorRequestRef.current;
    primeDialogAudioFromGesture();
    setDlgTutorLoading(true);
    setDlgAudioNotice("");
    const fallback = getFreeDialogQuestionReply(question, scene.hotspots);
    const immediateReply = fallback?.immediate
      ? fallback.text.replace(/^[^:]+:\s*/, "")
      : `${scene.teacherName}: I heard you. I will help you practise this lesson step by step.`;
    const immediateFeedback = `${scene.teacherName}: ${immediateReply.replace(/^[^:]+:\s*/, "")}${fallback?.immediate && fallback.nativeText ? `\n${nativeLangLabel}: ${fallback.nativeText}` : ""}`;
    const immediateSpokenText = immediateReply.replace(/^[^:]+:\s*/, "");
    if (scene.id === "beach" && scene.teacherName === "James") {
      const objectClipId = fallback?.hotspotId
        ? ({
            palm: "james-tropical-point-palm",
            wave: "james-tropical-point-wave",
            ocean: "james-tropical-point-ocean",
            sand: "james-tropical-point-sand",
          } as const)[fallback.hotspotId as "palm" | "wave" | "ocean" | "sand"]
        : null;
      // Para perguntas livres, o gesto lateral existente é apenas temporal:
      // fica pendente até o player único confirmar onplaying e nunca simula
      // sincronia labial com uma frase diferente.
      playJamesTropicalClip(objectClipId || "james-tropical-greeting");
    }
    setDlgFeedback(immediateFeedback);
    setDlgTutorSpokenText(immediateSpokenText);
    setDlgTutorHistory((history) => [...history, { role: "user" as const, content: question }, { role: "assistant" as const, content: immediateReply.replace(/^[^:]+:\s*/, "") }].slice(-8));
    requestSpeechSafely(immediateReply.replace(/^[^:]+:\s*/, ""), scene.teacherLang, scene.teacherGender, "teacher", true);
    // A resposta imediata continua visível e falada sem atraso. O tutor
    // protegido segue em segundo plano para ampliar o contexto da lição,
    // mas não repete a fala que já foi entregue ao aluno.
    if (fallback?.immediate) {
      setDlgTutorLoading(false);
    }
    const loadingTimeout = window.setTimeout(() => {
      if (requestId === dlgTutorRequestRef.current) {
        setDlgTutorLoading(false);
        setDlgFeedback((current) => current || immediateFeedback);
      }
    }, 10_000);
    try {
      const result = await immersiveSceneTutorMut.mutateAsync({
        teacherName: scene.teacherName,
        targetLanguage: currentLangInfo.name,
        targetLocale: scene.teacherLang,
        nativeLanguage: nativeLang || "pt-BR",
        sceneTitle: scene.nameEn,
        sceneDescription: activeSceneDialog.find((line) => line.speaker === "teacher")?.text || scene.nameEn,
        locationDisclosure: getSceneLocationDisclosure(scene),
        vocabulary: scene.hotspots.map((hotspot) => ({ label: hotspot.label, translation: hotspot.translation, example: hotspot.example })),
        studentMessage: question,
        history: dlgTutorHistory.slice(-6),
      });
      if (requestId !== dlgTutorRequestRef.current) return;
      const targetReply = result.targetReply.trim() || fallback?.text.replace(/^[^:]+:\s*/, "") || "I can help you practise this lesson. What would you like to learn?";
      const feedbackPrefix = `${scene.teacherName}: ${targetReply}`;
      setDlgFeedback(feedbackPrefix);
      setDlgTutorSpokenText(targetReply);
      setDlgTutorHistory((history) => [...history, { role: "assistant" as const, content: targetReply }].slice(-8));
      const relatedHotspot = fallback?.hotspotId
        ? scene.hotspots.find((hotspot) => hotspot.id === fallback.hotspotId) || null
        : null;
      setDlgSuggestedHotspot(relatedHotspot);
      if (!fallback?.immediate) {
        requestSpeechSafely(targetReply, scene.teacherLang, scene.teacherGender, "teacher");
      }
      void dialogTranslateMut.mutateAsync({ text: targetReply, sourceLanguage: scene.teacherLang, targetLanguage: nativeLang || "pt-BR" })
        .then((translation) => {
          if (requestId === dlgTutorRequestRef.current && translation.translation) {
            setDlgFeedback(`${feedbackPrefix}\n${nativeLangLabel}: ${translation.translation}`);
          }
        })
        .catch(() => undefined);
    } catch {
      if (requestId !== dlgTutorRequestRef.current) return;
      const targetReply = fallback?.text.replace(/^[^:]+:\s*/, "") || "I can help you practise vocabulary, grammar, and new sentences from this lesson.";
      setDlgFeedback(`${scene.teacherName}: ${targetReply}`);
      setDlgTutorSpokenText(targetReply);
      if (!fallback?.immediate) {
        requestSpeechSafely(targetReply, scene.teacherLang, scene.teacherGender, "teacher");
      }
    } finally {
      window.clearTimeout(loadingTimeout);
      if (requestId === dlgTutorRequestRef.current) setDlgTutorLoading(false);
    }
  }, [activeTeachingScene, currentLangInfo.name, dialogTranslateMut, dlgTutorHistory, dlgTutorLoading, immersiveSceneTutorMut, nativeLang, nativeLangLabel, playJamesTropicalClip, primeDialogAudioFromGesture, requestSpeechSafely, selectedScene]);

  const validateDialogAnswer = useCallback((answer: string) => {
    const scene = activeTeachingScene ?? selectedScene;
    if (!scene) return;
    const line = activeSceneDialog[dlgStep];
    if (!line) return;
    const provided = answer.trim();
    if (!provided) {
      setDlgFeedback("Diga ou escreva sua resposta no idioma estudado antes de conferir.");
      return;
    }
    if (!line.options || line.correctIndex === undefined) {
      void askImmersiveTutor(provided);
      return;
    }
    const expected = line.options[line.correctIndex].trim();
    const correct = matchesImmersiveDialogAnswer(expected, provided);
    if (!correct) {
      if (scene.teacherName === "James") playJamesTropicalClip("james-tropical-retry");
      if (scene.teacherName === "Sophie") playSophieCafeClip("sophie-cafe-retry");
      void askImmersiveTutor(provided);
      return;
    }
    setDlgFeedback("Muito bem. Sua resposta em inglês está correta.");
    setDlgAnswer(line.correctIndex);
    const praiseClip = scene.teacherName === "James"
      ? playJamesTropicalClip("james-tropical-praise")
      : scene.teacherName === "Sophie"
        ? playSophieCafeClip("sophie-cafe-praise")
        : null;
    if (isAuthenticated) {
      const teacherSpeech = getImmersiveDialogTeacherSpeech(praiseClip?.dialogue || `Excellent. ${line.options[line.correctIndex]}`, scene);
      requestSpeechSafely(teacherSpeech.text, teacherSpeech.language, teacherSpeech.gender, teacherSpeech.purpose);
    }
    const referencedHotspotId = findReferencedHotspotId(line.options[line.correctIndex], scene.hotspots);
    const referencedHotspot = referencedHotspotId
      ? scene.hotspots.find((hotspot) => hotspot.id === referencedHotspotId) || null
      : null;
    setDlgSuggestedHotspot(referencedHotspot);
    if (referencedHotspot) {
      setDlgFeedback(`Muito bem. Antes de continuar, pratique “${referencedHotspot.label}” com o ciclo Pareto ou siga para a próxima fala.`);
      return;
    }
    window.setTimeout(() => dlgNext(), 1400);
  }, [activeSceneDialog, activeTeachingScene, askImmersiveTutor, dlgStep, dlgNext, isAuthenticated, playJamesTropicalClip, playSophieCafeClip, requestSpeechSafely, selectedScene]);

  const submitWrittenDialogAnswer = useCallback(() => {
    const question = dlgWrittenAnswer.trim();
    if (!question) return;
    setDlgWrittenAnswer("");
    validateDialogAnswer(question);
  }, [dlgWrittenAnswer, validateDialogAnswer]);

  const submitTeacherQuestion = useCallback(() => {
    const question = dlgWrittenAnswer.trim();
    if (!question) return;
    setDlgWrittenAnswer("");
    void askImmersiveTutor(question);
  }, [askImmersiveTutor, dlgWrittenAnswer]);

  const replayTeacherSpeechFromGesture = useCallback(() => {
    const scene = activeTeachingScene ?? selectedScene;
    if (!scene) return;
    const lineText = activeSceneDialog[dlgStep]?.text || "";
    const phrase = (dlgTutorSpokenText || activeSpeechText || lineText).trim();
    if (!phrase) return;

    // A faixa já preparada é preferida. O mesmo player liga o clipe somente
    // em onplaying, portanto não há movimento antes de áudio confirmado.
    if (dialogAudioSource && activeSpeechText.trim() === phrase) {
      void replayVisibleDialogAudio();
      return;
    }

    primeDialogAudioFromGesture();
    stopTeacherAudio();
    const requestKey = `manual-teacher:${scene.teacherLang}:${scene.teacherGender}:${phrase}`;
    activeSpeechRequestRef.current = requestKey;
    setActiveSpeechText(phrase);
    setIsPreparingNeuralAudio(true);
    if (scene.id === "beach" && scene.teacherName === "James") {
      playJamesTropicalClip("james-tropical-greeting");
    }
    // A reserva local nasce dentro do clique. Seu utterance.onstart é o único
    // ponto que pode tornar o clipe lateral visível.
    if (playLocalDialogFallback(phrase, scene.teacherLang, requestKey, scene.teacherGender)) {
      setDlgAudioNotice("");
      return;
    }
    requestSpeechSafely(phrase, scene.teacherLang, scene.teacherGender, "teacher", true);
    if (scene.id === "beach" && scene.teacherName === "James") {
      playJamesTropicalClip("james-tropical-greeting");
    }
  }, [activeSceneDialog, activeSpeechText, activeTeachingScene, dialogAudioSource, dlgStep, dlgTutorSpokenText, playJamesTropicalClip, playLocalDialogFallback, primeDialogAudioFromGesture, replayVisibleDialogAudio, requestSpeechSafely, selectedScene, stopTeacherAudio]);

  const stopDialogRecording = useCallback(() => {
    if (dlgRecorderRef.current?.state === "recording") {
      dlgRecorderRef.current.stop();
      setDlgIsRecording(false);
    }
  }, []);

  const startDialogRecording = useCallback(async () => {
    const scene = selectedScene;
    if (!scene || dlgAnswer !== null || dlgIsProcessingSpeech) return;
    if (!window.confirm("Ativar microfone para responder nesta cena? O áudio será usado apenas para transcrever sua resposta e será encerrado ao concluir.")) return;

    try {
      const stream = await requestMicrophoneStream();
      const recorder = createAudioRecorder(stream);
      const chunks: Blob[] = [];
      const recordingSession = ++dlgRecordingSessionRef.current;
      dlgRecorderRef.current = recorder;
      dlgRecordingStreamRef.current = stream;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        if (dlgRecordingStreamRef.current === stream) dlgRecordingStreamRef.current = null;
        if (dlgRecorderRef.current === recorder) dlgRecorderRef.current = null;
        if (recordingSession !== dlgRecordingSessionRef.current) return;
        setDlgIsRecording(false);
        if (!chunks.length) {
          setDlgFeedback("Vamos tentar mais uma vez: comece a falar depois de tocar em Gravar.");
          return;
        }
        setDlgIsProcessingSpeech(true);
        try {
          const transcription = await dialogTranscribeMut.mutateAsync({
            audioData: await audioBlobToDataUrl(new Blob(chunks, { type: recorder.mimeType || "audio/webm" })),
            language: scene.teacherLang.split("-")[0],
          });
          if (recordingSession !== dlgRecordingSessionRef.current) return;
          const spokenText = transcription.text.trim();
          setDlgWrittenAnswer(spokenText);
          if (!spokenText) {
            setDlgFeedback("Vamos praticar de outro modo: fale um pouco mais devagar ou escreva sua resposta.");
            return;
          }
          validateDialogAnswer(spokenText);
        } catch {
          console.info("[immersive-dialogue] transcription-unavailable");
          setDlgFeedback("Sua resposta pode ser enviada por escrito enquanto você prepara uma nova tentativa de fala.");
        } finally {
          setDlgIsProcessingSpeech(false);
        }
      };
      recorder.start();
      setDlgFeedback("Gravando sua resposta. Toque em Parar quando terminar.");
      setDlgIsRecording(true);
    } catch {
      console.info("[immersive-dialogue] microphone-capture-unavailable");
      setDlgFeedback("Escolha escrever sua resposta agora ou tente a gravação novamente quando estiver pronto.");
    }
  }, [dialogTranscribeMut, dlgAnswer, dlgIsProcessingSpeech, selectedScene, validateDialogAnswer]);
  const handleAddParetoToNotebook = useCallback((word: ParetoWord) => {
    addToNotebook({
      word: word.enUS,
      translation: word.ptBR,
      pronunciation: word.pronunciation,
      example: word.example,
      examplePt: word.examplePt,
      langCode: effectiveLang(selectedScene || { teacherLang: "en-US" }),
      scene: selectedScene?.name || "Vocabulário Pareto",
    });
    setNotebookCount(loadNotebook().length);
  }, [selectedScene]);



  const handleEnterScene = useCallback((scene: Scene) => {
    setSelectedScene(scene);
    setParticles(false);
  }, []);

  const handleHotspotClick = useCallback((hotspot: Hotspot) => {
    if (!selectedScene) return;
    const activeTeacherScene = teachingScene ?? selectedScene;
    setActiveHotspot(hotspot);
    setParticles(true);
    setTimeout(() => setParticles(false), 1000);
    if (!learnedWords.has(hotspot.id)) {
      setLearnedWords(prev => { const next = new Set(Array.from(prev)); next.add(hotspot.id); return next; });
      setScore(prev => prev + 10);
    }
    // Auto-save to notebook
    addToNotebook({
      word: hotspot.label,
      translation: hotspot.translation,
      pronunciation: hotspot.pronunciation,
      example: hotspot.example,
      examplePt: hotspot.examplePt,
      langCode: effectiveLang(selectedScene),
      scene: selectedScene.name,
    });
    setNotebookCount(loadNotebook().length);
    const interaction = createImmersiveHotspotInteraction(hotspot, activeTeacherScene);
    setGreetingText(interaction.greeting);
    setShowGreeting(true);
    // A fala do objeto sempre usa o idioma da cena; tradução fica só como apoio visual.
    const jamesObjectClipId = activeTeacherScene.teacherName === "James"
      ? ({
        palm: "james-tropical-point-palm",
        wave: "james-tropical-point-wave",
        ocean: "james-tropical-point-ocean",
        sand: "james-tropical-point-sand",
      } as const)[hotspot.id]
      : null;
    const objectFocusClip = jamesObjectClipId
      ? playJamesTropicalClip(jamesObjectClipId)
      : activeTeacherScene.teacherName === "Sophie" && hotspot.id === "croissant"
        ? playSophieCafeClip("sophie-cafe-point-croissant")
        : null;
    if (objectFocusClip) {
      requestSpeechSafely(objectFocusClip.dialogue, interaction.speech.language, interaction.speech.gender, interaction.speech.purpose);
    } else {
      requestSpeechSafely(interaction.speech.text, interaction.speech.language, interaction.speech.gender, interaction.speech.purpose);
    }
    setTimeout(() => setShowGreeting(false), 5000);
  }, [selectedScene, teachingScene, learnedWords, nativeLang, playJamesTropicalClip, playSophieCafeClip, requestSpeechSafely]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  }, []);

  const filteredScenes = IMMERSIVE_SCENES.filter(s => {
    if (filter !== "all" && sceneCefrLevel(s) !== filter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) &&
        !s.nameEn.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    // Sort: scenes matching the user's target language come first
    const base = (targetLang || "").split("-")[0].toLowerCase();
    const aMatch = base && (a.langCode === base || a.teacherLang.startsWith(base)) ? 0 : 1;
    const bMatch = base && (b.langCode === base || b.teacherLang.startsWith(base)) ? 0 : 1;
    return aMatch - bMatch;
  });

  const cefrColor = (level: ImmersiveCEFRLevel) =>
    level === "A1" || level === "A2" ? "#22c55e" : level === "B1" || level === "B2" ? "#f59e0b" : "#ef4444";
  const cefrLabel = (level: ImmersiveCEFRLevel) => IMMERSIVE_CEFR_LEVELS.find((item) => item.value === level)?.label || level;

  if (isAuthLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-slate-100">
        <p className="text-sm font-semibold">Preparando seu espaço de aprendizagem…</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#1e3a8a,_#0f172a_58%,_#020617)] px-6 text-center text-slate-100">
        <section className="max-w-md rounded-3xl border border-cyan-200/20 bg-slate-950/75 p-8 shadow-2xl backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">MultiLingue Universal</p>
          <h1 className="mt-3 text-2xl font-black">Sua jornada de aprendizagem está protegida</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">Entre para acessar as cenas, professores, materiais de estudo e o seu progresso pessoal.</p>
          <button
            type="button"
            onClick={() => { window.location.href = getLoginUrl(); }}
            className="mt-6 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
          >
            Entrar para aprender
          </button>
          <button
            type="button"
            onClick={() => setLocation("/")}
            className="mt-3 block w-full text-sm font-semibold text-slate-300 hover:text-white"
          >
            Voltar ao início
          </button>
        </section>
      </main>
    );
  }

  // ── Scene View ──
  if (selectedScene) {
    return (
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden select-none"
        style={{ height: "100dvh", background: "#000" }}
        onMouseMove={handleMouseMove}
        onClick={() => { if (activeHotspot) setActiveHotspot(null); }}
      >
        {/* CSS Animations */}
        <style>{`
          /* ── Professor breathing (idle) ── */
          @keyframes teacher-breathe {
            0%,100% { transform: scaleY(1) translateY(0); }
            50% { transform: scaleY(1.018) translateY(-4px); }
          }
          /* ── Natural head sway (gentle side-to-side) ── */
          @keyframes head-sway {
            0%,100% { transform: rotate(0deg) translateY(0); }
            25% { transform: rotate(-1.5deg) translateY(-2px); }
            50% { transform: rotate(0deg) translateY(-3px); }
            75% { transform: rotate(1.5deg) translateY(-2px); }
          }
          /* ── Eye blink (natural every 3-5 seconds) ── */
          @keyframes eye-blink {
            0%, 92%, 100% { transform: translateX(-50%) scaleY(1); opacity: 0; }
            94%, 96% { transform: translateX(-50%) scaleY(0.1); opacity: 0.8; background: rgba(0,0,0,0.15); }
            98% { transform: translateX(-50%) scaleY(1); opacity: 0; }
          }
          @keyframes brow-focus {
            0%,100% { transform: translateY(0) rotate(0deg); opacity: .46; }
            50% { transform: translateY(-2px) rotate(-2deg); opacity: .78; }
          }
          @keyframes cheek-warmth {
            0%,100% { opacity: .25; transform: scale(.94); }
            50% { opacity: .72; transform: scale(1.04); }
          }
          /* ── Mouth talk (lip-sync simulation) ── */
          @keyframes mouth-talk {
            0% { transform: translateX(-50%) scaleY(0.3); width: 8%; }
            20% { transform: translateX(-50%) scaleY(1); width: 14%; }
            40% { transform: translateX(-50%) scaleY(0.5); width: 10%; }
            60% { transform: translateX(-50%) scaleY(0.8); width: 12%; }
            80% { transform: translateX(-50%) scaleY(0.4); width: 9%; }
            100% { transform: translateX(-50%) scaleY(0.6); width: 11%; }
          }
          /* ── Hand gesture (teacher explaining) ── */
          @keyframes hand-gesture {
            0%, 100% { transform: translateX(0) rotate(0deg); opacity: 0; }
            10% { opacity: 0.6; }
            30% { transform: translateX(8px) rotate(5deg); opacity: 0.8; }
            50% { transform: translateX(-5px) rotate(-3deg); opacity: 0.6; }
            70% { transform: translateX(6px) rotate(4deg); opacity: 0.7; }
            90% { opacity: 0.3; }
          }
          /* ── Natural transition between idle and speaking ── */
          @keyframes natural-transition {
            0% { transform: scale(1) translateY(0); }
            50% { transform: scale(1.01) translateY(-2px); }
            100% { transform: scale(1) translateY(0); }
          }
          /* ── Professor talking (lip-sync simulation) ── */
          @keyframes teacher-talk {
            0%   { transform: translateY(0)    scaleY(1); }
            25%  { transform: translateY(-1px) scaleY(1.005); }
            50%  { transform: translateY(-2px) scaleY(1.01); }
            75%  { transform: translateY(-1px) scaleY(1.005); }
            100% { transform: translateY(0)    scaleY(1); }
          }
          /* ── Lip-sync overlay (mouth movement) ── */
          @keyframes lip-sync {
            0%,100% { transform: scaleY(1) scaleX(1); }
            10%     { transform: scaleY(1.4) scaleX(0.95); }
            20%     { transform: scaleY(0.8) scaleX(1.05); }
            35%     { transform: scaleY(1.5) scaleX(0.92); }
            50%     { transform: scaleY(0.7) scaleX(1.08); }
            65%     { transform: scaleY(1.3) scaleX(0.96); }
            80%     { transform: scaleY(0.9) scaleX(1.03); }
          }
          /* ── Head nod (natural movement) ── */
          @keyframes head-nod {
            0%,100% { transform: rotate(0deg) translateY(0); }
            20%     { transform: rotate(-2deg) translateY(-2px); }
            40%     { transform: rotate(1.5deg) translateY(1px); }
            60%     { transform: rotate(-1deg) translateY(-1px); }
            80%     { transform: rotate(2deg) translateY(0); }
          }
          /* ── Professor wave ── */
          @keyframes professor-wave {
            0%, 100% { transform: rotate(0deg); transform-origin: 80% 20%; }
            20%  { transform: rotate(18deg); transform-origin: 80% 20%; }
            40%  { transform: rotate(-12deg); transform-origin: 80% 20%; }
            60%  { transform: rotate(15deg); transform-origin: 80% 20%; }
            80%  { transform: rotate(-8deg); transform-origin: 80% 20%; }
          }
          /* ── Professor nod ── */
          @keyframes professor-nod {
            0%, 100% { transform: rotateX(0deg) translateY(0); transform-origin: center top; }
            25%  { transform: rotateX(-10deg) translateY(-3px); }
            75%  { transform: rotateX(8deg) translateY(2px); }
          }
          /* ── Professor celebrate (bounce) ── */
          @keyframes professor-celebrate {
            0%, 100% { transform: scale(1) translateY(0); }
            30%  { transform: scale(1.06) translateY(-10px); }
            60%  { transform: scale(0.98) translateY(3px); }
            80%  { transform: scale(1.03) translateY(-5px); }
          }
          /* ── Hotspot float: defined in index.css as .hs-float / .hs-float-N ── */
          /* ── Teacher speaking ring ── */
          @keyframes teacher-ring {
            0%   { transform: scale(1); opacity: 0.9; }
            100% { transform: scale(2.5); opacity: 0; }
          }
          /* ── Sound bars (speaking indicator) ── */
          @keyframes sound-bar {
            0%   { transform: scaleY(0.3); }
            50%  { transform: scaleY(1); }
            100% { transform: scaleY(0.3); }
          }
          /* ── Particle fly (word learned) ── */
          @keyframes particle-fly {
            0%   { transform: translate(0,0) scale(1) rotate(0deg); opacity: 1; }
            100% { transform: translate(${Math.random() > 0.5 ? "" : "-"}${40 + Math.random() * 60}px, -${60 + Math.random() * 80}px) scale(0) rotate(180deg); opacity: 0; }
          }
          /* ── Label pop in ── */
          @keyframes label-pop {
            0%   { transform: scale(0.6) translateY(8px); opacity: 0; }
            70%  { transform: scale(1.05) translateY(-2px); opacity: 1; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
          /* ── Vocab card slide in ── */
          @keyframes vocab-slide-in {
            0%   { transform: scale(0.82) translateY(14px); opacity: 0; }
            70%  { transform: scale(1.02) translateY(-2px); opacity: 1; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
          /* ── Greeting text scroll ── */
          @keyframes greeting-scroll {
            0%   { transform: translateY(20px); opacity: 0; }
            15%  { transform: translateY(0); opacity: 1; }
            75%  { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-20px); opacity: 0; }
          }
          /* ── Scene card hover lift ── */
          @keyframes card-lift {
            0%   { transform: translateY(0) scale(1); }
            100% { transform: translateY(-6px) scale(1.02); }
          }
          /* ── Correct answer flash ── */
          @keyframes correct-flash {
            0%,100% { background: rgba(34,197,94,0.0); }
            30%     { background: rgba(34,197,94,0.35); }
            60%     { background: rgba(34,197,94,0.15); }
          }
          /* ── Wrong answer shake ── */
          @keyframes wrong-shake {
            0%,100% { transform: translateX(0); }
            20%     { transform: translateX(-8px); }
            40%     { transform: translateX(8px); }
            60%     { transform: translateX(-5px); }
            80%     { transform: translateX(5px); }
          }
          /* ── Floating score +1 ── */
          @keyframes score-float {
            0%   { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(-50px) scale(1.4); opacity: 0; }
          }
          /* ── Hotspot discovered glow ── */
          @keyframes discovered-glow {
            0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
            50%     { box-shadow: 0 0 20px 8px rgba(34,197,94,0.6); }
          }
          /* ── Smooth button press ── */
          .btn-press:active { transform: scale(0.95); transition: transform 0.12s cubic-bezier(0.23,1,0.32,1); }
          .btn-press { transition: transform 0.16s cubic-bezier(0.23,1,0.32,1), opacity 0.16s; }
          .btn-press:hover { opacity: 0.9; }
          /* ── Scene card hover ── */
          .scene-card { transition: transform 0.22s cubic-bezier(0.23,1,0.32,1), box-shadow 0.22s; }
          .scene-card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 16px 40px rgba(0,0,0,0.5); }
          /* ── Hotspot hover ── */
          .hotspot-btn { transition: transform 0.15s cubic-bezier(0.23,1,0.32,1); }
          .hotspot-btn:hover { transform: translate(-50%,-50%) scale(1.15); }
          /* ── Compact mobile scene controls: preserve hotspots and a safe lower dialogue area. ── */
          @media (max-width: 640px) {
            .immersive-hud {
              padding: 8px !important;
              gap: 6px;
              align-items: flex-start !important;
            }
            .immersive-hud-title { display: none !important; }
            .immersive-hud-actions {
              gap: 4px !important;
              max-width: calc(100vw - 92px);
              overflow-x: auto;
              scrollbar-width: none;
            }
            .immersive-hud-actions::-webkit-scrollbar { display: none; }
            .immersive-hud-actions > :nth-child(n+5) { display: none !important; }
            .immersive-teacher {
              right: 8px !important;
              width: 112px !important;
            }
            .immersive-start-dialog { top: 108px !important; bottom: auto !important; }
            .immersive-dialog {
              bottom: 52px !important;
              padding-right: 116px !important;
              padding-left: 8px !important;
            }
          }
          /* ── Fade in ── */
          @keyframes fade-in {
            from { opacity: 0; } to { opacity: 1; }
          }
          @media (prefers-reduced-motion: reduce) {
            * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
          }
        `}</style>

        {/* Background with parallax — img tag so hotspot % coords align correctly on mobile */}
        {/* OLD (background-image approach — hotspots misaligned on mobile because cover crops differently):
        <div style={{ position:"absolute", inset:"-3%", backgroundImage:`url(${selectedScene.bgImage})`,
          backgroundSize:"cover", backgroundPosition:"center",
          transform:`translate(${mousePos.x*18}px,${mousePos.y*12}px)`,
          transition:"transform 0.15s ease-out", filter:"brightness(1.05) saturate(1.1)" }} />
        */}
        {/* Background image — inset:0 so hotspot % coords align perfectly on mobile */}
        <img
          src={selectedScene.bgImage}
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            filter: "brightness(1.05) saturate(1.1)",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />

        {/* Subtle vignette only at edges */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.35) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Top HUD */}
        <div
          className="immersive-hud absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-40"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)" }}
        >
          <button
            onClick={() => { stopEdgeTTS(); setLocation(sceneReturnTo); }}
            className="flex items-center gap-2 text-white font-semibold px-3 py-1.5 rounded-full"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            ← Voltar
          </button>
          <div className="immersive-hud-title flex items-center gap-2 text-white font-bold" style={{ fontSize: "clamp(13px, 1.8vw, 18px)" }}>
            <span>{selectedScene.flag}</span>
            <span>{immersionMode ? selectedScene.nameEn : selectedScene.name}</span>
          </div>
          <div className="immersive-hud-actions flex items-center gap-2">
            {/* Idioma nativo: fica oculto durante a imersão total */}
            {!immersionMode && <div
              style={{ background: "#ffffff", color: "#1d4ed8", border: "1.5px solid #93c5fd", borderRadius: "9999px", padding: "4px 10px", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}
              title={`Idioma nativo: ${nativeLang}`}
            >
              <span>{nativeLangInfo.flag}</span>
              <span style={{ textTransform: "uppercase", letterSpacing: 1 }}>{nativeLang.split("-")[0].toUpperCase()}</span>
            </div>}
            {/* Language picker button */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowLangPicker(v => !v)}
                className="flex items-center gap-1 text-white font-semibold px-3 py-1.5 rounded-full text-xs"
                style={{ background: "rgba(99,102,241,0.35)", backdropFilter: "blur(8px)", border: "1px solid rgba(99,102,241,0.6)" }}
                title="Mudar idioma a estudar"
              >
                {currentLangInfo.flag} {currentLangInfo.name}
              </button>
              {showLangPicker && (
                <div
                  style={{
                    position: "absolute", top: "110%", right: 0, zIndex: 100,
                    background: "rgba(15,12,41,0.97)", backdropFilter: "blur(16px)",
                    border: "1px solid rgba(99,102,241,0.5)", borderRadius: 12,
                    padding: 8, minWidth: 180, maxHeight: 280, overflowY: "auto",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.6)"
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700, padding: "4px 8px 8px", textTransform: "uppercase", letterSpacing: 1 }}>Estudar idioma</div>
                  {Object.entries(LANG_LABELS).map(([code, info]) => (
                    <button
                      key={code}
                      onClick={() => handleSelectTargetLang(code)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        width: "100%", padding: "6px 10px", borderRadius: 8,
                        background: targetLang === code ? "rgba(99,102,241,0.6)" : "transparent",
                        color: targetLang === code ? "#ffffff" : "rgba(255,255,255,0.75)",
                        fontSize: 13, fontWeight: targetLang === code ? 700 : 400,
                        border: targetLang === code ? "1px solid rgba(167,139,250,0.8)" : "1px solid transparent",
                        cursor: "pointer", textAlign: "left"
                      }}
                    >
                      <span>{info.flag}</span>
                      <span>{info.name}</span>
                      <span style={{ color: "#6b7280", fontSize: 11, marginLeft: "auto" }}>{code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {targetLanguageBlockIsPlanned && !immersionMode && (
              <span
                className="rounded-full border border-sky-300/40 bg-sky-400/15 px-2 py-1 text-[10px] font-bold text-sky-100"
                title="Este idioma será liberado em um bloco próprio, após a localização e a validação pedagógica."
              >
                Bloco em preparação
              </span>
            )}
            {sceneTeacherResolution.materialIsInTargetLanguage && compatibleSceneTeachers.length > 0 && !immersionMode && (
              <label className="hidden items-center gap-1 rounded-full border border-white/20 bg-slate-950/55 px-2 py-1 text-xs text-white lg:flex" title="Professor compatível com o idioma estudado">
                <span className="sr-only">Professor da cena</span>
                <select
                  value={selectedSceneTeacherId || activeSceneTeacher?.id || ""}
                  onChange={(event) => setSelectedSceneTeacherId(event.target.value || null)}
                  className="max-w-32 bg-transparent text-xs font-semibold text-white outline-none"
                  aria-label="Professor da cena"
                >
                  {compatibleSceneTeachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id} className="bg-slate-950 text-white">
                      {teacher.flag} {teacher.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <ImmersionModeToggle compact />
            {!immersionMode && canUseAuthorizedSceneInteractions && <>
              <div className="hidden sm:block">
                <VoiceSelector
                  langCode={targetLang || effectiveLang(selectedScene)}
                  langName={currentLangInfo.name || selectedScene.name}
                  compact
                />
              </div>
              <NotebookButton onClick={() => setNotebookOpen(true)} count={notebookCount} />
              <button
                onClick={() => setParetoOpen(true)}
                className="flex items-center gap-1 text-white font-semibold px-3 py-1.5 rounded-full text-xs"
                style={{ background: "rgba(20,184,166,0.25)", backdropFilter: "blur(8px)", border: "1px solid rgba(20,184,166,0.6)" }}
                title="Vocabulário Pareto 1000+"
              >
                📚 Pareto
              </button>
              <div
                className="flex items-center gap-1 text-yellow-400 font-bold px-3 py-1.5 rounded-full"
                style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
              >
                ⭐ {score}
              </div>
              <button
                type="button"
                onClick={(event) => { event.stopPropagation(); setQuizFeedback(null); setQuizOpen((open) => !open); }}
                className="rounded-full px-3 py-1.5 text-xs font-bold text-white transition hover:scale-105"
                style={{ background: "rgba(99,102,241,.88)", backdropFilter: "blur(8px)" }}
              >
                {quizOpen ? "Fechar quiz" : "Quiz da cena"}
              </button>
              <div
                className="text-white px-3 py-1.5 rounded-full"
                style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", fontSize: "clamp(11px, 1.3vw, 14px)" }}
              >
                {learnedWords.size}/{activeSceneHotspots.length}
              </div>
            </>}
          </div>
        </div>

        {!immersionMode && isAuthenticated && <FlyingSOSBook compact className="fixed bottom-4 left-4 z-[90]" />}

        {/* AR Hotspots */}
        {canUseAuthorizedSceneInteractions && activeSceneHotspots.map((hotspot) => {
          const learned = learnedWords.has(hotspot.id);
          return (
            <div
              key={hotspot.id}
              style={{
                position: "absolute",
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 20,
                cursor: "pointer",
              }}
              onClick={(e) => { e.stopPropagation(); handleHotspotClick(hotspot); }}
            >
              {/* Float wrapper: CSS class hs-float-N — translateY only, no inline style conflict */}
              <div className={learned ? undefined : `hs-float hs-float-${hotspot.id.charCodeAt(hotspot.id.length - 1) % 10}`}>
              {/* Main button — clean, no glow, no ring */}
              <div
                style={{
                  width: "clamp(44px, 5.5vw, 58px)",
                  height: "clamp(44px, 5.5vw, 58px)",
                  borderRadius: "50%",
                  background: learned
                    ? `${hotspot.color}33`
                    : `linear-gradient(135deg, ${hotspot.color}cc, ${hotspot.color}88)`,
                  border: `2.5px solid ${hotspot.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "clamp(18px, 2.2vw, 26px)",
                  backdropFilter: "blur(8px)",
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1.12)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; }}
              >
                {learned ? "✓" : <HotspotVisual hotspot={hotspot} size={24} />}
              </div>
              {/* Label always visible — translated to student's target language */}
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(0,0,0,0.85)",
                  color: "#fff",
                  padding: "3px 8px",
                  borderRadius: "20px",
                  fontSize: "clamp(9px, 1.1vw, 12px)",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  border: `1px solid ${hotspot.color}66`,
                  backdropFilter: "blur(4px)",
                  animation: "label-pop 0.3s ease-out",
                }}
              >
                {hotspot.label}
              </div>
              </div>{/* end float wrapper */}
            </div>
          );
        })}

        {/* Vocabulary Card */}
        {canUseAuthorizedSceneInteractions && activeHotspot && (
          <div
            style={{ animation: "vocab-slide-in 0.25s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <VocabCard
              hotspot={activeHotspot}
              langCode={targetLang || effectiveLang(selectedScene)}
              nativeLang={nativeLang}
              nativeLangFlag={nativeLangInfo?.flag || "🇧🇷"}
              onClose={() => {
                setActiveHotspot(null);
                setActiveJamesClipId(null);
                setActiveSophieClipId(null);
              }}
              onSpeak={(text, language, mode) => {
                const activeTeacherScene = teachingScene ?? selectedScene;
                const jamesObjectClipId = (mode === "object" || mode === "example") && activeTeacherScene.teacherName === "James"
                  ? ({
                    palm: "james-tropical-point-palm",
                    wave: "james-tropical-point-wave",
                    ocean: "james-tropical-point-ocean",
                    sand: "james-tropical-point-sand",
                  } as const)[activeHotspot.id]
                  : null;
                const objectFocusClip = jamesObjectClipId ? playJamesTropicalClip(jamesObjectClipId) : null;
                requestSpeechSafely(
                  mode === "object" ? objectFocusClip?.dialogue ?? text : text,
                  language,
                  activeTeacherScene.teacherGender,
                  "hotspot",
                );
              }}
              onPractice={() => setPracticeHotspot(activeHotspot)}
            />
          </div>
        )}

        {canUseAuthorizedSceneInteractions && practiceHotspot && (
          <ParetoPracticeCycle
            term={{ word: practiceHotspot.label, translation: practiceHotspot.translation, example: practiceHotspot.example }}
            onClose={() => setPracticeHotspot(null)}
            onSpeak={(text) => requestSpeechSafely(text, (teachingScene ?? selectedScene).teacherLang, (teachingScene ?? selectedScene).teacherGender, "hotspot")}
            level={sceneCefrLevel(selectedScene)}
          />
        )}

        {canUseAuthorizedSceneInteractions && quizOpen && quizQuestion && (
          <div
            className="absolute left-1/2 top-1/2 z-40 w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border p-5 shadow-2xl"
            style={{ background: "rgba(15,23,42,.95)", borderColor: "rgba(129,140,248,.65)", backdropFilter: "blur(18px)" }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Quiz da cena"
          >
            <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-indigo-200">
              <span>Estrela da cena</span>
              <span>+10 XP</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setQuizHintVisible(true);
                requestSpeechSafely(quizQuestion.example, (teachingScene ?? selectedScene).teacherLang, (teachingScene ?? selectedScene).teacherGender, "hotspot");
              }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-amber-300/60 bg-amber-300/15 text-amber-200 shadow-lg transition hover:scale-105 hover:bg-amber-300/25"
              aria-label="Ouvir pista do professor para o objeto escondido"
            >
              <Star className="h-10 w-10 fill-current" aria-hidden="true" />
            </button>
            <p className="mb-1 text-center text-sm text-slate-300">Toque na estrela para ouvir a pista do professor. Qual objeto ela esconde?</p>
            {quizHintVisible && (
              <div className="mb-4 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-sm text-cyan-50">
                <strong>Pista:</strong> {quizQuestion.example}
              </div>
            )}
            <div className="grid gap-2">
              {quizOptions.map((option) => {
                const isCorrectOption = option === quizQuestion.translation;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleQuizAnswer(option)}
                    className="rounded-xl border px-4 py-3 text-left text-sm font-semibold text-white transition hover:border-indigo-300 hover:bg-indigo-500/20"
                    style={{
                      borderColor: quizFeedback && isCorrectOption ? "#4ade80" : quizFeedback === "wrong" && !isCorrectOption ? "rgba(248,113,113,.4)" : "rgba(148,163,184,.35)",
                      background: quizFeedback && isCorrectOption ? "rgba(34,197,94,.18)" : "rgba(255,255,255,.04)",
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {quizFeedback && (
              <div className={`mt-4 rounded-xl border p-3 ${quizFeedback === "correct" ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-100" : "border-amber-300/40 bg-amber-300/10 text-amber-100"}`}>
                <p className="text-sm font-bold">
                  {quizFeedback === "correct" ? `Correto! “${quizQuestion.label}” é ${quizQuestion.translation}.` : `Quase. A estrela escondia “${quizQuestion.label}”.`}
                </p>
                <p className="mt-1 text-sm">Diga a palavra, escreva uma frase e fixe o vocabulário no Pareto.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => requestSpeechSafely(quizQuestion.label, (teachingScene ?? selectedScene).teacherLang, (teachingScene ?? selectedScene).teacherGender, "hotspot")} className="rounded-full border border-current/50 px-3 py-1.5 text-xs font-bold hover:bg-white/10">Ouvir professor</button>
                  <button type="button" onClick={() => setPracticeHotspot(quizQuestion)} className="rounded-full border border-current/50 px-3 py-1.5 text-xs font-bold hover:bg-white/10">Fixar no Pareto</button>
                  <button type="button" onClick={advanceSceneGuess} className="rounded-full border border-current/50 px-3 py-1.5 text-xs font-bold hover:bg-white/10">Próxima estrela</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Particles */}
        <Particles active={particles} />

        {/* Teacher */}
        <TeacherAvatar
          scene={teachingScene ?? selectedScene!}
          greeting={canUseAuthorizedSceneInteractions ? greetingText : ""}
          showGreeting={canUseAuthorizedSceneInteractions && showGreeting}
          isSpeaking={canUseAuthorizedSceneInteractions && isSpeaking}
          isPreparingAudio={canUseAuthorizedSceneInteractions && isPreparingNeuralAudio}
          spokenText={canUseAuthorizedSceneInteractions ? activeSpeechText || greetingText : ""}
          audioViseme={audioViseme}
          activeClip={activeJamesClip || activeSophieClip}
          overrideName={teachingScene?.teacherName === "James" ? "James" : undefined}
          overrideImage={teachingScene?.teacherName === "James" ? JAMES_CANONICAL_PORTRAIT_URL : undefined}
          onClipFinished={() => { setActiveJamesClipId(null); setActiveSophieClipId(null); }}
          onExactClipPlaying={() => {
            setIsPreparingNeuralAudio(false);
            setIsSpeaking(true);
            if (activeDialogLineRef.current === JAMES_TROPICAL_INTRO_LINE) setDlgAudioClock(true);
          }}
          onExactClipEnded={() => {
            if (activeDialogLineRef.current === JAMES_TROPICAL_INTRO_LINE) {
              setDlgWordIdx(activeDialogWordCountRef.current);
              setDlgAudioClock(false);
            }
            setIsSpeaking(false);
            setActiveSpeechText("");
            setActiveJamesClipId(null);
            if (activeSpeechRequestRef.current === "james-tropical-introduction-exact-pair") activeSpeechRequestRef.current = null;
          }}
          onExactClipFailed={() => {
            setActiveJamesClipId(null);
            setDlgAudioClock(false);
            void playTeacherAudio(
              JAMES_TROPICAL_INTRO_FALLBACK_URL,
              JAMES_TROPICAL_INTRO_LINE,
              "en-US",
              "james-tropical-introduction",
              false,
              true,
            );
          }}
          hasPreparedSpeech={Boolean(dialogAudioSource)}
          onReplaySpeech={() => { void replayVisibleDialogAudio(); }}
        />

        {/* O elemento de áudio precisa existir também com o diálogo fechado:
            os cartões de Wave, Ocean, Palm Tree e Sand usam a mesma voz neural. */}
          <audio
            ref={dialogAudioElementRef}
            src={dialogAudioSource || undefined}
            controls={Boolean(dialogAudioSource)}
            preload="auto"
            className={dialogAudioSource
              ? "absolute z-[90] left-1/2 bottom-24 w-[min(360px,calc(100%-32px))] -translate-x-1/2 rounded-xl bg-slate-950/90 p-2 shadow-2xl"
              : "sr-only"}
            aria-label={`Áudio da fala em ${getSpokenLanguageLabel(teachingScene?.teacherLang || selectedScene?.teacherLang || targetLang)}`}
          />

        {/* ── Dialog Panel: scrolling text + exercises ── */}
        {!(dlgOpen || (isSpeaking && activeDialogLineRef.current)) && activeSceneDialog.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isAuthenticated) {
                setDialogAuthRequired(true);
                setGreetingText("Ative o acesso protegido para iniciar o diálogo desta cena.");
                setShowGreeting(true);
                return;
              }
              startDialog(teachingScene ?? selectedScene);
            }}
            className="immersive-start-dialog absolute z-[80] flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-full"
            style={{
              top: "108px", left: "50%", transform: "translateX(-50%)",
              background: "rgba(99,102,241,0.85)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(99,102,241,0.6)", fontSize: "clamp(12px,1.4vw,15px)",
              boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
            }}
          >
            {isAuthenticated
              ? immersionMode ? "🔊 Hear introduction" : `🔊 Ouvir apresentação de ${(teachingScene ?? selectedScene).teacherName}`
              : "Ativar acesso para iniciar"}
          </button>
        )}
        {!(dlgOpen || (isSpeaking && activeDialogLineRef.current)) && sceneMaterialIsPreparing && (
          <div
            className="absolute z-50 rounded-full px-4 py-2 text-xs font-bold text-cyan-100"
            style={{ bottom: "100px", left: "50%", transform: "translateX(-50%)", background: "rgba(8,47,73,.88)", border: "1px solid rgba(103,232,249,.45)" }}
            role="status"
          >
            Preparando material protegido da cena…
          </div>
        )}
        {!(dlgOpen || (isSpeaking && activeDialogLineRef.current)) && sceneMaterialNeedsAccess && (
          <div
            className="absolute left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border p-4 text-center shadow-2xl"
            style={{ bottom: "100px", background: "rgba(15,23,42,.94)", borderColor: "rgba(129,140,248,.72)", backdropFilter: "blur(14px)" }}
            role="status"
          >
            <p className="text-sm font-semibold text-white">Ative o acesso para iniciar esta cena.</p>
            <p className="mt-1 text-xs text-slate-300">O diálogo, a voz e o vocabulário são liberados somente na sessão protegida.</p>
            <button type="button" onClick={() => { window.location.href = isAuthenticated ? window.location.href : getLoginUrl(); }} className="mt-3 rounded-full bg-indigo-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-400">{sceneMaterialActionLabel}</button>
          </div>
        )}
        {dialogAuthRequired && !isAuthenticated && (
          <div
            className="absolute left-1/2 z-[60] w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border p-4 text-center shadow-2xl"
            style={{ bottom: "148px", background: "rgba(15,23,42,.94)", borderColor: "rgba(129,140,248,.72)", backdropFilter: "blur(14px)" }}
            role="status"
          >
            <p className="text-sm font-semibold text-white">O diálogo com voz neural requer uma sessão protegida.</p>
            <p className="mt-1 text-xs text-slate-300">As cenas e o vocabulário continuam visíveis; entre para ativar fala, resposta e sincronização labial.</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <button type="button" onClick={() => { window.location.href = getLoginUrl(); }} className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-400">Entrar</button>
              <button type="button" onClick={() => setDialogAuthRequired(false)} className="rounded-full border border-slate-500 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-300">Agora não</button>
            </div>
          </div>
        )}
        {(dlgOpen || (isSpeaking && activeDialogLineRef.current)) && activeSceneDialog[dlgStep] && (
          <div
            className="immersive-dialog absolute left-3 z-[70]"
            style={{
              bottom: dlgExpanded ? "clamp(112px, 16vh, 150px)" : "18px",
              width: dlgExpanded ? "min(72vw, 860px)" : "min(92vw, 390px)",
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Diálogo da cena"
          >
            <div
              style={{
                background: "rgba(0,0,0,0.82)",
                backdropFilter: "blur(12px)",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.12)",
                padding: dlgExpanded ? "14px 16px" : "8px 10px",
                maxHeight: dlgExpanded ? "min(43vh, 340px)" : "none",
                overflowY: dlgExpanded ? "auto" : "hidden",
              }}
            >
              <div className={`flex items-center justify-between gap-2 ${dlgExpanded ? "mb-3 border-b border-white/10 pb-2" : ""}`}>
                {!immersionMode && <span className="text-xs font-black uppercase tracking-[0.16em] text-indigo-200">Diálogo da cena</span>}
                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-white/80">{activeSceneDialog[dlgStep].text}</span>
                <button type="button" onClick={() => setDlgExpanded((expanded) => !expanded)} aria-expanded={dlgExpanded} className="shrink-0 rounded-full border border-cyan-300/35 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-extrabold text-cyan-100 hover:bg-cyan-400/20">{dlgExpanded ? "Recolher" : "Abrir"}</button>
                <button
                  type="button"
                  onClick={() => {
                    stopTeacherAudio();
                    activeDialogLineRef.current = null;
                    activeDialogWordCountRef.current = 0;
                    setDlgAudioClock(false);
                    setDlgOpen(false);
                  }}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white hover:bg-white/20"
                >
                  Fechar
                </button>
              </div>
              {dlgExpanded && <div className="mt-3">
              {/* Speaker label */}
              <div className="flex items-center gap-2 mb-2">
                <span style={{ fontSize: "11px", fontWeight: 700, color: activeSceneDialog[dlgStep].speaker === 'teacher' ? '#818cf8' : '#34d399', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {activeSceneDialog[dlgStep].speaker === 'teacher' ? `🏫 ${(teachingScene ?? selectedScene).teacherName}` : '👤 Você'}
                </span>
                {!immersionMode && dlgTranslationLoading && !isPortugueseLocale(nativeLang) && (
                  <span className="text-[11px] text-cyan-100/65">Traduzindo para {nativeLangLabel}…</span>
                )}
{!immersionMode && getDlgTranslation(activeSceneDialog[dlgStep]) && (
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>
                    — {getDlgTranslation(activeSceneDialog[dlgStep])}
                  </span>
                )}
                {getDlgTranslation(activeSceneDialog[dlgStep]) && (
                  <button
                    type="button"
                    onClick={() => speakNativeHelp(getDlgTranslation(activeSceneDialog[dlgStep]))}
                    className="ml-auto rounded-full border border-cyan-300/35 bg-cyan-400/10 px-2 py-1 text-[10px] font-bold text-cyan-100 hover:bg-cyan-400/20"
                    title="Ouvir ajuda na língua nativa"
                    aria-label="Ouvir ajuda na língua nativa"
                  >
                    {immersionMode ? "?" : `Ouvir ajuda ${nativeLangLabel}`}
                  </button>
                )}
              </div>
              {activeSceneDialog[dlgStep].speaker === 'teacher' && (<>
                <div className="mb-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isAuthenticated) {
                        setDialogAuthRequired(true);
                        return;
                      }
                      if (dialogAudioSource) {
                        void replayVisibleDialogAudio();
                        return;
                      }
                      const teacherSpeech = getImmersiveDialogTeacherSpeech(activeSceneDialog[dlgStep].text, teachingScene ?? selectedScene);
                      requestSpeechSafely(teacherSpeech.text, teacherSpeech.language, teacherSpeech.gender, teacherSpeech.purpose);
                    }}
                    className="rounded-full border border-indigo-300/45 bg-indigo-400/10 px-3 py-1.5 text-xs font-extrabold text-indigo-100 transition hover:bg-indigo-400/20"
                    title={`Repetir a fala do professor em ${getSpokenLanguageLabel(teachingScene?.teacherLang || selectedScene?.teacherLang || targetLang)}`}
                  >
                    {isPreparingNeuralAudio
                      ? `Preparando ${getSpokenLanguageLabel(teachingScene?.teacherLang || selectedScene?.teacherLang || targetLang)}…`
                      : isSpeaking
                        ? `Reiniciar ${getSpokenLanguageLabel(teachingScene?.teacherLang || selectedScene?.teacherLang || targetLang)}`
                        : isAuthenticated
                          ? `Ouvir ${getSpokenLanguageLabel(teachingScene?.teacherLang || selectedScene?.teacherLang || targetLang)}`
                          : "Ativar acesso para ouvir"}
                  </button>
                  {dialogAudioNeedsGesture && dialogAudioSource && (
                    <button
                      type="button"
                      onClick={() => { void replayVisibleDialogAudio(); }}
                      className="rounded-full border border-amber-300/60 bg-amber-300/15 px-3 py-1.5 text-xs font-extrabold text-amber-50 transition hover:bg-amber-300/25"
                      title="Iniciar a fala em um toque explícito"
                    >
                      Tocar agora
                    </button>
                  )}
                  <div className="flex items-center gap-1 rounded-full border border-white/15 bg-slate-950/60 p-1" role="group" aria-label="Velocidade da fala do professor e da ajuda nativa">
                    {DIALOG_SPEECH_RATES.map((rate) => (
                      <button
                        key={rate.value}
                        type="button"
                        onClick={() => setDialogSpeechRate(rate.value)}
                        aria-pressed={dialogSpeechRate === rate.value}
                        className={dialogSpeechRate === rate.value
                          ? "rounded-full bg-cyan-300 px-2 py-1 text-[10px] font-extrabold text-slate-950"
                          : "rounded-full px-2 py-1 text-[10px] font-bold text-slate-200 hover:bg-white/10"}
                        title={`Ouvir fala e ajuda em ${rate.value}×`}
                      >
                        {immersionMode ? `${rate.value}×` : rate.label}
                      </button>
                    ))}
                  </div>
                  {dialogAudioSource && (
                    <div className="flex min-w-[210px] flex-1 items-center gap-2 rounded-xl border border-cyan-300/45 bg-cyan-400/10 px-2 py-1.5" role="group" aria-label={`Controle de áudio da fala de ${(teachingScene ?? selectedScene).teacherName}`}>
                      <button
                        type="button"
                        onClick={() => { void replayVisibleDialogAudio(); }}
                        className="rounded-lg bg-cyan-300 px-2.5 py-1 text-[11px] font-black text-slate-950 transition hover:bg-cyan-200"
                        title={`Reproduzir a fala de ${(teachingScene ?? selectedScene).teacherName} desde o início`}
                      >
                        ▶ Ouvir {(teachingScene ?? selectedScene).teacherName}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={dialogAudioDuration || 0}
                        step={0.01}
                        value={Math.min(dialogAudioPosition, dialogAudioDuration || 0)}
                        disabled={!dialogAudioDuration}
                        aria-label={`Posição da fala de ${(teachingScene ?? selectedScene).teacherName}`}
                        onChange={(event) => {
                          const audio = dialogAudioElementRef.current;
                          const nextPosition = Number(event.target.value);
                          if (!audio || !Number.isFinite(nextPosition)) return;
                          audio.currentTime = nextPosition;
                          setDialogAudioPosition(nextPosition);
                        }}
                        className="min-w-0 flex-1 accent-cyan-300 disabled:opacity-50"
                      />
                      <span className="shrink-0 text-[10px] font-bold tabular-nums text-cyan-50" aria-live="polite">
                        {dialogAudioDuration
                          ? `${Math.floor(dialogAudioPosition / 60)}:${String(Math.floor(dialogAudioPosition % 60)).padStart(2, "0")} / ${Math.floor(dialogAudioDuration / 60)}:${String(Math.floor(dialogAudioDuration % 60)).padStart(2, "0")}`
                          : "medindo duração…"}
                      </span>
                    </div>
                  )}
                </div>
                {dlgAudioNotice && (
                  <p role="status" aria-live="polite" className="mt-2 text-xs font-medium text-cyan-100/85">
                    {dlgAudioNotice}
                  </p>
                )}
              </>)}
              {/* Scrolling text word by word */}
              {activeSceneDialog[dlgStep].speaker === 'teacher' && (
                <div style={{ fontSize: "clamp(16px,2vw,22px)", fontWeight: 600, color: "#fff", lineHeight: 1.5, minHeight: "2em", letterSpacing: "0.01em" }}>
                  {dlgWords.slice(0, dlgWordIdx).map((w, i) => (
                    <span key={i} style={{ display: 'inline-block', marginRight: '0.3em', opacity: 1, animation: 'wordFadeIn 0.25s ease' }}>{w}</span>
                  ))}
                  {dlgWordIdx < dlgWords.length && (
                    <span style={{ display: 'inline-block', width: '8px', height: '18px', background: '#818cf8', borderRadius: '2px', verticalAlign: 'middle', animation: 'cursorBlink 0.8s infinite' }} />
                  )}
                </div>
              )}
              {activeSceneDialog[dlgStep] && (
                <div className="mt-3 rounded-xl border border-cyan-200/20 bg-cyan-500/5 p-3">
                  <p className="mb-2 text-xs font-semibold text-cyan-100">Pergunte ao professor sobre a fala atual, sua resposta, a cena ou uma palavra:</p>
                  <div className="flex gap-2">
                    <input
                      value={dlgWrittenAnswer}
                      onChange={(event) => setDlgWrittenAnswer(event.target.value)}
                      onKeyDown={(event) => { if (event.key === "Enter") submitTeacherQuestion(); }}
                      placeholder="Ex.: What is pool?"
                      className="min-w-0 flex-1 rounded-lg border border-white/20 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={submitTeacherQuestion}
                      className="rounded-lg bg-cyan-300 px-3 py-2 text-sm font-extrabold text-slate-950 disabled:opacity-50"
                    >
                      {dlgTutorLoading ? "Respondendo…" : "Perguntar"}
                    </button>
                  </div>
                  {dlgFeedback && (
                    <div ref={dlgFeedbackRef} className="mt-3 rounded-lg border border-amber-300/35 bg-amber-300/10 px-3 py-2">
                      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-amber-100">Resposta escrita do professor</p>
                      <div role="status" aria-live="polite" className="whitespace-pre-line text-sm font-medium text-amber-100">
                        {dlgFeedback}
                      </div>
                      <button
                        type="button"
                        onClick={replayTeacherSpeechFromGesture}
                        className="mt-3 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-indigo-500"
                      >
                        🔊 Ouvir resposta de {(teachingScene ?? selectedScene).teacherName}
                      </button>
                      <div className="mt-3 border-t border-amber-300/20 pt-3">
                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-amber-100">Aprofundar esta dúvida no curso ABC</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button type="button" onClick={() => openSceneReinforcement("/base-de-estudos")} className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-2.5 py-1 text-xs font-bold text-cyan-50 hover:bg-cyan-300/20">Entender no curso</button>
                          <button type="button" onClick={() => openSceneReinforcement("/pareto-1000")} className="rounded-full border border-violet-300/40 bg-violet-300/10 px-2.5 py-1 text-xs font-bold text-violet-50 hover:bg-violet-300/20">Memorizar no Pareto</button>
                          <button type="button" onClick={() => openSceneReinforcement("/lessons")} className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-2.5 py-1 text-xs font-bold text-emerald-50 hover:bg-emerald-300/20">Praticar frases</button>
                          <button type="button" onClick={() => openSceneReinforcement("/free-talk")} className="rounded-full border border-fuchsia-300/40 bg-fuchsia-300/10 px-2.5 py-1 text-xs font-bold text-fuchsia-50 hover:bg-fuchsia-300/20">Conversar mais</button>
                        </div>
                      </div>
                    </div>
                  )}
                  {localizedSceneDialogueQuery.data?.status === "ready" && localizedSceneDialogueQuery.data.turns.length > 0 && (
                    <section className="mt-3 rounded-lg border border-emerald-300/25 bg-emerald-950/20 px-3 py-2" aria-label="Material localizado da cena">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-100">Material localizado da cena</p>
                      <div className="space-y-2 text-sm text-emerald-50">
                        {localizedSceneDialogueQuery.data.turns.map((turn, index) => (
                          <div key={`${index}-${turn.targetText}`}>
                            <p className="font-semibold">{turn.targetText}</p>
                            <p className="text-emerald-100/80">{nativeLangInfo.name}: {turn.nativeHelp}</p>
                          </div>
                        ))}
                      </div>
                      {localizedSceneDialogueQuery.data.objects.length > 0 && (
                        <div className="mt-3 border-t border-emerald-300/15 pt-3">
                          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-200">Objetos para praticar</p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {localizedSceneDialogueQuery.data.objects.map((object, index) => (
                              <div key={`${index}-${object.targetText}`} className="rounded-md bg-emerald-300/10 px-2.5 py-2">
                                <p className="text-sm font-semibold text-emerald-50">{object.targetText}</p>
                                <p className="text-xs text-emerald-100/80">{nativeLangInfo.name}: {object.nativeHelp}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </section>
                  )}
                  <div className="mt-3 rounded-lg border border-violet-300/20 bg-violet-400/5 p-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-violet-100">Começar só pelas palavras Pareto</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activeSceneHotspots.slice(0, 6).map((hotspot) => (
                        <button
                          key={hotspot.id}
                          type="button"
                          onClick={() => {
                            setPracticeHotspot(hotspot);
                            setDlgFeedback(`Vamos começar por “${hotspot.label}”. Ouça, escreva e crie uma frase quando estiver pronto.`);
                            requestSpeechSafely(hotspot.label, (teachingScene ?? selectedScene).teacherLang, (teachingScene ?? selectedScene).teacherGender, "hotspot");
                          }}
                          className="rounded-full border border-violet-300/35 bg-violet-300/10 px-2.5 py-1 text-xs font-bold text-violet-100 hover:bg-violet-300/20"
                        >
                          {hotspot.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* Multiple choice — only for user turns */}
              {activeSceneDialog[dlgStep].speaker === 'user' && activeSceneDialog[dlgStep].options && (
                <div className="flex flex-col gap-2 mt-1">
                  {activeSceneDialog[dlgStep].options!.map((opt, i) => (
                    <button
                      key={i}
                      disabled={dlgAnswer !== null}
                      onClick={() => {
                        setDlgAnswer(i);
                        const correct = activeSceneDialog[dlgStep].correctIndex === i;
                        if (correct) {
                          const praiseClip = playJamesTropicalClip("james-tropical-praise") || playSophieCafeClip("sophie-cafe-praise");
                          const teacherSpeech = getImmersiveDialogTeacherSpeech(praiseClip?.dialogue || `✅ ${opt}`, teachingScene ?? selectedScene);
                          requestSpeechSafely(teacherSpeech.text, teacherSpeech.language, teacherSpeech.gender, teacherSpeech.purpose);
                        } else {
                          const retryClip = playJamesTropicalClip("james-tropical-retry") || playSophieCafeClip("sophie-cafe-retry");
                          if (retryClip) requestSpeechSafely(retryClip.dialogue, retryClip.language, retryClip.teacherName === "James" ? "male" : "female", "teacher");
                        }
                        setTimeout(() => dlgNext(), 1400);
                      }}
                      style={{
                        textAlign: 'left', padding: '10px 14px', borderRadius: '10px', fontSize: 'clamp(13px,1.5vw,16px)', fontWeight: 500, cursor: dlgAnswer !== null ? 'default' : 'pointer', transition: 'all 0.2s',
                        background: dlgAnswer === null ? 'rgba(255,255,255,0.1)' : i === activeSceneDialog[dlgStep].correctIndex ? 'rgba(34,197,94,0.3)' : dlgAnswer === i ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)',
                        border: dlgAnswer === null ? '1px solid rgba(255,255,255,0.15)' : i === activeSceneDialog[dlgStep].correctIndex ? '1px solid #22c55e' : dlgAnswer === i ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)',
                        color: '#fff',
                      }}
                    >
                      {dlgAnswer !== null && i === activeSceneDialog[dlgStep].correctIndex && <span style={{marginRight:'6px'}}>✅</span>}
                      {dlgAnswer === i && i !== activeSceneDialog[dlgStep].correctIndex && <span style={{marginRight:'6px'}}>❌</span>}
                      {opt}
                    </button>
                  ))}
                  <div className="mt-2 rounded-xl border border-cyan-200/20 bg-cyan-500/5 p-3">
                    <p className="mb-2 text-xs font-semibold text-cyan-100">Ou escreva sua resposta no idioma estudado:</p>
                    <div className="flex gap-2">
                      <input
                        value={dlgWrittenAnswer}
                        onChange={(event) => setDlgWrittenAnswer(event.target.value)}
                        onKeyDown={(event) => { if (event.key === "Enter") submitWrittenDialogAnswer(); }}
                        disabled={dlgAnswer !== null}
                        placeholder="Digite sua resposta no idioma estudado"
                        className="min-w-0 flex-1 rounded-lg border border-white/20 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300"
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={submitWrittenDialogAnswer}
                        disabled={dlgAnswer !== null}
                        className="rounded-lg bg-cyan-300 px-3 py-2 text-sm font-extrabold text-slate-950 disabled:opacity-50"
                      >
                        {dlgTutorLoading ? "Respondendo…" : "Responder"}
                      </button>
                    </div>
                    {dlgFeedback && (
                      <div role="status" className="mt-3 whitespace-pre-line rounded-lg border border-amber-300/35 bg-amber-300/10 px-3 py-2 text-sm font-medium text-amber-100">
                        {dlgFeedback}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={dlgIsRecording ? stopDialogRecording : startDialogRecording}
                        disabled={dlgAnswer !== null || dlgIsProcessingSpeech}
                        className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/45 bg-emerald-400/10 px-3 py-2 text-sm font-extrabold text-emerald-100 hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {dlgIsRecording ? <Square size={15} fill="currentColor" /> : <Mic size={16} />}
                        {dlgIsRecording ? "Parar gravação" : dlgIsProcessingSpeech ? "Transcrevendo…" : "Responder com microfone"}
                      </button>
                      <span className="text-[11px] text-cyan-100/65">O navegador pedirá permissão antes de gravar.</span>
                    </div>
                  </div>
                </div>
              )}
              {dlgSuggestedHotspot && dlgAnswer !== null && (
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-amber-300/30 bg-amber-400/10 p-3">
                  <span className="text-xs font-semibold text-amber-100">Objeto visível: {dlgSuggestedHotspot.label}</span>
                  <button
                    type="button"
                    onClick={() => setPracticeHotspot(dlgSuggestedHotspot)}
                    className="rounded-lg bg-amber-300 px-3 py-2 text-xs font-extrabold text-slate-950"
                  >
                    Praticar com Pareto
                  </button>
                  <button
                    type="button"
                    onClick={dlgNext}
                    className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/15"
                  >
                    Continuar diálogo
                  </button>
                </div>
              )}
              {/* Continue button for teacher lines */}
              {activeSceneDialog[dlgStep].speaker === 'teacher' && dlgWordIdx >= dlgWords.length && (
                <button
                  onClick={dlgNext}
                  style={{ marginTop: '12px', padding: '8px 20px', borderRadius: '8px', background: 'rgba(99,102,241,0.7)', color: '#fff', fontWeight: 600, fontSize: '14px', border: '1px solid rgba(99,102,241,0.5)', cursor: 'pointer' }}
                >
                  {immersionMode ? "Next →" : "Continuar →"}
                </button>
              )}
              </div>}
            </div>
          </div>
        )}
        <style>{`
          @keyframes wordFadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
          @keyframes cursorBlink { 0%,100% { opacity:1; } 50% { opacity:0; } }
        `}</style>

        {/* Bottom bar */}
        <div
          className="absolute left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
          style={{
            bottom: "48px",
            background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
            paddingRight: "clamp(130px, 20vw, 240px)",
            paddingBottom: "clamp(12px, 2vh, 20px)",
          }}
        >
          <div />
          <div className="flex gap-2">
            {canUseAuthorizedSceneInteractions && activeSceneHotspots.map((h) => (
              <div
                key={h.id}
                style={{
                  width: "clamp(8px, 1vw, 12px)",
                  height: "clamp(8px, 1vw, 12px)",
                  borderRadius: "50%",
                  background: learnedWords.has(h.id) ? h.color : "rgba(255,255,255,0.3)",
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const idx = IMMERSIVE_SCENES.findIndex(s => s.id === selectedScene.id);
              const next = IMMERSIVE_SCENES[(idx + 1) % IMMERSIVE_SCENES.length];
              console.log('[Próxima] clicked. current:', selectedScene.id, 'idx:', idx, 'next:', next.id);
              setSelectedScene(next);
            }}
            className="flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-full btn-press"
            style={{ background: "rgba(99,102,241,0.8)", backdropFilter: "blur(8px)", border: "1px solid rgba(99,102,241,0.5)", fontSize: "clamp(11px, 1.3vw, 14px)" }}
          >
            {immersionMode ? "Next →" : "Próxima →"}
          </button>
        </div>
        {!isAuthenticated && !dialogAuthRequired && (
          <div
            className="absolute left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border p-4 text-center shadow-2xl"
            style={{ bottom: "112px", background: "rgba(15,23,42,.94)", borderColor: "rgba(129,140,248,.72)", backdropFilter: "blur(14px)" }}
            role="status"
          >
            <p className="text-sm font-semibold text-white">Prévia visual disponível.</p>
            <p className="mt-1 text-xs text-slate-300">Ative o acesso para liberar objetos, vocabulário, diálogo e prática com o professor.</p>
            <button type="button" onClick={() => { window.location.href = getLoginUrl(); }} className="mt-3 rounded-full bg-indigo-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-400">Ativar acesso</button>
          </div>
        )}
        {/* Notebook Modal */}
        <Notebook
          isOpen={notebookOpen}
          onClose={() => setNotebookOpen(false)}
          nativeLang={nativeLang}
        />
        {/* Pareto Vocabulary Panel */}
        <ParetoPanel
          isOpen={paretoOpen}
          onClose={() => setParetoOpen(false)}
          targetLang={targetLang || "en-US"}
          targetLangName={currentLangInfo.name || "English"}
          nativeLang={nativeLang}
          currentScene={selectedScene?.id}
          practiceLevel={selectedScene ? sceneCefrLevel(selectedScene) : "A1"}
          voiceGender={selectedScene?.teacherGender}
          onAddToNotebook={handleAddParetoToNotebook}
        />
      </div>
    );
  }

  // ── Scene Selection Grid ──
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-4"
        style={{ background: "rgba(15,12,41,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => { stopEdgeTTS(); setLocation("/"); }}
            className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-1.5 rounded-full text-sm transition-colors"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            ← Voltar
          </button>
          <div className="text-center">
            <h1 className="text-white font-bold" style={{ fontSize: "clamp(16px, 2.5vw, 24px)" }}>
              🌍 Immersive Scenes
            </h1>
            <p className="text-gray-400 text-xs">{IMMERSIVE_SCENES.length} environments • Native teacher • Contextual vocabulary</p>
          </div>
          <div
            className="text-yellow-400 font-bold px-3 py-1.5 rounded-full text-sm"
            style={{ background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.3)" }}
          >
            ⭐ {score}
          </div>
        </div>

        {/* Language selector for study target */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Estudar:</span>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowLangPicker(v => !v)}
              className="flex items-center gap-1 text-white font-semibold px-3 py-1.5 rounded-full text-sm"
              style={{ background: targetLang ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.1)", border: "1px solid rgba(99,102,241,0.5)" }}
            >
              {currentLangInfo.flag} {currentLangInfo.name || "Selecionar idioma"} ▾
            </button>
            {showLangPicker && (
              <div
                style={{
                  position: "absolute", top: "110%", left: 0, zIndex: 100,
                  background: "rgba(15,12,41,0.98)", backdropFilter: "blur(16px)",
                  border: "1px solid rgba(99,102,241,0.5)", borderRadius: 12,
                  padding: 8, minWidth: 200, maxHeight: 300, overflowY: "auto",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.8)"
                }}
              >
                <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700, padding: "4px 8px 8px", textTransform: "uppercase", letterSpacing: 1 }}>Escolha o idioma a estudar</div>
                {Object.entries(LANG_LABELS).map(([code, info]) => (
                  <button
                    key={code}
                    onClick={() => handleSelectTargetLang(code)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      width: "100%", padding: "7px 10px", borderRadius: 8,
                      background: targetLang === code ? "rgba(99,102,241,0.4)" : "transparent",
                      color: "white", fontSize: 13, fontWeight: targetLang === code ? 700 : 400,
                      border: "none", cursor: "pointer", textAlign: "left"
                    }}
                  >
                    <span>{info.flag}</span>
                    <span>{info.name}</span>
                    <span style={{ color: "#6b7280", fontSize: 11, marginLeft: "auto" }}>{code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {targetLang && (
            <span className="text-green-400 text-xs">✓ Idioma selecionado — as cenas mostrarão vocabulário em {currentLangInfo.name}</span>
          )}
        </div>
        {targetLang && <VoiceQualityBanner lang={targetLang} className="mb-3" />}

        {/* Search + Filters */}
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="🔍 Buscar cena..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-32 px-3 py-2 rounded-full text-white text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "white" }}
          />
          {(["all", ...IMMERSIVE_CEFR_LEVELS.map((item) => item.value)] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                background: filter === f ? "#6366f1" : "rgba(255,255,255,0.08)",
                color: filter === f ? "white" : "#94a3b8",
                border: filter === f ? "1px solid #6366f1" : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {f === "all" ? "Todos" : cefrLabel(f)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="p-4 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(clamp(150px, 42vw, 280px), 1fr))" }}>
        {filteredScenes.map((scene) => (
          <div
            key={scene.id}
            onClick={() => handleEnterScene(scene)}
            className="relative rounded-2xl overflow-hidden cursor-pointer group"
            style={{
              aspectRatio: "16/10",
              border: "1px solid rgba(255,255,255,0.1)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "scale(1.03)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 60px rgba(99,102,241,0.4)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
          >
            {/* Background image */}
            <img
              src={scene.bgImage}
              alt={scene.name}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.4s",
              }}
              className="group-hover:scale-105"
            />

            {/* Overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
              }}
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-1">
              <span
                className="px-2 py-0.5 rounded-full text-white font-bold"
                style={{ background: cefrColor(sceneCefrLevel(scene)), fontSize: "clamp(8px, 1vw, 11px)" }}
              >
                {cefrLabel(sceneCefrLevel(scene))}
              </span>
              {scene.premium && (
                <span
                  className="px-2 py-0.5 rounded-full text-white font-bold"
                  style={{ background: "#f59e0b", fontSize: "clamp(8px, 1vw, 11px)" }}
                >
                  ⭐ PRO
                </span>
              )}
            </div>

            {/* Object count */}
            <div
              className="absolute top-2 right-2 text-white font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(0,0,0,0.6)", fontSize: "clamp(8px, 1vw, 11px)" }}
            >
              {scene.hotspots.length} objetos
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2">
              <div className="text-white font-bold" style={{ fontSize: "clamp(12px, 1.6vw, 16px)" }}>
                {scene.name}
              </div>
              <div className="text-gray-300" style={{ fontSize: "clamp(9px, 1.1vw, 12px)" }}>
                {scene.nameEn}
              </div>
              {/* Hotspot icons preview */}
              <div className="flex gap-1 mt-1 flex-wrap">
                {scene.hotspots.slice(0, 4).map((h) => (
                  <span
                    key={h.id}
                    className="px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: `${h.color}44`, border: `1px solid ${h.color}66`, fontSize: "clamp(8px, 1vw, 11px)" }}
                  >
                    {h.icon} {h.label}
                  </span>
                ))}
                {scene.hotspots.length > 4 && (
                  <span className="text-gray-400" style={{ fontSize: "clamp(8px, 1vw, 11px)" }}>
                    +{scene.hotspots.length - 4}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
