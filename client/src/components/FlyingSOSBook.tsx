import { BookOpen } from "lucide-react";
import { useLocation } from "wouter";

function safeOrigin(location: string) {
  return location.startsWith("/") && !location.startsWith("//") ? location : "/dashboard";
}

export function getABCBookHref(location: string) {
  return `/abc-book?returnTo=${encodeURIComponent(safeOrigin(location))}`;
}

export function FlyingSOSBook({ className = "fixed bottom-6 left-4 z-[80]" }: { className?: string }) {
  const [location, setLocation] = useLocation();

  return (
    <button
      type="button"
      onClick={() => setLocation(getABCBookHref(location))}
      className={`${className} group flex items-center gap-2 rounded-full border border-amber-200/80 bg-white px-3 py-2 text-slate-900 shadow-xl transition duration-200 hover:-translate-y-1 hover:shadow-2xl active:scale-[0.97]`}
      aria-label="Socorro: abrir o Livro ABC de Idiomas e retornar a esta atividade"
      title="SOS — abrir o Livro ABC de Idiomas"
    >
      <span className="relative grid h-8 w-8 place-items-center rounded-full bg-amber-100 text-amber-700">
        <BookOpen className="h-5 w-5" aria-hidden="true" />
        <span className="absolute -right-2 -top-2 rounded-full bg-rose-600 px-1.5 py-0.5 text-[9px] font-black leading-none text-white">SOS</span>
      </span>
      <span className="text-left leading-tight">
        <span className="block text-xs font-black">Livro ABC</span>
        <span className="block text-[10px] font-semibold text-slate-500">Socorro de estudo</span>
      </span>
    </button>
  );
}
