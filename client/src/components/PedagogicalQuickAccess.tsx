import { BookOpen, BrainCircuit, MessageCircleMore, PenLine } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  getPedagogicalShortcutHrefs,
  PEDAGOGICAL_QUICK_ACCESS_CLASS,
  shouldShowPedagogicalQuickAccess,
} from "@/lib/pedagogicalQuickAccess";

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
    <details className={PEDAGOGICAL_QUICK_ACCESS_CLASS}>
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
