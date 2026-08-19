/**
 * TourSpotlight — Guia interativo contextual
 * Overlay escuro com furo transparente no elemento atual
 * Balão explicativo + seta animada + passo a passo com clique do usuário
 * Botão "?" fixo em toda tela — ativa o tour da página atual
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { X, ChevronRight, ChevronLeft, HelpCircle } from "lucide-react";
import { TOUR_STEPS, type TourStep } from "@/lib/tourSteps";

interface SpotlightRect {
  top: number; left: number; width: number; height: number;
}

interface TourSpotlightProps {
  isActive: boolean;
  onClose: () => void;
  steps: TourStep[];
  onNavigate: (route: string) => void;
}

function TourSpotlight({ isActive, onClose, steps, onNavigate }: TourSpotlightProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<SpotlightRect | null>(null);
  const [balloonPos, setBalloonPos] = useState<{ top: number; left: number; transform: string }>({ top: 0, left: 0, transform: "" });

  const step = steps[stepIdx];

  const updateRect = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(`[data-tour="${step.target}"]`) as HTMLElement | null;
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    const pad = 8;
    setRect({ top: r.top - pad, left: r.left - pad, width: r.width + pad * 2, height: r.height + pad * 2 });

    const pos = step.position || "bottom";
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const bw = Math.min(320, vw - 32);
    let top = 0, left = 0, transform = "";

    if (pos === "bottom") {
      top = r.bottom + pad + 16;
      left = Math.min(Math.max(r.left + r.width / 2, bw / 2 + 16), vw - bw / 2 - 16);
      transform = "translateX(-50%)";
    } else if (pos === "top") {
      top = r.top - pad - 16;
      left = Math.min(Math.max(r.left + r.width / 2, bw / 2 + 16), vw - bw / 2 - 16);
      transform = "translateX(-50%) translateY(-100%)";
    } else if (pos === "left") {
      top = r.top + r.height / 2;
      left = r.left - pad - 16;
      transform = "translateX(-100%) translateY(-50%)";
    } else if (pos === "right") {
      top = r.top + r.height / 2;
      left = r.right + pad + 16;
      transform = "translateY(-50%)";
    } else {
      top = vh / 2; left = vw / 2; transform = "translate(-50%, -50%)";
    }

    if (top + 220 > vh) top = vh - 230;
    if (top < 16) top = 16;
    setBalloonPos({ top, left, transform });
  }, [step]);

  useEffect(() => { if (!isActive) return; setStepIdx(0); }, [isActive]);

  useEffect(() => {
    if (!isActive) return;
    updateRect();
    const el = document.querySelector(`[data-tour="${step?.target}"]`) as HTMLElement | null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, [stepIdx, isActive, updateRect]);

  if (!isActive || !step) return null;

  const isLast = stepIdx === steps.length - 1;
  const isFirst = stepIdx === 0;
  const next = () => { if (isLast) { onClose(); return; } setStepIdx(i => i + 1); };
  const prev = () => { if (!isFirst) setStepIdx(i => i - 1); };

  return (
    <>
      <div
        className="fixed inset-0 z-[9998] pointer-events-auto"
        style={{
          background: rect
            ? `radial-gradient(ellipse ${rect.width / 2 + 24}px ${rect.height / 2 + 24}px at ${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px, transparent 0%, transparent 55%, rgba(0,0,0,0.78) 100%)`
            : "rgba(0,0,0,0.78)",
        }}
        onClick={(e) => { if ((e.target as HTMLElement).closest("[data-tour-balloon]")) return; next(); }}
      />
      {rect && (
        <div className="fixed z-[9999] pointer-events-none rounded-xl" style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height, boxShadow: "0 0 0 3px #6366f1, 0 0 24px 6px rgba(99,102,241,0.55)", animation: "tour-pulse 1.5s ease-in-out infinite" }} />
      )}
      {rect && (
        <div className="fixed z-[9999] pointer-events-none text-2xl" style={{ top: rect.top + rect.height / 2 - 14, left: rect.left - 38, animation: "tour-arrow 0.8s ease-in-out infinite alternate" }}>👉</div>
      )}
      <div data-tour-balloon="true" className="fixed z-[10000] pointer-events-auto" style={{ top: balloonPos.top, left: balloonPos.left, transform: balloonPos.transform, width: Math.min(320, window.innerWidth - 32) }}>
        <div className="bg-white rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden">
          <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between">
            <span className="text-white font-bold text-sm">{step.title}</span>
            <div className="flex items-center gap-2">
              <span className="text-indigo-200 text-xs">{stepIdx + 1}/{steps.length}</span>
              <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="h-1 bg-indigo-100"><div className="h-1 bg-indigo-500 transition-all duration-300" style={{ width: `${((stepIdx + 1) / steps.length) * 100}%` }} /></div>
          <div className="px-4 py-3"><p className="text-gray-700 text-sm leading-relaxed">{step.description}</p></div>
          <div className="px-4 pb-4 flex items-center gap-2">
            {!isFirst && <button onClick={prev} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 rounded-lg hover:bg-gray-50"><ChevronLeft className="w-3 h-3" /> Anterior</button>}
            <div className="flex-1" />
            {step.action && step.route && <button onClick={() => { onNavigate(step.route!); onClose(); }} className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-100">{step.action}</button>}
            <button onClick={next} className="flex items-center gap-1 text-xs bg-indigo-600 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-700 active:scale-95">
              {isLast ? "Fechar ✓" : "Próximo"}{!isLast && <ChevronRight className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes tour-pulse { 0%,100%{box-shadow:0 0 0 3px #6366f1,0 0 24px 6px rgba(99,102,241,0.55)} 50%{box-shadow:0 0 0 5px #818cf8,0 0 32px 10px rgba(99,102,241,0.75)} }
        @keyframes tour-arrow { from{transform:translateX(0)} to{transform:translateX(10px)} }
      `}</style>
    </>
  );
}

export function TourButton() {
  const [location, navigate] = useLocation();
  const [active, setActive] = useState(false);
  const steps = TOUR_STEPS[location] || TOUR_STEPS["/"];
  if (!steps || steps.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setActive(true)}
        className="fixed bottom-20 right-4 z-[9990] w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 hover:scale-105"
        title="Guia desta tela"
        aria-label="Abrir guia interativo"
      >
        <HelpCircle className="w-6 h-6" />
      </button>
      <TourSpotlight isActive={active} onClose={() => setActive(false)} steps={steps} onNavigate={(r) => navigate(r)} />
    </>
  );
}

export default TourSpotlight;
