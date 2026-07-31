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
} from "lucide-react";

export default function IANativa() {
  const { data: status, isLoading } = trpc.offlineAI.getStatus.useQuery(undefined, {
    refetchInterval: 10000,
  });

  const ollamaOnline = (status as any)?.ollama ?? false;
  const lmstudioOnline = (status as any)?.lmstudio ?? false;
  const anyLocal = ollamaOnline || lmstudioOnline;

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
            IA Nativa Local
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
                  IA Nativa Ativa
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-amber-600" />
                  IA Nativa Não Detectada
                </>
              )}
            </CardTitle>
            <CardDescription>
              {anyLocal
                ? "Sua IA local está funcionando. O app usará seus recursos para respostas mais rápidas e sem depender de servidores externos."
                : "Instale uma IA local para acelerar suas lições, reduzir latência e funcionar mesmo sem internet."}
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
                    <Badge variant="destructive">
                      <WifiOff className="h-3 w-3 mr-1" /> Offline
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
                    <Badge variant="destructive">
                      <WifiOff className="h-3 w-3 mr-1" /> Offline
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
              Por que usar IA Nativa no seu computador?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                <Gauge className="h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-semibold mb-1">Muito Mais Rápido</h3>
                <p className="text-sm text-slate-600">
                  As respostas são geradas no seu próprio computador, sem esperar servidores remotos. Latência quase zero.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <Shield className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-semibold mb-1">Privacidade Total</h3>
                <p className="text-sm text-slate-600">
                  Seus dados de aprendizado nunca saem do seu computador. Nada é enviado para servidores de terceiros.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                <WifiOff className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-semibold mb-1">Funciona Offline</h3>
                <p className="text-sm text-slate-600">
                  Sem internet? Sem problema. A IA local continua funcionando para suas lições e exercícios.
                </p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Importante:</strong> Com IA nativa ativa, o app reduz drasticamente o uso de recursos de terceiros.
                Isso significa menos custo de servidores, menos carga de processamento remoto, e uma experiência muito mais fluida para você.
                O app detecta automaticamente sua IA local e a utiliza como prioridade.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Instalação do Ollama */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Download className="h-5 w-5 text-green-600" />
              Como instalar o Ollama (Recomendado)
            </CardTitle>
            <CardDescription>
              Ollama é gratuito, leve e roda modelos de IA diretamente no seu computador.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="outline">Passo 1</Badge>
                Baixar e instalar
              </h3>
              <p className="text-sm text-slate-600 mb-2">
                Acesse o site oficial e baixe o instalador para seu sistema operacional:
              </p>
              <a href="https://ollama.com/download" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Ollama
                </Button>
              </a>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="outline">Passo 2</Badge>
                Baixar o modelo de IA
              </h3>
              <p className="text-sm text-slate-600 mb-2">
                Abra o terminal e execute o comando abaixo para baixar o modelo Mistral 7B (recomendado):
              </p>
              <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-sm flex items-center gap-2">
                <Terminal className="h-4 w-4 text-green-400" />
                ollama pull mistral
              </div>
              <p className="text-xs text-slate-500 mt-2">
                O modelo tem aproximadamente 4.1 GB. O download pode levar alguns minutos dependendo da sua conexão.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="outline">Passo 3</Badge>
                Verificar instalação
              </h3>
              <p className="text-sm text-slate-600 mb-2">
                O Ollama inicia automaticamente. Verifique se está rodando:
              </p>
              <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-sm flex items-center gap-2">
                <Terminal className="h-4 w-4 text-green-400" />
                ollama list
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Se aparecer "mistral" na lista, está tudo pronto! O app detectará automaticamente.
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
                Dentro do LM Studio, pesquise por "Mistral" ou "Llama 3" e baixe o modelo de sua preferência.
                Recomendamos Mistral 7B Instruct para melhor compatibilidade.
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
                <strong>Prioridade local:</strong> O app sempre tenta usar sua IA local primeiro (Ollama ou LM Studio).
                Só usa servidores remotos como fallback se nenhuma IA local estiver disponível.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-700">
                <strong>Detecção automática:</strong> Não precisa configurar nada. O app detecta automaticamente
                se Ollama (porta 11434) ou LM Studio (porta 1234) estão rodando.
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
                <strong>Fallback gracioso:</strong> Se sua IA local cair, o app automaticamente muda para o servidor remoto
                sem interromper sua lição. Quando a IA local voltar, o app volta a usá-la.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center py-8">
          {anyLocal ? (
            <div className="space-y-3">
              <p className="text-lg font-semibold text-green-700">
                Sua IA nativa está ativa e pronta para uso!
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
                Instale uma IA local para aproveitar ao máximo o app!
              </p>
              <a href="https://ollama.com/download" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  <Download className="h-5 w-5 mr-2" />
                  Baixar Ollama Agora
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
