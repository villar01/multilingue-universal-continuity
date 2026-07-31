import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function OfflineAISettings() {
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [lmStudioUrl, setLmStudioUrl] = useState("http://localhost:1234");
  
  const { data: status, refetch } = trpc.offlineAI.getStatus.useQuery();
  const generateMutation = trpc.offlineAI.generate.useMutation();

  const testConnection = async (provider: "ollama" | "lmstudio") => {
    try {
      const result = await generateMutation.mutateAsync({
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Say hello" },
        ],
        preferredProvider: provider,
        useCache: false,
      });

      toast.success(`${provider} conectado com sucesso!`, {
        description: `Resposta: ${result.content.substring(0, 50)}...`,
      });
    } catch (error: any) {
      toast.error(`Erro ao conectar ${provider}`, {
        description: error.message,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>⚙️ Configuração de IA Offline</CardTitle>
        <CardDescription>
          Configure Ollama e LM Studio para reduzir créditos e funcionar offline
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ollama */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="ollama-url">Ollama Endpoint</Label>
            {status?.ollama !== undefined && (
              <Badge variant={status.ollama ? "default" : "destructive"}>
                {status.ollama ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Online
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1" />
                    Offline
                  </>
                )}
              </Badge>
            )}
          </div>
          <Input
            id="ollama-url"
            value={ollamaUrl}
            onChange={(e) => setOllamaUrl(e.target.value)}
            placeholder="http://localhost:11434"
          />
          <Button
            onClick={() => testConnection("ollama")}
            disabled={generateMutation.isPending}
            size="sm"
            variant="outline"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              "Testar Conexão"
            )}
          </Button>
        </div>

        {/* LM Studio */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="lmstudio-url">LM Studio Endpoint</Label>
            {status?.lmstudio !== undefined && (
              <Badge variant={status.lmstudio ? "default" : "destructive"}>
                {status.lmstudio ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Online
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1" />
                    Offline
                  </>
                )}
              </Badge>
            )}
          </div>
          <Input
            id="lmstudio-url"
            value={lmStudioUrl}
            onChange={(e) => setLmStudioUrl(e.target.value)}
            placeholder="http://localhost:1234"
          />
          <Button
            onClick={() => testConnection("lmstudio")}
            disabled={generateMutation.isPending}
            size="sm"
            variant="outline"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              "Testar Conexão"
            )}
          </Button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
          <p className="font-semibold">📋 Instruções de Instalação:</p>
          <div className="space-y-1">
            <p><strong>Ollama:</strong></p>
            <code className="block bg-background p-2 rounded">
              curl -fsSL https://ollama.com/install.sh | sh && ollama pull qwen2.5:3b
            </code>
          </div>
          <div className="space-y-1">
            <p><strong>LM Studio:</strong></p>
            <p className="text-muted-foreground">
              Baixe em{" "}
              <a
                href="https://lmstudio.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                lmstudio.ai
              </a>
              {" "}e inicie o servidor local
            </p>
          </div>
        </div>

        <Button onClick={() => refetch()} variant="secondary" className="w-full">
          Atualizar Status
        </Button>
      </CardContent>
    </Card>
  );
}
