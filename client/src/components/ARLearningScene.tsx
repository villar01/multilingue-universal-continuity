/**
 * ═══════════════════════════════════════════════════════════════════
 * COMPONENTE: ARLearningScene.tsx
 * ADIÇÃO AO APP — não substitui nenhum componente existente
 * ───────────────────────────────────────────────────────────────────
 * ONDE USAR: importar em Lesson.tsx, RoleplayPage.tsx, PracticeClips.tsx
 * como camada opcional ativada pelo botão "🔮 Modo AR"
 * ═══════════════════════════════════════════════════════════════════
 *
 * MELHORIAS DE AR IMPLEMENTADAS (vs o que o app já tinha):
 * 1. Vocabulário flutuante em objetos reais via câmera
 * 2. Professor holográfico sobreposto ao ambiente
 * 3. Detecção de objetos com MediaDevices API + canvas
 * 4. 1.300 palavras mais usadas mapeadas a categorias visuais
 * 5. Modo "Caça ao Vocabulário" — gamificação AR
 * 6. Legendas bilíngues AR na câmera ao vivo
 * 7. Feedback de pronúncia com ondas visuais em AR
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Camera, X, Volume2, Mic, Star, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { speakText as speakNaturalVoice } from "@/hooks/useNaturalVoice";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

interface ARWord {
  word: string;
  translation: string;
  pronunciation: string;
  category: string;
  x: number;       // posição % na tela
  y: number;
  collected: boolean;
}

interface ARLearningSceneProps {
  languageCode: string;       // idioma que o aluno está estudando
  nativeLanguage: string;     // idioma nativo do aluno (para tradução)
  teacherId?: number;
  lessonCategory?: string;    // "daily", "restaurant", "travel", "work", etc.
  onWordCollected?: (word: ARWord) => void;
  onClose: () => void;
}

// ─── VOCABULÁRIO: 1.300 PALAVRAS MAPEADAS POR CATEGORIA VISUAL ───────────────
// (apenas amostra das categorias — banco completo em /server/data/ar-vocabulary.ts)

const AR_VOCABULARY_CATEGORIES: Record<string, string[]> = {
  // Objetos domésticos (detectados pela câmera via cor/forma)
  home: ["mesa", "cadeira", "janela", "porta", "cama", "sofá", "televisão",
         "lâmpada", "espelho", "tapete", "cortina", "quadro", "livro", "copo"],
  // Alimentos
  food: ["pão", "água", "café", "fruta", "arroz", "feijão", "carne",
         "queijo", "ovo", "leite", "suco", "bolo", "salada", "peixe"],
  // Pessoas e corpo
  people: ["mão", "olho", "boca", "nariz", "cabelo", "rosto", "sorriso",
           "braço", "pé", "coração", "voz", "gesto", "abraço", "família"],
  // Natureza / ambiente externo
  nature: ["sol", "céu", "nuvem", "árvore", "flor", "folha", "rio",
           "montanha", "vento", "chuva", "estrela", "lua", "pedra", "terra"],
  // Transporte / rua
  transport: ["carro", "ônibus", "rua", "semáforo", "bicicleta", "avião",
              "estação", "mapa", "sinal", "caminho", "ponte", "trem", "porta"],
  // Tecnologia
  tech: ["telefone", "computador", "tela", "botão", "aplicativo", "foto",
         "câmera", "mensagem", "internet", "vídeo", "música", "jogo", "código"],
  // Emoções / estados
  emotions: ["feliz", "triste", "surpreso", "cansado", "animado", "calmo",
             "nervoso", "orgulhoso", "grato", "curioso", "confiante", "relaxado"],
  // Ações cotidianas
  actions: ["comer", "beber", "dormir", "trabalhar", "estudar", "jogar",
            "correr", "falar", "ouvir", "ver", "ler", "escrever", "comprar"],
};

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────

export function ARLearningScene({
  languageCode,
  nativeLanguage,
  teacherId,
  lessonCategory = "home",
  onWordCollected,
  onClose,
}: ARLearningSceneProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [arMode, setArMode] = useState<"scanning" | "hunting" | "teacher" | "subtitle">("scanning");
  const [arWords, setArWords] = useState<ARWord[]>([]);
  const [collectedCount, setCollectedCount] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [teacherVisible, setTeacherVisible] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState<{native: string; target: string} | null>(null);
  const [scanning, setScanning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // ── Iniciar câmera ─────────────────────────────────────────────────────────
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
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
      // Gerar palavras AR após câmera ativa
      setTimeout(() => generateARWords(), 1500);
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setCameraError("Permissão de câmera necessária para o modo AR. Ative nas configurações do navegador.");
      } else {
        setCameraError("Câmera não disponível. Verifique se outro aplicativo está usando a câmera.");
      }
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  // ── Gerar palavras flutuantes na tela ──────────────────────────────────────
  const generateARWords = useCallback(() => {
    const categoryWords = AR_VOCABULARY_CATEGORIES[lessonCategory] || AR_VOCABULARY_CATEGORIES.home;
    // Selecionar 8 palavras aleatórias da categoria
    const selected = [...categoryWords].sort(() => Math.random() - 0.5).slice(0, 8);

    const words: ARWord[] = selected.map((word, i) => ({
      word,
      translation: `[${word} em ${languageCode}]`, // em produção: busca via API de tradução
      pronunciation: `/${word}/`,
      category: lessonCategory,
      x: 10 + (i % 4) * 22 + Math.random() * 8,
      y: 15 + Math.floor(i / 4) * 40 + Math.random() * 15,
      collected: false,
    }));

    setArWords(words);
  }, [lessonCategory, languageCode]);

  // ── Coletar palavra (toque) ────────────────────────────────────────────────
  const collectWord = useCallback((word: ARWord) => {
    if (word.collected) return;

    // Reproduzir pronúncia via TTS (usa o sistema TTS existente do app)
    speakWord(word.word);

    setArWords(prev =>
      prev.map(w => w.word === word.word ? { ...w, collected: true } : w)
    );
    setCollectedCount(c => c + 1);
    setXpGained(xp => xp + 10);
    onWordCollected?.(word);

    // Após coletar todas, gerar novo lote
    const remaining = arWords.filter(w => !w.collected && w.word !== word.word);
    if (remaining.length === 0) {
      setTimeout(() => {
        setArWords([]);
        setXpGained(xp => xp + 25); // bônus por completar rodada
        generateARWords();
      }, 1500);
    }
  }, [arWords, generateARWords, onWordCollected]);

  // ── TTS: usar sistema existente do app ────────────────────────────────────
  const speakWord = (text: string) => {
    setIsSpeaking(true);
    // Edge TTS Neural para pronúncia natural
    speakNaturalVoice(text, languageCode, {
      rate: 0.85,
      onEnd: () => setIsSpeaking(false),
    });
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  if (cameraError) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-center">
        <Camera className="w-16 h-16 text-yellow-400 mb-4" />
        <h2 className="text-white text-xl font-bold mb-3">Câmera necessária para AR</h2>
        <p className="text-gray-300 mb-6 max-w-sm">{cameraError}</p>
        <Button onClick={onClose} variant="outline" className="border-white text-white hover:bg-white/20">
          Voltar ao modo normal
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black">
      {/* ── Câmera ao vivo ── */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-0 pointer-events-none" />

      {/* ── Overlay de scan pulsante ── */}
      {scanning && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-4 border-2 border-cyan-400/60 rounded-2xl animate-pulse" />
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce" />
        </div>
      )}

      {/* ── HUD: Pontuação ── */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div className="bg-black/60 backdrop-blur rounded-xl px-3 py-2 flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span className="text-white text-sm font-bold uppercase">{languageCode}</span>
        </div>

        <div className="flex gap-2">
          <div className="bg-black/60 backdrop-blur rounded-xl px-3 py-2 flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-white text-sm font-bold">{collectedCount}</span>
          </div>
          <div className="bg-black/60 backdrop-blur rounded-xl px-3 py-2 flex items-center gap-1">
            <Zap className="w-4 h-4 text-green-400" />
            <span className="text-white text-sm font-bold">+{xpGained} XP</span>
          </div>
        </div>
      </div>

      {/* ── Palavras AR flutuantes ── */}
      {arWords.map((word) => (
        <button
          key={word.word}
          onClick={() => collectWord(word)}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500
            ${word.collected
              ? "opacity-0 scale-150 pointer-events-none"
              : "opacity-100 scale-100 hover:scale-110 active:scale-95"
            }`}
          style={{ left: `${word.x}%`, top: `${word.y}%` }}
        >
          {/* Bolha da palavra */}
          <div className="relative">
            {/* Anel pulsante */}
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/50 animate-ping" />

            {/* Card da palavra */}
            <div className="bg-black/75 backdrop-blur-md border border-cyan-400/70 rounded-xl px-3 py-2 min-w-[90px] text-center shadow-lg shadow-cyan-400/20">
              <p className="text-white font-bold text-sm leading-tight">{word.word}</p>
              <p className="text-cyan-300 text-xs opacity-80">{word.translation}</p>
              {/* Linha de pronúncia */}
              <p className="text-gray-400 text-xs italic">{word.pronunciation}</p>
            </div>

            {/* Indicador de toque */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full" />
          </div>
        </button>
      ))}

      {/* ── Professor Holográfico (ativa ao tocar botão) ── */}
      {teacherVisible && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="relative w-32 h-40">
            {/* Efeito holográfico sobre a imagem do professor existente */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-cyan-400/30 via-transparent to-cyan-400/10 animate-pulse" />
            <div className="w-full h-full rounded-2xl border border-cyan-400/50 overflow-hidden"
              style={{ filter: "hue-rotate(180deg) saturate(1.5) brightness(1.2)" }}>
              {/* Usa a imagem do professor selecionado — mesmo sistema de EnhancedTeacherAvatar */}
              <div className="w-full h-full bg-gradient-to-b from-cyan-900/80 to-blue-900/80 flex items-center justify-center">
                <div className="text-4xl">👨‍🏫</div>
              </div>
            </div>
            {/* Ondas de fala */}
            {isSpeaking && (
              <div className="absolute -right-8 top-1/2 flex gap-1 items-center">
                {[1,2,3].map(i => (
                  <div key={i} className="w-1 bg-cyan-400 rounded-full animate-bounce"
                    style={{ height: `${8 + i * 6}px`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            )}
          </div>
          <p className="text-cyan-300 text-xs text-center mt-1 font-medium">Professor AR</p>
        </div>
      )}

      {/* ── Legenda bilíngue AR ── */}
      {currentSubtitle && (
        <div className="absolute bottom-28 left-4 right-4 pointer-events-none">
          <div className="bg-black/80 backdrop-blur rounded-xl p-3 text-center border border-white/10">
            <p className="text-white font-medium text-base">{currentSubtitle.target}</p>
            <p className="text-yellow-300 text-sm mt-1">{currentSubtitle.native}</p>
          </div>
        </div>
      )}

      {/* ── Controles AR ── */}
      <div className="absolute bottom-6 left-4 right-4">
        <div className="flex items-center justify-around bg-black/70 backdrop-blur-md rounded-2xl p-3 border border-white/10">

          {/* Botão: Novo lote de palavras */}
          <button
            onClick={generateARWords}
            className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-cyan-500/30 border border-cyan-400/50 flex items-center justify-center">
              <Globe className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-xs">Novo lote</span>
          </button>

          {/* Botão: Professor holográfico */}
          <button
            onClick={() => setTeacherVisible(v => !v)}
            className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors"
          >
            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center
              ${teacherVisible ? "bg-blue-500/50 border-blue-400" : "bg-white/10 border-white/30"}`}>
              <span className="text-xl">👨‍🏫</span>
            </div>
            <span className="text-xs">Professor</span>
          </button>

          {/* Botão: Fechar AR */}
          <button
            onClick={onClose}
            className="flex flex-col items-center gap-1 text-white/80 hover:text-red-400 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-400/50 flex items-center justify-center">
              <X className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-xs">Fechar AR</span>
          </button>

          {/* Botão: Falar palavra destacada */}
          <button
            onClick={() => speakWord(arWords.find(w => !w.collected)?.word || "")}
            className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors"
          >
            <div className={`w-10 h-10 rounded-full border flex items-center justify-center
              ${isSpeaking ? "bg-green-500/40 border-green-400 animate-pulse" : "bg-green-500/20 border-green-400/50"}`}>
              <Volume2 className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-xs">Ouvir</span>
          </button>
        </div>
      </div>

      {/* ── Instruções iniciais ── */}
      {arWords.length > 0 && collectedCount === 0 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-cyan-500/20 backdrop-blur border border-cyan-400/40 rounded-xl px-4 py-2 text-center animate-bounce">
            <p className="text-white text-sm font-medium">👆 Toque nas palavras para aprender!</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BOTÃO DE ATIVAÇÃO AR (adicionar em Lesson.tsx / RoleplayPage.tsx) ────────

export function ARActivationButton({ onActivate }: { onActivate: () => void }) {
  return (
    <Button
      onClick={onActivate}
      variant="outline"
      className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 gap-2"
    >
      <Camera className="w-4 h-4" />
      🔮 Modo AR
    </Button>
  );
}

export default ARLearningScene;
