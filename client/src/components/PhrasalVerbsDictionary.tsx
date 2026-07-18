/**
 * PHRASAL VERBS DICTIONARY
 * Dicionário sempre disponível de phrasal verbs com busca e exemplos
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, Search, Volume2, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function PhrasalVerbsDictionary() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const { data: phrasalVerbs, isLoading } = trpc.phrasalVerbs.search.useQuery(
    {
      searchTerm,
      category: selectedCategory || undefined,
      difficulty: selectedDifficulty as "beginner" | "intermediate" | "advanced" | undefined,
    },
    { enabled: isOpen }
  );

  const playAudio = trpc.tts.generateAudio.useMutation({
    onSuccess: (data) => {
      const audio = new Audio(data.audioUrl);
      audio.play();
    },
    onError: () => {
      toast.error("Erro ao gerar áudio");
    },
  });

  const categories = [
    { value: "relationships", label: "Relacionamentos", icon: "💑" },
    { value: "daily_life", label: "Dia a Dia", icon: "🏠" },
    { value: "work", label: "Trabalho", icon: "💼" },
    { value: "study", label: "Estudos", icon: "📚" },
    { value: "travel", label: "Viagem", icon: "✈️" },
    { value: "emotions", label: "Emoções", icon: "❤️" },
    { value: "social", label: "Social", icon: "👥" },
    { value: "decisions", label: "Decisões", icon: "🤔" },
    { value: "discovery", label: "Descoberta", icon: "🔍" },
    { value: "conversation", label: "Conversação", icon: "💬" },
  ];

  const difficulties = [
    { value: "beginner", label: "Iniciante", color: "bg-green-500" },
    { value: "intermediate", label: "Intermediário", color: "bg-yellow-500" },
    { value: "advanced", label: "Avançado", color: "bg-red-500" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none z-50"
        >
          <Book className="h-8 w-8" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Book className="h-6 w-6 text-purple-600" />
            Dicionário de Phrasal Verbs
          </DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar phrasal verb (ex: break up, give up)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Category Filter */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Categorias:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
              >
                Todas
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  size="sm"
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  {cat.icon} {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Nível:</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={selectedDifficulty === null ? "default" : "outline"}
                onClick={() => setSelectedDifficulty(null)}
              >
                Todos
              </Button>
              {difficulties.map((diff) => (
                <Button
                  key={diff.value}
                  size="sm"
                  variant={selectedDifficulty === diff.value ? "default" : "outline"}
                  onClick={() => setSelectedDifficulty(diff.value)}
                  className={selectedDifficulty === diff.value ? diff.color : ""}
                >
                  {diff.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4 mt-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : (phrasalVerbs as unknown as any[]) && (phrasalVerbs as unknown as any[]).length > 0 ? (
            (phrasalVerbs as unknown as any[]).map((pv: any) => (
              <Card key={pv.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-blue-600">{pv.phrasalVerb}</h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            playAudio.mutate({
                              text: pv.phrasalVerb,
                              languageCode: "en-US",
                            })
                          }
                          disabled={playAudio.isPending}
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-gray-700 font-medium">{pv.meaning}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge
                        className={
                          pv.difficulty === "beginner"
                            ? "bg-green-500"
                            : pv.difficulty === "intermediate"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }
                      >
                        {pv.difficulty === "beginner"
                          ? "Iniciante"
                          : pv.difficulty === "intermediate"
                          ? "Intermediário"
                          : "Avançado"}
                      </Badge>
                      <Badge variant="outline">
                        {categories.find((c) => c.value === pv.category)?.icon}{" "}
                        {categories.find((c) => c.value === pv.category)?.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Translations */}
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-1">🇧🇷 Traduções:</p>
                    <div className="flex flex-wrap gap-2">
                      {JSON.parse(pv.translations).map((translation: string, idx: number) => (
                        <Badge key={idx} variant="secondary">
                          {translation}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Examples */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">📝 Exemplos:</p>
                    {JSON.parse(pv.examples).map((example: any, idx: number) => (
                      <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium">{example.en}</p>
                            <p className="text-gray-600 text-sm mt-1">{example.pt}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              playAudio.mutate({
                                text: example.en,
                                languageCode: "en-US",
                              })
                            }
                            disabled={playAudio.isPending}
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Synonyms */}
                  {pv.synonyms && (
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 mb-1">🔄 Sinônimos:</p>
                      <div className="flex flex-wrap gap-2">
                        {JSON.parse(pv.synonyms).map((synonym: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="bg-white">
                            {synonym}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related Phrases */}
                  {pv.relatedPhrases && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 mb-1">🔗 Phrasal Verbs Relacionados:</p>
                      <div className="flex flex-wrap gap-2">
                        {JSON.parse(pv.relatedPhrases).map((related: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="bg-white cursor-pointer hover:bg-gray-100">
                            {related}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {pv.notes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 mb-1">💡 Dica:</p>
                      <p className="text-gray-600 text-sm">{pv.notes}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm
                ? "Nenhum phrasal verb encontrado. Tente outra busca!"
                : "Use a busca ou filtros para encontrar phrasal verbs."}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
