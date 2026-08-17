import { BookOpenCheck, BrainCircuit, MapPinned, MessageCircleMore, GraduationCap } from "lucide-react";
import { Link, useLocation } from "wouter";

const EXCLUDED_PATHS = ["/", "/base-de-estudos", "/immersive-scene", "/onboarding"];

function getContextualOrigin(location: string) {
  return location.startsWith("/") ? location : "/";
}

function isExcludedPath(origin: string) {
  const path = origin.split("?")[0] || "/";
  return EXCLUDED_PATHS.includes(path) || path.startsWith("/admin") || path.startsWith("/checkout");
}

export function getQuickStudyHref(location: string): string | null {
  const origin = getContextualOrigin(location);
  return isExcludedPath(origin) ? null : `/base-de-estudos?returnTo=${encodeURIComponent(origin)}`;
}

export function getQuickParetoHref(location: string): string | null {
  const origin = getContextualOrigin(location);
  const path = origin.split("?")[0] || "/";
  return isExcludedPath(origin) || path === "/pareto-1000" ? null : `/pareto-1000?returnTo=${encodeURIComponent(origin)}`;
}

export function getQuickLessonsHref(location: string): string | null {
  const origin = getContextualOrigin(location);
  const path = origin.split("?")[0] || "/";
  return isExcludedPath(origin) || path === "/lessons-hub" ? null : `/lessons-hub?returnTo=${encodeURIComponent(origin)}`;
}

export function getQuickSceneHref(location: string): string | null {
  const origin = getContextualOrigin(location);
  return isExcludedPath(origin) ? null : `/immersive-scene?returnTo=${encodeURIComponent(origin)}`;
}

export function getQuickTeacherHref(location: string): string | null {
  const origin = getContextualOrigin(location);
  const path = origin.split("?")[0] || "/";
  return isExcludedPath(origin) || path === "/free-talk" ? null : `/free-talk?returnTo=${encodeURIComponent(origin)}`;
}

export function QuickStudyAccess() {
  const [location] = useLocation();
  const studyHref = getQuickStudyHref(location);
  const paretoHref = getQuickParetoHref(location);
  const lessonsHref = getQuickLessonsHref(location);
  const sceneHref = getQuickSceneHref(location);
  const teacherHref = getQuickTeacherHref(location);
  if (!studyHref && !paretoHref && !lessonsHref && !sceneHref && !teacherHref) return null;

  return (
    <nav aria-label="Caminhos de aprendizagem" className="fixed bottom-6 left-4 z-[80] flex max-w-[calc(100vw-2rem)] flex-wrap items-stretch gap-2 rounded-2xl border border-white/15 bg-slate-950/95 p-2 shadow-2xl backdrop-blur">
      {(studyHref || teacherHref) && (
        <div className="flex flex-col gap-1 rounded-xl border border-amber-300/25 bg-amber-300/5 p-1.5">
          <span className="px-2 text-[10px] font-black uppercase tracking-[0.12em] text-amber-200">Entender</span>
          <div className="flex flex-wrap gap-1">
            {studyHref && <Link href={studyHref} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-extrabold text-amber-100 transition hover:bg-amber-300 hover:text-slate-950" aria-label="Abrir Consulta Rápida e Total"><BookOpenCheck className="h-4 w-4" />Consulta</Link>}
            {teacherHref && <Link href={teacherHref} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-extrabold text-violet-100 transition hover:bg-violet-300 hover:text-slate-950" aria-label="Conversar com o professor e retornar ao estudo"><MessageCircleMore className="h-4 w-4" />Professor</Link>}
          </div>
        </div>
      )}
      {paretoHref && <div className="flex flex-col gap-1 rounded-xl border border-cyan-300/25 bg-cyan-300/5 p-1.5"><span className="px-2 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-200">Memorizar</span><Link href={paretoHref} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-extrabold text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950" aria-label="Memorizar vocabulário pelo Pareto e retornar à atividade"><BrainCircuit className="h-4 w-4" />Pareto</Link></div>}
      {lessonsHref && <div className="flex flex-col gap-1 rounded-xl border border-emerald-300/25 bg-emerald-300/5 p-1.5"><span className="px-2 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-200">Praticar</span><Link href={lessonsHref} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-extrabold text-emerald-100 transition hover:bg-emerald-300 hover:text-slate-950" aria-label="Abrir trilhas de lições e retornar à atividade"><GraduationCap className="h-4 w-4" />Lições</Link></div>}
      {sceneHref && <div className="flex flex-col gap-1 rounded-xl border border-rose-300/25 bg-rose-300/5 p-1.5"><span className="px-2 text-[10px] font-black uppercase tracking-[0.12em] text-rose-200">Aplicar</span><Link href={sceneHref} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-extrabold text-rose-100 transition hover:bg-rose-300 hover:text-slate-950" aria-label="Aplicar vocabulário em uma cena e retornar à atividade"><MapPinned className="h-4 w-4" />Cena</Link></div>}
    </nav>
  );
}
