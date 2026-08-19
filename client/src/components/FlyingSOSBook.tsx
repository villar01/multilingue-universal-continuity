import { useLocation } from "wouter";
import { getABCBookHref } from "@/lib/abcBookAccess";

export function FlyingSOSBook({
  className = "fixed bottom-6 left-4 z-[80]",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const [location, setLocation] = useLocation();

  return (
    <button
      type="button"
      onClick={() => setLocation(getABCBookHref(location))}
      data-compact={compact ? "true" : "false"}
      className={`${className} sos-floating-book group flex items-center ${compact ? "h-11 w-11 justify-center gap-0 p-0" : "gap-2 px-3 py-2"} rounded-md border border-amber-200/80 bg-white text-slate-900 shadow-xl transition duration-200 hover:-translate-y-1 hover:shadow-2xl active:scale-[0.97]`}
      aria-label="Socorro: abrir o Livro ABC de Idiomas e retornar a esta atividade"
      title="SOS — abrir o Livro ABC de Idiomas"
    >
      <span className="relative h-9 w-8 overflow-visible rounded-[3px] border border-amber-700 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-sm ring-1 ring-amber-100/80" aria-hidden="true">
        <span className="absolute inset-y-0 left-0 w-1.5 rounded-l-[2px] border-r border-amber-900/70 bg-gradient-to-b from-amber-800 to-amber-950" />
        <span className="absolute inset-y-1 right-0 w-1.5 rounded-r-[1px] border-l border-amber-100 bg-gradient-to-b from-amber-50 via-amber-100 to-amber-200 shadow-[inset_-1px_0_0_rgba(120,53,15,0.28)]" />
        <span className="absolute inset-x-2 top-2.5 rounded-sm border border-amber-900/50 bg-amber-100 px-0.5 py-[1px] text-center text-[7px] font-black leading-none tracking-tight text-amber-950">SOS</span>
        <span className="absolute bottom-1.5 left-2 right-2 h-px bg-amber-900/50" />
        <span className="absolute -right-2 -top-2 rounded-full border border-white/80 bg-rose-600 px-1.5 py-0.5 text-[9px] font-black leading-none text-white shadow-sm">?</span>
      </span>
      <span className={compact ? "sr-only" : "text-left leading-tight"}>
        <span className="block text-xs font-black">Livro SOS</span>
        <span className="block text-[10px] font-semibold text-slate-500">Socorro de estudo</span>
      </span>
    </button>
  );
}
