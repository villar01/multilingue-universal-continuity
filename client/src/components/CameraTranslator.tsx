/**
 * CameraTranslator — Tradução Instantânea por Câmera
 * MultiLingue Universal - Tradução por Câmera com IA em Tempo Real
 * Usa câmera do dispositivo + OCR via canvas + LLM para tradução
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, X, Languages, Zap, RefreshCw, Image as ImageIcon, ScanLine } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

interface CameraTranslatorProps {
  targetLanguage?: string;
  nativeLanguage?: string;
  onClose?: () => void;
}

export default function CameraTranslator({
  targetLanguage = "English",
  nativeLanguage = "Português",
  onClose,
}: CameraTranslatorProps) {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Array<{ original: string; translated: string; x: number; y: number }>>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const scanLineRef = useRef<number>(0);
  const [scanY, setScanY] = useState(0);
  const scanAnimRef = useRef<number | null>(null);

  // Animação da linha de scan
  useEffect(() => {
    if (!cameraActive) return;
    const animate = () => {
      scanLineRef.current = (scanLineRef.current + 1) % 100;
      setScanY(scanLineRef.current);
      scanAnimRef.current = requestAnimationFrame(animate);
    };
    scanAnimRef.current = requestAnimationFrame(animate);
    return () => {
      if (scanAnimRef.current) cancelAnimationFrame(scanAnimRef.current);
    };
  }, [cameraActive]);

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
    } catch (err) {
      setCameraError("Câmera não disponível. Verifique as permissões.");
      console.error("Camera error:", err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // Capturar frame da câmera
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  }, []);

  // Mutation para traduzir imagem via LLM
  const translateImageMutation = trpc.translate.translateImage.useMutation({
    onSuccess: (data) => {
      setTranslations(data.translations || []);
      setIsTranslating(false);
    },
    onError: () => {
      setIsTranslating(false);
      toast.error("Erro ao traduzir. Tente novamente.");
    },
  });

  const handleCapture = useCallback(async () => {
    if (!user) {
      toast.error("Faça login para traduzir imagens com IA.");
      return;
    }
    setIsCapturing(true);
    const imageData = captureFrame();
    if (!imageData) {
      setIsCapturing(false);
      return;
    }
    setCapturedImage(imageData);
    setIsTranslating(true);
    setIsCapturing(false);
    // Chamar LLM para detectar e traduzir texto na imagem
    translateImageMutation.mutate({
      imageBase64: imageData,
      targetLanguage,
      nativeLanguage,
    });
  }, [captureFrame, targetLanguage, nativeLanguage, translateImageMutation, user]);

  const handleReset = () => {
    setCapturedImage(null);
    setTranslations([]);
  };

  const handleClose = () => {
    stopCamera();
    onClose?.();
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{ minHeight: 380, aspectRatio: "16/9" }}>
      {/* Canvas oculto para captura */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ── Fundo: câmera ou imagem capturada ─────────────────────────────── */}
      {capturedImage ? (
        <img src={capturedImage} alt="Captura" className="absolute inset-0 w-full h-full object-cover" />
      ) : cameraActive ? (
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" autoPlay playsInline muted />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950">
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>
      )}

      {/* ── Linha de scan animada ─────────────────────────────────────────── */}
      {cameraActive && !capturedImage && (
        <div
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-70 pointer-events-none"
          style={{ top: `${scanY}%`, transition: "top 0.016s linear" }}
        />
      )}

      {/* ── Overlay de traduções sobrepostas ─────────────────────────────── */}
      {capturedImage && translations.map((t, idx) => (
        <div
          key={idx}
          className="absolute"
          style={{ left: `${t.x}%`, top: `${t.y}%`, transform: "translate(-50%, -50%)" }}
        >
          <div className="bg-emerald-600/90 backdrop-blur-sm rounded-lg px-2 py-1 border border-emerald-400/50 shadow-lg max-w-[150px]">
            <p className="text-white text-xs font-bold leading-tight">{t.translated}</p>
            <p className="text-emerald-200 text-xs opacity-70 leading-tight">{t.original}</p>
          </div>
        </div>
      ))}

      {/* ── Loading de tradução ───────────────────────────────────────────── */}
      {isTranslating && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-white text-sm">Traduzindo...</p>
          </div>
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 rounded-lg bg-emerald-600/80 backdrop-blur-sm border border-emerald-400/30">
            <span className="text-white text-xs font-bold flex items-center gap-1">
              <ScanLine className="w-3 h-3" /> TRADUÇÃO AR
            </span>
          </div>
          <Badge className="bg-black/60 text-white border-white/20 text-xs">
            {nativeLanguage} → {targetLanguage}
          </Badge>
        </div>
        {onClose && (
          <button onClick={handleClose} className="p-1.5 rounded-lg bg-black/50 hover:bg-red-600/80 backdrop-blur-sm transition-colors">
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        )}
      </div>

      {/* ── Controles inferiores ──────────────────────────────────────────── */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 z-10">
        {!cameraActive && !capturedImage ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/80 flex items-center justify-center mx-auto mb-3 shadow-2xl">
              <Languages className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-white font-bold mb-1">Tradução por Câmera</h3>
            <p className="text-white/60 text-sm mb-3 max-w-xs px-4">
              Aponte a câmera para qualquer texto e veja a tradução instantânea sobreposta
            </p>
            {cameraError && (
              <p className="text-red-400 text-xs mb-2">{cameraError}</p>
            )}
            <Button onClick={startCamera} className="bg-emerald-600 hover:bg-emerald-700">
              <Camera className="w-4 h-4 mr-2" /> Ativar Câmera
            </Button>
          </div>
        ) : capturedImage ? (
          <div className="flex gap-2">
            {translations.length === 0 && !isTranslating && (
              <p className="text-white/70 text-sm">Nenhum texto detectado na imagem</p>
            )}
            <Button onClick={handleReset} variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Nova Captura
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button
              onClick={handleCapture}
              disabled={isCapturing}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 rounded-full w-14 h-14 p-0"
            >
              {isCapturing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Zap className="w-6 h-6" />
              )}
            </Button>
            <Button
              onClick={stopCamera}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 self-center"
            >
              <X className="w-3.5 h-3.5 mr-1" /> Parar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
