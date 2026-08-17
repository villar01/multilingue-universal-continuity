import { BookOpen, BrainCircuit, MessageCircleMore, PenLine } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getABCBookHref } from "./FlyingSOSBook";

function safeOrigin(location: string) {
  return location.startsWith("/") && !location.startsWith("//") ? location : "/dashboard";
}

export function getPedagogicalShortcutHrefs(location: string) {
  const origin = safeOrigin(location);
  const returnTo = encodeURIComponent(origin);
  return {
    understand: getABCBookHref(origin),
    memorize: `/pareto-1000?returnTo=${returnTo}`,
    practice: `/base-de-estudos?returnTo=${returnTo}`,
    apply: `/immersive-scene?scene=beach&returnTo=${returnTo}`,
    teacher: `/free-talk?returnTo=${returnTo}`,
  };
}

export function shouldShowPedagogicalQuickAccess(location: string) {
  const path = location.split("?")[0] || "/";
  return !["/", "/abc-book", "/onboarding"].includes(path) && !path.startsWith("/admin") && !path.startsWith("/checkout");
}

export function PedagogicalQuickAccess() {
  const [location] = useLocation();
  if (!shouldShowPedagogicalQuickAccess(location)) return null;

  const hrefs = getPedagogicalShortcutHrefs(location);
  const shortcuts = [
    { href: hrefs.understand, label: "Entender", detail: "Livro ABC", icon: BookOpen },
    { href: hrefs.memorize, label: "Memorizar", detail: "Pareto", icon: BrainCircuit },
    { href: hrefs.practice, label: "Praticar", detail: "Escrita", icon: PenLine },
    { href: hrefs.apply, label: "Aplicar", detail: "Cena", icon: MessageCircleMore },
    { href: hrefs.teacher, label: "Conversar", detail: "Professor", icon: MessageCircleMore },
  ];

  return (
    <details className="fixed bottom-5 right-4 z-[80] w-48 rounded-2xl border border-cyan-200/50 bg-slate-950/95 text-white shadow-2xl backdrop-blur">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-black text-cyan-100 marker:content-none">Atalhos de estudo</summary>
      <div className="grid gap-1 border-t border-white/10 p-2" aria-label="Atalhos pedagógicos agrupados">
        {shortcuts.map(({ href, label, detail, icon: Icon }) => (
          <Link key={label} href={href} className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-left transition hover:bg-cyan-300/15">
            <Icon className="h-4 w-4 text-cyan-200" />
            <span><span className="block text-xs font-bold">{label}</span><span className="block text-[10px] text-slate-400">{detail}</span></span>
          </Link>
        ))}
      </div>
    </details>
  );
}
