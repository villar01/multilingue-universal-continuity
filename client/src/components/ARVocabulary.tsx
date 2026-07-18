/**
 * ARVocabulary — Modo Realidade Aumentada de Vocabulário
 * MultiLingue Universal - Vocabulário em Realidade Aumentada com IA
 * Funciona via WebRTC (câmera) + Canvas overlay + CSS 3D transforms
 * Compatível com todos os navegadores modernos (sem necessidade de headset)
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, X, Volume2, ChevronLeft, ChevronRight, Maximize2, ZoomIn } from "lucide-react";

interface VocabItem {
  word: string;
  translation: string;
  phonetic?: string;
  emoji?: string;
  imageKeyword?: string;
  examples?: Array<{ en: string; pt: string }>;
}

interface ARVocabularyProps {
  vocabulary: VocabItem[];
  languageCode?: string;
  teacherName?: string;
  onClose?: () => void;
  onSpeak?: (word: string) => void;
}

// Posições fixas para os cards AR flutuantes na tela
const AR_POSITIONS = [
  { x: 15, y: 20 },
  { x: 60, y: 15 },
  { x: 75, y: 55 },
  { x: 10, y: 60 },
  { x: 40, y: 70 },
  { x: 55, y: 30 },
];

export default function ARVocabulary({ vocabulary, languageCode = "en", teacherName = "Professor", onClose, onSpeak }: ARVocabularyProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeWord, setActiveWord] = useState<number>(0);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Iniciar câmera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setCameraError(null);
      // Mostrar cards progressivamente
      setTimeout(() => setVisibleCards([0]), 500);
      setTimeout(() => setVisibleCards([0, 1]), 1200);
      setTimeout(() => setVisibleCards([0, 1, 2]), 1900);
      setTimeout(() => setVisibleCards([0, 1, 2, 3]), 2600);
      setTimeout(() => setVisibleCards([0, 1, 2, 3, 4]), 3300);
      setTimeout(() => setVisibleCards([0, 1, 2, 3, 4, 5]), 4000);
    } catch (err) {
      setCameraError("Câmera não disponível. Verifique as permissões do navegador.");
      console.error("Camera error:", err);
    }
  }, []);

  // Parar câmera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setVisibleCards([]);
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const handleClose = () => {
    stopCamera();
    onClose?.();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const currentWord = vocabulary[activeWord];
  const displayVocab = vocabulary.slice(0, 6);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden bg-black"
      style={{ minHeight: 420, aspectRatio: "16/9" }}
    >
      {/* ── Câmera / Fundo ─────────────────────────────────────────────────── */}
      {cameraActive ? (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
      ) : (
        // Fundo simulado quando câmera não está ativa (gradiente imersivo)
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 30%, rgba(99,102,241,0.4) 0%, transparent 50%),
                                radial-gradient(circle at 80% 70%, rgba(139,92,246,0.4) 0%, transparent 50%)`,
            }}
          />
          {/* Grid AR simulado */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>
      )}

      {/* ── Overlay AR — Cards de Vocabulário Flutuantes ──────────────────── */}
      {displayVocab.map((item, idx) => {
        const pos = AR_POSITIONS[idx % AR_POSITIONS.length];
        const isVisible = visibleCards.includes(idx) || !cameraActive;
        const isActive = activeWord === idx;
        return (
          <div
            key={idx}
            className={`absolute transition-all duration-700 cursor-pointer select-none`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: isVisible
                ? `scale(1) translateZ(0) ${isActive ? "scale(1.1)" : ""}`
                : "scale(0) translateZ(0)",
              opacity: isVisible ? 1 : 0,
              zIndex: isActive ? 20 : 10,
              transitionDelay: `${idx * 0.1}s`,
            }}
            onClick={() => {
              setActiveWord(idx);
              onSpeak?.(item.word);
            }}
          >
            {/* Card AR com efeito glassmorphism */}
            <div
              className={`relative rounded-xl px-3 py-2 shadow-2xl border transition-all duration-300 ${
                isActive
                  ? "bg-indigo-600/90 border-indigo-400 shadow-indigo-500/50"
                  : "bg-black/60 border-white/20 hover:bg-black/80"
              }`}
              style={{
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                minWidth: 90,
                maxWidth: 140,
              }}
            >
              {/* Linha de conexão AR (decorativa) */}
              <div className={`absolute -bottom-3 left-1/2 w-px h-3 ${isActive ? "bg-indigo-400" : "bg-white/30"}`} />
              <div className={`absolute -bottom-4 left-1/2 w-2 h-2 rounded-full -translate-x-1/2 ${isActive ? "bg-indigo-400" : "bg-white/30"}`} />

              <div className="text-center">
                <span className="text-2xl block mb-1">{item.emoji || "📚"}</span>
                <p className={`font-bold text-sm leading-tight ${isActive ? "text-white" : "text-white/90"}`}>
                  {item.word}
                </p>
                <p className={`text-xs mt-0.5 ${isActive ? "text-indigo-200" : "text-white/60"}`}>
                  {item.translation}
                </p>
                {item.phonetic && (
                  <p className="text-xs text-white/40 mt-0.5">{item.phonetic}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* ── Painel Inferior — Detalhes da Palavra Ativa ───────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 p-4"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 70%, transparent 100%)",
        }}
      >
        {currentWord && (
          <div className="flex items-start gap-3">
            {/* Imagem do objeto */}
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-indigo-500/50 shadow-lg">
              <img
                src={`https://source.unsplash.com/80x80/?${encodeURIComponent(currentWord.imageKeyword || currentWord.word)}`}
                alt={currentWord.word}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://placehold.co/80x80/4f46e5/white?text=${currentWord.emoji || "📚"}`;
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-bold text-lg leading-tight">{currentWord.word}</h3>
                <span className="text-2xl">{currentWord.emoji}</span>
                <button
                  onClick={() => onSpeak?.(currentWord.word)}
                  className="p-1 rounded-full bg-indigo-600/80 hover:bg-indigo-600 transition-colors"
                >
                  <Volume2 className="w-3 h-3 text-white" />
                </button>
              </div>
              <p className="text-indigo-300 text-sm">{currentWord.translation}</p>
              {currentWord.phonetic && (
                <p className="text-white/50 text-xs">{currentWord.phonetic}</p>
              )}
              {currentWord.examples?.[0] && (
                <p className="text-white/70 text-xs mt-1 italic truncate">
                  "{currentWord.examples[0].en}"
                </p>
              )}
            </div>
            {/* Navegação */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setActiveWord(Math.max(0, activeWord - 1))}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-3 h-3 text-white" />
              </button>
              <button
                onClick={() => setActiveWord(Math.min(vocabulary.length - 1, activeWord + 1))}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
        )}
        {/* Indicadores */}
        <div className="flex items-center justify-center gap-1 mt-2">
          {vocabulary.slice(0, 6).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveWord(idx)}
              className={`rounded-full transition-all duration-300 ${
                activeWord === idx ? "w-4 h-1.5 bg-indigo-400" : "w-1.5 h-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Header — Controles ─────────────────────────────────────────────── */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 rounded-lg bg-indigo-600/80 backdrop-blur-sm border border-indigo-400/30">
            <span className="text-white text-xs font-bold tracking-wide">AR MODE</span>
          </div>
          {cameraActive && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-600/80 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
              <span className="text-white text-xs">AO VIVO</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5 text-white" />
          </button>
          {onClose && (
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg bg-black/50 hover:bg-red-600/80 backdrop-blur-sm transition-colors"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* ── Estado: Câmera Inativa ─────────────────────────────────────────── */}
      {!cameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-30">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/80 flex items-center justify-center mx-auto mb-3 shadow-2xl shadow-indigo-500/50">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Modo AR — Vocabulário</h3>
            <p className="text-white/60 text-sm max-w-xs text-center px-4">
              Ative a câmera para ver os objetos do vocabulário sobrepostos no mundo real, com IA de última geração
            </p>
          </div>
          {cameraError ? (
            <div className="px-4 py-2 rounded-xl bg-red-600/20 border border-red-500/30 text-red-300 text-sm text-center max-w-xs">
              {cameraError}
              <p className="text-white/50 text-xs mt-1">Modo simulado ativado abaixo</p>
            </div>
          ) : null}
          <div className="flex gap-3">
            <Button
              onClick={startCamera}
              className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30"
            >
              <Camera className="w-4 h-4 mr-2" />
              Ativar Câmera AR
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // Modo simulado sem câmera
                setCameraActive(false);
                setVisibleCards([0, 1, 2, 3, 4, 5]);
              }}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ZoomIn className="w-4 h-4 mr-2" />
              Modo Simulado
            </Button>
          </div>
        </div>
      )}

      {/* ── Contador de palavras ───────────────────────────────────────────── */}
      <div className="absolute top-12 right-3">
        <Badge className="bg-black/60 text-white border-white/20 text-xs">
          {activeWord + 1} / {Math.min(vocabulary.length, 6)}
        </Badge>
      </div>
    </div>
  );
}
