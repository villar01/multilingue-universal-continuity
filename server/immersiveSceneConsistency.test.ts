import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getSecureSceneSeed } from "./curriculum/secureSceneSeeds";

const sceneSource = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");
const teacherSource = readFileSync("client/src/data/teachers57.ts", "utf8");
const contractSource = readFileSync("docs/immersive-language-pair-contract-2026-08-16.md", "utf8");
const auditSource = readFileSync("docs/six-language-materials-audit-2026-08-16.md", "utf8");

const INITIAL_LANGUAGE_VOICES = ["pt-BR", "en-US", "es-ES", "fr-FR", "it-IT", "de-DE"] as const;

describe("consistência permanente das cenas e idiomas iniciais", () => {
  it("mantém a contagem declarada de 29 cenas sincronizada com a documentação", () => {
    const sceneCount = (sceneSource.match(/^    id:"/gm) || []).length;
    expect(sceneCount).toBe(29);
    expect(sceneSource).toContain("Scene Data (29 scenes with CDN images)");
    expect(contractSource).toContain("29 estruturas de cenário");
    expect(auditSource).toContain("29 cenários");
  });

  it("mantém professor, retrato e voz em todas as cenas declaradas", () => {
    const teacherAssignments = sceneSource.match(/teacherImage:"[^\"]+",\n?\s*teacherName:"[^\"]+", teacherLang:"[^\"]+", langCode:"[^\"]+"/g) || [];
    expect(teacherAssignments).toHaveLength(29);
    expect(sceneSource).toContain("const showSyntheticMouth = false;");
  });

  it("faz as 29 cenas passarem pelo mesmo início de diálogo e pelos objetos protegidos", () => {
    const sceneIds = [...sceneSource.matchAll(/^    id:"([^"]+)"/gm)].map((match) => match[1]);
    expect(sceneIds).toHaveLength(29);
    expect(sceneSource).toContain("const launchDialogFromGesture = useCallback");
    expect(sceneSource).toContain("onPointerUp={(e) => { e.stopPropagation(); launchDialogFromGesture(); }}");
    expect(sceneSource).toContain("activeSceneHotspots.map((hotspot) => {");
    expect(sceneSource).toContain("handleHotspotClick(hotspot);");
    for (const sceneId of sceneIds) {
      const seed = getSecureSceneSeed(sceneId);
      expect(seed?.dialog.length, sceneId).toBeGreaterThan(0);
      expect(seed?.hotspots.length, sceneId).toBeGreaterThan(0);
    }
  });

  it("preserva perfis com retrato para as seis línguas iniciais", () => {
    for (const voiceLanguage of INITIAL_LANGUAGE_VOICES) {
      const languageEntry = new RegExp(`voiceLang: '${voiceLanguage}'[\\s\\S]{0,260}?photo: '/manus-storage/`);
      expect(teacherSource).toMatch(languageEntry);
    }
  });

  it("registra a expansão por pares sem confundir réplica estrutural com tradução mecânica", () => {
    expect(contractSource).toContain("idioma estudado");
    expect(contractSource).toContain("idioma nativo");
    expect(contractSource).toContain("não devem integrar o pacote público do navegador");
    expect(auditSource).toContain("português, inglês, espanhol, francês, italiano e alemão");
  });
});
