import { AnimatedTeacher3D } from './AnimatedTeacher3D';
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Maximize } from "lucide-react";
import EnhancedTeacherAvatar from "./EnhancedTeacherAvatar";
import { toast } from "sonner";

interface SubtitleSegment {
  start: number;
  end: number;
  textPT: string;
  textEN: string;
  words: WordTimestamp[];
}

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  isClickable: boolean;
}

interface TeacherPoliVideoPlayerProps {
  videoUrl?: string; // Opcional - pode ser apenas áudio
  audioUrl?: string;
  title: string;
  subtitles: SubtitleSegment[];
  vocabulary: Array<{
    word: string;
    translation: string;
    phonetic: string;
    example: string;
  }>;
  teacherName: string;
  teacherAvatar?: "male" | "female";
}

export default function TeacherPoliVideoPlayer({
  videoUrl,
  audioUrl,
  title,
  subtitles,
  vocabulary,
  teacherName,
  teacherAvatar = "female",
}: TeacherPoliVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentSubtitle, setCurrentSubtitle] = useState<SubtitleSegment | null>(null);
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    translation: string;
    phonetic: string;
    example: string;
  } | null>(null);
  const [showLanguage, setShowLanguage] = useState<"en" | "pt" | "both">("both");
  const [currentText, setCurrentText] = useState("");

  const mediaRef = videoRef.current || audioRef.current;

  useEffect(() => {
    const media = mediaRef;
    if (!media) return;

    const handleTimeUpdate = () => {
      const time = media.currentTime;
      setCurrentTime(time);

      // Encontrar legenda atual
      const subtitle = subtitles.find((s) => time >= s.start && time <= s.end);
      setCurrentSubtitle(subtitle || null);

      // Atualizar texto para animação do professor
      if (subtitle) {
        setCurrentText(subtitle.textPT);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(media.duration);
    };

    media.addEventListener("timeupdate", handleTimeUpdate);
    media.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      media.removeEventListener("timeupdate", handleTimeUpdate);
      media.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [mediaRef, subtitles]);

  const togglePlay = () => {
    const media = mediaRef;
    if (!media) return;

    if (isPlaying) {
      media.pause();
    } else {
      media.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const media = mediaRef;
    if (!media) return;

    media.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const skip = (seconds: number) => {
    const media = mediaRef;
    if (!media) return;

    media.currentTime = Math.max(0, Math.min(media.duration, media.currentTime + seconds));
  };

  const changePlaybackRate = () => {
    const media = mediaRef;
    if (!media) return;

    const rates = [0.5, 0.75, 1, 1.25, 1.5];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];

    media.playbackRate = nextRate;
    setPlaybackRate(nextRate);
    toast.success(`Velocidade: ${nextRate}x`);
  };

  const toggleFullscreen = () => {
    const media = videoRef.current;
    if (!media) return;

    if (!document.fullscreenElement) {
      media.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleWordClick = (word: string) => {
    // Pausar mídia automaticamente
    const media = mediaRef;
    if (media && isPlaying) {
      media.pause();
      setIsPlaying(false);
    }

    // Buscar palavra no vocabulário
    const cleanWord = word.replace(/[.,!?;:]/g, "").toLowerCase();
    const vocabEntry = vocabulary.find((v) => v.word.toLowerCase() === cleanWord);

    if (vocabEntry) {
      setSelectedWord(vocabEntry);

      // Pronunciar palavra
      const utterance = new SpeechSynthesisUtterance(vocabEntry.word);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    } else {
      toast.error("Palavra não encontrada no vocabulário");
    }
  };

  const closeGlossary = () => {
    setSelectedWord(null);
    // Retomar mídia
    const media = mediaRef;
    if (media) {
      media.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-2xl overflow-hidden border-2 border-blue-200">
      {/* Título */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 text-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-sm opacity-90">Vídeo Interativo Estilo Teacher Poli</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 p-6">
        {/* Lado Esquerdo: Vídeo ou Professor Animado */}
        <div className="space-y-4">
          {videoUrl ? (
            <div className="relative bg-black rounded-xl overflow-hidden shadow-lg">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full aspect-video"
                onClick={togglePlay}
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 shadow-lg flex items-center justify-center">
              <AnimatedTeacher3D
                teacherName={teacherName}
                text={currentText}
                isTeaching={isPlaying}
                avatar={teacherAvatar}
              />
            </div>
          )}

          {audioUrl && (
            <audio ref={audioRef} src={audioUrl} className="hidden" />
          )}

          {/* Controles */}
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => skip(-10)}
                className="flex-shrink-0"
              >
                <SkipBack className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                onClick={togglePlay}
                className="flex-shrink-0 bg-blue-600 hover:bg-blue-700"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => skip(10)}
                className="flex-shrink-0"
              >
                <SkipForward className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={toggleMute}
                className="flex-shrink-0"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={changePlaybackRate}
                className="flex-shrink-0 text-xs font-bold"
              >
                {playbackRate}x
              </Button>

              {videoUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleFullscreen}
                  className="flex-shrink-0"
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Barra de progresso */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={(e) => {
                  const media = mediaRef;
                  if (media) {
                    media.currentTime = parseFloat(e.target.value);
                  }
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Legendas Bilíngues Clicáveis */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-lg min-h-[300px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Legendas Interativas</h3>
              <button
                onClick={() =>
                  setShowLanguage((prev) =>
                    prev === "both" ? "en" : prev === "en" ? "pt" : "both"
                  )
                }
                className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold hover:bg-blue-200 transition-colors"
              >
                {showLanguage === "both"
                  ? "EN + PT"
                  : showLanguage === "en"
                  ? "Apenas EN"
                  : "Apenas PT"}
              </button>
            </div>

            {currentSubtitle ? (
              <div className="space-y-4">
                {/* Legenda em Inglês (clicável) */}
                {(showLanguage === "en" || showLanguage === "both") && (
                  <div className="flex flex-wrap gap-2">
                    {currentSubtitle.words.map((wordObj, idx) => (
                      <button
                        key={idx}
                        onClick={() => wordObj.isClickable && handleWordClick(wordObj.word)}
                        disabled={!wordObj.isClickable}
                        className={`text-lg font-medium px-2 py-1 rounded transition-all ${
                          wordObj.isClickable
                            ? "bg-blue-500 text-white hover:bg-blue-600 hover:scale-110 cursor-pointer shadow-md"
                            : "bg-gray-100 text-gray-700 cursor-default"
                        }`}
                      >
                        {wordObj.word}
                      </button>
                    ))}
                  </div>
                )}

                {/* Legenda em Português */}
                {(showLanguage === "pt" || showLanguage === "both") && (
                  <p className="text-gray-700 text-base leading-relaxed border-l-4 border-purple-500 pl-4">
                    {currentSubtitle.textPT}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-center italic">
                Aguardando legendas...
              </p>
            )}
          </div>

          {/* Dica */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">💡 Dica:</p>
            <p>
              Clique nas palavras <span className="bg-blue-500 text-white px-2 py-0.5 rounded">destacadas</span> para ver tradução, pronúncia e exemplos!
            </p>
          </div>
        </div>
      </div>

      {/* Glossário Popup (pausa automática) */}
      {selectedWord && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full border-4 border-blue-500">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-3xl font-bold text-gray-900">
                  {selectedWord.word}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{selectedWord.phonetic}</p>
              </div>
              <button
                onClick={closeGlossary}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Tradução:</p>
                <p className="text-xl text-gray-900 font-medium">{selectedWord.translation}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Exemplo:</p>
                <p className="text-base text-gray-800 italic bg-gray-50 p-3 rounded-lg">
                  "{selectedWord.example}"
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => {
                  const utterance = new SpeechSynthesisUtterance(selectedWord.word);
                  utterance.lang = "en-US";
                  utterance.rate = 0.8;
                  speechSynthesis.speak(utterance);
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                <Volume2 className="h-5 w-5 mr-2" />
                Ouvir Pronúncia
              </Button>
              <Button onClick={closeGlossary} className="flex-1 bg-blue-600 hover:bg-blue-700" size="lg">
                Continuar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
