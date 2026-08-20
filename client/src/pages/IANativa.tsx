import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  Cpu,
  Zap,
  Shield,
  Wifi,
  WifiOff,
  CheckCircle2,
  XCircle,
  Download,
  Terminal,
  ArrowLeft,
  Sparkles,
  Gauge,
  Server,
  Monitor,
  Apple,
  Copy,
  AlertCircle,
} from "lucide-react";

export default function IANativa() {
  const { data: status, isLoading } = trpc.offlineAI.getStatus.useQuery(undefined, {
    refetchInterval: 10000,
  });

  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const ollamaOnline = (status as any)?.ollama ?? false;
  const lmstudioOnline = (status as any)?.lmstudio ?? false;
  const anyLocal = ollamaOnline || lmstudioOnline;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-purple-600" />
            IA para estudo
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Status atual */}
        <Card className={`mb-8 border-2 ${anyLocal ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              {anyLocal ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  Runtime local do servidor ativo
                </>
              ) : (
                <>
                  <Sparkles className="h-6 w-6 text-amber-600" />
                  Assistência de estudo disponível
                </>
              )}
            </CardTitle>
            <CardDescription>
              {anyLocal
                ? "O servidor deste app encontrou um provedor local configurado. Esse status não verifica o Ollama instalado apenas no computador do aluno."
                : "Este ambiente está usando a assistência integrada da plataforma. O processamento local permanece uma opção para ambientes preparados."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {/* Ollama status */}
              <div className={`p-4 rounded-lg border ${ollamaOnline ? "border-green-200 bg-white" : "border-slate-200 bg-white"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold flex items-center gap-2">
                    <Server className="h-4 w-4 text-slate-600" />
                    Ollama
                  </span>
                  {isLoading ? (
                    <Badge variant="secondary">Verificando...</Badge>
                  ) : ollamaOnline ? (
                    <Badge className="bg-green-600 text-white">
                      <Wifi className="h-3 w-3 mr-1" /> Online
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <WifiOff className="h-3 w-3 mr-1" /> Não conectado
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500">localhost:11434</p>
              </div>

              {/* LM Studio status */}
              <div className={`p-4 rounded-lg border ${lmstudioOnline ? "border-green-200 bg-white" : "border-slate-200 bg-white"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold flex items-center gap-2">
                    <Server className="h-4 w-4 text-slate-600" />
                    LM Studio
                  </span>
                  {isLoading ? (
                    <Badge variant="secondary">Verificando...</Badge>
                  ) : lmstudioOnline ? (
                    <Badge className="bg-green-600 text-white">
                      <Wifi className="h-3 w-3 mr-1" /> Online
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <WifiOff className="h-3 w-3 mr-1" /> Não conectado
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500">localhost:1234</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Por que IA nativa? */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Sobre IA local e integração com o app
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                <Gauge className="h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-semibold mb-1">Processamento local configurado</h3>
                <p className="text-sm text-slate-600">
                  Um modelo local pode executar tarefas de texto sem enviar esse processamento ao provedor remoto, quando a integração apropriada estiver configurada.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <Shield className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-semibold mb-1">Privacidade por tarefa</h3>
                <p className="text-sm text-slate-600">
                  O modelo local reduz dependência de geração remota, mas outras funções do app podem continuar usando servidor e armazenamento conforme a política de privacidade.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                <WifiOff className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-semibold mb-1">Modelo disponível offline</h3>
                <p className="text-sm text-slate-600">
                  Depois do download, o modelo pode funcionar offline no Ollama; o uso dentro desta versão hospedada depende de uma integração cliente-local ainda configurável.
                </p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Importante:</strong> O status acima verifica somente provedores acessíveis ao servidor do app. Uma instalação de Ollama no computador do aluno não é detectada automaticamente por esta versão hospedada.
                A integração direta cliente-local deve ser habilitada antes de o app enviar tarefas para esse modelo.
                <br/><br/>
                <strong>Voz natural e animação:</strong> Voz neural e animação dos professores usam os mecanismos próprios do app. Instalar Qwen não cria voz neural nem animação labial.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Informação opcional para o aluno */}
        <Card className="mb-8 border-2 border-blue-300 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              IA local é opcional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800">
              Você não precisa instalar nenhum modelo local para estudar. Qwen2.5 no Ollama é apenas uma opção para prática de texto em um ambiente preparado; ele não ativa automaticamente voz neural, animação ou modo offline nesta versão hospedada.
              Consulte licenças e requisitos atuais do modelo somente se decidir usar essa opção.
            </p>
          </CardContent>
        </Card>

        {/* Instalação automática por sistema operacional */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Download className="h-5 w-5 text-green-600" />
              Instalação guiada do Qwen2.5
            </CardTitle>
            <CardDescription>
              Escolha seu sistema operacional e siga os comandos oficiais. Licenças, tamanhos e compatibilidade variam por modelo e equipamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Windows */}
            <div className="p-4 rounded-lg border border-slate-200 bg-white">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-700">
                <Monitor className="h-5 w-5" />
                Windows
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600 mb-2">Passo 1: Baixar e instalar o Ollama</p>
                  <a href="https://ollama.com/download/OllamaSetup.exe" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="mb-2">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar OllamaSetup.exe
                    </Button>
                  </a>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-2">Passo 2: Abrir o PowerShell e instalar o Qwen2.5</p>
                  <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-green-400" />
                      ollama pull qwen2.5:3b
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("ollama pull qwen2.5:3b", "win-pull")}>
                      <Copy className="h-3 w-3" /> {copiedCmd === "win-pull" ? "Copiado!" : "Copiar"}
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-2">Passo 3: Verificar</p>
                  <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-green-400" />
                      ollama list
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("ollama list", "win-list")}>
                      <Copy className="h-3 w-3" /> {copiedCmd === "win-list" ? "Copiado!" : "Copiar"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* macOS */}
            <div className="p-4 rounded-lg border border-slate-200 bg-white">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-700">
                <Apple className="h-5 w-5" />
                macOS
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600 mb-2">Passo 1: Instalar via Homebrew (recomendado)</p>
                  <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-green-400" />
                      brew install ollama
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("brew install ollama", "mac-brew")}>
                      <Copy className="h-3 w-3" /> {copiedCmd === "mac-brew" ? "Copiado!" : "Copiar"}
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-2">Passo 2: Iniciar o serviço e instalar o Qwen2.5</p>
                  <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-sm flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-green-400" />
                      ollama serve &
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("ollama serve &", "mac-serve")}>
                      <Copy className="h-3 w-3" /> {copiedCmd === "mac-serve" ? "Copiado!" : "Copiar"}
                    </Button>
                  </div>
                  <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-green-400" />
                      ollama pull qwen2.5:3b
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("ollama pull qwen2.5:3b", "mac-pull")}>
                      <Copy className="h-3 w-3" /> {copiedCmd === "mac-pull" ? "Copiado!" : "Copiar"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Linux */}
            <div className="p-4 rounded-lg border border-slate-200 bg-white">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-orange-700">
                <Monitor className="h-5 w-5" />
                Linux
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600 mb-2">Passo 1: Abra as instruções oficiais para Linux e escolha o método adequado à sua distribuição.</p>
                  <a href="https://docs.ollama.com/linux" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Instruções oficiais do Ollama</Button>
                  </a>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-2">Passo 2: Instalar o Qwen2.5</p>
                  <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-green-400" />
                      ollama pull qwen2.5:3b
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("ollama pull qwen2.5:3b", "linux-pull")}>
                      <Copy className="h-3 w-3" /> {copiedCmd === "linux-pull" ? "Copiado!" : "Copiar"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Info sobre o modelo */}
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
              <p className="text-sm text-purple-800">
                <strong>Sobre o Qwen2.5 3B:</strong> modelo de linguagem local disponível no catálogo Ollama. Tamanho, requisitos de memória, licença e variantes dependem da versão/quantização; confirme os detalhes na página oficial antes de baixar.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Instalação do LM Studio */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Download className="h-5 w-5 text-blue-600" />
              Alternativa: LM Studio
            </CardTitle>
            <CardDescription>
              LM Studio tem interface gráfica e é mais amigável para iniciantes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="outline">Passo 1</Badge>
                Baixar LM Studio
              </h3>
              <p className="text-sm text-slate-600 mb-2">
                Acesse o site oficial e baixe para Windows, Mac ou Linux:
              </p>
              <a href="https://lmstudio.ai" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar LM Studio
                </Button>
              </a>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="outline">Passo 2</Badge>
                Baixar um modelo
              </h3>
              <p className="text-sm text-slate-600 mb-2">
                Dentro do LM Studio, pesquise por "Qwen2.5" e baixe o modelo de sua preferência.
                Recomendamos Qwen2.5 3B Instruct para melhor compatibilidade multilingual.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="outline">Passo 3</Badge>
                Iniciar o servidor local
              </h3>
              <p className="text-sm text-slate-600 mb-2">
                Na aba "Local Server" do LM Studio, clique em "Start Server". O servidor roda em
                <code className="bg-slate-100 px-1 rounded mx-1">localhost:1234</code>.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Configuração no app */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Zap className="h-5 w-5 text-amber-600" />
              Como o app usa sua IA nativa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-700">
                <strong>Prioridade local no servidor:</strong> O app tenta usar Ollama ou LM Studio acessíveis ao servidor. Modelos locais do aluno exigem uma conexão cliente-local adicional.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-700">
                <strong>Status exibido:</strong> A verificação indica somente os endpoints acessíveis ao servidor deste app; ela não inspeciona automaticamente as portas do navegador do aluno.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-700">
                <strong>Cache inteligente:</strong> Respostas repetidas são cacheadas em memória para resposta instantânea,
                reduzindo ainda mais a carga tanto local quanto remota.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-700">
                <strong>Fallback gracioso:</strong> Quando nenhum provedor local do servidor responde, o app usa o provedor integrado e identifica essa escolha em métricas e cache.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center py-8">
          {anyLocal ? (
            <div className="space-y-3">
              <p className="text-lg font-semibold text-green-700">
                O runtime local do servidor está ativo.
              </p>
              <Link href="/dashboard">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Ir para o Dashboard
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-lg font-semibold text-amber-700">
                A plataforma está pronta para estudar com a assistência integrada. Processamento local é opcional e só é usado quando configurado no servidor.
              </p>
              <a href="https://ollama.com/download" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  <Download className="h-5 w-5 mr-2" />
                  Conhecer a opção local
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
