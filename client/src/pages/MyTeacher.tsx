/**
 * MyTeacher — Escolha seu Professor Pessoal
 * O aluno pode escolher qualquer professor dos 11 disponíveis como seu professor pessoal.
 * A escolha é salva em localStorage e no banco (via auth.saveAvatar).
 */
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Volume2, Star, Users, Globe } from "lucide-react";
import { ALL_TEACHERS, getStoredTeacherId, storeTeacherId, type TeacherProfile } from "@/lib/teachers-data";

// ── Lip-sync animation using AudioContext ──────────────────────────────────────
function useLipSync() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const [mouthOpen, setMouthOpen] = useState(0); // 0-1

  const startLipSync = (audioBuffer: ArrayBuffer) => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    const ctx = audioCtxRef.current;
    ctx.decodeAudioData(audioBuffer.slice(0), (decoded) => {
      const source = ctx.createBufferSource();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.buffer = decoded;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      analyserRef.current = analyser;
      source.start();
      source.onended = () => {
        setMouthOpen(0);
        cancelAnimationFrame(animFrameRef.current);
      };
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
        setMouthOpen(Math.min(1, avg / 80));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    });
  };

  const stopLipSync = () => {
    cancelAnimationFrame(animFrameRef.current);
    setMouthOpen(0);
  };

  return { mouthOpen, startLipSync, stopLipSync };
}

// ── Teacher Card ───────────────────────────────────────────────────────────────
function TeacherCard({
  teacher,
  isSelected,
  isPlaying,
  mouthOpen,
  onSelect,
  onPreview,
}: {
  teacher: TeacherProfile;
  isSelected: boolean;
  isPlaying: boolean;
  mouthOpen: number;
  onSelect: () => void;
  onPreview: () => void;
}) {
  const openPx = Math.round(mouthOpen * 14); // 0-14px mouth opening

  return (
    <div
      onClick={onSelect}
      className="relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        border: isSelected ? "3px solid #6366f1" : "2px solid rgba(255,255,255,0.1)",
        background: isSelected
          ? "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))"
          : "rgba(255,255,255,0.04)",
        transform: isSelected ? "scale(1.02)" : "scale(1)",
        boxShadow: isSelected ? "0 0 24px rgba(99,102,241,0.4)" : "none",
      }}
    >
      {/* Selected badge */}
      {isSelected && (
        <div
          className="absolute top-2 right-2 z-10 flex items-center justify-center w-7 h-7 rounded-full"
          style={{ background: "#6366f1" }}
        >
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Teacher photo with lip-sync overlay */}
      <div className="relative" style={{ height: 200 }}>
        <img
          src={teacher.photo}
          alt={teacher.name}
          className="w-full h-full object-cover object-top"
          style={{ filter: isSelected ? "brightness(1.05)" : "brightness(0.9)" }}
        />

        {/* Lip-sync mouth overlay */}
        {isPlaying && (
          <div
            className="absolute"
            style={{
              bottom: "22%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 28,
              height: Math.max(3, openPx),
              background: "rgba(220,50,50,0.85)",
              borderRadius: openPx > 4 ? "50%" : "4px",
              transition: "height 0.04s ease-out",
              boxShadow: "0 0 8px rgba(220,50,50,0.5)",
            }}
          />
        )}

        {/* Speaking indicator */}
        {isPlaying && (
          <div className="absolute bottom-2 left-2 flex gap-1 items-end">
            {[0.5, 1, 0.7, 0.9, 0.6].map((h, i) => (
              <div
                key={i}
                style={{
                  width: 3,
                  height: `${8 + mouthOpen * 16 * h}px`,
                  background: "#6366f1",
                  borderRadius: 2,
                  transition: "height 0.05s ease-out",
                }}
              />
            ))}
          </div>
        )}

        {/* Flag overlay */}
        <div
          className="absolute bottom-2 right-2 text-xl"
          style={{
            background: "rgba(0,0,0,0.6)",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {teacher.flag}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-white font-bold text-base">{teacher.name}</h3>
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(); }}
            className="text-gray-400 hover:text-purple-400 transition-colors"
            title="Ouvir saudação"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
        <p className="text-purple-300 text-xs font-semibold mb-1">
          {teacher.flag} {teacher.langName} • {teacher.nationality}
        </p>
        <p className="text-gray-400 text-xs leading-relaxed mb-2 line-clamp-2">
          {teacher.personality}
        </p>
        <div className="flex flex-wrap gap-1">
          {teacher.specialties.slice(0, 2).map(s => (
            <span
              key={s}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc" }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function MyTeacher() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [selectedId, setSelectedId] = useState<string>(() => getStoredTeacherId());
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const { mouthOpen, startLipSync, stopLipSync } = useLipSync();

  const saveAvatarMutation = trpc.auth.saveAvatar.useMutation({
    onSuccess: () => {
      setSaved(true);
      toast.success("Professor salvo com sucesso! 🎉");
      setTimeout(() => setSaved(false), 3000);
    },
    onError: () => toast.error("Erro ao salvar. Tente novamente."),
  });

  const speakMutation = trpc.tts.speak.useMutation({
    onSuccess: (data) => {
      if (data.success && data.audioBase64) {
        const binary = atob(data.audioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        startLipSync(bytes.buffer);
      }
    },
    onSettled: () => {
      setTimeout(() => { setPlayingId(null); stopLipSync(); }, 4000);
    },
  });

  // Load saved teacher from user profile
  useEffect(() => {
    if (user && (user as any).selectedAvatar) {
      const saved = (user as any).selectedAvatar;
      if (saved && saved !== "teacher1") {
        setSelectedId(saved);
        storeTeacherId(saved);
      }
    }
  }, [user]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    storeTeacherId(id);
  };

  const handlePreview = (teacher: TeacherProfile) => {
    if (playingId === teacher.id) return;
    setPlayingId(teacher.id);
    speakMutation.mutate({ text: teacher.greeting, voiceLang: teacher.voiceLang });
  };

  const handleConfirm = () => {
    storeTeacherId(selectedId);
    if (isAuthenticated) {
      saveAvatarMutation.mutate({ avatarId: selectedId });
    } else {
      toast.success("Professor escolhido! Faça login para salvar permanentemente.");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const selectedTeacher = ALL_TEACHERS.find(t => t.id === selectedId) ?? ALL_TEACHERS[0];

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-20 px-4 py-4"
        style={{
          background: "rgba(15,12,41,0.95)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setLocation("/dashboard")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar</span>
          </button>
          <div className="text-center">
            <h1 className="text-white font-bold text-lg">👨‍🏫 Meu Professor</h1>
            <p className="text-gray-400 text-xs">{ALL_TEACHERS.length} professores disponíveis</p>
          </div>
          <Button
            onClick={handleConfirm}
            disabled={saveAvatarMutation.isPending}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
          >
            {saved ? "✓ Salvo!" : saveAvatarMutation.isPending ? "Salvando..." : "Confirmar"}
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Selected teacher banner */}
        <div
          className="rounded-2xl p-4 mb-6 flex items-center gap-4"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))",
            border: "1px solid rgba(99,102,241,0.4)",
          }}
        >
          <div className="relative flex-shrink-0">
            <img
              src={selectedTeacher.photo}
              alt={selectedTeacher.name}
              className="w-16 h-16 rounded-full object-cover object-top border-2 border-purple-400"
            />
            {/* Lip-sync on banner when playing */}
            {playingId === selectedTeacher.id && (
              <div
                className="absolute"
                style={{
                  bottom: "8px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 14,
                  height: Math.max(2, Math.round(mouthOpen * 8)),
                  background: "rgba(220,50,50,0.9)",
                  borderRadius: mouthOpen > 0.3 ? "50%" : "3px",
                  transition: "height 0.04s ease-out",
                }}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-bold text-base">{selectedTeacher.name}</span>
              <Badge className="bg-purple-600/30 text-purple-300 text-xs border-0">
                Seu Professor
              </Badge>
            </div>
            <p className="text-gray-300 text-sm">{selectedTeacher.greetingPt}</p>
          </div>
          <button
            onClick={() => handlePreview(selectedTeacher)}
            className="flex-shrink-0 p-2 rounded-full text-purple-300 hover:text-white hover:bg-purple-600/30 transition-colors"
            title="Ouvir saudação"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: <Users className="w-4 h-4" />, label: "Professores", value: ALL_TEACHERS.length },
            { icon: <Globe className="w-4 h-4" />, label: "Idiomas", value: new Set(ALL_TEACHERS.map(t => t.langCode)).size },
            { icon: <Star className="w-4 h-4" />, label: "Voz Neural", value: "Edge TTS" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-3 text-center"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex justify-center text-purple-400 mb-1">{stat.icon}</div>
              <div className="text-white font-bold text-lg">{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Instruction */}
        <p className="text-gray-400 text-sm text-center mb-4">
          Clique em um professor para selecioná-lo. Clique em{" "}
          <Volume2 className="w-3 h-3 inline" /> para ouvir a saudação com voz neural autêntica.
        </p>

        {/* Teacher grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {ALL_TEACHERS.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              isSelected={selectedId === teacher.id}
              isPlaying={playingId === teacher.id}
              mouthOpen={playingId === teacher.id ? mouthOpen : 0}
              onSelect={() => handleSelect(teacher.id)}
              onPreview={() => handlePreview(teacher)}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleConfirm}
            disabled={saveAvatarMutation.isPending}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-10 font-bold"
          >
            {saved ? "✓ Professor Salvo!" : `Confirmar — ${selectedTeacher.name} é meu professor`}
          </Button>
          <p className="text-gray-500 text-xs mt-2">
            Você pode trocar de professor a qualquer momento
          </p>
        </div>

        {/* Start lesson CTA */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setLocation("/immersive-lesson")}
            className="text-purple-400 hover:text-purple-300 text-sm underline underline-offset-2 transition-colors"
          >
            Iniciar aula com {selectedTeacher.name} →
          </button>
        </div>
      </div>
    </div>
  );
}
