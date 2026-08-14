import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const scenePath = path.resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx");
const sceneSource = fs.readFileSync(scenePath, "utf8");

describe("deduplicação de áudio do diálogo imersivo", () => {
  it("mantém uma chave ativa para impedir a mesma linha de iniciar duas falas", () => {
    expect(sceneSource).toContain("const activeSpeechRequestRef = useRef<string | null>(null)");
    expect(sceneSource).toContain("if (activeSpeechRequestRef.current === requestKey) return;");
  });

  it("libera a chave quando a reprodução encerra, falha ou não encontra voz", () => {
    expect(sceneSource).toContain("const releaseRequest = () => {");
    expect(sceneSource).toContain("releaseRequest();");
    expect(sceneSource).toContain("if (activeSpeechRequestRef.current === requestKey) activeSpeechRequestRef.current = null;");
  });

  it("preserva o painel de diálogo enquanto deduplica apenas a fala", () => {
    expect(sceneSource).toContain("setDlgOpen(true); setDlgStep(0);");
    expect(sceneSource).toContain("className=\"immersive-dialog absolute left-0 right-0 z-[70]\"");
  });
});
