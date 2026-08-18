import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const scenePath = path.resolve(process.cwd(), "client/src/pages/ImmersiveScene.tsx");
const source = fs.readFileSync(scenePath, "utf8");

describe("áudio e estado visual do diálogo imersivo", () => {
  it("oferece repetição explícita em inglês e fallback local quando a voz neural não responde", () => {
    expect(source).toContain("trpc.sceneDialogueVoice.speak.useMutation()");
    expect(source).toContain("const playPublicSceneDialogue = useCallback");
    expect(source).toContain("function waitForSpeechResult<T>(task: Promise<T>, timeoutMs: number)");
    expect(source).toContain("12_000,");
    expect(source).toContain("scene-dialogue-speech-timeout");
    expect(source).toContain("const playLocalDialogFallback = useCallback");
    expect(source).toContain("synth.speak(utterance);");
    expect(source).toContain("Toque em Ouvir inglês para repetir a frase e continuar praticando.");
    expect(source).toContain('"Ouvir inglês"');
    expect(source).not.toContain("A voz neural não respondeu.");
    expect(source).not.toContain("A faixa neural não ficou disponível.");
    expect(source).not.toContain("A voz da cena não está disponível agora.");
    expect(source).toContain("audioBase64ToDataUrl");
    expect(source).toContain('audioBase64ToDataUrl(result.audioBase64, "audio/mpeg")');
    expect(source).toContain('audioBase64ToDataUrl(edgeAudio.audioBase64, "audio/mpeg")');
    expect(source).toContain("dialogAudioObjectUrlRef");
    expect(source).toContain("const replayVisibleDialogAudio = useCallback");
    expect(source).toContain("▶ Ouvir James");
    expect(source).not.toContain('audio.removeAttribute("src")');
    expect(source).toContain("src={dialogAudioSource || undefined}");
    expect(source).toContain("const dialogAudioElementRef = useRef<HTMLAudioElement | null>(null)");
    expect(source).toContain("const audio = dialogAudioElementRef.current;");
    expect(source).toContain("ref={dialogAudioElementRef}");
    expect(source).not.toContain("document.body.appendChild(audio)");
  });

  it("prepara a faixa de James sem disparar reprodução automática", () => {
    const neuralPreparation = source.slice(
      source.indexOf("const playTeacherAudio = useCallback"),
      source.indexOf("const replayVisibleDialogAudio = useCallback"),
    );
    const jamesPreparation = neuralPreparation.slice(0, neuralPreparation.indexOf("const isObjectPronunciation"));
    expect(neuralPreparation).toContain("Voz de James pronta. Toque em Ouvir James para iniciar.");
    expect(jamesPreparation).not.toContain("audio.play()");
    expect(source).toContain("await audio.play();");
  });

  it("recusa uma faixa sem duração e inicia a voz masculina de reserva sem exibir player 0:00", () => {
    const neuralPreparation = source.slice(
      source.indexOf("const playTeacherAudio = useCallback"),
      source.indexOf("const replayVisibleDialogAudio = useCallback"),
    );
    expect(neuralPreparation).toContain("const useFallbackForInvalidTrack");
    expect(neuralPreparation).toContain("!Number.isFinite(audio.duration) || audio.duration <= 0");
    expect(neuralPreparation).toContain("setDialogAudioSource(null);");
    expect(neuralPreparation).toContain("if (playLocalDialogFallback(phrase, _language, requestKey, selectedScene?.teacherGender))");
    expect(neuralPreparation).toContain("Sua frase está pronta para repetir. Toque em Ouvir inglês para continuar.");
    expect(neuralPreparation).toContain("Alguns navegadores anunciam metadata antes de calcular a duração");
  });

  it("não usa tremor ou gesto sintético como substituto de animação facial natural", () => {
    expect(source).toContain('animation: "none"');
    expect(source).not.toContain("scene.teacherAnimation\n              ?");
  });

  it("oferece escolha direta da voz do navegador para visitante após o gesto do aluno", () => {
    expect(source).toContain("const playGuestBrowserVoice");
    expect(source).toContain("browser-dialog:");
    expect(source).toContain("Usar voz do navegador");
    expect(source).toContain("playGuestBrowserVoice(teacherSpeech.text");
  });

  it("mantém James audível sem escolher voz identificada como feminina quando o navegador não nomeia voz masculina", () => {
    expect(source).toContain("const maleVoicePattern");
    expect(source).toContain("const nonFemaleRegionalVoice");
    expect(source).toContain("regionalVoices.find((voice) => !femaleVoicePattern.test(voice.name))");
    expect(source).toContain("|| nonFemaleRegionalVoice");
    expect(source).toContain("if (gender && !preferredVoice) return false;");
    expect(source).toContain("playLocalDialogFallback(text, language, requestKey, gender)");
  });

  it("repete a tentativa local de James quando o navegador ainda está carregando as vozes", () => {
    expect(source).toContain("const startWithAvailableVoices = (retriesRemaining: number): boolean");
    expect(source).toContain("const voices = synth.getVoices();");
    expect(source).toContain("if (!voices.length)");
    expect(source).toContain("startWithAvailableVoices(retriesRemaining - 1)");
    expect(source).toContain("return startWithAvailableVoices(2);");
    expect(source).toContain("A voz inglesa ainda está preparando neste navegador");
  });

  it("mantém a reserva masculina de James disponível tanto para pergunta quanto para pronúncia", () => {
    expect(source).toContain("James continua exclusivamente masculino");
    expect(source).toContain("prioriza uma voz regional masculina");
    expect(source).toContain("if (playLocalDialogFallback(phrase, _language, requestKey, selectedScene?.teacherGender))");
  });

  it("mantém o único elemento de áudio montado e oculto quando o diálogo está fechado para os cartões de objeto", () => {
    const teacherIndex = source.indexOf("<TeacherAvatar");
    const dialogPanelIndex = source.indexOf("{/* ── Dialog Panel:");
    const audioIndex = source.indexOf("ref={dialogAudioElementRef}");
    expect(audioIndex).toBeGreaterThan(teacherIndex);
    expect(audioIndex).toBeLessThan(dialogPanelIndex);
    expect(source).toContain("controls={false}");
    expect(source).toContain('className="hidden"');
    expect(source).toContain("os cartões de Wave, Ocean, Palm Tree e Sand usam a mesma voz neural");
  });

  it("inicia a pronúncia de objeto pelo gesto explícito e mantém o botão do cartão como única recuperação", () => {
    expect(source).toContain('const isObjectPronunciation = requestKey.startsWith("hotspot:")');
    expect(source).toContain("void audio.play().catch(() =>");
    expect(source).toContain("Pronúncia pronta. Toque novamente no botão de áudio do cartão para ouvir.");
  });

  it("mantém a frase de exemplo em inglês diretamente acionável no cartão", () => {
    expect(source).toContain('onClick={() => onSpeak(hotspot.example, langCode, "example")}');
    expect(source).toContain("Ouvir frase em inglês");
    expect(source).not.toContain("disabled={!pronunciationPlayed}");
    expect(source).not.toContain("Ouça a palavra primeiro");
  });

  it("não renderiza barra nativa sobre a frase ou os botões do cartão", () => {
    expect(source).not.toContain('top-[160px] z-[75] h-9');
    expect(source).not.toContain('bottom-[112px] left-1/2 z-[75]');
    expect(source).toContain("controls={false}");
  });
});
