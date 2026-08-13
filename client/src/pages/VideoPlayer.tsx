import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw,
  ChevronLeft,
  Settings,
  Sparkles,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ParetoPracticeCycle } from "@/components/ParetoPracticeCycle";
import { resolvePracticeCEFRLevel } from "@/lib/lesson-levels";

type ClipVocabularyItem = {
  word: string;
  translation: string;
  examples?: string[];
};

function parseClipVocabulary(value: string | null | undefined): ClipVocabularyItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is ClipVocabularyItem => Boolean(item?.word && item?.translation));
  } catch {
    return [];
  }
}

export default function VideoPlayer() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Estados do player
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const practiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const practiceTtsMutation = trpc.tts.speak.useMutation();
  
  // Buscar dados do clipe
  const { data: clip, isLoading } = trpc.precisionClips.getById.useQuery(
    { clipId: parseInt(id!) },
    { enabled: !!id }
  );

  // Controles do player
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handlePlaybackRateChange = (rate: string) => {
    if (!videoRef.current) return;
    const rateNum = parseFloat(rate);
    videoRef.current.playbackRate = rateNum;
    setPlaybackRate(rateNum);
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    setCurrentTime(0);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando clipe...</p>
        </div>
      </div>
    );
  }

  if (!clip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">Clipe não encontrado</p>
          <Button onClick={() => setLocation('/practice/clips')}>
            Voltar para Clipes
          </Button>
        </Card>
      </div>
    );
  }

  const vocabulary = parseClipVocabulary(clip.vocabularyData);
  const practiceTerm = vocabulary[practiceIndex];
  const practiceLevel = resolvePracticeCEFRLevel(clip.difficulty);

  const speakPractice = async (text: string) => {
    if (!text.trim()) return;
    practiceAudioRef.current?.pause();
    try {
      const result = await practiceTtsMutation.mutateAsync({ text: text.slice(0, 400), voiceLang: clip.targetLanguage });
      if (!result.success || !result.audioBase64) return;
      const bytes = Uint8Array.from(atob(result.audioBase64), (char) => char.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: "audio/mp3" }));
      const audio = new Audio(url);
      practiceAudioRef.current = audio;
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
    } catch {
      // The active-recall exercise remains available when neural audio is temporarily unavailable.
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-8">
      <div className="container max-w-6xl">
        {/* Cabeçalho */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/practice/clips')}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{clip.title}</h1>
            <p className="text-sm text-gray-600">
              {clip.difficulty} • {Math.floor(clip.duration / 60)} min
            </p>
          </div>
        </div>

        {/* Player de vídeo */}
        <Card className="overflow-hidden mb-6">
          <div className="relative bg-black aspect-video">
            <video
              ref={videoRef}
              src={clip.videoUrl || ''}
              className="w-full h-full"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            {/* Legendas (placeholder) */}
            {showSubtitles && (
              <div className="absolute bottom-20 left-0 right-0 text-center px-4">
                <div className="inline-block bg-black/80 text-white px-4 py-2 rounded-lg text-lg">
                  <p className="text-purple-300 text-sm mb-1">[PT] Olá! Como você está?</p>
                  <p>[EN] Hello! How are you?</p>
                </div>
              </div>
            )}

            {/* Controles do player */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
              {/* Barra de progresso */}
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer mb-4"
                style={{
                  background: `linear-gradient(to right, #9333ea 0%, #9333ea ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`
                }}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Play/Pause */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={togglePlay}
                    className="text-white hover:text-purple-300"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </Button>

                  {/* Restart */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRestart}
                    className="text-white hover:text-purple-300"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>

                  {/* Volume */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleMute}
                    className="text-white hover:text-purple-300"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>

                  {/* Tempo */}
                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Velocidade */}
                  <Select value={playbackRate.toString()} onValueChange={handlePlaybackRateChange}>
                    <SelectTrigger className="w-20 h-8 bg-transparent text-white border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x</SelectItem>
                      <SelectItem value="0.75">0.75x</SelectItem>
                      <SelectItem value="1">1x</SelectItem>
                      <SelectItem value="1.25">1.25x</SelectItem>
                      <SelectItem value="1.5">1.5x</SelectItem>
                      <SelectItem value="2">2x</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Legendas */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowSubtitles(!showSubtitles)}
                    className={`text-white hover:text-purple-300 ${showSubtitles ? 'bg-purple-600/30' : ''}`}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>

                  {/* Fullscreen */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleFullscreen}
                    className="text-white hover:text-purple-300"
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Informações do clipe */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Sobre este clipe</h2>
            <p className="text-gray-700 mb-4">{clip.description}</p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {clip.targetLanguage.toUpperCase()}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                {clip.difficulty}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                Quality: {clip.qualityScore}%
              </span>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Vocabulário</h2>
            {vocabulary.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Escolha uma palavra realmente presente no clipe para praticar recuperação, escrita e criação de frase no nível {practiceLevel}.</p>
                <div className="flex flex-wrap gap-2">
                  {vocabulary.map((item, index) => (
                    <Button key={`${item.word}-${index}`} size="sm" variant={index === practiceIndex ? "default" : "outline"} onClick={() => { setPracticeIndex(index); setPracticeOpen(false); }}>
                      {item.word} · {item.translation}
                    </Button>
                  ))}
                </div>
                <Button className="w-full" variant="outline" onClick={() => setPracticeOpen((open) => !open)}>
                  <Sparkles className="mr-2 h-4 w-4" /> {practiceOpen ? "Fechar prática Pareto" : "Praticar Pareto"}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Este clipe ainda não possui vocabulário estruturado para a prática ativa.</p>
            )}
          </Card>
        </div>

        {practiceOpen && practiceTerm && (
          <div className="mt-6">
            <ParetoPracticeCycle
              term={{ word: practiceTerm.word, translation: practiceTerm.translation, example: practiceTerm.examples?.[0] || practiceTerm.word }}
              onClose={() => setPracticeOpen(false)}
              onSpeak={speakPractice}
              embedded
              level={practiceLevel}
            />
          </div>
        )}
      </div>
    </div>
  );
}
