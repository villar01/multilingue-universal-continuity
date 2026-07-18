/**
 * LanguageSetupModal
 * Aparece quando o aluno ainda não escolheu o idioma a estudar.
 * Mostra o idioma nativo detectado automaticamente (editável) e
 * um seletor do idioma a estudar.
 */
import { useState } from "react";
import { SUPPORTED_LANGUAGES } from "@/hooks/useLanguageSettings";

interface Props {
  nativeLang: string;
  targetLang: string;
  onConfirm: (native: string, target: string) => void;
}

export default function LanguageSetupModal({ nativeLang, targetLang, onConfirm }: Props) {
  const [native, setNative] = useState(nativeLang || "pt-BR");
  const [target, setTarget] = useState(targetLang || "");
  const [step, setStep] = useState<"native" | "target">("native");

  const langs = Object.entries(SUPPORTED_LANGUAGES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        {step === "native" ? (
          <>
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🌍</div>
              <h2 className="text-white text-xl font-bold">Qual é o seu idioma nativo?</h2>
              <p className="text-gray-400 text-sm mt-1">
                Detectamos automaticamente: <span className="text-green-400 font-semibold">
                  {SUPPORTED_LANGUAGES[native]?.flag} {SUPPORTED_LANGUAGES[native]?.name}
                </span>
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-700 mb-4">
              {langs.map(([code, info]) => (
                <button
                  key={code}
                  onClick={() => setNative(code)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    native === code
                      ? "bg-blue-600/30 border-l-2 border-blue-400"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <span className="text-xl">{info.flag}</span>
                  <span className="text-white text-sm">{info.name}</span>
                  {native === code && <span className="ml-auto text-blue-400">✓</span>}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep("target")}
              disabled={!native}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Próximo →
            </button>
          </>
        ) : (
          <>
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🎯</div>
              <h2 className="text-white text-xl font-bold">Qual idioma quer estudar?</h2>
              <p className="text-gray-400 text-sm mt-1">
                Idioma nativo: <span className="text-green-400">{SUPPORTED_LANGUAGES[native]?.flag} {SUPPORTED_LANGUAGES[native]?.name}</span>
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-700 mb-4">
              {langs.filter(([code]) => code !== native).map(([code, info]) => (
                <button
                  key={code}
                  onClick={() => setTarget(code)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    target === code
                      ? "bg-green-600/30 border-l-2 border-green-400"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <span className="text-xl">{info.flag}</span>
                  <span className="text-white text-sm">{info.name}</span>
                  {target === code && <span className="ml-auto text-green-400">✓</span>}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep("native")}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                ← Voltar
              </button>
              <button
                onClick={() => target && onConfirm(native, target)}
                disabled={!target}
                className="flex-2 flex-grow bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                ✓ Começar a Aprender!
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
