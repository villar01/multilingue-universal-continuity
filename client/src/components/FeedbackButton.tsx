import { MessageSquarePlus } from "lucide-react";
import { Link, useLocation } from "wouter";

/** Atalho global para o canal privado; não revela conteúdo nem estado de solicitações. */
export function FeedbackButton() {
  const [location] = useLocation();

  if (location === "/suporte") return null;

  return (
    <Link
      href="/suporte"
      aria-label="Enviar opinião, sugestão ou relatar um problema"
      className="fixed bottom-5 left-4 z-50 inline-flex items-center gap-2 rounded-full border border-violet-300/70 bg-white/95 px-3 py-2 text-xs font-semibold text-violet-800 shadow-lg shadow-violet-950/15 backdrop-blur transition-colors hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2"
    >
      <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
      <span>Opinião</span>
    </Link>
  );
}
