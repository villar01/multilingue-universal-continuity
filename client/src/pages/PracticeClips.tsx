/**
 * Página de Clipes Educacionais
 * Biblioteca de 100+ clipes com legendas bilíngues e 18 variações de sotaque
 * MultiLingue Universal - Clipes de Prática com Voz Neural IA
 */

import { useState } from "react";
import { trpc } from '@/lib/trpc';
import { Link } from 'wouter';
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Play, Search, Filter, Star } from "lucide-react";
import { CEFR_LEVELS, type CEFRLevel } from "@/lib/lesson-levels";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export function PracticeClips() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<CEFRLevel | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Query todos os clipes (filtros aplicados localmente)
  const { data: clipsData, isLoading } = trpc.precisionClips.list.useQuery({
    limit: 50,
    category: selectedCategory === "all" ? undefined : selectedCategory as "daily" | "travel" | "business" | "academic" | "social",
  });

  const normalizeClipCefr = (difficulty?: string): CEFRLevel | undefined => {
    const normalized = difficulty?.trim().toUpperCase();
    if (normalized === "A1" || normalized === "A2" || normalized === "B1" || normalized === "B2" || normalized === "C1" || normalized === "C2") return normalized;
    if (normalized === "BEGINNER") return "A1";
    if (normalized === "INTERMEDIATE") return "B1";
    if (normalized === "ADVANCED") return "C1";
    return undefined;
  };

  // Filtrar clipes localmente (busca, idioma, dificuldade e categoria)
  const clips = clipsData?.clips?.filter((clip) => {
    const matchesSearch = !searchQuery || 
      String(clip.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(clip.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLanguage = selectedLanguage === "all" || 
      clip.targetLanguage === selectedLanguage ||
      selectedLanguage.startsWith(clip.targetLanguage + "-");
    
    const clipCefr = normalizeClipCefr(clip.difficulty);
    const matchesDifficulty = selectedDifficulty === "all" || 
      clipCefr === selectedDifficulty;
    
    const matchesCategory = selectedCategory === "all" || clip.category === selectedCategory;
    
    return matchesSearch && matchesLanguage && matchesDifficulty && matchesCategory;
  }) || [];

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Clipes Educacionais</h1>
        <p className="text-muted-foreground">
          Biblioteca de clipes com legendas bilíngues palavra por palavra e 18 variações de sotaque nativo
        </p>
      </div>

      {/* Filtros */}
      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar clipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Idioma */}
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os idiomas</SelectItem>
              <SelectItem value="en-US">Inglês (US)</SelectItem>
              <SelectItem value="en-GB">Inglês (UK)</SelectItem>
              <SelectItem value="en-AU">Inglês (AU)</SelectItem>
              <SelectItem value="es-ES">Espanhol (ES)</SelectItem>
              <SelectItem value="es-MX">Espanhol (MX)</SelectItem>
              <SelectItem value="fr-FR">Francês (FR)</SelectItem>
              <SelectItem value="de-DE">Alemão (DE)</SelectItem>
              <SelectItem value="it-IT">Italiano (IT)</SelectItem>
              <SelectItem value="pt-BR">Português (BR)</SelectItem>
            </SelectContent>
          </Select>

          {/* Dificuldade */}
          <Select value={selectedDifficulty} onValueChange={(value) => setSelectedDifficulty(value as CEFRLevel | "all")}>
            <SelectTrigger>
              <SelectValue placeholder="Dificuldade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {(Object.keys(CEFR_LEVELS) as CEFRLevel[]).map((cefrLevel) => (
                <SelectItem key={cefrLevel} value={cefrLevel}>
                  {cefrLevel} · {CEFR_LEVELS[cefrLevel].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Categorias */}
        <div className="flex flex-wrap gap-2 mt-4">
          {["all", "daily", "travel", "business", "academic", "social"].map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category === "all" ? "Todas" : category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>
      </Card>

      {/* Grid de Clipes */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="aspect-video bg-muted rounded-lg mb-4" />
              <div className="h-6 bg-muted rounded mb-2" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </Card>
          ))}
        </div>
      ) : clips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clips.map((clip) => (
            <Card key={clip.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              {/* Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                <Play className="w-16 h-16 text-white opacity-80" />
                {clip.qualityScore && clip.qualityScore >= 90 && (
                  <Badge className="absolute top-2 right-2 bg-green-500">
                    <Star className="w-3 h-3 mr-1" />
                    {clip.qualityScore}
                  </Badge>
                )}
              </div>

              {/* Info */}
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{clip.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {clip.description}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">
                  {normalizeClipCefr(clip.difficulty) || clip.difficulty}
                </Badge>
                {clip.category && <Badge variant="secondary">{clip.category}</Badge>}

              </div>

              {/* Ação */}
              <Link href={`/practice/clips/${clip.id}`}>
                <Button className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Assistir Clipe
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-2xl font-semibold mb-2">Clipes em Produção</h3>
          <p className="text-muted-foreground mb-6">
            Estamos gerando 100+ clipes educacionais de alta qualidade com legendas bilíngues e 18 variações de sotaque nativo.
          </p>
          <div className="flex flex-col items-center gap-4">
            <div className="text-sm text-muted-foreground">
              <strong>Recursos dos clipes:</strong>
            </div>
            <ul className="text-left text-sm text-muted-foreground space-y-2">
              <li>✅ Legendas bilíngues palavra por palavra clicáveis</li>
              <li>✅ 18 variações de sotaque nativo (inglês US/UK/AU, espanhol, francês, etc.)</li>
              <li>✅ Quality Score 90+ (validação em 5 etapas)</li>
              <li>✅ 100 tópicos práticos (daily/travel/business/academic/social)</li>
              <li>✅ Voz Neural Microsoft Edge TTS de alta qualidade</li>
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
}

export default PracticeClips;
