import { useState, useMemo } from "react";
import { ACTIVE_LANGUAGE_COUNT, COMING_SOON_LANGUAGE_COUNT, LANGUAGES_57, POPULAR_LANGUAGES, LANGUAGES_BY_REGION, REGIONS, TOTAL_LANGUAGES, type Language } from "@/lib/languages";

interface Props {
  value: Language;
  onChange: (lang: Language) => void;
  label?: string;
}

export default function LanguageSelector({ value, onChange, label = "Idioma" }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<string>("Popular");

  const filtered = useMemo(() => {
    const list = region === "Popular" ? POPULAR_LANGUAGES : (LANGUAGES_BY_REGION[region] || LANGUAGES_57);
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(l => l.label.toLowerCase().includes(q) || l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q));
  }, [search, region]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white hover:border-indigo-500 transition-all w-full"
      >
        <span className="text-xl">{value.flag}</span>
        <span className="flex-1 text-left text-sm font-medium">{value.label}</span>
        <span className="text-slate-400 text-xs">{value.code}</span>
        <span className="text-slate-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-slate-700">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar idioma..."
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Region tabs */}
          <div className="flex gap-1 p-2 border-b border-slate-700 overflow-x-auto">
            {["Popular", ...REGIONS].map(r => (
              <button
                key={r}
                onClick={() => { setRegion(r); setSearch(""); }}
                className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-all ${region === r ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700"}`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Language list */}
          <div className="max-h-64 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">Nenhum idioma encontrado</p>
            ) : (
              <div className="grid grid-cols-1 gap-0.5">
                {filtered.map(l => (
                  <button
                    key={l.code}
                    disabled={!l.available}
                    onClick={() => { if (l.available) { onChange(l); setOpen(false); setSearch(""); } }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${!l.available ? "cursor-not-allowed text-slate-500 opacity-70" : value.code === l.code ? "bg-indigo-700 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
                  >
                    <span className="text-lg w-7 text-center">{l.flag}</span>
                    <span className="flex-1 text-sm">{l.label}</span>
                    <span className="text-xs text-slate-500">{l.available ? l.name : "Em preparação"}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-slate-700 text-xs text-slate-500 text-center">
            Catálogo de {TOTAL_LANGUAGES} idiomas · {ACTIVE_LANGUAGE_COUNT} disponíveis agora · {COMING_SOON_LANGUAGE_COUNT} em preparação
          </div>
        </div>
      )}
    </div>
  );
}
