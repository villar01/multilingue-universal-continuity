import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Volume2, VolumeX, Mic, MessageCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface VideoWord {
  word: string;
  translation: string;
  phonetic: string;
  startTime: number;
  endTime: number;
}

interface VideoDialogue {
  speaker: string;
  text: string;
  translation: string;
  startTime: number;
  endTime: number;
  words: VideoWord[];
}

interface AdvancedVideoPlayerProps {
  videoId: string;
  title: string;
  dialogues: VideoDialogue[];
  onComplete?: () => void;
}

export function AdvancedVideoPlayer({ videoId, title, dialogues, onComplete }: AdvancedVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedWord, setSelectedWord] = useState<VideoWord | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const translateWord = trpc.ai.translateWord.useMutation();
  const analyzePronunciation = trpc.stt.analyzePronunciation.useMutation();

  // Encontrar diálogo atual baseado no tempo
  const currentDialogue = dialogues.find(
    (d) => currentTime >= d.startTime && currentTime <= d.endTime
  );

  // Encontrar palavra atual
  const currentWord = currentDialogue?.words.find(
    (w) => currentTime >= w.startTime && currentTime <= w.endTime
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, [onComplete]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleWordClick = async (word: VideoWord) => {
    setSelectedWord(word);
    
    // Tocar áudio da palavra
    if (audioRef.current) {
      audioRef.current.src = `/audio/words/${word.word.toLowerCase()}.mp3`;
      audioRef.current.play();
    }
  };

  const handlePronunciationPractice = async () => {
    if (!currentDialogue) return;

    setIsRecording(true);
    
    // TODO: Implementar gravação de áudio
    // Por enquanto, simular análise
    setTimeout(async () => {
      setIsRecording(false);
      
      const result = await analyzePronunciation.mutateAsync({
        audioUrl: "https://example.com/user-audio.mp3",
        expectedText: currentDialogue.text,
        languageCode: "en",
      });

      setPronunciationScore((result as any)?.score || 85);
    }, 2000);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Título */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Badge variant="secondary">Vídeo Interativo IA</Badge>
      </div>

      {/* Player de Vídeo */}
      <Card className="overflow-hidden">
        <div className="relative bg-black aspect-video">
          <video
            ref={videoRef}
            className="w-full h-full"
            src={`/videos/${videoId}.mp4`}
            playsInline
          />

          {/* Legendas Interativas */}
          {currentDialogue && (
            <div className="absolute bottom-20 left-0 right-0 px-8">
              <Card className="bg-black/80 backdrop-blur-sm p-4">
                <div className="flex items-start gap-3">
                  <Badge className="shrink-0">{currentDialogue.speaker}</Badge>
                  <div className="flex-1 space-y-2">
                    {/* Texto com palavras clicáveis */}
                    <div className="flex flex-wrap gap-1">
                      {currentDialogue.words.map((word, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleWordClick(word)}
                          className={`
                            px-1 py-0.5 rounded transition-all hover:bg-blue-500/30
                            ${currentWord?.word === word.word ? "bg-blue-500 text-white" : "text-white"}
                            ${selectedWord?.word === word.word ? "ring-2 ring-yellow-400" : ""}
                          `}
                        >
                          {word.word}
                        </button>
                      ))}
                    </div>

                    {/* Tradução */}
                    {showTranslation && (
                      <p className="text-sm text-gray-300">{currentDialogue.translation}</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Controles */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <Progress value={progress} className="mb-3" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" onClick={togglePlay}>
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                
                <Button size="icon" variant="ghost" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>

                <span className="text-sm text-white">
                  {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, "0")} / 
                  {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, "0")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={showTranslation ? "default" : "outline"}
                  onClick={() => setShowTranslation(!showTranslation)}
                >
                  Tradução
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePronunciationPractice}
                  disabled={isRecording || !currentDialogue}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  {isRecording ? "Gravando..." : "Praticar"}
                </Button>

                <Button size="sm" variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Conversar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Painel de Palavra Selecionada */}
      {selectedWord && (
        <Card className="p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{selectedWord.word}</h3>
              <p className="text-sm text-muted-foreground mb-1">
                Fonética: <span className="font-mono">{selectedWord.phonetic}</span>
              </p>
              <p className="text-sm">
                Tradução: <span className="font-semibold">{selectedWord.translation}</span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                size="sm"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.play();
                  }
                }}
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Ouvir Pronúncia
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Feedback de Pronúncia */}
      {pronunciationScore !== null && (
        <Card className="p-4 bg-green-50 dark:bg-green-950">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Análise de Pronúncia</h3>
              <p className="text-sm text-muted-foreground">
                Sua pronúncia está {pronunciationScore >= 80 ? "excelente" : pronunciationScore >= 60 ? "boa" : "precisa melhorar"}!
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">{pronunciationScore}%</div>
              <p className="text-xs text-muted-foreground">Precisão</p>
            </div>
          </div>
          <Progress value={pronunciationScore} className="mt-3" />
        </Card>
      )}

      {/* Áudio para palavras */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
