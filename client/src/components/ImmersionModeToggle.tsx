import { Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getUIStrings } from "@/lib/i18n";

/** Lets learners switch core learning screens between guided bilingual and target-language immersion. */
export function ImmersionModeToggle({ compact = false }: { compact?: boolean }) {
  const { profile, immersionMode, setImmersionMode } = useLanguage();
  const targetUI = getUIStrings(profile.targetCode);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={immersionMode}
      onClick={() => setImmersionMode(!immersionMode)}
      className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
      style={{
        borderColor: immersionMode ? "rgba(34,197,94,.65)" : "rgba(148,163,184,.45)",
        background: immersionMode ? "rgba(22,163,74,.15)" : "rgba(255,255,255,.08)",
        color: "inherit",
      }}
      title={immersionMode ? "Voltar ao modo guiado" : "Ativar modo de imersão"}
    >
      <Languages size={15} aria-hidden="true" />
      <span>{immersionMode ? targetUI.immersive : "Modo imersão"}</span>
      {!compact && <span className="opacity-70">{immersionMode ? "ON" : "OFF"}</span>}
    </button>
  );
}
