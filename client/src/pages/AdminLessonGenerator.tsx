import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Loader2, Sparkles, Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function AdminLessonGenerator() {
  const [, setLocation] = useLocation();
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [languageCode, setLanguageCode] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("English");
  const [generatedLesson, setGeneratedLesson] = useState<any>(null);

  const generateMutation = trpc.admin.generateLesson.useMutation({
    onSuccess: (data) => {
      setGeneratedLesson(data);
      toast.success("Lição gerada com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao gerar lição: ${error.message}`);
    }
  });

  const publishMutation = trpc.admin.publishLesson.useMutation({
    onSuccess: () => {
      toast.success("Lição publicada com sucesso!");
      setGeneratedLesson(null);
      setTopic("");
    },
    onError: (error) => {
      toast.error(`Erro ao publicar lição: ${error.message}`);
    }
  });

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast.error("Por favor, insira um tópico");
      return;
    }
    generateMutation.mutate({ topic, level, languageCode, targetLanguage });
  };

  const handlePublish = () => {
    if (!generatedLesson) return;
    publishMutation.mutate(generatedLesson);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/admin")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Admin
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            ✨ Gerador de Lições com IA
          </h1>
          <p className="text-gray-600 mt-2">Crie lições completas automaticamente com GPT-4</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de Geração */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Configurar Lição
              </CardTitle>
              <CardDescription>
                Preencha os campos e clique em "Gerar com IA"
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="topic">Tópico da Lição</Label>
                <Input
                  id="topic"
                  placeholder="Ex: At the Airport, Shopping Mall, Job Interview"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={generateMutation.isPending}
                />
              </div>

              <div>
                <Label htmlFor="level">Nível</Label>
                <Select value={level} onValueChange={(v: any) => setLevel(v)} disabled={generateMutation.isPending}>
                  <SelectTrigger id="level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="language">Idioma</Label>
                <Select value={languageCode} onValueChange={setLanguageCode} disabled={generateMutation.isPending}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="it">Italiano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando com IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar com IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview da Lição Gerada */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {generatedLesson ? (
                  <>
                    <Check className="w-5 h-5 text-green-600" />
                    Lição Gerada
                  </>
                ) : (
                  "Preview"
                )}
              </CardTitle>
              <CardDescription>
                {generatedLesson
                  ? "Revise e publique a lição"
                  : "A lição gerada aparecerá aqui"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedLesson ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  <div>
                    <h3 className="font-semibold text-lg">{generatedLesson.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{generatedLesson.description}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">História:</h4>
                    <p className="text-sm text-gray-600 line-clamp-6">{generatedLesson.storyText}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Vocabulário:</h4>
                    <p className="text-xs text-gray-500">
                      {JSON.parse(generatedLesson.vocabularyDetailed).length} palavras
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Gramática:</h4>
                    <p className="text-xs text-gray-500">
                      {JSON.parse(generatedLesson.grammarDetailed).length} tópicos
                    </p>
                  </div>

                  <Button
                    onClick={handlePublish}
                    disabled={publishMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {publishMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Publicando...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Publicar Lição
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aguardando geração...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
