import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Link } from "wouter";

export default function AdminSIGA() {
  const { user } = useAuth();
  const [problemInput, setProblemInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [researchTopic, setResearchTopic] = useState("");
  const [researchLang, setResearchLang] = useState("inglês");
  const [genLessonId, setGenLessonId] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);
  const [diagnoseResult, setDiagnoseResult] = useState<any>(null);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [researchResult, setResearchResult] = useState<string>("");
  const [genResult, setGenResult] = useState<any>(null);

  const engines = trpc.siga.checkEngines.useQuery();
  const status = trpc.siga.getStatus.useQuery();

  const autoScan = trpc.siga.autoScan.useMutation({
    onSuccess: (data) => {
      setScanResult(data);
      if (data.problems.length === 0) toast.success("✅ App saudável — nenhum problema!");
      else toast.warning(`⚠️ ${data.problems.length} problema(s) detectado(s)`);
    },
    onError: () => toast.error("Erro ao executar scan"),
  });

  const diagnose = trpc.siga.diagnose.useMutation({
    onSuccess: (data) => {
      setDiagnoseResult(data);
      toast.success("Diagnóstico concluído");
    },
    onError: () => toast.error("Erro no diagnóstico"),
  });

  const search = trpc.siga.search.useMutation({
    onSuccess: (data) => {
      setSearchResult(data);
      toast.success("Busca concluída");
    },
    onError: () => toast.error("Erro na busca"),
  });

  const research = trpc.siga.research.useMutation({
    onSuccess: (data) => {
      setResearchResult(data.content);
      toast.success("Pesquisa concluída");
    },
    onError: () => toast.error("Erro na pesquisa"),
  });

  const generateExercises = trpc.siga.generateExercises.useMutation({
    onSuccess: (data) => {
      setGenResult(data);
      toast.success(`✅ ${data.inserted} exercícios gerados para "${data.lessonTitle}"`);
    },
    onError: () => toast.error("Erro ao gerar exercícios"),
  });

  if (!user || (user as any).role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
          <p className="text-gray-400 mb-4">Apenas o gestor Renato Villar tem acesso ao SIGA.</p>
          <Link href="/"><Button variant="outline">Voltar</Button></Link>
        </div>
      </div>
    );
  }

  const healthColor = status.data?.health === "ok" ? "text-green-400" : status.data?.health === "warning" ? "text-yellow-400" : "text-red-400";

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-400">⚡ SIGA</h1>
            <p className="text-gray-400 text-sm">Sistema Inteligente de Gerenciamento e Aprimoramento</p>
            <p className="text-gray-500 text-xs">Supervisor: {user.name} — Controle total sob sua supervisão</p>
          </div>
          <Link href="/admin">
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300">← Admin</Button>
          </Link>
        </div>

        {/* Status dos motores IA */}
        <Card className="bg-gray-900 border-gray-800 mb-4">
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-gray-300">
                  <strong className="text-white">LLM Manus</strong> — Motor IA principal (sempre ativo)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${engines.data?.tavily.enabled ? "bg-green-500" : "bg-yellow-500"}`} />
                <span className="text-xs text-gray-300">
                  <strong className="text-white">Tavily AI</strong> — {engines.data?.tavily.description ?? "Verificando..."}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status saúde do app */}
        {status.data && (
          <Card className="bg-gray-900 border-gray-800 mb-6">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-sm font-bold ${healthColor}`}>
                  {status.data.health === "ok" ? "✅ App Saudável" : status.data.health === "warning" ? "⚠️ Atenção Necessária" : "🚨 Problemas Críticos"}
                </span>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs border-gray-600">{status.data.lessons} lições</Badge>
                  <Badge variant="outline" className="text-xs border-gray-600">{status.data.exercises} exercícios</Badge>
                  <Badge variant="outline" className="text-xs border-gray-600">{status.data.teachers} professores</Badge>
                  <Badge variant="outline" className="text-xs border-gray-600">{status.data.users} usuários</Badge>
                </div>
              </div>
              {status.data.issues.length > 0 && (
                <div className="space-y-1">
                  {status.data.issues.map((issue, i) => (
                    <div key={i} className={`text-xs px-2 py-1 rounded ${issue.severity === "critical" ? "bg-red-950 text-red-300 border border-red-800" : "bg-yellow-950 text-yellow-300 border border-yellow-800"}`}>
                      {issue.severity === "critical" ? "🚨" : "⚠️"} {issue.description}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scan Automático */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg text-white">🔍 Scan Automático</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-400 text-sm">Detecta problemas reais e notifica você automaticamente. Usa LLM + Tavily.</p>
              <Button onClick={() => autoScan.mutate()} disabled={autoScan.isPending} className="w-full bg-blue-600 hover:bg-blue-700">
                {autoScan.isPending ? "Escaneando..." : "▶ Executar Scan"}
              </Button>
              {scanResult && (
                <div className="space-y-2">
                  {scanResult.problems.length === 0 ? (
                    <p className="text-green-400 text-sm">✅ Nenhum problema encontrado</p>
                  ) : (
                    scanResult.problems.map((p: any, i: number) => (
                      <div key={i} className="bg-red-950 border border-red-800 rounded p-2 text-xs text-red-300">⚠️ {p.description}</div>
                    ))
                  )}
                  {scanResult.aiAnalysis && (
                    <div className="bg-blue-950 border border-blue-800 rounded p-2 text-xs text-blue-200 max-h-40 overflow-y-auto">
                      <strong className="text-blue-300">Análise IA:</strong><br />{scanResult.aiAnalysis}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Diagnóstico com LLM */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg text-white">🧠 Diagnóstico IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-400 text-sm">Descreva um problema. O LLM + Tavily identificam causa raiz e solução.</p>
              <Textarea
                placeholder="Ex: professores não estão falando corretamente..."
                value={problemInput}
                onChange={(e) => setProblemInput(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white text-sm min-h-[80px]"
              />
              <Button onClick={() => diagnose.mutate({ problem: problemInput })} disabled={diagnose.isPending || !problemInput.trim()} className="w-full bg-purple-600 hover:bg-purple-700">
                {diagnose.isPending ? "Diagnosticando..." : "🔍 Diagnosticar"}
              </Button>
              {diagnoseResult && (
                <div className="bg-gray-800 rounded p-3 text-xs text-gray-300 max-h-48 overflow-y-auto">
                  <strong className="text-white">Diagnóstico:</strong>
                  <p className="mt-1 whitespace-pre-wrap">{diagnoseResult.diagnosis}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gerar Exercícios com IA */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg text-white">✏️ Gerar Exercícios com IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-400 text-sm">Gera exercícios pedagógicos para lições sem conteúdo usando LLM.</p>
              <Input
                placeholder="ID da lição (ex: 420001)"
                value={genLessonId}
                onChange={(e) => setGenLessonId(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white text-sm"
              />
              <Button
                onClick={() => generateExercises.mutate({ lessonId: parseInt(genLessonId), count: 5 })}
                disabled={generateExercises.isPending || !genLessonId.trim()}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {generateExercises.isPending ? "Gerando..." : "⚡ Gerar 5 Exercícios"}
              </Button>
              {genResult && (
                <div className="bg-green-950 border border-green-800 rounded p-2 text-xs text-green-300">
                  ✅ {genResult.inserted} exercícios gerados para "{genResult.lessonTitle}"
                </div>
              )}
            </CardContent>
          </Card>

          {/* Busca Web Tavily */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg text-white">🌐 Busca Web (Tavily)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-400 text-sm">Busca direta na web com resposta sintetizada.</p>
              <Input
                placeholder="Ex: best TTS voices for language learning"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white text-sm"
              />
              <Button onClick={() => search.mutate({ query: searchQuery })} disabled={search.isPending || !searchQuery.trim()} className="w-full bg-teal-600 hover:bg-teal-700">
                {search.isPending ? "Buscando..." : "🔎 Buscar"}
              </Button>
              {searchResult && (
                <div className="bg-gray-800 rounded p-3 text-xs text-gray-300 max-h-48 overflow-y-auto space-y-2">
                  {searchResult.answer && <p><strong className="text-white">Resposta:</strong> {searchResult.answer}</p>}
                  {searchResult.results?.slice(0, 3).map((r: any, i: number) => (
                    <div key={i} className="border-t border-gray-700 pt-2">
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline text-xs">{r.title}</a>
                      <p className="text-gray-400 mt-1">{r.content?.slice(0, 150)}...</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pesquisa Pedagógica */}
        <Card className="bg-gray-900 border-gray-800 mt-6">
          <CardHeader>
            <CardTitle className="text-lg text-white">📚 Pesquisa Pedagógica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Tópico (ex: greetings, numbers)" value={researchTopic} onChange={(e) => setResearchTopic(e.target.value)} className="bg-gray-800 border-gray-700 text-white text-sm" />
              <Input placeholder="Idioma (ex: inglês, espanhol)" value={researchLang} onChange={(e) => setResearchLang(e.target.value)} className="bg-gray-800 border-gray-700 text-white text-sm" />
            </div>
            <Button onClick={() => research.mutate({ topic: researchTopic, language: researchLang })} disabled={research.isPending || !researchTopic.trim()} className="w-full bg-orange-600 hover:bg-orange-700">
              {research.isPending ? "Pesquisando..." : "📖 Pesquisar Melhores Práticas"}
            </Button>
            {researchResult && (
              <div className="bg-gray-800 rounded p-3 text-xs text-gray-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                {researchResult}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
