import { FlyingSOSBook } from "@/components/FlyingSOSBook";
import { PedagogicalQuickAccess } from "@/components/PedagogicalQuickAccess";
import { getQuickStudyHref } from "@/lib/quickStudyAccess";
import { useLocation } from "wouter";

export function QuickStudyAccess() {
  const [location] = useLocation();
  const useCompactSosBook = location.startsWith("/pareto-1000");
  const sosBookClassName = useCompactSosBook ? "fixed right-4 top-3 z-[80]" : undefined;
  return (
    <>
      {getQuickStudyHref(location) && <FlyingSOSBook compact={useCompactSosBook} className={sosBookClassName} />}
      <PedagogicalQuickAccess />
    </>
  );
}
