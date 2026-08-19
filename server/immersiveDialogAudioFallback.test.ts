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
    expect(source).toContain("audioBase64ToObjectUrl");
    expect(source).toContain('audioBase64ToObjectUrl(result.audioBase64, "audio/mpeg")');
    expect(source).toContain('audioBase64ToObjectUrl(edgeAudio.audioBase64, "audio/mpeg")');
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

  it("tenta uma segunda rota neural de MP3 direto antes de recorrer ao provedor remoto ou à voz local", () => {
    const speechFlow = source.slice(source.indexOf("const speak = useCallback"), source.indexOf("const requestSpeechSafely = useCallback"));
    expect(source).toContain("const playPublicSceneDialogue = useCallback");
    expect(source).toContain('await playTeacherAudio(source, text, language, requestKey, false, autoPlay);');
    const edgeAttempt = speechFlow.indexOf("if (await playEdgeNeural()) return;");
    const directAttempt = speechFlow.indexOf("if (await playPublicSceneDialogue(text, lang, teacherGender, requestKey, autoPlay)) return;");
    const remoteAttempt = speechFlow.indexOf("const googleAudio");
    expect(edgeAttempt).toBeGreaterThan(-1);
    expect(directAttempt).toBeGreaterThan(edgeAttempt);
    expect(remoteAttempt).toBeGreaterThan(directAttempt);
  });

  it("usa uma faixa masculina pré-gravada somente como última reserva da apresentação inicial de James", () => {
    const speechFlow = source.slice(source.indexOf("const speak = useCallback"), source.indexOf("const requestSpeechSafely = useCallback"));
    expect(source).toContain('const JAMES_TROPICAL_INTRO_LINE = "Hello! My name is James. Welcome to this beautiful tropical beach!";');
    expect(source).toContain('const JAMES_TROPICAL_INTRO_FALLBACK_URL = "/manus-storage/james-tropical-introduction-fallback_73d168f4.wav";');
    expect(speechFlow).toContain('selectedScene?.id === "beach"');
    expect(speechFlow).toContain('selectedScene.teacherName === "James"');
    expect(speechFlow).toContain("text.trim() === JAMES_TROPICAL_INTRO_LINE");
    expect(speechFlow).toContain("JAMES_TROPICAL_INTRO_FALLBACK_URL");
    expect(speechFlow.indexOf("JAMES_TROPICAL_INTRO_FALLBACK_URL")).toBeGreaterThan(speechFlow.indexOf("const googleAudio"));
  });

  it("restaura a fala masculina e o clipe lateral já validados para a apresentação de James", () => {
    const dialogStart = source.slice(source.indexOf("const startDialog"), source.indexOf("useEffect(() => {", source.indexOf("const startDialog")));
    expect(dialogStart).toContain('playJamesTropicalClip("james-tropical-greeting")');
    expect(dialogStart).toContain("JAMES_TROPICAL_INTRO_FALLBACK_URL");
    expect(dialogStart).toContain('"james-tropical-introduction"');
    expect(source).toContain("audio.onplaying = () => {");
    expect(source).toContain("setActiveJamesClipId(pendingJamesClipIdRef.current);");
  });

  it("usa reservas masculinas curtas para os quatro objetos da Praia Tropical sem ativar vídeo de fala diferente", () => {
    const speechFlow = source.slice(source.indexOf("const speak = useCallback"), source.indexOf("const requestSpeechSafely = useCallback"));
    expect(source).toContain("const JAMES_TROPICAL_OBJECT_FALLBACKS = {");
    expect(source).toContain('"/manus-storage/james-palm-tree-fallback_b2eab131.wav"');
    expect(source).toContain('"/manus-storage/james-wave-fallback_b0f10757.wav"');
    expect(source).toContain('"/manus-storage/james-ocean-fallback_597e69cc.wav"');
    expect(source).toContain('"/manus-storage/james-sand-fallback_fba216c0.wav"');
    expect(speechFlow).toContain("const jamesObjectFallback");
    expect(speechFlow).toContain("pendingJamesClipIdRef.current = null;");
    expect(speechFlow).toContain("setActiveJamesClipId(null);");
    expect(speechFlow).toContain("jamesObjectFallback.spokenText");
    expect(speechFlow.indexOf("const jamesObjectFallback")).toBeGreaterThan(speechFlow.indexOf("const googleAudio"));
    expect(speechFlow.indexOf("const jamesObjectFallback")).toBeLessThan(speechFlow.indexOf("playLocalDialogFallback(text, lang"));
  });

  it("registra internamente carregamento, reprodução, rejeição e erro do player sem expor a frase", () => {
    expect(source).toContain('const reportAudioEvent = (event: "loaded" | "play" | "play-rejected" | "error", reason?: string) => {');
    expect(source).toContain('console.info("[immersive-audio]"');
    expect(source).toContain('source: source.startsWith("blob:") ? "blob" : "remote"');
    expect(source).toContain('reportAudioEvent("play");');
    expect(source).toContain('reportAudioEvent("loaded");');
    expect(source).toContain('reportAudioEvent("play-rejected", error instanceof Error ? error.name : "unknown");');
    expect(source).toContain('reportAudioEvent("error", audio.error?.message || String(audio.error?.code ?? "unknown"));');
    expect(source).toContain("if (playLocalDialogFallback(phrase, _language, requestKey, selectedScene?.teacherGender)) {");
    expect(source).not.toContain("phrase: phrase");
  });

  it("usa a reserva masculina depois de uma falha no botão explícito de reprodução", () => {
    const replayFlow = source.slice(source.indexOf("const replayVisibleDialogAudio"), source.indexOf("const primeDialogAudioFromGesture"));
    expect(replayFlow).toContain("const fallbackKey = `manual-replay:");
    expect(replayFlow).toContain("if (activeSpeechText && playLocalDialogFallback(activeSpeechText, selectedScene?.teacherLang || \"en-US\", fallbackKey, selectedScene?.teacherGender)) {");
    expect(replayFlow).toContain('setDlgAudioNotice("");');
  });

  it("oferece junto ao professor um único comando de ouvir para a faixa já preparada", () => {
    expect(source).toContain("hasPreparedSpeech?: boolean;");
    expect(source).toContain("onReplaySpeech?: () => void;");
    expect(source).toContain("{hasPreparedSpeech && onReplaySpeech && !isPreparingAudio && (");
    expect(source).toContain("onClick={onReplaySpeech}");
    expect(source).toContain("hasPreparedSpeech={Boolean(dialogAudioSource)}");
    expect(source).toContain("onReplaySpeech={() => { void replayVisibleDialogAudio(); }}");
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

  it("troca avisos técnicos de voz e microfone por orientação positiva ao aluno", () => {
    expect(source).toContain("Entre na sua conta para praticar com a voz do professor nesta cena.");
    expect(source).toContain("A explicação está pronta abaixo. Leia no seu ritmo e toque em Ouvir novamente quando quiser continuar.");
    expect(source).toContain("Vamos tentar mais uma vez: comece a falar depois de tocar em Gravar.");
    expect(source).toContain("Vamos praticar de outro modo: fale um pouco mais devagar ou escreva sua resposta.");
    expect(source).toContain("Sua resposta pode ser enviada por escrito enquanto você prepara uma nova tentativa de fala.");
    expect(source).toContain("Escolha escrever sua resposta agora ou tente a gravação novamente quando estiver pronto.");
    expect(source).not.toContain("A voz do navegador não está disponível.");
    expect(source).not.toContain("A ajuda por voz neural não está disponível agora.");
    expect(source).not.toContain("Não foi possível reconhecer uma resposta.");
    expect(source).not.toContain("Não foi possível transcrever sua resposta.");
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
