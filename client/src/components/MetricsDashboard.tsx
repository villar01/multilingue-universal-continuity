import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingDown, Zap, Clock, History, Globe } from "lucide-react";

interface OptimizationEntry {
  date: string;
  action: string;
  tokensBefore: number;
  tokensAfter: number;
  savingPercent: number;
}

interface LanguageUsage {
  language: string;
  requests: number;
  tokensSaved: number;
  percentage: number;
}

interface MetricsData {
  totalRequests: number;
  cacheHitRate: number;
  tokensSaved: number;
  avgResponseTime: number;
  ollamaUsage: number;
  lmstudioUsage: number;
  onlineUsage: number;
  optimizationHistory: OptimizationEntry[];
  usageByLanguage: LanguageUsage[];
}

export function MetricsDashboard() {
  // Mock data - replace with actual tRPC query
  const metrics: MetricsData = {
    totalRequests: 1247,
    cacheHitRate: 68.5,
    tokensSaved: 342150,
    avgResponseTime: 1.2,
    ollamaUsage: 45,
    lmstudioUsage: 23,
    onlineUsage: 32,
    optimizationHistory: [
      { date: "2026-07-28", action: "Prompt compression enabled", tokensBefore: 1850, tokensAfter: 920, savingPercent: 50.3 },
      { date: "2026-07-25", action: "Cache TTL extended to 24h", tokensBefore: 2100, tokensAfter: 680, savingPercent: 67.6 },
      { date: "2026-07-20", action: "System prompt deduplication", tokensBefore: 3200, tokensAfter: 1450, savingPercent: 54.7 },
      { date: "2026-07-15", action: "Context window pruning (keep last 6)", tokensBefore: 4200, tokensAfter: 1800, savingPercent: 57.1 },
      { date: "2026-07-10", action: "Offline fallback for Ollama", tokensBefore: 1500, tokensAfter: 0, savingPercent: 100 },
    ],
    usageByLanguage: [
      { language: "English", requests: 487, tokensSaved: 142300, percentage: 39.0 },
      { language: "Português", requests: 312, tokensSaved: 98700, percentage: 28.8 },
      { language: "Español", requests: 198, tokensSaved: 54200, percentage: 15.9 },
      { language: "Français", requests: 150, tokensSaved: 31950, percentage: 9.3 },
      { language: "Deutsch", requests: 100, tokensSaved: 15000, percentage: 7.0 },
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">📊 Dashboard de Métricas</h2>
        <p className="text-muted-foreground">
          Economia de créditos e performance do sistema de IA
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Requisições</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Desde o início</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Cache Hit</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cacheHitRate}%</div>
            <p className="text-xs text-muted-foreground">Respostas instantâneas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Economizados</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.tokensSaved / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">≈ ${((metrics.tokensSaved / 1000) * 0.002).toFixed(2)} economizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgResponseTime}s</div>
            <p className="text-xs text-muted-foreground">Por requisição</p>
          </CardContent>
        </Card>
      </div>

      {/* Provider Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Uso por Provider</CardTitle>
          <CardDescription>Percentual de requisições por fonte de IA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Ollama (Offline)</span>
                <span className="text-sm text-muted-foreground">{metrics.ollamaUsage}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${metrics.ollamaUsage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">LM Studio (Offline)</span>
                <span className="text-sm text-muted-foreground">{metrics.lmstudioUsage}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${metrics.lmstudioUsage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Online (Manus API)</span>
                <span className="text-sm text-muted-foreground">{metrics.onlineUsage}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{ width: `${metrics.onlineUsage}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Otimizações
          </CardTitle>
          <CardDescription>Ações de redução de tokens aplicadas ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.optimizationHistory.map((entry, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{entry.action}</span>
                  <span className="text-xs text-muted-foreground">{entry.date}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground line-through">{entry.tokensBefore.toLocaleString()}</span>
                    <span className="mx-1 text-xs text-muted-foreground">→</span>
                    <span className="text-sm font-semibold text-green-600">{entry.tokensAfter.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingDown className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-bold text-green-600">−{entry.savingPercent}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage by Language */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Uso por Idioma
          </CardTitle>
          <CardDescription>Distribuição de requisições e tokens economizados por idioma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.usageByLanguage.map((lang, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{lang.language}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{lang.requests} req</span>
                    <span className="text-xs font-semibold text-green-600">{(lang.tokensSaved / 1000).toFixed(1)}K tokens</span>
                    <span className="text-sm text-muted-foreground">{lang.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${lang.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Savings Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>💰 Economia Detalhada</CardTitle>
          <CardDescription>Comparação de custos: Online vs Offline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Custo estimado (100% online):</span>
              <span className="text-lg font-bold text-red-500">
                ${((metrics.totalRequests * 0.002)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Custo real (com offline):</span>
              <span className="text-lg font-bold text-green-500">
                ${((metrics.onlineUsage / 100) * metrics.totalRequests * 0.002).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border-2 border-primary">
              <span className="font-bold">Total Economizado:</span>
              <span className="text-2xl font-bold text-primary">
                ${(((metrics.totalRequests * 0.002)) - ((metrics.onlineUsage / 100) * metrics.totalRequests * 0.002)).toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
