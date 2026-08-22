import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ACTIVE_LANGUAGE_COUNT, LANGUAGES_57, TOTAL_LANGUAGES, type Language } from "@/lib/languages";
import LanguageSelector from "@/components/LanguageSelector";
import { toast } from "sonner";

export default function Certificates() {
  const { user } = useAuth();
  const [selectedLang, setSelectedLang] = useState<Language>(LANGUAGES_57[0]);
  const [generating, setGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data: eligibility, isLoading: checkLoading } = trpc.certificates.check.useQuery(
    { targetLanguage: selectedLang.code },
    { enabled: !!user }
  );
  const { data: myCerts, refetch: refetchCerts } = trpc.certificates.list.useQuery(undefined, { enabled: !!user });
  const issueCert = trpc.certificates.issue.useMutation();

  const generateCertificateCanvas = (userName: string, langName: string, langFlag: string, date: string, validationCode?: string | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    canvas.width = 1200;
    canvas.height = 850;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 1200, 850);
    bg.addColorStop(0, "#0f172a");
    bg.addColorStop(0.5, "#1e1b4b");
    bg.addColorStop(1, "#0f172a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1200, 850);

    // Outer border
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, 1160, 810);

    // Inner border
    ctx.strokeStyle = "#818cf8";
    ctx.lineWidth = 2;
    ctx.strokeRect(35, 35, 1130, 780);

    // Corner decorations
    const corners = [[55, 55], [1145, 55], [55, 795], [1145, 795]];
    corners.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fillStyle = "#6366f1";
      ctx.fill();
    });

    // Top decorative line
    const topLine = ctx.createLinearGradient(100, 0, 1100, 0);
    topLine.addColorStop(0, "transparent");
    topLine.addColorStop(0.5, "#6366f1");
    topLine.addColorStop(1, "transparent");
    ctx.strokeStyle = topLine;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.lineTo(1100, 100);
    ctx.stroke();

    // Stars decoration
    const starPositions = [150, 300, 450, 600, 750, 900, 1050];
    starPositions.forEach(x => {
      ctx.fillStyle = "#fbbf24";
      ctx.font = "20px serif";
      ctx.textAlign = "center";
      ctx.fillText("★", x, 90);
    });

    // Certificate title
    ctx.textAlign = "center";
    ctx.fillStyle = "#818cf8";
    ctx.font = "bold 28px Georgia, serif";
    ctx.letterSpacing = "8px";
    ctx.fillText("CERTIFICADO DE PROFICIÊNCIA", 600, 160);

    // Divider
    ctx.strokeStyle = "#4f46e5";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(200, 185);
    ctx.lineTo(1000, 185);
    ctx.stroke();

    // Language flag and name
    ctx.font = "80px serif";
    ctx.fillText(langFlag, 600, 290);

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 42px Georgia, serif";
    ctx.fillText(`${langName}`, 600, 360);

    // "Certifica que" text
    ctx.fillStyle = "#94a3b8";
    ctx.font = "22px Georgia, serif";
    ctx.fillText("Este certificado atesta que", 600, 430);

    // Student name
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 52px Georgia, serif";
    ctx.fillText(userName, 600, 510);

    // Achievement text
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "22px Georgia, serif";
    ctx.fillText("atingiu o Nível 5 de proficiência e completou com êxito", 600, 570);
    ctx.fillText(`o programa de aprendizado de ${langName} na plataforma`, 600, 605);

    // Platform name
    ctx.fillStyle = "#6366f1";
    ctx.font = "bold 30px Georgia, serif";
    ctx.fillText("MultiLingue Universal — IA Avançada", 600, 650);

    // Bottom divider
    const botLine = ctx.createLinearGradient(100, 0, 1100, 0);
    botLine.addColorStop(0, "transparent");
    botLine.addColorStop(0.5, "#6366f1");
    botLine.addColorStop(1, "transparent");
    ctx.strokeStyle = botLine;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 690);
    ctx.lineTo(1100, 690);
    ctx.stroke();

    // Date and seal
    ctx.fillStyle = "#64748b";
    ctx.font = "18px Georgia, serif";
    ctx.textAlign = "left";
    ctx.fillText(`Data de emissão: ${date}`, 100, 740);

    ctx.textAlign = "right";
    ctx.fillText("Certificado Digital Verificado", 1100, 740);

    // Seal
    ctx.textAlign = "center";
    ctx.font = "50px serif";
    ctx.fillText("🏅", 600, 760);

    ctx.fillStyle = "#4f46e5";
    ctx.font = "14px Georgia, serif";
    ctx.fillText(validationCode ? `VERIFICAÇÃO: ${validationCode}` : "CERTIFICADO AUTÊNTICO", 600, 800);

    return canvas.toDataURL("image/png");
  };

  const handleIssueCertificate = async () => {
    if (!user || !eligibility?.eligible) return;
    setGenerating(true);
    try {
      const res = await issueCert.mutateAsync({
        targetLanguage: selectedLang.code,
        languageName: selectedLang.name,
      });

      const date = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
      const dataUrl = generateCertificateCanvas(
        eligibility.userName || user.name || "Estudante",
        selectedLang.name,
        selectedLang.flag,
        date,
        res.validationCode
      );

      if (dataUrl) {
        const link = document.createElement("a");
        link.download = `certificado-${selectedLang.code}-multilingue.png`;
        link.href = dataUrl;
        link.click();
        toast.success(res.alreadyExists ? "Certificado baixado novamente!" : "🏅 Certificado emitido e baixado!");
        refetchCerts();
      }
    } catch (e: any) {
      toast.error(e.message || "Erro ao emitir certificado");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadExisting = (cert: { userName: string; languageName: string; targetLanguage: string; issuedAt?: Date | null; validationCode?: string | null }) => {
    const lang = LANGUAGES_57.find(l => l.code === cert.targetLanguage);
    const date = cert.issuedAt
      ? new Date(cert.issuedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
      : new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

    const dataUrl = generateCertificateCanvas(
      cert.userName,
      cert.languageName,
      lang?.flag || "🌐",
      date,
      cert.validationCode
    );
    if (dataUrl) {
      const link = document.createElement("a");
      link.download = `certificado-${cert.targetLanguage}-multilingue.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Certificado baixado!");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-900/20 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800/80 border-slate-700 p-8 text-center max-w-md">
          <div className="text-5xl mb-4">🏅</div>
          <h2 className="text-2xl font-bold text-white mb-2">Certificados</h2>
          <p className="text-slate-400 mb-6">Faça login para ver e emitir seus certificados</p>
          <Link href="/"><Button className="bg-yellow-600 hover:bg-yellow-700">Entrar</Button></Link>
        </Card>
      </div>
    );
  }

  const level = eligibility?.level || 0;
  const xp = eligibility?.xp || 0;
  const xpToNextLevel = (Math.floor(xp / 500) + 1) * 500;
  const xpProgress = ((xp % 500) / 500) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-900/10 to-slate-900 p-4">
      {/* Hidden canvas for generation */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/ar-mode">
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">← Voltar</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">🏅 Certificados de Proficiência</h1>
            <p className="text-slate-400 text-sm">Emita certificados nos {ACTIVE_LANGUAGE_COUNT} idiomas ativos agora · {TOTAL_LANGUAGES} no catálogo</p>
          </div>
        </div>

        {/* Level Progress */}
        <Card className="bg-slate-800/60 border-yellow-700/30 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-white font-bold text-lg">Nível {level}</div>
                <div className="text-slate-400 text-sm">{xp} XP total</div>
              </div>
              <div className="text-4xl">
                {level >= 10 ? "👑" : level >= 7 ? "💎" : level >= 5 ? "🥇" : level >= 3 ? "🥈" : "🥉"}
              </div>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>{xp % 500} XP</span>
              <span>Próximo nível: {xpToNextLevel} XP</span>
            </div>
            {level < 5 && (
              <div className="mt-3 p-3 bg-slate-700/50 rounded-lg text-center">
                <p className="text-slate-400 text-sm">
                  🎯 Alcance o <strong className="text-yellow-400">Nível 5</strong> para emitir certificados.
                  Faltam <strong className="text-white">{Math.max(0, 2500 - xp)} XP</strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Issue Certificate */}
          <Card className="bg-slate-800/60 border-yellow-700/30">
            <CardHeader>
              <CardTitle className="text-white">🎓 Emitir Novo Certificado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-1">Idioma do Certificado</label>
                <LanguageSelector value={selectedLang} onChange={setSelectedLang} />
              </div>

              {checkLoading ? (
                <div className="text-center py-4 text-slate-400">Verificando elegibilidade...</div>
              ) : eligibility?.eligible ? (
                <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">✅</div>
                  <p className="text-green-400 font-bold">Você é elegível!</p>
                  <p className="text-slate-400 text-sm">Nível {eligibility.level} — {eligibility.xp} XP</p>
                </div>
              ) : (
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">🔒</div>
                  <p className="text-slate-300 font-bold">Nível 5 necessário</p>
                  <p className="text-slate-400 text-sm">Você está no Nível {level}. Continue praticando!</p>
                </div>
              )}

              <Button
                onClick={handleIssueCertificate}
                disabled={!eligibility?.eligible || generating}
                className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
              >
                {generating ? "⏳ Gerando..." : "📥 Emitir e Baixar Certificado"}
              </Button>

              <p className="text-slate-500 text-xs text-center">
                O certificado será baixado como imagem PNG de alta resolução
              </p>
            </CardContent>
          </Card>

          {/* My Certificates */}
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">📜 Meus Certificados ({myCerts?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {!myCerts || myCerts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">🏅</div>
                  <p className="text-slate-400">Nenhum certificado ainda</p>
                  <p className="text-slate-500 text-sm mt-1">Alcance o Nível 5 para emitir o primeiro</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myCerts.map((cert) => {
                    const langInfo = LANGUAGES_57.find(l => l.code === cert.targetLanguage);
                    return (
                      <div key={cert.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{langInfo?.flag || "🌐"}</span>
                          <div>
                            <div className="text-white font-medium text-sm">{cert.languageName}</div>
                            <div className="text-slate-500 text-xs">
                              {cert.issuedAt
                                ? new Date(cert.issuedAt).toLocaleDateString("pt-BR")
                                : "—"}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadExisting(cert)}
                          className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20 text-xs"
                        >
                          📥 Baixar
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How to earn */}
        <Card className="bg-slate-800/40 border-slate-700 mt-6">
          <CardContent className="p-6">
            <h3 className="text-white font-bold mb-4">🎯 Como Ganhar XP e Subir de Nível</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {[
                { icon: "🎭", action: "Conversação Completa", xp: "+150 XP" },
                { icon: "🧠", action: "Jogo de Palavras", xp: "+50 XP" },
                { icon: "⚔️", action: "Batalha Vencida", xp: "+200 XP" },
                { icon: "🔥", action: "Desafio Diário", xp: "+350 XP" },
              ].map((item, i) => (
                <div key={i} className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-slate-300 text-xs mb-1">{item.action}</div>
                  <div className="text-yellow-400 font-bold">{item.xp}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Link href="/vr-conversation">
            <Button className="bg-indigo-600 hover:bg-indigo-700">🎭 Praticar Conversação</Button>
          </Link>
          <Link href="/daily-challenge">
            <Button variant="outline" className="border-slate-600 text-slate-300">🔥 Desafio Diário</Button>
          </Link>
          <Link href="/ranking">
            <Button variant="outline" className="border-slate-600 text-slate-300">🏆 Ver Ranking</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
