import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { Heart, MessageCircle, Share2, Volume2, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ReelData {
  id: number;
  phrasePtBr: string;
  phraseEn: string;
  audioUrlPtBr?: string;
  audioUrlEn?: string;
  difficulty: number;
  category: string;
  theme: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

export default function ReelsPage() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [reels, setReels] = useState<ReelData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [likedReels, setLikedReels] = useState<Set<number>>(new Set());
  const [playingAudio, setPlayingAudio] = useState<"pt" | "en" | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  const languageId = 1; // Default to Portuguese/English
  const cefrLevel = "A1"; // Start with A1

  // Fetch reels
  const { data: fetchedReels, isLoading: isFetching } = trpc.clips.getClips.useQuery(
    {
      languageId,
      cefrLevel,
      limit: 50,
      offset: 0,
    },
    {
      enabled: isAuthenticated || !isAuthenticated, // Always fetch
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  useEffect(() => {
    if (!isFetching) {
      setReels(Array.isArray(fetchedReels) ? (fetchedReels as unknown as ReelData[]) : []);
      setIsLoading(false);
    }
  }, [fetchedReels, isFetching]);

  // Like mutation - local toggle
  const likeReelMutation = {
    mutate: (_args: any) => {
      const currentId = reels[currentIndex]?.id || 0;
      const isCurrentlyLiked = likedReels.has(currentId);
      if (!isCurrentlyLiked) {
        setLikedReels((prev) => new Set([...Array.from(prev), currentId]));
        setReels((prev) =>
          prev.map((r, i) => (i === currentIndex ? { ...r, likeCount: r.likeCount + 1 } : r))
        );
        toast.success("Adicionado aos favoritos!");
      } else {
        setLikedReels((prev) => {
          const newSet = new Set(Array.from(prev));
          newSet.delete(currentId);
          return newSet;
        });
        setReels((prev) =>
          prev.map((r, i) => (i === currentIndex ? { ...r, likeCount: r.likeCount - 1 } : r))
        );
        toast.success("Removido dos favoritos");
      }
    },
  };

  const currentReel = reels[currentIndex];

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        handlePreviousReel();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleNextReel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, reels.length]);

  // Handle touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.changedTouches[0]!.screenY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndY.current = e.changedTouches[0]!.screenY;
    handleSwipe();
  };

  const handleSwipe = () => {
    const diff = touchStartY.current - touchEndY.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swiped up
        handleNextReel();
      } else {
        // Swiped down
        handlePreviousReel();
      }
    }
  };

  const handleNextReel = useCallback(() => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setPlayingAudio(null);
    }
  }, [currentIndex, reels.length]);

  const handlePreviousReel = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setPlayingAudio(null);
    }
  }, [currentIndex]);

  const handlePlayAudio = (type: "pt" | "en") => {
    if (!currentReel) return;

    const audioUrl = type === "pt" ? currentReel.audioUrlPtBr : currentReel.audioUrlEn;
    if (!audioUrl) {
      toast.error("Áudio não disponível");
      return;
    }

    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(() => {
        toast.error("Erro ao reproduzir áudio");
      });
      setPlayingAudio(type);
    }
  };

  const handleLike = () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (currentReel) {
      likeReelMutation.mutate({ reelId: currentReel.id });
    }
  };

  const handleComment = () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (currentReel) {
      navigate(`/discussions?reelId=${currentReel.id}`);
    }
  };

  const handleShare = async () => {
    if (!currentReel) return;

    const shareText = `${currentReel.phrasePtBr} = ${currentReel.phraseEn}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "MultiLingue Universal",
          text: shareText,
          url: window.location.href,
        });
        toast.success("Compartilhado com sucesso!");
      } catch (err) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText);
      toast.success("Copiado para a área de transferência!");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando aulas...</p>
        </div>
      </div>
    );
  }

  if (!currentReel || reels.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Nenhuma aula disponível</h2>
          <p className="text-gray-600 mb-6">Volte mais tarde para novas aulas!</p>
          <Button onClick={() => navigate("/dashboard")}>Voltar ao Dashboard</Button>
        </Card>
      </div>
    );
  }

  const isLiked = currentReel && likedReels.has(currentReel.id);
  const progressPercent = reels.length > 0 ? ((currentIndex + 1) / reels.length) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <motion.div
          className="h-full bg-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-40 flex justify-between items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          ← Voltar
        </Button>
        <div className="text-sm font-semibold text-gray-600">
          {currentIndex + 1} / {reels.length}
        </div>
        <Button variant="ghost" size="icon">
          ⚙️
        </Button>
      </div>

      {/* Main content - Reel card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentReel.id}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center p-4 pt-20 pb-24"
        >
          <Card className="w-full max-w-md h-full max-h-[600px] flex flex-col bg-white shadow-2xl">
            {/* Difficulty badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                Nível {currentReel.difficulty}/10
              </span>
            </div>

            {/* Content area */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 space-y-8">
              {/* Portuguese phrase */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <p className="text-sm text-gray-500 mb-2">Português (Brasil)</p>
                <p className="text-4xl font-bold text-blue-600 mb-4">{currentReel.phrasePtBr}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePlayAudio("pt")}
                  className="gap-2"
                  disabled={!currentReel.audioUrlPtBr || playingAudio === "pt"}
                >
                  <Volume2 className="w-4 h-4" />
                  {playingAudio === "pt" ? "Reproduzindo..." : "Ouvir"}
                </Button>
              </motion.div>

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"
              />

              {/* English phrase */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <p className="text-sm text-gray-500 mb-2">English</p>
                <p className="text-4xl font-bold text-red-600 mb-4">{currentReel.phraseEn}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePlayAudio("en")}
                  className="gap-2"
                  disabled={!currentReel.audioUrlEn || playingAudio === "en"}
                >
                  <Volume2 className="w-4 h-4" />
                  {playingAudio === "en" ? "Reproduzindo..." : "Ouvir"}
                </Button>
              </motion.div>

              {/* Category & Theme */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex gap-2 justify-center flex-wrap"
              >
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                  {currentReel.category}
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                  {currentReel.theme}
                </span>
              </motion.div>
            </div>

            {/* Action buttons */}
            <div className="border-t bg-gray-50 p-6 flex justify-around items-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLike}
                className="flex flex-col items-center gap-1 text-gray-600 hover:text-red-600 transition"
              >
                <Heart
                  className={`w-6 h-6 ${isLiked ? "fill-red-600 text-red-600" : ""}`}
                />
                <span className="text-xs font-semibold">{currentReel.likeCount}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleComment}
                className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-600 transition"
              >
                <MessageCircle className="w-6 h-6" />
                <span className="text-xs font-semibold">{currentReel.commentCount}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex flex-col items-center gap-1 text-gray-600 hover:text-green-600 transition"
              >
                <Share2 className="w-6 h-6" />
                <span className="text-xs font-semibold">Compartilhar</span>
              </motion.button>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-30">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePreviousReel}
          disabled={currentIndex === 0}
          className="pointer-events-auto p-2 rounded-full bg-white/80 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition"
        >
          <ChevronUp className="w-6 h-6 text-gray-800" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNextReel}
          disabled={currentIndex === reels.length - 1}
          className="pointer-events-auto p-2 rounded-full bg-white/80 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition"
        >
          <ChevronDown className="w-6 h-6 text-gray-800" />
        </motion.button>
      </div>

      {/* Audio element */}
      <audio ref={audioRef} onEnded={() => setPlayingAudio(null)} />

      {/* Mobile hint */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-500 pointer-events-none">
        Deslize para cima/baixo ou use setas do teclado
      </div>
    </div>
  );
}
