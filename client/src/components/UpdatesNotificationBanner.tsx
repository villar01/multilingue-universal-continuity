/**
 * UpdatesNotificationBanner.tsx
 * Banner automático exibido ao aluno quando há novas atualizações não lidas.
 * - Aparece no topo do app após login
 * - Atualizações críticas ficam em destaque vermelho
 * - O aluno pode ver detalhes e marcar como lido
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";

const TYPE_ICONS: Record<string, string> = {
  lesson:   "📚",
  teacher:  "👨‍🏫",
  feature:  "✨",
  security: "🛡️",
  bugfix:   "🔧",
  content:  "📝",
};

const TYPE_LABELS: Record<string, string> = {
  lesson:   "Nova Lição",
  teacher:  "Novo Professor",
  feature:  "Nova Funcionalidade",
  security: "Atualização de Segurança",
  bugfix:   "Correção",
  content:  "Novo Conteúdo",
};

export default function UpdatesNotificationBanner() {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const utils = trpc.useUtils();

  const { data } = trpc.updates.getUnread.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000, // verifica a cada 5 min
  });

  const markReadMut = trpc.updates.markRead.useMutation({
    onSuccess: () => {
      utils.updates.getUnread.invalidate();
      setDismissed(true);
    },
  });

  if (!user || !data || data.count === 0 || dismissed) return null;

  const isCritical = data.hasCritical;

  return (
    <div className={`w-full z-50 ${isCritical ? "bg-red-900/90 border-red-500" : "bg-blue-900/90 border-blue-500"} border-b`}>
      <div className="max-w-5xl mx-auto px-4 py-2">
        {/* Linha principal */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-lg">{isCritical ? "🚨" : "🆕"}</span>
            <span className="text-white text-sm font-medium truncate">
              {data.count === 1
                ? `${data.updates[0].title}`
                : `${data.count} novas atualizações disponíveis`}
            </span>
            {isCritical && (
              <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full shrink-0">CRÍTICA</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setExpanded(!expanded)}
              className="text-white hover:text-white hover:bg-white/10 text-xs h-7"
            >
              {expanded ? "Fechar ▲" : "Ver detalhes ▼"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => markReadMut.mutate({})}
              disabled={markReadMut.isPending}
              className="text-white/70 hover:text-white hover:bg-white/10 text-xs h-7"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Detalhes expandidos */}
        {expanded && (
          <div className="mt-3 space-y-2 pb-2">
            {data.updates.map((u) => (
              <div
                key={u.id}
                className={`rounded-lg p-3 flex items-start justify-between gap-3 ${
                  u.isCritical ? "bg-red-800/50" : "bg-blue-800/50"
                }`}
              >
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <span className="text-base mt-0.5">{TYPE_ICONS[u.updateType] ?? "📌"}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white text-sm font-medium">{u.title}</span>
                      <span className="text-xs text-white/60">
                        {TYPE_LABELS[u.updateType] ?? u.updateType}
                      </span>
                      {u.isCritical && (
                        <span className="text-xs text-red-300 font-bold">⚠️ CRÍTICA</span>
                      )}
                    </div>
                    <p className="text-white/60 text-xs mt-0.5">
                      v{u.version} · {u.publishedAt ? new Date(u.publishedAt).toLocaleDateString("pt-BR") : ""}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => markReadMut.mutate({ updateId: u.id })}
                  disabled={markReadMut.isPending}
                  className="text-white/50 hover:text-white text-xs h-6 shrink-0"
                >
                  Marcar lida
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              onClick={() => markReadMut.mutate({})}
              disabled={markReadMut.isPending}
              className="w-full bg-white/10 hover:bg-white/20 text-white text-xs h-7 mt-1"
            >
              Marcar todas como lidas
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
