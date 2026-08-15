import { BookOpenCheck, MessageCircleMore } from "lucide-react";
import { Link, useLocation } from "wouter";

const EXCLUDED_PATHS = ["/", "/base-de-estudos", "/immersive-scene", "/onboarding"];

export function getQuickStudyHref(location: string): string | null {
  const path = location.split("?")[0] || "/";
  const isExcluded = EXCLUDED_PATHS.includes(path) || path.startsWith("/admin") || path.startsWith("/checkout");
  return isExcluded ? null : `/base-de-estudos?returnTo=${encodeURIComponent(path)}`;
}

export function getQuickTeacherHref(location: string): string | null {
  const path = location.split("?")[0] || "/";
  const isExcluded = EXCLUDED_PATHS.includes(path) || path === "/free-talk" || path.startsWith("/admin") || path.startsWith("/checkout");
  return isExcluded ? null : `/free-talk?returnTo=${encodeURIComponent(path)}`;
}

export function QuickStudyAccess() {
  const [location] = useLocation();
  const studyHref = getQuickStudyHref(location);
  const teacherHref = getQuickTeacherHref(location);
  if (!studyHref && !teacherHref) return null;

  return (
    <div className="fixed bottom-6 left-4 z-[80] flex flex-wrap items-center gap-2">
      {studyHref && (
        <Link
          href={studyHref}
          className="inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-slate-950/95 px-4 py-3 text-sm font-extrabold text-amber-100 shadow-xl backdrop-blur transition hover:bg-amber-300 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2"
          aria-label="Abrir Consulta Rápida e Total"
        >
          <BookOpenCheck className="h-4 w-4" />
          Consulta Rápida
        </Link>
      )}
      {teacherHref && (
        <Link
          href={teacherHref}
          className="inline-flex items-center gap-2 rounded-full border border-violet-300/50 bg-slate-950/95 px-4 py-3 text-sm font-extrabold text-violet-100 shadow-xl backdrop-blur transition hover:bg-violet-300 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:ring-offset-2"
          aria-label="Conversar com o professor e retornar ao estudo"
        >
          <MessageCircleMore className="h-4 w-4" />
          Professor
        </Link>
      )}
    </div>
  );
}
