import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sceneSource = readFileSync("client/src/pages/ImmersiveScene.tsx", "utf8");
const sceneCatalogSource = readFileSync("client/src/lib/immersiveScenesCatalog.ts", "utf8");
const teacherSource = readFileSync("client/src/data/teachers57.ts", "utf8");
const contractSource = readFileSync("docs/immersive-language-pair-contract-2026-08-16.md", "utf8");
const auditSource = readFileSync("docs/six-language-materials-audit-2026-08-16.md", "utf8");

const INITIAL_LANGUAGE_VOICES = ["pt-BR", "en-US", "es-ES", "fr-FR", "it-IT", "de-DE"] as const;

describe("consistência permanente das cenas e idiomas iniciais", () => {
  it("mantém a contagem declarada de 29 cenas sincronizada com a documentação", () => {
    const sceneCount = (sceneCatalogSource.match(/^    id:"/gm) || []).length;
    expect(sceneCount).toBe(29);
    expect(sceneCatalogSource).toContain("export const IMMERSIVE_SCENES: Scene[] = [");
    expect(contractSource).toContain("29 estruturas de cenário");
    expect(auditSource).toContain("29 cenários");
  });

  it("mantém professor, retrato e voz em todas as cenas declaradas", () => {
    const teacherAssignments = sceneCatalogSource.match(/teacherImage:"[^\"]+",\n?\s*teacherName:"[^\"]+", teacherLang:"[^\"]+", langCode:"[^\"]+"/g) || [];
    expect(teacherAssignments).toHaveLength(29);
    expect(sceneSource).toContain("const showSyntheticMouth = false;");
  });

  it("aplica a rejeição de faixa vazia pelo fluxo compartilhado das 29 cenas com reserva masculina para James", () => {
    const sceneIds = sceneCatalogSource.match(/^    id:"[^"]+"/gm) || [];
    expect(sceneIds).toHaveLength(29);
    expect(sceneSource).toContain("const useFallbackForInvalidTrack");
    expect(sceneSource).toContain("!Number.isFinite(audio.duration) || audio.duration <= 0");
    expect(sceneSource).toContain("if (playLocalDialogFallback(phrase, _language, requestKey, selectedScene?.teacherGender))");
    expect(sceneSource).toContain("regionalVoices.find((voice) => maleVoicePattern.test(voice.name)) || nonFemaleRegionalVoice");
    expect(sceneSource).toContain("trpc.sceneDialogueVoice.speak.useMutation()");
  });

  it("associa cada objeto da Praia Tropical ao seu clipe roteirizado próprio de James", () => {
    expect(sceneSource).toContain('const jamesObjectClipId = activeTeacherScene.teacherName === "James"');
    expect(sceneSource).toContain('palm: "james-tropical-point-palm"');
    expect(sceneSource).toContain('wave: "james-tropical-point-wave"');
    expect(sceneSource).toContain('ocean: "james-tropical-point-ocean"');
    expect(sceneSource).toContain('sand: "james-tropical-point-sand"');
    expect(sceneSource).toContain('playJamesTropicalClip(jamesObjectClipId)');
    expect(sceneSource).toContain("if (activeClipHasExactAudioVideoPair) onExactClipEnded?.();");
    expect(sceneSource).toContain("if (activeClipHasExactAudioVideoPair) onExactClipFailed?.();");
    expect(sceneSource).toContain("else onClipFinished?.();");
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
