/**
 * ═══════════════════════════════════════════════════════════════════
 * server/voice-tts.test.ts
 * Testes Vitest para Edge TTS (Microsoft Neural Voices)
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from "vitest";
import {
  EDGE_TTS_VOICES,
  resolveVoice,
  synthesizeEdgeTTS,
} from "./edge-tts";

describe("🎤 Voice TTS System (Edge TTS)", () => {
  describe("Configuração de Vozes", () => {
    it("deve ter vozes configuradas para múltiplos idiomas", () => {
      expect(typeof EDGE_TTS_VOICES).toBe("object");
      expect(Object.keys(EDGE_TTS_VOICES).length).toBeGreaterThan(10);
    });

    it("deve ter voz para Português (Brasil)", () => {
      expect(EDGE_TTS_VOICES["pt-BR"]).toBeDefined();
      expect(EDGE_TTS_VOICES["pt-BR"]).toContain("Neural");
    });

    it("deve ter voz para Inglês (EUA)", () => {
      expect(EDGE_TTS_VOICES["en-US"]).toBeDefined();
      expect(EDGE_TTS_VOICES["en-US"]).toContain("Neural");
    });

    it("deve ter voz para Espanhol", () => {
      expect(EDGE_TTS_VOICES["es-ES"]).toBeDefined();
    });

    it("deve ter voz para Francês", () => {
      expect(EDGE_TTS_VOICES["fr-FR"]).toBeDefined();
    });

    it("deve ter voz para Alemão", () => {
      expect(EDGE_TTS_VOICES["de-DE"]).toBeDefined();
    });
  });

  describe("resolveVoice", () => {
    it("deve resolver voz para pt-BR", () => {
      const voice = resolveVoice("pt-BR");
      expect(voice).toBeDefined();
      expect(typeof voice).toBe("string");
      expect(voice.length).toBeGreaterThan(0);
    });

    it("deve resolver voz para en-US", () => {
      const voice = resolveVoice("en-US");
      expect(voice).toBeDefined();
      expect(voice).toContain("en-US");
    });

    it("mantém Sarah na voz neural feminina de inglês americano", () => {
      expect(resolveVoice("en-US", "female")).toBe("en-US-JennyNeural");
    });

    it("mantém James na voz neural masculina de inglês britânico", () => {
      expect(resolveVoice("en-GB", "male")).toBe("en-GB-RyanNeural");
    });

    it("deve resolver voz para código curto 'pt'", () => {
      const voice = resolveVoice("pt");
      expect(voice).toBeDefined();
      expect(typeof voice).toBe("string");
    });

    it("deve resolver voz para código curto 'en'", () => {
      const voice = resolveVoice("en");
      expect(voice).toBeDefined();
      expect(typeof voice).toBe("string");
    });

    it("deve usar voz padrão para idioma desconhecido", () => {
      const voice = resolveVoice("xx-UNKNOWN");
      expect(voice).toBeDefined();
      expect(typeof voice).toBe("string");
    });
  });

  describe("synthesizeEdgeTTS", () => {
    it("deve sintetizar voz em Português", async () => {
      const result = await synthesizeEdgeTTS("Olá, como você está?", "pt-BR");
      expect(result).toBeDefined();
      expect(result.audioBase64).toBeDefined();
      expect(result.audioBase64.length).toBeGreaterThan(100);
      expect(result.durationEstimateMs).toBeGreaterThan(0);
    }, 15000);

    it("deve sintetizar voz em Inglês", async () => {
      const result = await synthesizeEdgeTTS("Hello, how are you?", "en-US");
      expect(result).toBeDefined();
      expect(result.audioBase64).toBeDefined();
      expect(result.audioBase64.length).toBeGreaterThan(100);
      expect(result.durationEstimateMs).toBeGreaterThan(0);
    }, 15000);

    it("sintetiza James com a voz neural britânica masculina correta", async () => {
      const result = await synthesizeEdgeTTS(
        "Good day. Shall we begin our English lesson?",
        "en-GB",
        undefined,
        "male",
      );
      expect(result.voice).toBe("en-GB-RyanNeural");
      expect(result.audioBase64.length).toBeGreaterThan(100);
      expect(result.durationEstimateMs).toBeGreaterThan(0);
    }, 15000);

    it("deve usar cache para texto repetido", async () => {
      const text = "Cache test sentence";
      const lang = "en-US";
      const result1 = await synthesizeEdgeTTS(text, lang);
      const result2 = await synthesizeEdgeTTS(text, lang);
      expect(result1.audioBase64).toBe(result2.audioBase64);
    }, 20000);

    it("deve retornar duração estimada válida", async () => {
      const result = await synthesizeEdgeTTS("Test duration", "en-US");
      expect(result.durationEstimateMs).toBeGreaterThan(500);
      expect(result.durationEstimateMs).toBeLessThan(30000);
    }, 15000);
  });

  describe("Suporte a Múltiplos Idiomas", () => {
    it("deve sintetizar voz em Espanhol", async () => {
      const result = await synthesizeEdgeTTS("Hola mundo", "es-ES");
      expect(result.audioBase64.length).toBeGreaterThan(100);
    }, 15000);

    it("deve sintetizar voz em Francês", async () => {
      const result = await synthesizeEdgeTTS("Bonjour le monde", "fr-FR");
      expect(result.audioBase64.length).toBeGreaterThan(100);
    }, 15000);
  });

});

describe("📊 Performance Tests", () => {
  it("deve sintetizar voz em menos de 10 segundos", async () => {
    const start = Date.now();
    await synthesizeEdgeTTS("Performance test", "en-US");
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(10000);
  }, 15000);
});
