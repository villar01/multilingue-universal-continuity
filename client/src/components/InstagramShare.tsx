/**
 * InstagramShare — Compartilhar progresso no Instagram
 * Gera card visual com XP, palavras aprendidas e professor
 * Funciona via Web Share API (mobile) ou download de imagem (desktop)
 */
import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { Teacher57 } from "@/data/teachers57";

interface InstagramShareProps {
  teacher: Teacher57;
  xp: number;
  wordsLearned: number;
  level: number;
  langCode: string;
  shareType?: "ar_progress" | "lesson_complete" | "achievement" | "vocabulary";
  className?: string;
  compact?: boolean;
}

export function InstagramShare({
  teacher,
  xp,
  wordsLearned,
  level,
  langCode,
  shareType = "ar_progress",
  className = "",
  compact = false,
}: InstagramShareProps) {
  const [sharing, setSharing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shareMutation = trpc.instagram.share.useMutation();

  // Gerar card visual no canvas
  const generateCard = useCallback(async (): Promise<string> => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d")!;

    // Background gradiente
    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, "#0a0a1a");
    grad.addColorStop(0.5, teacher.color + "44");
    grad.addColorStop(1, "#1a0a2e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Borda decorativa
    ctx.strokeStyle = teacher.color;
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 1040, 1040);

    // Logo/título
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 56px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🌍 MultiLingue Universal", 540, 120);

    // Subtítulo
    ctx.fillStyle = teacher.color;
    ctx.font = "bold 36px Arial";
    ctx.fillText("Realidade Aumentada • IA Avançada", 540, 180);

    // Linha divisória
    ctx.strokeStyle = teacher.color + "88";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 210);
    ctx.lineTo(980, 210);
    ctx.stroke();

    // Avatar emoji do professor (grande)
    ctx.font = "200px Arial";
    ctx.textAlign = "center";
    ctx.fillText(teacher.flag, 540, 460);

    // Nome do professor
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 52px Arial";
    ctx.fillText(`Prof. ${teacher.name}`, 540, 540);

    // Idioma
    ctx.fillStyle = teacher.color;
    ctx.font = "38px Arial";
    ctx.fillText(`${teacher.language} • ${teacher.specialty}`, 540, 600);

    // Stats
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 80px Arial";
    ctx.fillText(`${xp} XP`, 270, 750);
    ctx.fillText(`${wordsLearned}`, 810, 750);

    ctx.fillStyle = "#ffffff88";
    ctx.font = "32px Arial";
    ctx.fillText("Pontos Ganhos", 270, 800);
    ctx.fillText("Palavras", 810, 800);

    // Nível
    ctx.fillStyle = teacher.color;
    ctx.font = "bold 48px Arial";
    ctx.fillText(`Nível ${level}`, 540, 880);

    // Hashtags
    ctx.fillStyle = "#ffffff66";
    ctx.font = "28px Arial";
    ctx.fillText("#MultiLingue #AR #AprendaIdiomas #IA #Idiomas", 540, 960);

    // Call to action
    ctx.fillStyle = "#ffffff44";
    ctx.font = "24px Arial";
    ctx.fillText("multilingueia-z3xkmfhw.manus.space", 540, 1020);

    return canvas.toDataURL("image/png");
  }, [teacher, xp, wordsLearned, level]);

  const handleShare = useCallback(async () => {
    if (sharing) return;
    setSharing(true);

    try {
      const imageDataUrl = await generateCard();

      // Registrar no banco
      await shareMutation.mutateAsync({
        shareType,
        teacherId: teacher.id,
        langCode,
        xpEarned: xp,
        wordsLearned,
        screenshotUrl: imageDataUrl.substring(0, 200), // Apenas preview
      });

      // Converter para blob
      const res = await fetch(imageDataUrl);
      const blob = await res.blob();
      const file = new File([blob], "multilingue-progresso.png", { type: "image/png" });

      // Tentar Web Share API (mobile)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "Meu progresso no MultiLingue Universal! 🌍",
          text: `Aprendi ${wordsLearned} palavras em ${teacher.language} com ${xp} XP! #MultiLingue #AR`,
          files: [file],
        });
        toast.success("Compartilhado com sucesso! 🎉");
      } else {
        // Fallback: download da imagem
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "multilingue-progresso.png";
        a.click();
        URL.revokeObjectURL(url);

        // Abrir Instagram na web
        setTimeout(() => {
          window.open("https://www.instagram.com/", "_blank");
        }, 500);

        toast.success("Imagem baixada! Abra o Instagram e publique nos Stories 📸", {
          duration: 5000,
        });
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        toast.error("Erro ao compartilhar. Tente novamente.");
      }
    } finally {
      setSharing(false);
    }
  }, [sharing, generateCard, shareMutation, shareType, teacher, langCode, xp, wordsLearned]);

  if (compact) {
    return (
      <button
        onClick={handleShare}
        disabled={sharing}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white transition-all ${
          sharing ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"
        } ${className}`}
        style={{
          background: sharing
            ? "#666"
            : "linear-gradient(135deg, #E1306C, #833AB4, #405DE6)",
        }}
        title="Compartilhar no Instagram"
      >
        {sharing ? (
          <>⏳ Gerando...</>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Compartilhar
          </>
        )}
      </button>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Preview do card */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl"
        style={{
          width: 240,
          height: 240,
          background: `linear-gradient(135deg, #0a0a1a, ${teacher.color}44, #1a0a2e)`,
          border: `2px solid ${teacher.color}`,
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
          <div className="text-5xl">{teacher.flag}</div>
          <div className="text-white font-bold text-sm text-center">{teacher.name}</div>
          <div className="text-xs text-center" style={{ color: teacher.color }}>{teacher.language}</div>
          <div className="flex gap-4 mt-1">
            <div className="text-center">
              <div className="font-black text-lg text-white">{xp}</div>
              <div className="text-xs text-white/60">XP</div>
            </div>
            <div className="text-center">
              <div className="font-black text-lg text-white">{wordsLearned}</div>
              <div className="text-xs text-white/60">Palavras</div>
            </div>
            <div className="text-center">
              <div className="font-black text-lg" style={{ color: teacher.color }}>Nv.{level}</div>
              <div className="text-xs text-white/60">Nível</div>
            </div>
          </div>
        </div>
        {/* Instagram gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-8 opacity-30"
          style={{ background: "linear-gradient(to top, #E1306C, transparent)" }} />
      </div>

      {/* Botão compartilhar */}
      <button
        onClick={handleShare}
        disabled={sharing}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white text-sm transition-all shadow-lg ${
          sharing ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95 hover:shadow-pink-500/30"
        }`}
        style={{
          background: sharing
            ? "#666"
            : "linear-gradient(135deg, #E1306C, #833AB4, #405DE6)",
        }}
      >
        {sharing ? (
          <>⏳ Gerando card...</>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Compartilhar no Instagram
          </>
        )}
      </button>

      <p className="text-xs text-white/40 text-center max-w-48">
        Gera um card com seu progresso e abre o Instagram para publicar nos Stories
      </p>
    </div>
  );
}

export default InstagramShare;
