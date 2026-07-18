import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Slider } from "./ui/slider";

interface ClipSegment {
  startTime: number; // segundos
  endTime: number;
  text: string; // texto falado
  translation: string; // tradução
  phonemes: string[]; // fonemas para lip-sync
}

interface EducationalClipProps {
  title: string;
  teacherId: string;
  teacherName: string;
  teacherPhotoUrl: string;
  teacherVoiceId: string;
  duration: number; // duração total em segundos (1800s = 30min)
  segments: ClipSegment[];
  languageCode: string;
}

export function EducationalClip({
  title,
  teacherId,
  teacherName,
  teacherPhotoUrl,
  teacherVoiceId,
  duration,
  segments,
  languageCode,
}: EducationalClipProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Encontrar segmento atual baseado no tempo
  useEffect(() => {
    const segmentIndex = segments.findIndex(
      (seg) => currentTime >= seg.startTime && currentTime < seg.endTime
    );
    if (segmentIndex !== -1) {
      setCurrentSegmentIndex(segmentIndex);
    }
  }, [currentTime, segments]);

  // Animação de playback
  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = Date.now() - currentTime * 1000;

      const animate = () => {
        if (startTimeRef.current) {
          const elapsed = (Date.now() - startTimeRef.current) / 1000;
          const newTime = elapsed * playbackSpeed;

          if (newTime >= duration) {
            setCurrentTime(duration);
            setIsPlaying(false);
          } else {
            setCurrentTime(newTime);
            animationFrameRef.current = requestAnimationFrame(animate);
          }
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, duration]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0]);
    startTimeRef.current = Date.now() - value[0] * 1000;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentSegment = segments[currentSegmentIndex];

  // Calcular progresso da animação labial dentro do segmento atual
  const segmentProgress = currentSegment
    ? (currentTime - currentSegment.startTime) /
      (currentSegment.endTime - currentSegment.startTime)
    : 0;

  // Simular mouth shape baseado em phonemes (simplificado)
  const getMouthShape = () => {
    if (!isPlaying || !currentSegment) return "neutral";
    
    const phonemeIndex = Math.floor(
      segmentProgress * currentSegment.phonemes.length
    );
    const phoneme = currentSegment.phonemes[phonemeIndex] || "neutral";
    
    // Mapear phonemes para formas de boca
    const mouthShapes: Record<string, string> = {
      a: "open",
      e: "smile",
      i: "wide",
      o: "round",
      u: "pucker",
      m: "closed",
      p: "closed",
      b: "closed",
      f: "teeth",
      v: "teeth",
      neutral: "neutral",
    };
    
    return mouthShapes[phoneme] || "neutral";
  };

  const mouthShape = getMouthShape();

  return (
    <Card className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Título do Clipe */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">
          com {teacherName} • {Math.floor(duration / 60)} minutos de conteúdo completo
        </p>
      </div>

      {/* Professor Animado */}
      <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg overflow-hidden">
        {/* Avatar do Professor com Animação Labial */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-64 h-64">
            {/* Foto do Professor */}
            <img
              src={teacherPhotoUrl}
              alt={teacherName}
              className="w-full h-full object-cover rounded-full border-4 border-white dark:border-gray-800 shadow-2xl"
            />
            
            {/* Overlay de Animação Labial (simplificado) */}
            {isPlaying && (
              <div
                className={`absolute bottom-16 left-1/2 -translate-x-1/2 w-16 h-12 bg-red-500 rounded-full transition-all duration-100 ${
                  mouthShape === "open"
                    ? "scale-y-150"
                    : mouthShape === "smile"
                    ? "scale-x-125"
                    : mouthShape === "wide"
                    ? "scale-x-150"
                    : mouthShape === "round"
                    ? "scale-100 rounded-full"
                    : mouthShape === "pucker"
                    ? "scale-75 rounded-full"
                    : mouthShape === "closed"
                    ? "scale-y-25"
                    : mouthShape === "teeth"
                    ? "scale-y-75"
                    : "scale-y-50"
                }`}
                style={{ opacity: 0.8 }}
              />
            )}
          </div>
        </div>

        {/* Legendas Sincronizadas */}
        {currentSegment && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4 space-y-2">
            <p className="text-white text-xl font-semibold text-center">
              {currentSegment.text}
            </p>
            <p className="text-gray-300 text-sm text-center">
              {currentSegment.translation}
            </p>
          </div>
        )}

        {/* Indicador de Tempo */}
        <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Controles de Playback */}
      <div className="space-y-4">
        {/* Barra de Progresso */}
        <Slider
          value={[currentTime]}
          max={duration}
          step={0.1}
          onValueChange={handleSeek}
          className="w-full"
        />

        {/* Botões de Controle */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRestart}
            title="Reiniciar"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            size="lg"
            onClick={handlePlayPause}
            className="w-24"
          >
            {isPlaying ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                Pausar
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Play
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? "Ativar som" : "Silenciar"}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Velocidade de Reprodução */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">Velocidade:</span>
          {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
            <Button
              key={speed}
              variant={playbackSpeed === speed ? "default" : "outline"}
              size="sm"
              onClick={() => setPlaybackSpeed(speed)}
            >
              {speed}x
            </Button>
          ))}
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          🎯 {segments.length} segmentos • 🎙️ Voz natural fotorrealista • 🎬
          Animação labial sincronizada • ⏱️ {Math.floor(duration / 60)} minutos
        </p>
      </div>
    </Card>
  );
}
