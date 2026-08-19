import { getABCBookHref } from "./abcBookAccess";

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
  return !["/", "/abc-book", "/pareto-1000", "/onboarding"].includes(path) && !path.startsWith("/admin") && !path.startsWith("/checkout");
}

export const PEDAGOGICAL_QUICK_ACCESS_CLASS = "pedagogical-quick-access fixed bottom-1 left-3 z-[80] w-44 rounded-2xl border border-cyan-200/50 bg-slate-950/95 text-white shadow-2xl backdrop-blur sm:bottom-5 sm:left-auto sm:right-4 sm:w-48";
