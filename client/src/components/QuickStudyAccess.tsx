import { BookOpenCheck } from "lucide-react";
import { Link, useLocation } from "wouter";

const EXCLUDED_PATHS = ["/", "/base-de-estudos", "/immersive-scene", "/onboarding"];

export function getQuickStudyHref(location: string): string | null {
  const path = location.split("?")[0] || "/";
  const isExcluded = EXCLUDED_PATHS.includes(path) || path.startsWith("/admin") || path.startsWith("/checkout");
  return isExcluded ? null : `/base-de-estudos?returnTo=${encodeURIComponent(path)}`;
}

export function QuickStudyAccess() {
  const [location] = useLocation();
  const href = getQuickStudyHref(location);
  if (!href) return null;

  return (
    <Link
      href={href}
      className="fixed bottom-6 left-4 z-[80] inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-slate-950/95 px-4 py-3 text-sm font-extrabold text-amber-100 shadow-xl backdrop-blur transition hover:bg-amber-300 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2"
      aria-label="Abrir Consulta Rápida e Total"
    >
      <BookOpenCheck className="h-4 w-4" />
      Consulta Rápida
    </Link>
  );
}
