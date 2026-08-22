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
      aria-label={immersionMode ? targetUI.immersive : `↔ ${targetUI.immersive}`}
      onClick={() => setImmersionMode(!immersionMode)}
      className={`inline-flex items-center rounded-full border py-2 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-400 ${compact ? "gap-1 px-2 sm:gap-2 sm:px-3" : "gap-2 px-3"}`}
      style={{
        borderColor: immersionMode ? "rgba(34,197,94,.65)" : "rgba(148,163,184,.45)",
        background: immersionMode ? "rgba(22,163,74,.15)" : "rgba(255,255,255,.08)",
        color: "inherit",
      }}
      title={immersionMode ? targetUI.immersive : `↔ ${targetUI.immersive}`}
    >
      <Languages size={15} aria-hidden="true" />
      <span className={compact ? "hidden sm:inline" : undefined}>{targetUI.immersive}</span>
      {compact && <span className="sr-only">{targetUI.immersive}</span>}
      {!compact && <span className="opacity-70">{immersionMode ? "ON" : "OFF"}</span>}
    </button>
  );
}
