import { Book } from "lucide-react";
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
      <span className="relative grid h-9 w-8 place-items-center rounded-sm border border-amber-500 bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 text-amber-950 shadow-sm ring-1 ring-amber-100/80">
        <span className="absolute inset-y-1 left-1 w-px rounded-full bg-amber-700/60" aria-hidden="true" />
        <Book className="relative h-5 w-5 stroke-[2.4]" aria-hidden="true" />
        <span className="absolute -right-2 -top-2 rounded-full bg-rose-600 px-1.5 py-0.5 text-[9px] font-black leading-none text-white">SOS</span>
      </span>
      <span className={compact ? "sr-only" : "text-left leading-tight"}>
        <span className="block text-xs font-black">Livro SOS</span>
        <span className="block text-[10px] font-semibold text-slate-500">Socorro de estudo</span>
      </span>
    </button>
  );
}
