import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Trophy, CheckCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Admin() {
  const [isPopulating, setIsPopulating] = useState(false);
  const [achievementsPopulated, setAchievementsPopulated] = useState(false);
  const [teachersPopulated, setTeachersPopulated] = useState(false);

  // Mutations
  const populateAchievementsMutation = trpc.seed.populateAchievements.useMutation();
  const populateMassiveMutation = trpc.seed.populateMassive.useMutation();
  const seedTeachersMutation = trpc.aiAdmin.seedVirtualTeachers.useMutation();
  const seedAutoPaymentsMutation = trpc.aiAdmin.seedAutoPayments.useMutation();

  // Buscar conquistas existentes
  const { data: achievements, refetch: refetchAchievements } = trpc.achievements.getAll.useQuery();

  const handlePopulateAchievements = async () => {
    setIsPopulating(true);
    try {
      const result = await populateAchievementsMutation.mutateAsync();
      toast.success(result.message);
      setAchievementsPopulated(true);
      await refetchAchievements();
    } catch (error) {
      toast.error("Erro ao popular conquistas");
      console.error(error);
    } finally {
      setIsPopulating(false);
    }
  };

  const handleSeedAutoPayments = async () => {
    try {
      toast.info("💳 Configurando pagamentos automáticos...");
      const result = await seedAutoPaymentsMutation.mutateAsync();
      toast.success("✅ Pagamentos automáticos configurados!");
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
      console.error(error);
    }
  };

  const handlePopulateMassive = async () => {
    setIsPopulating(true);
    try {
      toast.info("🚀 Iniciando seed massivo... Isso pode levar alguns minutos.");
      const result = await populateMassiveMutation.mutateAsync();
      toast.success(result.message);
    } catch (error) {
      toast.error("Erro ao popular conteúdo massivo");
      console.error(error);
    } finally {
      setIsPopulating(false);
    }
  };

  const handlePopulateTeachers = async () => {
    setIsPopulating(true);
    try {
      toast.info("🎭 Criando professores virtuais...");
      const result = await seedTeachersMutation.mutateAsync();
      toast.success("✅ 54 professores criados com sucesso!");
      setTeachersPopulated(true);
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
      console.error(error);
    } finally {
      setIsPopulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Painel Administrativo
            </h1>
            <p className="text-lg text-gray-600">
              Gerenciar banco de dados e configurações do sistema
            </p>
          </div>

          {/* Cards de ações */}
          <div className="grid gap-6">
            {/* Seed Massivo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-6 w-6 text-blue-600" />
                  Seed Massivo: 54 Idiomas + 1080+ Lições
                </CardTitle>
                <CardDescription>
                  Popular banco de dados completo com todos os idiomas e lições
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2 text-sm">O que será criado:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• 54 idiomas (Europeus, Asiáticos, África, Américas)</li>
                      <li>• 162 cursos (3 níveis por idioma)</li>
                      <li>• 1080+ lições distribuídas por tópicos</li>
                    </ul>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">
                        ⚠️ Isso pode levar alguns minutos
                      </p>
                    </div>
                    <Button
                      onClick={handlePopulateMassive}
                      disabled={isPopulating || populateMassiveMutation.isPending}
                      size="lg"
                    >
                      {isPopulating || populateMassiveMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Populando...
                        </>
                      ) : (
                        <>
                          <Database className="h-4 w-4 mr-2" />
                          Iniciar Seed Massivo
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Popular Conquistas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                  Popular Conquistas
                </CardTitle>
                <CardDescription>
                  Adicionar 13 conquistas padrão ao banco de dados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Status: {achievements && achievements.length > 0 ? (
                          <Badge variant="secondary" className="ml-2">
                            {achievements.length} conquistas cadastradas
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="ml-2">
                            Nenhuma conquista
                          </Badge>
                        )}
                      </p>
                    </div>
                    <Button
                      onClick={handlePopulateAchievements}
                      disabled={isPopulating || (achievements && achievements.length > 0)}
                    >
                      {isPopulating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Populando...
                        </>
                      ) : achievementsPopulated || (achievements && achievements.length > 0) ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Concluído
                        </>
                      ) : (
                        <>
                          <Database className="h-4 w-4 mr-2" />
                          Popular Agora
                        </>
                      )}
                    </Button>
                  </div>

                  {achievements && achievements.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2 text-sm">Conquistas cadastradas:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {achievements.map((achievement) => (
                          <div key={achievement.id} className="flex items-center gap-2 text-sm">
                            <span>{achievement.icon}</span>
                            <span className="truncate">{achievement.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informações do Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-6 w-6 text-blue-600" />
                  Informações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Conquistas cadastradas:</span>
                    <span className="font-semibold">{achievements?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Status do banco:</span>
                    <Badge variant="secondary">Conectado</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Ambiente:</span>
                    <Badge>Desenvolvimento</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configurar Pagamentos Automáticos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💳 Pagamentos Automáticos
                </CardTitle>
                <CardDescription>
                  Configurar despesas recorrentes (DigitalOcean, PagBank, domínio)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2 text-sm">Despesas que serão configuradas:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• DigitalOcean: R$ 120/mês (hospedagem)</li>
                      <li>• PagBank: R$ 50/mês (taxas estimadas)</li>
                      <li>• Registro.br: R$ 40/ano (domínio multilingue.com.br)</li>
                    </ul>
                  </div>
                  <Button
                    onClick={handleSeedAutoPayments}
                    variant="default"
                    className="w-full"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Configurar Pagamentos
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Gerar Lições com IA */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ✨ Gerar Lições com IA GPT-4
                </CardTitle>
                <CardDescription>
                  Criar lições completas automaticamente para qualquer tópico e nível
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2 text-sm">Recursos da geração automática:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• História narrativa completa (300-400 palavras)</li>
                      <li>• Vocabulário detalhado (8-10 palavras com fonética, sinônimos, gírias)</li>
                      <li>• Gramática aplicada (2-3 tópicos com exercícios)</li>
                      <li>• Fonética (3-4 dicas de pronúncia)</li>
                      <li>• 10 prompts de conversação com IA</li>
                    </ul>
                  </div>

                  <Button
                    onClick={() => window.location.href = '/admin-lesson-generator'}
                    variant="default"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Abrir Gerador de Lições
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Popular Professores Virtuais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎭 Professores Virtuais
                </CardTitle>
                <CardDescription>
                  Criar professores específicos para cada um dos 54 idiomas com nomes culturalmente apropriados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2 text-sm">O que será criado:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• 54 professores virtuais (1 por idioma)</li>
                      <li>• Nomes culturalmente apropriados (ex: Ana Silva para Português, Yuki Tanaka para Japonês)</li>
                      <li>• Personalidades e estilos de ensino únicos</li>
                      <li>• Configurações de voz e aparência</li>
                      <li>• Frases características em cada idioma</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Status: {teachersPopulated ? (
                          <Badge variant="secondary" className="ml-2">
                            Professores criados
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="ml-2">
                            Aguardando criação
                          </Badge>
                        )}
                      </p>
                    </div>
                    <Button
                      onClick={handlePopulateTeachers}
                      disabled={isPopulating}
                      variant="default"
                    >
                      {isPopulating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Criando...
                        </>
                      ) : teachersPopulated ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Concluído
                        </>
                      ) : (
                        <>
                          <Database className="h-4 w-4 mr-2" />
                          Criar Professores
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* SIGA Banner */}
      <div className="max-w-4xl mx-auto px-4 pb-12 mt-6">
        <a href="/admin/siga">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-6 text-white cursor-pointer hover:opacity-90 transition-opacity shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">⚡ SIGA — IA de Autodesenvolvimento</h2>
                <p className="text-blue-100 mt-1">Tavily AI integrado • Scan automático • Diagnóstico • Pesquisa pedagógica</p>
                <p className="text-blue-200 text-sm mt-2">Supervisor exclusivo: Renato Villar</p>
              </div>
              <div className="text-5xl font-bold opacity-80">→</div>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}