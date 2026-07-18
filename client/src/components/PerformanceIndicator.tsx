/**
 * PerformanceIndicator.tsx
 * Indicador visual de qualidade adaptativa — exibido discretamente no app.
 * O cliente vê o nível de qualidade atual e pode ajustar manualmente.
 * Não cobra extra por qualidade — é automático e gratuito.
 */

import { useState } from "react";
import { useDevicePerformance } from "@/hooks/useDevicePerformance";
import {
  getTierLabel,
  getTierColor,
  TIER_DESCRIPTIONS,
  type PerformanceTier,
} from "@/lib/device-performance";

const ALL_TIERS: PerformanceTier[] = ["ultra", "high", "medium", "low", "eco"];

export default function PerformanceIndicator() {
  const { profile, isDetecting, overrideTier } = useDevicePerformance();
  const [open, setOpen] = useState(false);

  if (isDetecting || !profile) return null;

  const tierColor = getTierColor(profile.tier);
  const tierLabel = getTierLabel(profile.tier);

  return (
    <div className="relative">
      {/* Botão indicador */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border transition-all"
        style={{
          borderColor: tierColor + "60",
          backgroundColor: tierColor + "15",
          color: tierColor,
        }}
        title="Qualidade adaptativa do app"
      >
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: tierColor }}
        />
        {tierLabel}
      </button>

      {/* Painel de detalhes */}
      {open && (
        <div className="absolute right-0 top-8 z-50 w-72 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm font-semibold">⚡ Qualidade Adaptativa</h3>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white text-xs">✕</button>
          </div>

          {/* Info do dispositivo */}
          <div className="bg-gray-800 rounded-lg p-3 mb-3 space-y-1">
            <p className="text-gray-400 text-xs">
              <span className="text-gray-300">CPU:</span> {profile.cpuCores} núcleos
            </p>
            {profile.ramGB !== null && (
              <p className="text-gray-400 text-xs">
                <span className="text-gray-300">RAM:</span> {profile.ramGB} GB
              </p>
            )}
            <p className="text-gray-400 text-xs">
              <span className="text-gray-300">Rede:</span> {profile.connectionType.toUpperCase()} · {profile.connectionDownlink} Mbps
            </p>
            <p className="text-gray-400 text-xs">
              <span className="text-gray-300">GPU:</span> {profile.hasGPU ? "✅ Disponível" : "❌ Não detectada"}
            </p>
            <p className="text-gray-400 text-xs">
              <span className="text-gray-300">Score:</span> {profile.score}/100
            </p>
          </div>

          {/* Descrição do tier atual */}
          <p className="text-gray-400 text-xs mb-3 leading-relaxed">
            {TIER_DESCRIPTIONS[profile.tier]}
          </p>

          {/* Seletor manual */}
          <div>
            <p className="text-gray-500 text-xs mb-2">Ajustar manualmente:</p>
            <div className="grid grid-cols-1 gap-1">
              {ALL_TIERS.map((t) => {
                const color = getTierColor(t);
                const isActive = t === profile.tier;
                return (
                  <button
                    key={t}
                    onClick={() => { overrideTier(t); setOpen(false); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all text-left ${
                      isActive ? "ring-1" : "hover:bg-gray-800"
                    }`}
                    style={isActive ? { backgroundColor: color + "20", outline: `1px solid ${color}` } : {}}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className={isActive ? "text-white font-medium" : "text-gray-400"}>
                      {getTierLabel(t)}
                    </span>
                    {isActive && <span className="ml-auto text-gray-500">✓ ativo</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-gray-600 text-xs mt-3 text-center">
            Qualidade ajustada automaticamente · sem custo extra
          </p>
        </div>
      )}
    </div>
  );
}
