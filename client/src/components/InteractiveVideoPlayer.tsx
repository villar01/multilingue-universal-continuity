import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Play, Pause, Volume2, VolumeX, MessageCircle } from "lucide-react";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";
import VideoCharacterChat from "./VideoCharacterChat";

interface Subtitle {
  start: number;
  end: number;
  text: string;
  textPt: string; // Tradução em português
  words: Array<{
    word: string;
    translation: string;
    start: number;
    end: number;
  }>;
}

interface InteractiveVideoPlayerProps {
  videoId: number;
  videoUrl: string;
  title: string;
  subtitles: Subtitle[];
  characterName: string;
  characterDescription: string;
}

export default function InteractiveVideoPlayer({
  videoId,
  videoUrl,
  title,
  subtitles,
  characterName,
  characterDescription,
}: InteractiveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSubtitle, setCurrentSubtitle] = useState<Subtitle | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    translation: string;
    phonetic?: string;
    example?: string;
  } | null>(null);
  const [showLanguage, setShowLanguage] = useState<'en' | 'pt' | 'both'>('both');

  // Mutation removida - tradução agora vem direto das legendas

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);

      // Encontrar legenda atual
      const subtitle = subtitles.find((s) => time >= s.start && time <= s.end);
      setCurrentSubtitle(subtitle || null);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [subtitles]);

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

  const handleWordClick = async (wordObj: { word: string; translation: string }) => {
    // Pausar vídeo automaticamente
    const video = videoRef.current;
    if (video && isPlaying) {
      video.pause();
      setIsPlaying(false);
    }

    setSelectedWord({
      word: wordObj.word,
      translation: wordObj.translation,
      phonetic: undefined,
      example: undefined,
    });

    // Pronunciar palavra
    const utterance = new SpeechSynthesisUtterance(wordObj.word);
    utterance.lang = "en-US";
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  const closeGlossary = () => {
    setSelectedWord(null);
    // Retomar vídeo
    const video = videoRef.current;
    if (video) {
      video.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Vídeo */}
      <div className="relative bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full aspect-video"
          onClick={togglePlay}
        />

        {/* Controles */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={toggleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>

            <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{
                  width: `${(currentTime / (videoRef.current?.duration || 1)) * 100}%`,
                }}
              />
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowChat(!showChat)}
              className="text-white hover:bg-white/20"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Legendas Bilíngues Clicáveis */}
      {currentSubtitle && (
        <div className="bg-gray-900 text-white p-4 min-h-[100px] flex flex-col items-center justify-center gap-3">
          {/* Legenda em Inglês (clicável) */}
          {(showLanguage === 'en' || showLanguage === 'both') && (
            <div className="flex flex-wrap gap-2 justify-center">
              {currentSubtitle.words.map((wordObj, idx) => (
                <button
                  key={idx}
                  onClick={() => handleWordClick(wordObj)}
                  className="text-lg font-medium hover:bg-blue-600 hover:text-white px-2 py-1 rounded transition-colors cursor-pointer bg-blue-500/30"
                >
                  {wordObj.word}
                </button>
              ))}
            </div>
          )}

          {/* Legenda em Português */}
          {(showLanguage === 'pt' || showLanguage === 'both') && (
            <p className="text-gray-300 text-center text-base">
              {currentSubtitle.textPt}
            </p>
          )}

          {/* Botão alternar idioma */}
          <button
            onClick={() => setShowLanguage(prev => prev === 'both' ? 'en' : prev === 'en' ? 'pt' : 'both')}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            {showLanguage === 'both' ? 'EN + PT' : showLanguage === 'en' ? 'Apenas EN' : 'Apenas PT'}
          </button>
        </div>
      )}

      {/* Glossário Popup (pausa automática) */}
      {selectedWord && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-30 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedWord.word}
              </h3>
              <button
                onClick={closeGlossary}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-700">Tradução:</p>
                <p className="text-lg text-gray-900">{selectedWord.translation}</p>
              </div>

              {selectedWord.example && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Exemplo:</p>
                  <p className="text-base text-gray-800 italic">
                    "{selectedWord.example}"
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => {
                  const utterance = new SpeechSynthesisUtterance(selectedWord.word);
                  utterance.lang = 'en-US';
                  utterance.rate = 0.8;
                  speechSynthesis.speak(utterance);
                }}
                className="flex-1"
                variant="outline"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Ouvir Pronúncia
              </Button>
              <Button onClick={closeGlossary} className="flex-1">
                Continuar Vídeo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chat com Personagem */}
      {showChat && (
        <VideoCharacterChat
          characterName={characterName}
          videoTitle={title}
          videoContext={characterDescription}
        />
      )}
    </div>
  );
}
