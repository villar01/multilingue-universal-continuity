import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, Loader2, Sparkles, Database, BookOpen, FileQuestion } from "lucide-react";

export default function AdminRegenerateLessons() {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const statsQuery = trpc.regenerateLessons.getStats.useQuery();
  const regenerateMutation = trpc.regenerateLessons.execute.useMutation();

  const handleRegenerate = async () => {
    if (!confirm("⚠️ ATENÇÃO: Isso vai deletar TODAS as lições atuais e criar novas. Tem certeza?")) {
      return;
    }

    setIsRegenerating(true);
    setResult(null);

    try {
      const response = await regenerateMutation.mutateAsync();
      setResult(response);
      // Recarregar estatísticas
      statsQuery.refetch();
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "Erro ao regenerar lições"
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🔧 Regenerar Lições</h1>
        <p className="text-muted-foreground">
          Ferramenta administrativa para regenerar todo o conteúdo de lições
        </p>
      </div>

      {/* Estatísticas Atuais */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Estatísticas Atuais
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statsQuery.isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando...
            </div>
          ) : statsQuery.data ? (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{statsQuery.data.totalCourses}</div>
                <div className="text-sm text-muted-foreground">Cursos</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{statsQuery.data.totalLessons}</div>
                <div className="text-sm text-muted-foreground">Lições</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{statsQuery.data.totalExercises}</div>
                <div className="text-sm text-muted-foreground">Exercícios</div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Card Principal */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Sistema de Regeneração
          </CardTitle>
          <CardDescription>
            Deleta todas as lições atuais e cria 600 lições novas com conteúdo estruturado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Funcionalidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">10 Lições por Curso</h3>
                <p className="text-xs text-muted-foreground">
                  Cada curso recebe 10 lições organizadas por tópicos
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <FileQuestion className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">5 Exercícios por Lição</h3>
                <p className="text-xs text-muted-foreground">
                  Cada lição tem 5 exercícios de múltipla escolha
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Conteúdo Estruturado</h3>
                <p className="text-xs text-muted-foreground">
                  Lições organizadas por nível (iniciante, intermediário, avançado)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <Sparkles className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Professor Animado</h3>
                <p className="text-xs text-muted-foreground">
                  Todas as lições funcionam com o professor virtual 2D
                </p>
              </div>
            </div>
          </div>

          {/* Botão de Ação */}
          <div className="pt-4">
            <Button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              size="lg"
              className="w-full"
              variant="destructive"
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Regenerando... (Aguarde 1-2 minutos)
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Regenerar Todas as Lições
                </>
              )}
            </Button>
          </div>

          {/* Resultado */}
          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertTitle>{result.success ? "✅ Sucesso!" : "❌ Erro"}</AlertTitle>
              <AlertDescription>
                {result.message}
                {result.stats && (
                  <div className="mt-2 text-sm">
                    <div>• {result.stats.courses} cursos processados</div>
                    <div>• {result.stats.lessons} lições criadas</div>
                    <div>• {result.stats.exercises} exercícios criados</div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Informações */}
      <Card>
        <CardHeader>
          <CardTitle>ℹ️ Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="font-semibold min-w-[140px]">⏱️ Tempo estimado:</span>
            <span className="text-muted-foreground">1-2 minutos</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold min-w-[140px]">🗑️ Ação destrutiva:</span>
            <span className="text-muted-foreground">Deleta TODAS as lições e exercícios atuais</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold min-w-[140px]">📝 Tópicos:</span>
            <span className="text-muted-foreground">Greetings, Numbers, Colors, Family, Food, etc.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold min-w-[140px]">🎭 Animações:</span>
            <span className="text-muted-foreground">Professor virtual 2D funciona automaticamente</span>
          </div>
        </CardContent>
      </Card>

      {/* Aviso */}
      <Alert className="mt-6" variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>⚠️ ATENÇÃO</AlertTitle>
        <AlertDescription>
          Esta operação é IRREVERSÍVEL. Todas as lições atuais serão deletadas permanentemente.
          Certifique-se de ter um backup se necessário.
        </AlertDescription>
      </Alert>
    </div>
  );
}
