import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Heart, Share2, X, Clock, BookOpen } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

const CEFR_COLORS: Record<string, string> = {
  A1: "bg-green-100 text-green-800",
  A2: "bg-emerald-100 text-emerald-800",
  B1: "bg-blue-100 text-blue-800",
  B2: "bg-indigo-100 text-indigo-800",
  C1: "bg-purple-100 text-purple-800",
  C2: "bg-red-100 text-red-800",
};

const CATEGORY_LABELS: Record<string, string> = {
  vocabulary: "Vocabulário",
  grammar: "Gramática",
  conversation: "Conversação",
  pronunciation: "Pronúncia",
  business: "Negócios",
  culture: "Cultura",
};

const CATEGORY_ICONS: Record<string, string> = {
  vocabulary: "📚",
  grammar: "✏️",
  conversation: "💬",
  pronunciation: "🎤",
  business: "💼",
  culture: "🌍",
};

export default function Clips() {
  const { data: clips, isLoading, error } = trpc.clips.getClips.useQuery({ limit: 50 });
  const [selectedClip, setSelectedClip] = useState<number | null>(null);
  const [likedClips, setLikedClips] = useState<Set<number>>(new Set());

  const selectedClipData = clips?.find((c) => c.id === selectedClip);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "35 min";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s > 0 ? s + 's' : ''}` : `${s}s`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <div className="h-10 bg-gray-800 rounded w-64 mb-3 animate-pulse" />
            <div className="h-5 bg-gray-800 rounded w-96 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[9/16] bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Erro ao carregar clipes</p>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                ← Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">🎬 Clipes Educacionais</h1>
              <p className="text-xs text-gray-400">Aprenda com vídeos de 35 minutos</p>
            </div>
          </div>
          <Badge className="bg-purple-600 text-white">{clips?.length || 0} clipes</Badge>
        </div>
      </div>

      <div className="container mx-auto py-6 px-4">
        {/* AR Info Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl border border-purple-700/50">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🥽</div>
            <div>
              <h2 className="font-bold text-purple-200">Base para Realidade Aumentada</h2>
              <p className="text-sm text-gray-300">
                Clipes de 35 minutos com estrutura preparada para AR. Professor virtual integrado em breve.
              </p>
            </div>
          </div>
        </div>

        {/* Clips Grid */}
        {!clips || clips.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">Nenhum clipe disponível</h3>
            <p className="text-gray-500">Os clipes estão sendo preparados. Volte em breve!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {clips.map((clip) => (
              <Card
                key={clip.id}
                className="bg-gray-900 border-gray-700 overflow-hidden hover:border-purple-500 transition-all cursor-pointer group hover:scale-[1.02]"
                onClick={() => setSelectedClip(clip.id)}
              >
                <div className="relative aspect-[9/16] bg-gradient-to-br from-purple-600 via-pink-600 to-red-600">
                  {clip.thumbnailUrl ? (
                    <img src={clip.thumbnailUrl} alt={clip.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
                      <div className="text-4xl">{CATEGORY_ICONS[clip.category || ''] || '🎬'}</div>
                      <p className="text-white text-center text-sm font-bold leading-tight">{clip.title}</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                      <Play className="w-7 h-7 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(clip.duration)}
                  </div>
                  <div className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-bold ${CEFR_COLORS[clip.cefrLevel] || 'bg-gray-700 text-white'}`}>
                    {clip.cefrLevel}
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="text-white font-semibold text-sm leading-tight mb-1 line-clamp-2">{clip.title}</h3>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                      {CATEGORY_LABELS[clip.category || ''] || clip.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <BookOpen className="w-3 h-3" />
                      {clip.viewCount || 0}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedClip && selectedClipData && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedClip(null)}
        >
          <div className="relative max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedClip(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white flex items-center gap-2 text-sm"
            >
              <X className="w-5 h-5" /> Fechar
            </button>
            <div className="aspect-[9/16] bg-gray-900 rounded-xl overflow-hidden">
              {selectedClipData.videoUrl ? (
                <video src={selectedClipData.videoUrl} controls autoPlay className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
                  <div className="text-6xl">{CATEGORY_ICONS[selectedClipData.category || ''] || '🎬'}</div>
                  <h3 className="text-white text-xl font-bold">{selectedClipData.title}</h3>
                  <p className="text-gray-400 text-sm">{selectedClipData.description}</p>
                  <div className="flex gap-2">
                    <Badge className={CEFR_COLORS[selectedClipData.cefrLevel] || ''}>{selectedClipData.cefrLevel}</Badge>
                    <Badge variant="outline" className="border-gray-600 text-gray-300">{formatDuration(selectedClipData.duration)}</Badge>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">🎬 Vídeo em produção - disponível em breve com professor virtual AR</p>
                </div>
              )}
            </div>
            <div className="mt-4 bg-gray-900 rounded-xl p-4">
              <h3 className="text-white font-bold text-lg mb-1">{selectedClipData.title}</h3>
              {selectedClipData.description && (
                <p className="text-gray-400 text-sm mb-3">{selectedClipData.description}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge className={CEFR_COLORS[selectedClipData.cefrLevel] || ''}>{selectedClipData.cefrLevel}</Badge>
                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                    {CATEGORY_LABELS[selectedClipData.category || ''] || selectedClipData.category}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost" size="sm"
                    className={likedClips.has(selectedClip) ? "text-red-400" : "text-gray-400"}
                    onClick={() => setLikedClips(prev => {
                      const next = new Set(prev);
                      if (next.has(selectedClip)) next.delete(selectedClip); else next.add(selectedClip);
                      return next;
                    })}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${likedClips.has(selectedClip) ? 'fill-current' : ''}`} />
                    {selectedClipData.likeCount || 0}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400"><Share2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
