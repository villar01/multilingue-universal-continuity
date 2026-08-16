import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sceneSource = readFileSync(
  resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx"),
  "utf8",
);
const noticeSource = readFileSync(
  resolve(process.cwd(), "client/src/components/LocalAINotification.tsx"),
  "utf8",
);

describe("visibilidade do diálogo imersivo", () => {
  it("mantém o painel acima da barra inferior e com identificação explícita", () => {
    expect(sceneSource).toContain('className="immersive-dialog absolute left-0 right-0 z-[70]"');
    expect(sceneSource).toContain('bottom: "clamp(112px, 16vh, 150px)"');
    expect(sceneSource).toContain('aria-label="Diálogo da cena"');
    expect(sceneSource).toContain('className="absolute left-0 right-0 z-40 flex items-center justify-between px-4 py-3"');
  });

  it("mantém a fala visível quando a voz pública estiver indisponível", () => {
    expect(sceneSource.match(/setDlgWords\(words\); setDlgWordIdx\(0\);/g)).toHaveLength(2);
    expect(sceneSource).toContain("if (activeDialogLineRef.current === text) setDlgAudioClock(false);");
  });

  it("não permite que o aviso de IA local cubra rotas fora da abertura de jornada", () => {
    expect(noticeSource).toContain("const isJourneyStartRoute = location === '/';");
    expect(noticeSource).toContain("if (!visible || !isJourneyStartRoute) return null;");
  });

  it("usa posição facial calibrada e remove o gesto circular artificial", () => {
    expect(sceneSource).toContain('James: { mouthY: 53, mouthWidth: 0.88 }');
    expect(sceneSource).toContain('top: `${facePosition.mouthY}%`');
    expect(sceneSource).not.toContain('animation: "hand-gesture 2s ease-in-out infinite"');
  });
});
