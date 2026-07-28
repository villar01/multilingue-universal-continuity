/**
 * TeacherAvatar3D - Sistema de Avatar 3D com Lip-Sync Real
 *
 * Usa Three.js + @react-three/fiber + @react-three/drei para renderizar
 * avatares 3D fotorrealistas com animação labial sincronizada.
 *
 * Estratégia de lip-sync:
 * 1. Web Speech API (SpeechSynthesis) - TTS nativo do browser, zero custo
 * 2. Análise de fonemas em tempo real via AudioContext + AnalyserNode
 * 3. Morph targets (blend shapes) para animação da boca
 */

import { useRef, useEffect, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows, Html } from "@react-three/drei";
import { speakText as speakNaturalVoice } from "@/hooks/useNaturalVoice";
import { stopEdgeTTS } from "@/lib/edgeTTSClient";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

export interface TeacherProfile {
  id: number;
  name: string;
  gender: "male" | "female";
  language: string;
  voiceName?: string;
  avatarUrl?: string;
  color: string;
  personality: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFESSORES - perfis completos
// ─────────────────────────────────────────────────────────────────────────────

export const TEACHER_PROFILES: Record<number, TeacherProfile> = {
  150001: { id: 150001, name: "Ricardo", gender: "male",   language: "pt", color: "#1e40af", personality: "formal",      voiceName: "pt-BR-Neural2-B" },
  150002: { id: 150002, name: "Ingrid",  gender: "female", language: "en", color: "#7c3aed", personality: "friendly",    voiceName: "en-US-Neural2-F" },
  150003: { id: 150003, name: "Camila",  gender: "female", language: "pt", color: "#be185d", personality: "enthusiastic", voiceName: "pt-BR-Neural2-C" },
  150004: { id: 150004, name: "João",    gender: "male",   language: "pt", color: "#065f46", personality: "calm",        voiceName: "pt-BR-Neural2-B" },
  150005: { id: 150005, name: "Sofia",   gender: "female", language: "es", color: "#92400e", personality: "warm",        voiceName: "es-ES-Neural2-A" },
  150006: { id: 150006, name: "Pierre",  gender: "male",   language: "fr", color: "#1e3a5f", personality: "precise",     voiceName: "fr-FR-Neural2-B" },
  150007: { id: 150007, name: "Klaus",   gender: "male",   language: "de", color: "#374151", personality: "strict",      voiceName: "de-DE-Neural2-B" },
  150008: { id: 150008, name: "Giulia",  gender: "female", language: "it", color: "#7f1d1d", personality: "expressive",  voiceName: "it-IT-Neural2-A" },
};

// Fallback para IDs simples (1-8)
for (let i = 1; i <= 8; i++) {
  const profile = Object.values(TEACHER_PROFILES)[i - 1];
  if (profile) TEACHER_PROFILES[i] = profile;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAPEAMENTO DE VISEMAS (fonema → morph target)
// Compatível com avatares Ready Player Me e Mixamo
// ─────────────────────────────────────────────────────────────────────────────

const VISEME_MAP: Record<string, Record<string, number>> = {
  // Neutro / silêncio
  neutral: { viseme_sil: 1.0 },
  // Vogais
  A: { viseme_aa: 0.9, viseme_E: 0.1 },
  E: { viseme_E: 0.9, viseme_I: 0.1 },
  I: { viseme_I: 1.0 },
  O: { viseme_O: 0.9, viseme_U: 0.1 },
  U: { viseme_U: 0.9, viseme_O: 0.1 },
  // Consoantes labiais
  B: { viseme_PP: 1.0 },
  P: { viseme_PP: 1.0 },
  M: { viseme_PP: 0.8, viseme_sil: 0.2 },
  // Consoantes dentais
  F: { viseme_FF: 1.0 },
  V: { viseme_FF: 0.8, viseme_E: 0.2 },
  // Consoantes alveolares
  T: { viseme_DD: 0.8, viseme_nn: 0.2 },
  D: { viseme_DD: 1.0 },
  N: { viseme_nn: 1.0 },
  L: { viseme_nn: 0.6, viseme_E: 0.4 },
  // Consoantes velares
  K: { viseme_kk: 1.0 },
  G: { viseme_kk: 0.9, viseme_E: 0.1 },
  // Fricativas
  S: { viseme_SS: 1.0 },
  Z: { viseme_SS: 0.8, viseme_E: 0.2 },
  SH: { viseme_CH: 1.0 },
  CH: { viseme_CH: 1.0 },
  // Semivogais
  W: { viseme_U: 0.8, viseme_O: 0.2 },
  Y: { viseme_I: 0.8, viseme_E: 0.2 },
  // Especiais PT-BR
  NH: { viseme_nn: 0.7, viseme_I: 0.3 },
  LH: { viseme_nn: 0.5, viseme_E: 0.5 },
  R: { viseme_RR: 1.0 },
};

// Todos os morph targets de visemas do Ready Player Me
const ALL_VISEMES = [
  "viseme_sil", "viseme_PP", "viseme_FF", "viseme_TH", "viseme_DD",
  "viseme_kk", "viseme_CH", "viseme_SS", "viseme_nn", "viseme_RR",
  "viseme_aa", "viseme_E", "viseme_I", "viseme_O", "viseme_U",
];

// ─────────────────────────────────────────────────────────────────────────────
// ANÁLISE DE FONEMAS DO TEXTO
// ─────────────────────────────────────────────────────────────────────────────

interface PhonemeFrame {
  viseme: string;
  start: number;  // ms
  end: number;    // ms
}

function textToPhonemeFrames(text: string, lang: string = "pt-BR"): PhonemeFrame[] {
  const frames: PhonemeFrame[] = [];
  const words = text.trim().split(/\s+/);
  let time = 0;

  // Duração média por sílaba em ms (varia por idioma)
  const syllableDuration = lang.startsWith("pt") ? 130 : lang.startsWith("es") ? 120 : 140;

  for (const word of words) {
    const letters = word.toUpperCase().split("");
    let i = 0;
    while (i < letters.length) {
      const ch = letters[i];
      const next = letters[i + 1] || "";

      // Detectar dígrafos
      let viseme = "neutral";
      let skip = 1;

      if (ch === "N" && next === "H") { viseme = "NH"; skip = 2; }
      else if (ch === "L" && next === "H") { viseme = "LH"; skip = 2; }
      else if (ch === "S" && next === "H") { viseme = "SH"; skip = 2; }
      else if (ch === "C" && next === "H") { viseme = "CH"; skip = 2; }
      else if ("AEIOUÁÉÍÓÚÂÊÎÔÛÃÕÀÈÌÒÙÄËÏÖÜ".includes(ch)) {
        // Vogal
        const base = "AEIOU".includes(ch) ? ch : ch.normalize("NFD")[0];
        viseme = base || "A";
      } else if ("BPDFVTDNLKGSZRWYMJQXHC".includes(ch)) {
        viseme = ch;
      }

      const dur = syllableDuration * (["A","E","I","O","U"].includes(viseme) ? 1.2 : 0.8);
      frames.push({ viseme, start: time, end: time + dur });
      time += dur;
      i += skip;
    }
    // Pausa entre palavras
    frames.push({ viseme: "neutral", start: time, end: time + 60 });
    time += 60;
  }

  return frames;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE 3D DO AVATAR (usa modelo GLB do Ready Player Me)
// ─────────────────────────────────────────────────────────────────────────────

// URLs de avatares Ready Player Me (modelos GLB públicos com visemas)
const RPM_AVATAR_URLS: Record<string, string> = {
  male_formal:      "https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=ARKit,Oculus+Visemes",
  female_friendly:  "https://models.readyplayer.me/64c3f8f0e72c63d7c3934b12.glb?morphTargets=ARKit,Oculus+Visemes",
  female_enthusiastic: "https://models.readyplayer.me/64c3f8f0e72c63d7c3934b12.glb?morphTargets=ARKit,Oculus+Visemes",
  male_calm:        "https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=ARKit,Oculus+Visemes",
  female_warm:      "https://models.readyplayer.me/64c3f8f0e72c63d7c3934b12.glb?morphTargets=ARKit,Oculus+Visemes",
  male_precise:     "https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=ARKit,Oculus+Visemes",
  male_strict:      "https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=ARKit,Oculus+Visemes",
  female_expressive:"https://models.readyplayer.me/64c3f8f0e72c63d7c3934b12.glb?morphTargets=ARKit,Oculus+Visemes",
};

function getAvatarUrl(profile: TeacherProfile): string {
  const key = `${profile.gender}_${profile.personality}`;
  return RPM_AVATAR_URLS[key] || RPM_AVATAR_URLS["male_formal"]!;
}

interface AvatarMeshProps {
  profile: TeacherProfile;
  currentVisemeKey: string;
  emotion: string;
  isTeaching: boolean;
}

function AvatarMesh({ profile, currentVisemeKey, emotion, isTeaching }: AvatarMeshProps) {
  const avatarUrl = getAvatarUrl(profile);
  const { scene } = useGLTF(avatarUrl);
  const headRef = useRef<THREE.Object3D | null>(null);
  const morphMeshRef = useRef<THREE.SkinnedMesh | null>(null);
  const blinkTimer = useRef(0);
  const idleTimer = useRef(0);

  // Encontrar mesh com morph targets (cabeça/rosto)
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.SkinnedMesh && child.morphTargetDictionary) {
        const keys = Object.keys(child.morphTargetDictionary);
        if (keys.some(k => k.startsWith("viseme_"))) {
          morphMeshRef.current = child;
        }
      }
      if (child.name === "Head" || child.name === "head") {
        headRef.current = child;
      }
    });
  }, [scene]);

  // Loop de animação: visemas + piscar + idle
  useFrame((_, delta) => {
    const mesh = morphMeshRef.current;
    if (!mesh || !mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;

    const dict = mesh.morphTargetDictionary;
    const influences = mesh.morphTargetInfluences;

    // ── 1. Resetar todos os visemas suavemente ──
    for (const v of ALL_VISEMES) {
      const idx = dict[v];
      if (idx !== undefined) {
        influences[idx] = THREE.MathUtils.lerp(influences[idx] ?? 0, 0, delta * 12);
      }
    }

    // ── 2. Aplicar visema atual ──
    const targetMorphs = VISEME_MAP[currentVisemeKey] || VISEME_MAP["neutral"]!;
    for (const [morphName, weight] of Object.entries(targetMorphs)) {
      const idx = dict[morphName];
      if (idx !== undefined) {
        influences[idx] = THREE.MathUtils.lerp(influences[idx] ?? 0, weight, delta * 15);
      }
    }

    // ── 3. Emoções via ARKit blend shapes ──
    const emotionMorphs: Record<string, Record<string, number>> = {
      happy:       { mouthSmileLeft: 0.6, mouthSmileRight: 0.6, cheekSquintLeft: 0.3, cheekSquintRight: 0.3 },
      encouraging: { mouthSmileLeft: 0.4, mouthSmileRight: 0.4, browInnerUp: 0.3 },
      thinking:    { browDownLeft: 0.3, browDownRight: 0.3, eyeLookUpLeft: 0.2, eyeLookUpRight: 0.2 },
      neutral:     {},
    };
    const em = emotionMorphs[emotion] || {};
    for (const [morphName, weight] of Object.entries(em)) {
      const idx = dict[morphName];
      if (idx !== undefined) {
        influences[idx] = THREE.MathUtils.lerp(influences[idx] ?? 0, weight, delta * 5);
      }
    }

    // ── 4. Piscar automático ──
    blinkTimer.current += delta;
    if (blinkTimer.current > 3.5 + Math.random() * 2) {
      blinkTimer.current = 0;
      const blinkL = dict["eyeBlinkLeft"];
      const blinkR = dict["eyeBlinkRight"];
      if (blinkL !== undefined) influences[blinkL] = 1;
      if (blinkR !== undefined) influences[blinkR] = 1;
      setTimeout(() => {
        if (blinkL !== undefined && influences) influences[blinkL] = 0;
        if (blinkR !== undefined && influences) influences[blinkR] = 0;
      }, 120);
    }

    // ── 5. Movimento idle da cabeça ──
    if (headRef.current) {
      idleTimer.current += delta;
      const idleX = Math.sin(idleTimer.current * 0.4) * 0.03;
      const idleY = Math.sin(idleTimer.current * 0.3) * 0.04;
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, idleX, delta * 2);
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, idleY, delta * 2);
    }
  });

  return (
    <primitive
      object={scene}
      scale={[1, 1, 1]}
      position={[0, -1.6, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AVATAR FALLBACK SVG (quando GLB não carrega)
// ─────────────────────────────────────────────────────────────────────────────

function AvatarFallback2D({
  profile,
  currentVisemeKey,
  emotion,
  isTeaching,
}: {
  profile: TeacherProfile;
  currentVisemeKey: string;
  emotion: string;
  isTeaching: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Fundo gradiente
      const bg = ctx.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, W * 0.6);
      bg.addColorStop(0, profile.color + "33");
      bg.addColorStop(1, "#00000000");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Círculo de fundo
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, W * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = profile.color + "22";
      ctx.fill();
      ctx.strokeStyle = profile.color;
      ctx.lineWidth = isTeaching ? 3 : 1.5;
      ctx.stroke();

      // Rosto (oval)
      const skinColor = profile.gender === "female" ? "#f5c5a3" : "#e8a87c";
      ctx.beginPath();
      ctx.ellipse(W / 2, H * 0.42, W * 0.22, H * 0.28, 0, 0, Math.PI * 2);
      ctx.fillStyle = skinColor;
      ctx.fill();

      // Cabelo
      ctx.beginPath();
      ctx.ellipse(W / 2, H * 0.22, W * 0.22, H * 0.12, 0, 0, Math.PI * 2);
      ctx.fillStyle = profile.gender === "female" ? "#4a2c0a" : "#2c1a0a";
      ctx.fill();

      // Olhos
      const eyeY = H * 0.38;
      const eyeOpenness = emotion === "thinking" ? 0.6 : 1.0;
      [-1, 1].forEach(side => {
        const ex = W / 2 + side * W * 0.08;
        ctx.beginPath();
        ctx.ellipse(ex, eyeY, W * 0.03, H * 0.025 * eyeOpenness, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#1a0a00";
        ctx.fill();
        // Brilho
        ctx.beginPath();
        ctx.arc(ex + 2, eyeY - 2, 2, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
      });

      // Nariz
      ctx.beginPath();
      ctx.moveTo(W / 2, H * 0.44);
      ctx.lineTo(W / 2 - W * 0.025, H * 0.50);
      ctx.lineTo(W / 2 + W * 0.025, H * 0.50);
      ctx.strokeStyle = skinColor === "#f5c5a3" ? "#d4956a" : "#c07a4a";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // ── BOCA ANIMADA com visemas ──
      const mX = W / 2;
      const mY = H * 0.56;
      const vm = VISEME_MAP[currentVisemeKey] || VISEME_MAP["neutral"]!;

      // Calcular abertura da boca
      const aa = vm["viseme_aa"] || 0;
      const ee = vm["viseme_E"] || 0;
      const ii = vm["viseme_I"] || 0;
      const oo = vm["viseme_O"] || 0;
      const uu = vm["viseme_U"] || 0;
      const pp = vm["viseme_PP"] || 0;

      const openness = aa * 0.9 + ee * 0.5 + ii * 0.3 + oo * 0.7 + uu * 0.4;
      const roundness = oo * 0.8 + uu * 0.9;
      const closed = pp > 0.5;
      const smile = emotion === "happy" ? 0.4 : emotion === "encouraging" ? 0.2 : 0;

      const mW = W * (0.08 + roundness * 0.04 + openness * 0.02);
      const mH = H * (0.015 + openness * 0.06);

      // Lábio superior
      ctx.beginPath();
      ctx.moveTo(mX - mW, mY);
      ctx.bezierCurveTo(
        mX - mW * 0.5, mY - H * 0.02 - smile * H * 0.02,
        mX + mW * 0.5, mY - H * 0.02 - smile * H * 0.02,
        mX + mW, mY
      );
      ctx.strokeStyle = "#c0504a";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Interior da boca (se aberta)
      if (!closed && openness > 0.1) {
        ctx.beginPath();
        ctx.ellipse(mX, mY + mH * 0.3, mW * 0.8, mH, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#1a0000";
        ctx.fill();

        // Dentes
        if (openness > 0.3) {
          ctx.beginPath();
          ctx.ellipse(mX, mY + mH * 0.1, mW * 0.65, mH * 0.4, 0, 0, Math.PI * 2);
          ctx.fillStyle = "#f0ede8";
          ctx.fill();
        }
      }

      // Lábio inferior
      ctx.beginPath();
      ctx.moveTo(mX - mW, mY);
      ctx.bezierCurveTo(
        mX - mW * 0.5, mY + mH * 2 + smile * H * 0.02,
        mX + mW * 0.5, mY + mH * 2 + smile * H * 0.02,
        mX + mW, mY
      );
      ctx.strokeStyle = "#c0504a";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Indicador de fala
      if (isTeaching) {
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 180);
        ctx.beginPath();
        ctx.arc(W * 0.82, H * 0.18, 7 * (0.8 + pulse * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 197, 94, ${0.7 * pulse})`;
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
    };
  }, [profile, currentVisemeKey, emotion, isTeaching]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={320}
      className="w-full h-full rounded-full"
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WEB SPEECH API - TTS nativo do browser (melhor qualidade, zero custo)
// ─────────────────────────────────────────────────────────────────────────────

function getBestVoice(lang: string): SpeechSynthesisVoice | null {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();

  // Prioridade: Neural > Premium > Enhanced > Standard
  const priority = ["Neural", "Premium", "Enhanced", "Google", "Microsoft"];

  const langCode = lang.toLowerCase().startsWith("pt") ? "pt-BR"
    : lang.toLowerCase().startsWith("en") ? "en-US"
    : lang.toLowerCase().startsWith("es") ? "es-ES"
    : lang.toLowerCase().startsWith("fr") ? "fr-FR"
    : lang.toLowerCase().startsWith("de") ? "de-DE"
    : lang.toLowerCase().startsWith("it") ? "it-IT"
    : "en-US";

  const matching = voices.filter(v => v.lang.startsWith(langCode.split("-")[0]!));

  for (const keyword of priority) {
    const found = matching.find(v => v.name.includes(keyword));
    if (found) return found;
  }

  return matching[0] || voices[0] || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

interface TeacherAvatar3DProps {
  teacherId: number;
  isTeaching: boolean;
  text: string;
  emotion?: "neutral" | "happy" | "encouraging" | "thinking";
  audioUrl?: string;
  onSpeechEnd?: () => void;
  use3D?: boolean;
}

export function TeacherAvatar3D({
  teacherId,
  isTeaching,
  text,
  emotion = "neutral",
  audioUrl,
  onSpeechEnd,
  use3D = false, // false = 2D fallback (mais confiável), true = Three.js
}: TeacherAvatar3DProps) {
  const profile = TEACHER_PROFILES[teacherId] || TEACHER_PROFILES[150001]!;
  const [currentVisemeKey, setCurrentVisemeKey] = useState("neutral");
  const [use3DMode] = useState(use3D);
  const phonemeFramesRef = useRef<PhonemeFrame[]>([]);
  const speechStartRef = useRef<number>(0);
  const animFrameRef = useRef<number | undefined>(undefined);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // ── Sincronização de visemas com o texto ──
  const startVisemeSync = useCallback((spokenText: string, lang: string) => {
    phonemeFramesRef.current = textToPhonemeFrames(spokenText, lang);
    speechStartRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - speechStartRef.current;
      const frame = phonemeFramesRef.current.find(
        f => elapsed >= f.start && elapsed < f.end
      );
      if (frame) {
        setCurrentVisemeKey(frame.viseme);
        animFrameRef.current = requestAnimationFrame(tick);
      } else if (elapsed < (phonemeFramesRef.current.at(-1)?.end ?? 0)) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        setCurrentVisemeKey("neutral");
        onSpeechEnd?.();
      }
    };
    animFrameRef.current = requestAnimationFrame(tick);
  }, [onSpeechEnd]);

  const stopVisemeSync = useCallback(() => {
    if (animFrameRef.current !== undefined) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setCurrentVisemeKey("neutral");
  }, []);

  // ── Falar com Edge TTS Neural ──
  useEffect(() => {
    if (!isTeaching || !text) {
      stopVisemeSync();
      stopEdgeTTS();
      return;
    }

    // Se tiver audioUrl do servidor, usar ele + sincronizar visemas
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      const lang = profile.language || "pt";
      const langCode = lang === "pt" ? "pt-BR" : lang === "en" ? "en-US" : lang;
      startVisemeSync(text, langCode);
      audio.play().catch(console.error);
      audio.onended = () => {
        stopVisemeSync();
        onSpeechEnd?.();
      };
      return () => {
        audio.pause();
        stopVisemeSync();
      };
    }

    // Edge TTS Neural (voz natural via servidor)
    const lang = profile.language || "pt";
    const langCode = lang === "pt" ? "pt-BR"
      : lang === "en" ? "en-US"
      : lang === "es" ? "es-ES"
      : lang === "fr" ? "fr-FR"
      : lang === "de" ? "de-DE"
      : lang === "it" ? "it-IT"
      : "pt-BR";

    stopEdgeTTS();
    startVisemeSync(text, langCode);
    speakNaturalVoice(text, langCode, {
      rate: 0.95,
      gender: profile.gender as 'male' | 'female' | undefined,
      onEnd: () => {
        stopVisemeSync();
        onSpeechEnd?.();
      },
    });

    return () => {
      stopEdgeTTS();
      stopVisemeSync();
    };
  }, [isTeaching, text, audioUrl, profile, startVisemeSync, stopVisemeSync, onSpeechEnd]);

  return (
    <div className="relative w-full aspect-square max-w-xs mx-auto select-none">
      {use3DMode ? (
        // ── Modo 3D com Three.js ──
        <Canvas
          camera={{ position: [0, 0.5, 2.2], fov: 40 }}
          style={{ borderRadius: "50%", overflow: "hidden" }}
          shadows
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 4, 2]} intensity={1.2} castShadow />
          <pointLight position={[-2, 2, 2]} intensity={0.4} color={profile.color} />
          <Suspense fallback={
            <Html center>
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </Html>
          }>
            <AvatarMesh
              profile={profile}
              currentVisemeKey={currentVisemeKey}
              emotion={emotion}
              isTeaching={isTeaching}
            />
            <Environment preset="studio" />
            <ContactShadows position={[0, -1.6, 0]} opacity={0.4} scale={3} blur={2} />
          </Suspense>
        </Canvas>
      ) : (
        // ── Modo 2D (padrão - mais confiável) ──
        <AvatarFallback2D
          profile={profile}
          currentVisemeKey={currentVisemeKey}
          emotion={emotion}
          isTeaching={isTeaching}
        />
      )}

      {/* Nome do professor */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2
                   px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg"
        style={{ backgroundColor: profile.color }}
      >
        {profile.name}
      </div>

      {/* Badge de fala */}
      {isTeaching && (
        <div className="absolute top-1 right-1 flex items-center gap-1 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          Falando
        </div>
      )}

      {/* Emoção */}
      <div className="absolute top-1 left-1 text-xl drop-shadow">
        {emotion === "happy" && "😊"}
        {emotion === "encouraging" && "👍"}
        {emotion === "thinking" && "🤔"}
      </div>
    </div>
  );
}

// Pré-carregar modelos GLB para performance
export function preloadTeacherModels() {
  Object.values(RPM_AVATAR_URLS).forEach(url => {
    useGLTF.preload(url);
  });
}
