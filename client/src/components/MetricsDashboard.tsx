import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingDown, Zap, Clock } from "lucide-react";

interface MetricsData {
  totalRequests: number;
  cacheHitRate: number;
  tokensSaved: number;
  avgResponseTime: number;
  ollamaUsage: number;
  lmstudioUsage: number;
  onlineUsage: number;
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
