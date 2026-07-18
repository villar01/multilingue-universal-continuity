import { useState } from "react";
import InteractiveVideoPlayer from "../components/InteractiveVideoPlayer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Film, Play } from "lucide-react";

// Vídeos demo (em produção viriam do banco de dados)
const demoVideos = [
  {
    id: 1,
    title: "At the Coffee Shop",
    description: "Learn how to order coffee and have a conversation at a café",
    thumbnail: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // Placeholder
    level: "Beginner",
    duration: "3:45",
    characterName: "Sarah",
    characterDescription: "A friendly barista who loves to chat with customers",
    subtitles: [
      {
        start: 0,
        end: 3,
        text: "Hello! Welcome to our coffee shop.",
        words: [
          { word: "Hello!", start: 0, end: 0.5 },
          { word: "Welcome", start: 0.6, end: 1.2 },
          { word: "to", start: 1.3, end: 1.4 },
          { word: "our", start: 1.5, end: 1.7 },
          { word: "coffee", start: 1.8, end: 2.2 },
          { word: "shop.", start: 2.3, end: 3 },
        ],
      },
      {
        start: 3.5,
        end: 6,
        text: "What would you like to order today?",
        words: [
          { word: "What", start: 3.5, end: 3.8 },
          { word: "would", start: 3.9, end: 4.2 },
          { word: "you", start: 4.3, end: 4.5 },
          { word: "like", start: 4.6, end: 4.9 },
          { word: "to", start: 5, end: 5.1 },
          { word: "order", start: 5.2, end: 5.6 },
          { word: "today?", start: 5.7, end: 6 },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Job Interview",
    description: "Practice common job interview questions and answers",
    thumbnail: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
    videoUrl: "https://www.w3schools.com/html/movie.mp4", // Placeholder
    level: "Intermediate",
    duration: "5:20",
    characterName: "Mr. Johnson",
    characterDescription: "An experienced HR manager conducting interviews",
    subtitles: [
      {
        start: 0,
        end: 3,
        text: "Good morning. Please have a seat.",
        words: [
          { word: "Good", start: 0, end: 0.4 },
          { word: "morning.", start: 0.5, end: 1.2 },
          { word: "Please", start: 1.5, end: 1.9 },
          { word: "have", start: 2, end: 2.2 },
          { word: "a", start: 2.3, end: 2.4 },
          { word: "seat.", start: 2.5, end: 3 },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "At the Doctor's Office",
    description: "Learn medical vocabulary and how to describe symptoms",
    thumbnail: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=400",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // Placeholder
    level: "Beginner",
    duration: "4:15",
    characterName: "Dr. Martinez",
    characterDescription: "A caring doctor who explains everything clearly",
    subtitles: [
      {
        start: 0,
        end: 3,
        text: "Hello, how are you feeling today?",
        words: [
          { word: "Hello,", start: 0, end: 0.5 },
          { word: "how", start: 0.6, end: 0.9 },
          { word: "are", start: 1, end: 1.2 },
          { word: "you", start: 1.3, end: 1.5 },
          { word: "feeling", start: 1.6, end: 2.1 },
          { word: "today?", start: 2.2, end: 3 },
        ],
      },
    ],
  },
];

export default function InteractiveVideos() {
  const [selectedVideo, setSelectedVideo] = useState<typeof demoVideos[0] | null>(null);

  if (selectedVideo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-8">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setSelectedVideo(null)}
            className="mb-4"
          >
            ← Voltar aos Vídeos
          </Button>

          <InteractiveVideoPlayer
            videoId={selectedVideo.id}
            videoUrl={selectedVideo.videoUrl}
            title={selectedVideo.title}
            subtitles={selectedVideo.subtitles as any}
            characterName={selectedVideo.characterName}
            characterDescription={selectedVideo.characterDescription}
          />

          <div className="mt-8 bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-2">{selectedVideo.title}</h2>
            <p className="text-gray-600 mb-4">{selectedVideo.description}</p>
            <div className="flex gap-4 text-sm text-gray-500">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {selectedVideo.level}
              </span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                ⏱️ {selectedVideo.duration}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            🎬 Vídeos Interativos
          </h1>
          <p className="text-gray-600">
            Assista vídeos com legendas clicáveis e converse com os personagens
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoVideos.map((video) => (
            <Card
              key={video.id}
              className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="relative">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Button size="lg" className="rounded-full">
                    <Play className="w-6 h-6 mr-2" />
                    Assistir
                  </Button>
                </div>
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  {video.duration}
                </div>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="w-5 h-5 text-purple-600" />
                  {video.title}
                </CardTitle>
                <CardDescription>{video.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {video.level}
                  </span>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    👤 {video.characterName}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">✨ Recursos Exclusivos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">📝 Legendas Clicáveis</h3>
              <p className="text-sm text-white/90">
                Clique em qualquer palavra para ver tradução e ouvir pronúncia
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">💬 Converse com Personagens</h3>
              <p className="text-sm text-white/90">
                Pratique conversação com os personagens dos vídeos usando IA
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🎯 Aprenda no Contexto</h3>
              <p className="text-sm text-white/90">
                Veja como o idioma é usado em situações reais do dia a dia
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
