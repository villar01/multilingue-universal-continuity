import { FlyingSOSBook } from "@/components/FlyingSOSBook";
import { PedagogicalQuickAccess } from "@/components/PedagogicalQuickAccess";
import { getQuickStudyHref } from "@/lib/quickStudyAccess";
import { useLocation } from "wouter";

export function QuickStudyAccess() {
  const [location] = useLocation();
  return (
    <>
      {getQuickStudyHref(location) && <FlyingSOSBook />}
      <PedagogicalQuickAccess />
    </>
  );
}
