/**
 * ObjectScanAR — Escaneamento de Objetos e Paisagens com IA
 * 
 * Funcionalidades:
 * 1. Câmera ao vivo — aponte para qualquer objeto, sala ou paisagem
 * 2. Upload de imagem — fotos, figuras, paisagens, obras de arte
 * 3. IA identifica todos os elementos visíveis (objetos, animais, plantas, lugares, etc.)
 * 4. Labels flutuantes posicionados sobre cada elemento com:
 *    - Palavra no idioma alvo
 *    - Tradução em português
 *    - Fonética (pronúncia)
 *    - Artigo gramatical
 *    - Exemplo de frase
 *    - Botão de voz (TTS)
 * 5. Quiz rápido após o scan
 * 6. Salvar palavras no vocabulário pessoal
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ArrowLeft, Camera, Upload, Scan, Volume2, BookOpen,
  CheckCircle, XCircle, Sparkles, RefreshCw, ZoomIn,
  Image as ImageIcon, Eye, Trophy
} from "lucide-react";
import { LANGUAGES_57 } from "@/lib/languages";
import LanguageSelector from "@/components/LanguageSelector";
import type { Language } from "@/lib/languages";

// ── Tipos ────────────────────────────────────────────────────────────────────
interface DetectedObject {
  word: string;
  native: string;
  phonetic: string;
  article?: string;
  example: string;
  x: number; // 0-100 posição horizontal
  y: number; // 0-100 posição vertical
}

interface QuizItem {
  word: string;
  native: string;
  options: string[];
  correct: string;
}

type Mode = "camera" | "upload";
type Phase = "scan" | "result" | "quiz";

// ── Componente Principal ──────────────────────────────────────────────────────
export default function ObjectScanAR() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<Mode>("camera");
  const [phase, setPhase] = useState<Phase>("scan");
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null); // base64
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [objects, setObjects] = useState<DetectedObject[]>([]);
  const [selectedObj, setSelectedObj] = useState<DetectedObject | null>(null);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [xp, setXp] = useState(0);
  const [language, setLanguage] = useState<Language>(LANGUAGES_57.find(l => l.code === "en-US")!);

  // Quiz state
  const [quizItems, setQuizItems] = useState<QuizItem[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizSelected, setQuizSelected] = useState<string | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const scanMutation = trpc.vision.scanObjects.useMutation();
  const ttsMutation = trpc.tts?.speak?.useMutation?.() ?? { mutateAsync: async () => {} };

  // ── Câmera ────────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      toast.error("Câmera não disponível. Use o modo de upload de imagem.");
      setMode("upload");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  useEffect(() => {
    if (mode === "camera") startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [mode]);

  // ── Capturar frame da câmera ──────────────────────────────────────────────
  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
  }, []);

  // ── Scan via câmera ───────────────────────────────────────────────────────
  const handleCameraScan = useCallback(async () => {
    const base64 = captureFrame();
    if (!base64) { toast.error("Erro ao capturar imagem"); return; }
    const preview = `data:image/jpeg;base64,${base64}`;
    setCapturedImage(preview);
    await runScan(base64);
  }, [captureFrame, language]);

  // ── Upload de imagem ──────────────────────────────────────────────────────
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setUploadedPreview(dataUrl);
      const base64 = dataUrl.split(",")[1];
      await runScan(base64);
    };
    reader.readAsDataURL(file);
  }, [language]);

  // ── Executar scan via IA ──────────────────────────────────────────────────
  const runScan = useCallback(async (base64: string) => {
    setObjects([]);
    setSelectedObj(null);
    setPhase("result");
    try {
      const result = await scanMutation.mutateAsync({
        imageBase64: base64,
        targetLanguage: language.code,
        nativeLanguage: "pt-BR",
      });
      if (result.objects && result.objects.length > 0) {
        setObjects(result.objects as DetectedObject[]);
        setXp(p => p + result.objects.length * 5);
        toast.success(`${result.objects.length} elementos identificados! +${result.objects.length * 5} XP`);
      } else {
        toast.info("Nenhum objeto identificado. Tente uma imagem mais clara.");
        setPhase("scan");
      }
    } catch {
      toast.error("Erro ao analisar imagem. Tente novamente.");
      setPhase("scan");
    }
  }, [language, scanMutation]);

  // ── Falar palavra ─────────────────────────────────────────────────────────
  const speak = useCallback((text: string) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = language.code;
    utter.rate = 0.85;
    speechSynthesis.speak(utter);
  }, [language]);

  // ── Salvar palavra ────────────────────────────────────────────────────────
  const saveWord = useCallback((obj: DetectedObject) => {
    setSavedWords(p => { const n = new Set(p); n.add(obj.word); return n; });
    setXp(p => p + 10);
    toast.success(`"${obj.word}" salvo no vocabulário! +10 XP`);
  }, []);

  // ── Gerar Quiz ────────────────────────────────────────────────────────────
  const startQuiz = useCallback(() => {
    if (objects.length < 2) { toast.info("Precisa de pelo menos 2 objetos para o quiz"); return; }
    const items: QuizItem[] = objects.map(obj => {
      const others = objects.filter(o => o.word !== obj.word);
      const wrongOptions = others.slice(0, 3).map(o => o.native);
      const allOptions = [obj.native, ...wrongOptions].sort(() => Math.random() - 0.5);
      return { word: obj.word, native: obj.native, options: allOptions, correct: obj.native };
    });
    setQuizItems(items.slice(0, Math.min(6, items.length)));
    setQuizIdx(0);
    setQuizSelected(null);
    setQuizAnswered(false);
    setQuizScore(0);
    setPhase("quiz");
  }, [objects]);

  const answerQuiz = useCallback((option: string) => {
    if (quizAnswered) return;
    setQuizSelected(option);
    setQuizAnswered(true);
    if (option === quizItems[quizIdx]?.correct) {
      setQuizScore(p => p + 1);
      setXp(p => p + 15);
    }
  }, [quizAnswered, quizItems, quizIdx]);

  const nextQuiz = useCallback(() => {
    if (quizIdx < quizItems.length - 1) {
      setQuizIdx(p => p + 1);
      setQuizSelected(null);
      setQuizAnswered(false);
    } else {
      setPhase("result");
      const total = quizItems.length;
      toast.success(`Quiz concluído! ${quizScore + (quizSelected === quizItems[quizIdx]?.correct ? 1 : 0)}/${total} corretas!`);
    }
  }, [quizIdx, quizItems, quizScore, quizSelected]);

  const reset = useCallback(() => {
    setPhase("scan");
    setObjects([]);
    setCapturedImage(null);
    setUploadedPreview(null);
    setSelectedObj(null);
    if (mode === "camera") startCamera();
  }, [mode, startCamera]);

  const currentImage = mode === "upload" ? uploadedPreview : capturedImage;

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER: QUIZ
  // ════════════════════════════════════════════════════════════════════════════
  if (phase === "quiz" && quizItems.length > 0) {
    const item = quizItems[quizIdx];
    const isCorrect = quizSelected === item.correct;
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setPhase("result")} className="text-gray-400">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="font-bold text-sm">Quiz Rápido · {language.flag} {language.name}</div>
              <div className="w-full bg-gray-800 rounded-full h-1 mt-1">
                <div className="bg-blue-500 h-1 rounded-full transition-all" style={{ width: `${((quizIdx + 1) / quizItems.length) * 100}%` }} />
              </div>
            </div>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">⭐ {xp} XP</Badge>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-lg mx-auto w-full">
          <div className="text-center mb-8">
            <p className="text-sm text-gray-400 mb-2">O que significa esta palavra em {language.name}?</p>
            <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl border border-blue-500/30 px-8 py-6 inline-block">
              <div className="text-4xl font-bold text-white mb-1">{item.word}</div>
              <button onClick={() => speak(item.word)} className="text-blue-300 hover:text-blue-200 transition-colors">
                <Volume2 className="w-5 h-5 mx-auto" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            {item.options.map(opt => (
              <button
                key={opt}
                onClick={() => answerQuiz(opt)}
                className={`rounded-xl p-4 text-sm font-semibold border-2 transition-all ${
                  !quizAnswered
                    ? "bg-gray-800 border-gray-700 hover:border-blue-500 hover:bg-blue-900/20"
                    : opt === item.correct
                    ? "bg-green-900/40 border-green-500 text-green-300"
                    : opt === quizSelected
                    ? "bg-red-900/40 border-red-500 text-red-300"
                    : "bg-gray-800 border-gray-700 opacity-50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {quizAnswered && (
            <div className={`mt-6 w-full rounded-xl p-4 text-center ${isCorrect ? "bg-green-900/30 border border-green-500/40" : "bg-red-900/30 border border-red-500/40"}`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {isCorrect ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                <span className={`font-bold ${isCorrect ? "text-green-300" : "text-red-300"}`}>
                  {isCorrect ? `Correto! +15 XP` : `Errado — era "${item.correct}"`}
                </span>
              </div>
              <Button onClick={nextQuiz} className="bg-blue-600 hover:bg-blue-700 text-white">
                {quizIdx < quizItems.length - 1 ? "Próxima →" : "Ver Resultado"}
              </Button>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-500">{quizIdx + 1} / {quizItems.length}</div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER: RESULTADO COM LABELS AR
  // ════════════════════════════════════════════════════════════════════════════
  if (phase === "result" && currentImage) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={reset} className="text-gray-400">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="font-bold text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" />
                {scanMutation.isPending ? "Analisando com IA..." : `${objects.length} elementos detectados`}
              </div>
              <div className="text-xs text-gray-400">{language.flag} {language.name}</div>
            </div>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">⭐ {xp} XP</Badge>
          </div>
        </div>

        {/* Imagem com labels flutuantes */}
        <div className="relative mx-4 mt-4 rounded-2xl overflow-hidden border border-gray-700" style={{ aspectRatio: "16/9" }}>
          <img
            src={currentImage}
            alt="Imagem escaneada"
            className="w-full h-full object-cover"
          />

          {/* Loading overlay */}
          {scanMutation.isPending && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
              <Sparkles className="w-10 h-10 text-purple-400 animate-pulse" />
              <p className="text-white font-semibold">IA identificando elementos...</p>
              <p className="text-gray-400 text-sm">Analisando objetos, paisagem e contexto</p>
            </div>
          )}

          {/* Labels flutuantes AR */}
          {!scanMutation.isPending && objects.map((obj, i) => (
            <button
              key={i}
              onClick={() => setSelectedObj(selectedObj?.word === obj.word ? null : obj)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ left: `${obj.x}%`, top: `${obj.y}%` }}
            >
              {/* Ponto de ancoragem */}
              <div className="relative">
                <div className="w-3 h-3 bg-purple-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
                {/* Label */}
                <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/85 backdrop-blur border rounded-lg px-2 py-1 text-xs shadow-xl transition-all ${
                  selectedObj?.word === obj.word ? "border-purple-400 scale-110" : "border-gray-600"
                }`}>
                  <div className="font-bold text-white">{obj.word}</div>
                  <div className="text-gray-300 text-[10px]">{obj.native}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Painel de detalhes do objeto selecionado */}
        {selectedObj && (
          <div className="mx-4 mt-3 bg-gray-900 border border-purple-500/40 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {selectedObj.article && <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{selectedObj.article}</span>}
                  <span className="text-xl font-bold text-white">{selectedObj.word}</span>
                  <button onClick={() => speak(selectedObj.word)} className="text-purple-400 hover:text-purple-300">
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-purple-300 text-sm font-medium mb-1">{selectedObj.native}</div>
                <div className="text-gray-400 text-xs mb-2 font-mono">[{selectedObj.phonetic}]</div>
                <div className="text-gray-300 text-xs italic bg-gray-800 rounded-lg px-3 py-2">
                  "{selectedObj.example}"
                </div>
              </div>
              <button
                onClick={() => saveWord(selectedObj)}
                className={`flex-shrink-0 p-2 rounded-xl transition-all ${
                  savedWords.has(selectedObj.word)
                    ? "bg-green-600/20 text-green-400 border border-green-500/40"
                    : "bg-blue-600/20 text-blue-400 border border-blue-500/40 hover:bg-blue-600/40"
                }`}
              >
                {savedWords.has(selectedObj.word) ? <CheckCircle className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        {/* Lista de todos os objetos detectados */}
        {!scanMutation.isPending && objects.length > 0 && (
          <div className="mx-4 mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Elementos detectados</span>
              <button onClick={startQuiz} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Quiz rápido
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {objects.map((obj, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedObj(obj); speak(obj.word); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${
                    savedWords.has(obj.word)
                      ? "bg-green-900/30 border-green-500/40 text-green-300"
                      : selectedObj?.word === obj.word
                      ? "bg-purple-900/40 border-purple-500/60 text-purple-200"
                      : "bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500/40"
                  }`}
                >
                  <Volume2 className="w-3 h-3" />
                  <span className="font-medium">{obj.word}</span>
                  <span className="text-gray-500">·</span>
                  <span>{obj.native}</span>
                  {savedWords.has(obj.word) && <CheckCircle className="w-3 h-3 text-green-400" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="mx-4 mt-4 mb-6 flex gap-3">
          <Button onClick={reset} variant="outline" className="flex-1 border-gray-700 text-gray-300">
            <RefreshCw className="w-4 h-4 mr-2" /> Novo Scan
          </Button>
          {objects.length >= 2 && (
            <Button onClick={startQuiz} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
              <Trophy className="w-4 h-4 mr-2" /> Quiz ({objects.length})
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER: TELA PRINCIPAL (CÂMERA / UPLOAD)
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/ar-mode">
            <Button variant="ghost" size="icon" className="text-gray-400"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold flex items-center gap-2">
              <Scan className="w-5 h-5 text-purple-400" /> Scan AR Inteligente
            </h1>
            <p className="text-xs text-gray-400">Aponte para qualquer coisa — objetos, fotos, paisagens</p>
          </div>
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">⭐ {xp} XP</Badge>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-4 gap-4">

        {/* Seletor de idioma */}
        <div>
          <p className="text-xs text-gray-400 mb-2">Idioma alvo</p>
          <LanguageSelector
            value={language}
            onChange={setLanguage}
          />
        </div>

        {/* Tabs câmera / upload */}
        <div className="flex bg-gray-900 rounded-xl p-1 gap-1">
          <button
            onClick={() => setMode("camera")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === "camera" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Camera className="w-4 h-4" /> Câmera ao Vivo
          </button>
          <button
            onClick={() => setMode("upload")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === "upload" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Upload className="w-4 h-4" /> Enviar Imagem
          </button>
        </div>

        {/* Câmera ao vivo */}
        {mode === "camera" && (
          <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-700" style={{ aspectRatio: "16/9" }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900">
                <Camera className="w-12 h-12 text-gray-600" />
                <p className="text-gray-400 text-sm">Iniciando câmera...</p>
              </div>
            )}

            {/* Guia de scan */}
            {cameraActive && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-4 border-2 border-purple-400/40 rounded-xl" />
                <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-purple-400 rounded-tl" />
                <div className="absolute top-6 right-6 w-6 h-6 border-t-2 border-r-2 border-purple-400 rounded-tr" />
                <div className="absolute bottom-6 left-6 w-6 h-6 border-b-2 border-l-2 border-purple-400 rounded-bl" />
                <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-purple-400 rounded-br" />
                <div className="absolute bottom-3 left-0 right-0 text-center">
                  <span className="text-xs text-purple-300 bg-black/50 px-3 py-1 rounded-full">
                    Aponte para objetos, fotos ou paisagens
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload de imagem */}
        {mode === "upload" && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative rounded-2xl overflow-hidden bg-gray-900 border-2 border-dashed border-gray-700 hover:border-purple-500/60 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 py-12"
          >
            {uploadedPreview ? (
              <img src={uploadedPreview} alt="Preview" className="w-full h-48 object-contain rounded-xl" />
            ) : (
              <>
                <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-purple-400" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-200">Enviar imagem para análise</p>
                  <p className="text-sm text-gray-500 mt-1">Fotos, paisagens, obras de arte, figuras, revistas</p>
                  <p className="text-xs text-gray-600 mt-1">JPG, PNG, WEBP · Qualquer conteúdo visual</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  {["🏔️ Paisagem", "🏙️ Cidade", "🐾 Animais", "🍎 Comida", "🏠 Casa", "🎨 Arte"].map(tag => (
                    <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              </>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </div>
        )}

        {/* Botão de scan */}
        {mode === "camera" && cameraActive && (
          <Button
            onClick={handleCameraScan}
            disabled={scanMutation.isPending}
            className="w-full py-6 text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl shadow-lg shadow-purple-900/30"
          >
            {scanMutation.isPending ? (
              <><Sparkles className="w-5 h-5 mr-2 animate-spin" /> Analisando com IA...</>
            ) : (
              <><Scan className="w-5 h-5 mr-2" /> Escanear Agora</>
            )}
          </Button>
        )}

        {/* Dicas de uso */}
        <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-800">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Como usar</p>
          <div className="space-y-2">
            {[
              { icon: "📷", text: "Aponte a câmera para qualquer objeto na sala" },
              { icon: "🖼️", text: "Mostre uma foto de paisagem, cidade ou natureza" },
              { icon: "📰", text: "Fotografe uma página de revista ou livro com imagens" },
              { icon: "🎨", text: "Aponte para uma obra de arte ou poster" },
              { icon: "🔍", text: "A IA identifica tudo e ensina o vocabulário no idioma alvo" },
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
                <span>{tip.icon}</span>
                <span>{tip.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Estatísticas da sessão */}
        {savedWords.size > 0 && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-green-300">Vocabulário salvo nesta sessão</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from(savedWords).map(word => (
                <span key={word} className="text-xs bg-green-900/40 text-green-300 border border-green-500/30 px-2 py-1 rounded-full">
                  {word} ✓
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
