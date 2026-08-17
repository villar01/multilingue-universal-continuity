import { FlyingSOSBook, getABCBookHref } from "@/components/FlyingSOSBook";
import { PedagogicalQuickAccess } from "@/components/PedagogicalQuickAccess";
import { useLocation } from "wouter";

const EXCLUDED_PATHS = ["/", "/abc-book", "/immersive-scene", "/lesson", "/onboarding"];

function isExcludedPath(location: string) {
  const path = location.split("?")[0] || "/";
  return EXCLUDED_PATHS.includes(path) || path.startsWith("/lesson/") || path.startsWith("/admin") || path.startsWith("/checkout");
}

export function getQuickStudyHref(location: string): string | null {
  return isExcludedPath(location) ? null : getABCBookHref(location);
}

export function QuickStudyAccess() {
  const [location] = useLocation();
  return (
    <>
      {getQuickStudyHref(location) && <FlyingSOSBook />}
      <PedagogicalQuickAccess />
    </>
  );
}
