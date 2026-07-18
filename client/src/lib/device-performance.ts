/**
 * device-performance.ts
 * Sistema de qualidade adaptativa com 120+ configurações.
 * Detecta CPU, RAM, GPU, rede e define automaticamente o melhor
 * nível de experiência para cada dispositivo — sem custo extra ao cliente.
 *
 * Tiers: eco | low | medium | high | ultra
 */

export type PerformanceTier = "ultra" | "high" | "medium" | "low" | "eco";

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACE PRINCIPAL: 120+ configurações organizadas por módulo
// ─────────────────────────────────────────────────────────────────────────────
export interface PerformanceSettings {

  // ── 1. VÍDEO ────────────────────────────────────────────────────────────────
  videoQuality: "4k" | "1080p" | "720p" | "480p" | "360p";
  videoFrameRate: 60 | 30 | 24 | 15;
  videoHardwareAcceleration: boolean;
  videoAutoplay: boolean;
  videoPreload: "auto" | "metadata" | "none";
  videoBufferSize: "large" | "medium" | "small";
  videoAdaptiveBitrate: boolean;
  videoSubtitleRendering: "gpu" | "cpu" | "basic";
  videoThumbnailQuality: "high" | "medium" | "low";
  videoTransitionEffects: boolean;

  // ── 2. ÁUDIO ────────────────────────────────────────────────────────────────
  audioQuality: "lossless" | "high" | "medium" | "low";
  audioBitrate: 320 | 192 | 128 | 64;
  audioPreloadBuffer: boolean;
  audioSpatial3D: boolean;
  audioEchoCancellation: boolean;
  audioNoiseSuppression: boolean;
  audioAutoGainControl: boolean;
  audioSampleRate: 48000 | 44100 | 22050 | 16000;
  audioChannels: "stereo" | "mono";
  audioCompression: boolean;

  // ── 3. PROFESSORES VIRTUAIS ──────────────────────────────────────────────────
  avatarResolution: "8k" | "4k" | "2k" | "1k" | "512";
  avatarFrameRate: 60 | 30 | 15;
  avatarLipSync: "full-ai" | "full" | "basic" | "disabled";
  avatarFacialExpressions: boolean;
  avatarEyeTracking: boolean;
  avatarBodyAnimation: boolean;
  avatarShadows: boolean;
  avatarReflections: boolean;
  avatarAmbientOcclusion: boolean;
  avatarAntiAliasing: "msaa8x" | "msaa4x" | "fxaa" | "none";
  avatarTextureFiltering: "anisotropic16x" | "anisotropic4x" | "bilinear" | "nearest";
  avatarLOD: "high" | "medium" | "low";          // Level of Detail
  avatarConcurrentCount: 3 | 2 | 1;              // quantos professores simultâneos
  avatarPreloadNext: boolean;                     // pré-carrega próximo professor

  // ── 4. REALIDADE AUMENTADA (RA) ──────────────────────────────────────────────
  arEnabled: boolean;
  arResolution: "ultra" | "high" | "medium" | "low";
  arFrameRate: 60 | 30 | 15;
  arObjectTracking: "6dof" | "3dof" | "basic";
  arOcclusionDetection: boolean;
  arLightEstimation: boolean;
  arShadowCasting: boolean;
  arParticleEffects: boolean;
  arPhysicsSimulation: boolean;
  arMaxObjects: 20 | 10 | 5 | 2;
  arTextureQuality: "high" | "medium" | "low";
  arDepthSensing: boolean;
  arHandTracking: boolean;
  arFaceTracking: boolean;
  arWorldMapping: boolean;

  // ── 5. IA E PROCESSAMENTO ────────────────────────────────────────────────────
  realtimePronunciationAnalysis: boolean;
  pronunciationModelQuality: "large" | "medium" | "small" | "tiny";
  nlpContextWindow: 4096 | 2048 | 1024 | 512;   // tokens de contexto
  aiResponseStreaming: boolean;
  aiCacheResponses: boolean;
  aiParallelRequests: 4 | 2 | 1;
  aiAutoCorrect: boolean;
  aiGrammarCheck: boolean;
  aiSentimentAnalysis: boolean;
  aiAdaptiveDifficulty: boolean;
  aiPersonalization: "deep" | "standard" | "basic";
  aiPredictiveText: boolean;
  aiTranslationQuality: "neural" | "statistical" | "basic";
  aiSpeechRecognition: "cloud" | "local-large" | "local-small";

  // ── 6. REDE E CACHE ──────────────────────────────────────────────────────────
  prefetchLessons: boolean;
  prefetchCount: 5 | 3 | 1 | 0;
  offlineCacheSize: "unlimited" | "2gb" | "500mb" | "100mb" | "minimal";
  imageResolution: "original" | "compressed" | "thumbnail";
  lazyLoadImages: boolean;
  serviceWorkerCache: boolean;
  cdnOptimization: boolean;
  compressionLevel: "brotli" | "gzip" | "none";
  requestTimeout: 30 | 15 | 10 | 5;             // segundos
  retryAttempts: 3 | 2 | 1;
  backgroundSync: boolean;
  deltaUpdates: boolean;                          // baixa apenas o que mudou

  // ── 7. INTERFACE (UI) ────────────────────────────────────────────────────────
  animationsEnabled: boolean;
  animationDuration: "full" | "reduced" | "none";
  particleEffects: boolean;
  blurEffects: boolean;
  shadowsEnabled: boolean;
  gradientRendering: "gpu" | "cpu" | "flat";
  fontRendering: "subpixel" | "antialiased" | "none";
  iconQuality: "svg" | "png-2x" | "png-1x";
  scrollBehavior: "smooth" | "instant";
  transitionEffects: boolean;
  tooltipAnimations: boolean;
  skeletonLoaders: boolean;
  infiniteScrollBuffer: 10 | 5 | 3;
  virtualListRendering: boolean;                  // para listas longas
  canvasRendering: "webgl2" | "webgl" | "canvas2d";

  // ── 8. LIÇÕES E CONTEÚDO ────────────────────────────────────────────────────
  lessonImageQuality: "4k" | "2k" | "1k" | "512";
  lessonVideoEnabled: boolean;
  lessonAnimatedDiagrams: boolean;
  lessonInteractiveObjects: boolean;
  lessonAudioNarration: boolean;
  lessonRealTimeTranscript: boolean;
  lessonProgressAutoSave: "realtime" | "onpause" | "onend";
  lessonGlossaryPreload: boolean;
  lessonNotebookEnabled: boolean;
  lessonFlashcardsAnimation: boolean;

  // ── 9. SEGURANÇA E PRIVACIDADE ───────────────────────────────────────────────
  encryptionLevel: "aes256" | "aes128" | "basic";
  auditLogDetail: "full" | "standard" | "minimal";
  sessionTimeout: 3600 | 1800 | 900;             // segundos
  biometricAuth: boolean;
  deviceFingerprinting: boolean;
  contentIntegrityCheck: boolean;
  secureStorageEnabled: boolean;

  // ── 10. ACESSIBILIDADE ───────────────────────────────────────────────────────
  highContrastMode: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigationEnhanced: boolean;
  captionsEnabled: boolean;
  captionsFontSize: "large" | "medium" | "small";
  colorBlindMode: "none" | "deuteranopia" | "protanopia" | "tritanopia";
  focusIndicatorEnhanced: boolean;

  // ── 11. BATERIA E ENERGIA ────────────────────────────────────────────────────
  batterySaverMode: boolean;
  backgroundProcessingEnabled: boolean;
  wakeLocksEnabled: boolean;
  cpuThrottling: "none" | "moderate" | "aggressive";
  gpuThrottling: "none" | "moderate" | "aggressive";
  networkPollingInterval: 60 | 120 | 300 | 600;  // segundos
  idleDetection: boolean;
  autoQualityReduction: boolean;                  // reduz qualidade se bateria < 20%

  // ── 12. DIAGNÓSTICO E TELEMETRIA ─────────────────────────────────────────────
  performanceMonitoring: boolean;
  errorReporting: "full" | "anonymous" | "disabled";
  crashReporting: boolean;
  analyticsDetail: "full" | "basic" | "disabled";
  fpsMonitor: boolean;
  memoryMonitor: boolean;
  networkMonitor: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURAÇÕES POR TIER
// ─────────────────────────────────────────────────────────────────────────────

const TIER_SETTINGS: Record<PerformanceTier, PerformanceSettings> = {

  // ── ULTRA: máquinas potentes (8+ cores, 8+ GB RAM, GPU dedicada, fibra) ──────
  ultra: {
    // Vídeo
    videoQuality: "1080p", videoFrameRate: 60, videoHardwareAcceleration: true,
    videoAutoplay: true, videoPreload: "auto", videoBufferSize: "large",
    videoAdaptiveBitrate: true, videoSubtitleRendering: "gpu",
    videoThumbnailQuality: "high", videoTransitionEffects: true,
    // Áudio
    audioQuality: "lossless", audioBitrate: 320, audioPreloadBuffer: true,
    audioSpatial3D: true, audioEchoCancellation: true, audioNoiseSuppression: true,
    audioAutoGainControl: true, audioSampleRate: 48000, audioChannels: "stereo",
    audioCompression: false,
    // Professores
    avatarResolution: "4k", avatarFrameRate: 60, avatarLipSync: "full-ai",
    avatarFacialExpressions: true, avatarEyeTracking: true, avatarBodyAnimation: true,
    avatarShadows: true, avatarReflections: true, avatarAmbientOcclusion: true,
    avatarAntiAliasing: "msaa8x", avatarTextureFiltering: "anisotropic16x",
    avatarLOD: "high", avatarConcurrentCount: 3, avatarPreloadNext: true,
    // RA
    arEnabled: true, arResolution: "ultra", arFrameRate: 60,
    arObjectTracking: "6dof", arOcclusionDetection: true, arLightEstimation: true,
    arShadowCasting: true, arParticleEffects: true, arPhysicsSimulation: true,
    arMaxObjects: 20, arTextureQuality: "high", arDepthSensing: true,
    arHandTracking: true, arFaceTracking: true, arWorldMapping: true,
    // IA
    realtimePronunciationAnalysis: true, pronunciationModelQuality: "large",
    nlpContextWindow: 4096, aiResponseStreaming: true, aiCacheResponses: true,
    aiParallelRequests: 4, aiAutoCorrect: true, aiGrammarCheck: true,
    aiSentimentAnalysis: true, aiAdaptiveDifficulty: true,
    aiPersonalization: "deep", aiPredictiveText: true,
    aiTranslationQuality: "neural", aiSpeechRecognition: "cloud",
    // Rede
    prefetchLessons: true, prefetchCount: 5, offlineCacheSize: "unlimited",
    imageResolution: "original", lazyLoadImages: false, serviceWorkerCache: true,
    cdnOptimization: true, compressionLevel: "brotli", requestTimeout: 30,
    retryAttempts: 3, backgroundSync: true, deltaUpdates: true,
    // UI
    animationsEnabled: true, animationDuration: "full", particleEffects: true,
    blurEffects: true, shadowsEnabled: true, gradientRendering: "gpu",
    fontRendering: "subpixel", iconQuality: "svg", scrollBehavior: "smooth",
    transitionEffects: true, tooltipAnimations: true, skeletonLoaders: true,
    infiniteScrollBuffer: 10, virtualListRendering: true, canvasRendering: "webgl2",
    // Lições
    lessonImageQuality: "4k", lessonVideoEnabled: true, lessonAnimatedDiagrams: true,
    lessonInteractiveObjects: true, lessonAudioNarration: true,
    lessonRealTimeTranscript: true, lessonProgressAutoSave: "realtime",
    lessonGlossaryPreload: true, lessonNotebookEnabled: true,
    lessonFlashcardsAnimation: true,
    // Segurança
    encryptionLevel: "aes256", auditLogDetail: "full", sessionTimeout: 3600,
    biometricAuth: true, deviceFingerprinting: true, contentIntegrityCheck: true,
    secureStorageEnabled: true,
    // Acessibilidade
    highContrastMode: false, reducedMotion: false, screenReaderOptimized: true,
    keyboardNavigationEnhanced: true, captionsEnabled: true, captionsFontSize: "medium",
    colorBlindMode: "none", focusIndicatorEnhanced: true,
    // Bateria
    batterySaverMode: false, backgroundProcessingEnabled: true, wakeLocksEnabled: true,
    cpuThrottling: "none", gpuThrottling: "none", networkPollingInterval: 60,
    idleDetection: true, autoQualityReduction: false,
    // Diagnóstico
    performanceMonitoring: true, errorReporting: "full", crashReporting: true,
    analyticsDetail: "full", fpsMonitor: true, memoryMonitor: true, networkMonitor: true,
  },

  // ── HIGH: boa máquina (4+ cores, 4+ GB RAM, GPU integrada, banda larga) ──────
  high: {
    videoQuality: "720p", videoFrameRate: 30, videoHardwareAcceleration: true,
    videoAutoplay: true, videoPreload: "metadata", videoBufferSize: "medium",
    videoAdaptiveBitrate: true, videoSubtitleRendering: "gpu",
    videoThumbnailQuality: "high", videoTransitionEffects: true,
    audioQuality: "high", audioBitrate: 192, audioPreloadBuffer: true,
    audioSpatial3D: false, audioEchoCancellation: true, audioNoiseSuppression: true,
    audioAutoGainControl: true, audioSampleRate: 44100, audioChannels: "stereo",
    audioCompression: false,
    avatarResolution: "2k", avatarFrameRate: 30, avatarLipSync: "full",
    avatarFacialExpressions: true, avatarEyeTracking: false, avatarBodyAnimation: true,
    avatarShadows: true, avatarReflections: false, avatarAmbientOcclusion: false,
    avatarAntiAliasing: "msaa4x", avatarTextureFiltering: "anisotropic4x",
    avatarLOD: "high", avatarConcurrentCount: 2, avatarPreloadNext: true,
    arEnabled: true, arResolution: "high", arFrameRate: 30,
    arObjectTracking: "6dof", arOcclusionDetection: true, arLightEstimation: true,
    arShadowCasting: false, arParticleEffects: true, arPhysicsSimulation: false,
    arMaxObjects: 10, arTextureQuality: "medium", arDepthSensing: false,
    arHandTracking: false, arFaceTracking: true, arWorldMapping: true,
    realtimePronunciationAnalysis: true, pronunciationModelQuality: "medium",
    nlpContextWindow: 2048, aiResponseStreaming: true, aiCacheResponses: true,
    aiParallelRequests: 2, aiAutoCorrect: true, aiGrammarCheck: true,
    aiSentimentAnalysis: false, aiAdaptiveDifficulty: true,
    aiPersonalization: "standard", aiPredictiveText: true,
    aiTranslationQuality: "neural", aiSpeechRecognition: "cloud",
    prefetchLessons: true, prefetchCount: 3, offlineCacheSize: "2gb",
    imageResolution: "original", lazyLoadImages: true, serviceWorkerCache: true,
    cdnOptimization: true, compressionLevel: "brotli", requestTimeout: 30,
    retryAttempts: 3, backgroundSync: true, deltaUpdates: true,
    animationsEnabled: true, animationDuration: "full", particleEffects: true,
    blurEffects: true, shadowsEnabled: true, gradientRendering: "gpu",
    fontRendering: "subpixel", iconQuality: "svg", scrollBehavior: "smooth",
    transitionEffects: true, tooltipAnimations: true, skeletonLoaders: true,
    infiniteScrollBuffer: 10, virtualListRendering: true, canvasRendering: "webgl2",
    lessonImageQuality: "2k", lessonVideoEnabled: true, lessonAnimatedDiagrams: true,
    lessonInteractiveObjects: true, lessonAudioNarration: true,
    lessonRealTimeTranscript: true, lessonProgressAutoSave: "realtime",
    lessonGlossaryPreload: true, lessonNotebookEnabled: true,
    lessonFlashcardsAnimation: true,
    encryptionLevel: "aes256", auditLogDetail: "standard", sessionTimeout: 3600,
    biometricAuth: false, deviceFingerprinting: true, contentIntegrityCheck: true,
    secureStorageEnabled: true,
    highContrastMode: false, reducedMotion: false, screenReaderOptimized: true,
    keyboardNavigationEnhanced: true, captionsEnabled: true, captionsFontSize: "medium",
    colorBlindMode: "none", focusIndicatorEnhanced: true,
    batterySaverMode: false, backgroundProcessingEnabled: true, wakeLocksEnabled: true,
    cpuThrottling: "none", gpuThrottling: "none", networkPollingInterval: 60,
    idleDetection: true, autoQualityReduction: true,
    performanceMonitoring: true, errorReporting: "anonymous", crashReporting: true,
    analyticsDetail: "basic", fpsMonitor: false, memoryMonitor: false, networkMonitor: true,
  },

  // ── MEDIUM: máquina média (2-4 cores, 2-4 GB RAM, sem GPU dedicada) ──────────
  medium: {
    videoQuality: "480p", videoFrameRate: 30, videoHardwareAcceleration: true,
    videoAutoplay: false, videoPreload: "metadata", videoBufferSize: "small",
    videoAdaptiveBitrate: true, videoSubtitleRendering: "cpu",
    videoThumbnailQuality: "medium", videoTransitionEffects: false,
    audioQuality: "medium", audioBitrate: 128, audioPreloadBuffer: false,
    audioSpatial3D: false, audioEchoCancellation: true, audioNoiseSuppression: true,
    audioAutoGainControl: true, audioSampleRate: 22050, audioChannels: "stereo",
    audioCompression: true,
    avatarResolution: "1k", avatarFrameRate: 30, avatarLipSync: "basic",
    avatarFacialExpressions: false, avatarEyeTracking: false, avatarBodyAnimation: false,
    avatarShadows: false, avatarReflections: false, avatarAmbientOcclusion: false,
    avatarAntiAliasing: "fxaa", avatarTextureFiltering: "bilinear",
    avatarLOD: "medium", avatarConcurrentCount: 1, avatarPreloadNext: false,
    arEnabled: true, arResolution: "medium", arFrameRate: 15,
    arObjectTracking: "3dof", arOcclusionDetection: false, arLightEstimation: false,
    arShadowCasting: false, arParticleEffects: false, arPhysicsSimulation: false,
    arMaxObjects: 5, arTextureQuality: "low", arDepthSensing: false,
    arHandTracking: false, arFaceTracking: false, arWorldMapping: false,
    realtimePronunciationAnalysis: true, pronunciationModelQuality: "small",
    nlpContextWindow: 1024, aiResponseStreaming: true, aiCacheResponses: true,
    aiParallelRequests: 1, aiAutoCorrect: true, aiGrammarCheck: false,
    aiSentimentAnalysis: false, aiAdaptiveDifficulty: true,
    aiPersonalization: "basic", aiPredictiveText: false,
    aiTranslationQuality: "statistical", aiSpeechRecognition: "local-small",
    prefetchLessons: false, prefetchCount: 1, offlineCacheSize: "500mb",
    imageResolution: "compressed", lazyLoadImages: true, serviceWorkerCache: true,
    cdnOptimization: true, compressionLevel: "gzip", requestTimeout: 15,
    retryAttempts: 2, backgroundSync: false, deltaUpdates: true,
    animationsEnabled: true, animationDuration: "reduced", particleEffects: false,
    blurEffects: false, shadowsEnabled: false, gradientRendering: "cpu",
    fontRendering: "antialiased", iconQuality: "png-2x", scrollBehavior: "smooth",
    transitionEffects: false, tooltipAnimations: false, skeletonLoaders: true,
    infiniteScrollBuffer: 5, virtualListRendering: true, canvasRendering: "webgl",
    lessonImageQuality: "1k", lessonVideoEnabled: true, lessonAnimatedDiagrams: false,
    lessonInteractiveObjects: true, lessonAudioNarration: true,
    lessonRealTimeTranscript: false, lessonProgressAutoSave: "onpause",
    lessonGlossaryPreload: false, lessonNotebookEnabled: true,
    lessonFlashcardsAnimation: false,
    encryptionLevel: "aes128", auditLogDetail: "standard", sessionTimeout: 1800,
    biometricAuth: false, deviceFingerprinting: false, contentIntegrityCheck: true,
    secureStorageEnabled: true,
    highContrastMode: false, reducedMotion: false, screenReaderOptimized: true,
    keyboardNavigationEnhanced: false, captionsEnabled: true, captionsFontSize: "medium",
    colorBlindMode: "none", focusIndicatorEnhanced: false,
    batterySaverMode: false, backgroundProcessingEnabled: false, wakeLocksEnabled: false,
    cpuThrottling: "moderate", gpuThrottling: "none", networkPollingInterval: 120,
    idleDetection: true, autoQualityReduction: true,
    performanceMonitoring: false, errorReporting: "anonymous", crashReporting: true,
    analyticsDetail: "basic", fpsMonitor: false, memoryMonitor: false, networkMonitor: false,
  },

  // ── LOW: dispositivo básico (1-2 cores, <2 GB RAM, rede lenta) ───────────────
  low: {
    videoQuality: "360p", videoFrameRate: 15, videoHardwareAcceleration: false,
    videoAutoplay: false, videoPreload: "none", videoBufferSize: "small",
    videoAdaptiveBitrate: false, videoSubtitleRendering: "basic",
    videoThumbnailQuality: "low", videoTransitionEffects: false,
    audioQuality: "low", audioBitrate: 64, audioPreloadBuffer: false,
    audioSpatial3D: false, audioEchoCancellation: false, audioNoiseSuppression: false,
    audioAutoGainControl: true, audioSampleRate: 16000, audioChannels: "mono",
    audioCompression: true,
    avatarResolution: "512", avatarFrameRate: 15, avatarLipSync: "basic",
    avatarFacialExpressions: false, avatarEyeTracking: false, avatarBodyAnimation: false,
    avatarShadows: false, avatarReflections: false, avatarAmbientOcclusion: false,
    avatarAntiAliasing: "none", avatarTextureFiltering: "nearest",
    avatarLOD: "low", avatarConcurrentCount: 1, avatarPreloadNext: false,
    arEnabled: false, arResolution: "low", arFrameRate: 15,
    arObjectTracking: "basic", arOcclusionDetection: false, arLightEstimation: false,
    arShadowCasting: false, arParticleEffects: false, arPhysicsSimulation: false,
    arMaxObjects: 2, arTextureQuality: "low", arDepthSensing: false,
    arHandTracking: false, arFaceTracking: false, arWorldMapping: false,
    realtimePronunciationAnalysis: false, pronunciationModelQuality: "tiny",
    nlpContextWindow: 512, aiResponseStreaming: false, aiCacheResponses: true,
    aiParallelRequests: 1, aiAutoCorrect: false, aiGrammarCheck: false,
    aiSentimentAnalysis: false, aiAdaptiveDifficulty: false,
    aiPersonalization: "basic", aiPredictiveText: false,
    aiTranslationQuality: "basic", aiSpeechRecognition: "local-small",
    prefetchLessons: false, prefetchCount: 0, offlineCacheSize: "100mb",
    imageResolution: "thumbnail", lazyLoadImages: true, serviceWorkerCache: true,
    cdnOptimization: true, compressionLevel: "gzip", requestTimeout: 10,
    retryAttempts: 1, backgroundSync: false, deltaUpdates: false,
    animationsEnabled: false, animationDuration: "none", particleEffects: false,
    blurEffects: false, shadowsEnabled: false, gradientRendering: "flat",
    fontRendering: "none", iconQuality: "png-1x", scrollBehavior: "instant",
    transitionEffects: false, tooltipAnimations: false, skeletonLoaders: false,
    infiniteScrollBuffer: 3, virtualListRendering: true, canvasRendering: "canvas2d",
    lessonImageQuality: "512", lessonVideoEnabled: false, lessonAnimatedDiagrams: false,
    lessonInteractiveObjects: false, lessonAudioNarration: true,
    lessonRealTimeTranscript: false, lessonProgressAutoSave: "onend",
    lessonGlossaryPreload: false, lessonNotebookEnabled: true,
    lessonFlashcardsAnimation: false,
    encryptionLevel: "basic", auditLogDetail: "minimal", sessionTimeout: 900,
    biometricAuth: false, deviceFingerprinting: false, contentIntegrityCheck: false,
    secureStorageEnabled: false,
    highContrastMode: false, reducedMotion: true, screenReaderOptimized: false,
    keyboardNavigationEnhanced: false, captionsEnabled: true, captionsFontSize: "small",
    colorBlindMode: "none", focusIndicatorEnhanced: false,
    batterySaverMode: true, backgroundProcessingEnabled: false, wakeLocksEnabled: false,
    cpuThrottling: "aggressive", gpuThrottling: "aggressive", networkPollingInterval: 300,
    idleDetection: false, autoQualityReduction: true,
    performanceMonitoring: false, errorReporting: "disabled", crashReporting: false,
    analyticsDetail: "disabled", fpsMonitor: false, memoryMonitor: false, networkMonitor: false,
  },

  // ── ECO: modo economia de bateria ou dispositivo muito limitado ───────────────
  eco: {
    videoQuality: "360p", videoFrameRate: 15, videoHardwareAcceleration: false,
    videoAutoplay: false, videoPreload: "none", videoBufferSize: "small",
    videoAdaptiveBitrate: false, videoSubtitleRendering: "basic",
    videoThumbnailQuality: "low", videoTransitionEffects: false,
    audioQuality: "low", audioBitrate: 64, audioPreloadBuffer: false,
    audioSpatial3D: false, audioEchoCancellation: false, audioNoiseSuppression: false,
    audioAutoGainControl: false, audioSampleRate: 16000, audioChannels: "mono",
    audioCompression: true,
    avatarResolution: "512", avatarFrameRate: 15, avatarLipSync: "disabled",
    avatarFacialExpressions: false, avatarEyeTracking: false, avatarBodyAnimation: false,
    avatarShadows: false, avatarReflections: false, avatarAmbientOcclusion: false,
    avatarAntiAliasing: "none", avatarTextureFiltering: "nearest",
    avatarLOD: "low", avatarConcurrentCount: 1, avatarPreloadNext: false,
    arEnabled: false, arResolution: "low", arFrameRate: 15,
    arObjectTracking: "basic", arOcclusionDetection: false, arLightEstimation: false,
    arShadowCasting: false, arParticleEffects: false, arPhysicsSimulation: false,
    arMaxObjects: 2, arTextureQuality: "low", arDepthSensing: false,
    arHandTracking: false, arFaceTracking: false, arWorldMapping: false,
    realtimePronunciationAnalysis: false, pronunciationModelQuality: "tiny",
    nlpContextWindow: 512, aiResponseStreaming: false, aiCacheResponses: true,
    aiParallelRequests: 1, aiAutoCorrect: false, aiGrammarCheck: false,
    aiSentimentAnalysis: false, aiAdaptiveDifficulty: false,
    aiPersonalization: "basic", aiPredictiveText: false,
    aiTranslationQuality: "basic", aiSpeechRecognition: "local-small",
    prefetchLessons: false, prefetchCount: 0, offlineCacheSize: "minimal",
    imageResolution: "thumbnail", lazyLoadImages: true, serviceWorkerCache: false,
    cdnOptimization: false, compressionLevel: "none", requestTimeout: 5,
    retryAttempts: 1, backgroundSync: false, deltaUpdates: false,
    animationsEnabled: false, animationDuration: "none", particleEffects: false,
    blurEffects: false, shadowsEnabled: false, gradientRendering: "flat",
    fontRendering: "none", iconQuality: "png-1x", scrollBehavior: "instant",
    transitionEffects: false, tooltipAnimations: false, skeletonLoaders: false,
    infiniteScrollBuffer: 3, virtualListRendering: false, canvasRendering: "canvas2d",
    lessonImageQuality: "512", lessonVideoEnabled: false, lessonAnimatedDiagrams: false,
    lessonInteractiveObjects: false, lessonAudioNarration: false,
    lessonRealTimeTranscript: false, lessonProgressAutoSave: "onend",
    lessonGlossaryPreload: false, lessonNotebookEnabled: false,
    lessonFlashcardsAnimation: false,
    encryptionLevel: "basic", auditLogDetail: "minimal", sessionTimeout: 900,
    biometricAuth: false, deviceFingerprinting: false, contentIntegrityCheck: false,
    secureStorageEnabled: false,
    highContrastMode: true, reducedMotion: true, screenReaderOptimized: false,
    keyboardNavigationEnhanced: false, captionsEnabled: false, captionsFontSize: "small",
    colorBlindMode: "none", focusIndicatorEnhanced: false,
    batterySaverMode: true, backgroundProcessingEnabled: false, wakeLocksEnabled: false,
    cpuThrottling: "aggressive", gpuThrottling: "aggressive", networkPollingInterval: 600,
    idleDetection: false, autoQualityReduction: true,
    performanceMonitoring: false, errorReporting: "disabled", crashReporting: false,
    analyticsDetail: "disabled", fpsMonitor: false, memoryMonitor: false, networkMonitor: false,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// DETECÇÃO DE HARDWARE
// ─────────────────────────────────────────────────────────────────────────────

export interface DeviceProfile {
  tier: PerformanceTier;
  cpuCores: number;
  ramGB: number | null;
  hasGPU: boolean;
  connectionType: string;
  connectionDownlink: number;
  isBatterySaving: boolean;
  isLowMemory: boolean;
  score: number;
  settings: PerformanceSettings;
}

function getCpuCores(): number { return navigator.hardwareConcurrency ?? 2; }

function getRamGB(): number | null {
  const mem = (navigator as any).deviceMemory;
  return typeof mem === "number" ? mem : null;
}

function getConnectionInfo(): { type: string; downlink: number } {
  const conn = (navigator as any).connection ?? (navigator as any).mozConnection ?? (navigator as any).webkitConnection;
  if (!conn) return { type: "unknown", downlink: 10 };
  return { type: conn.effectiveType ?? "unknown", downlink: conn.downlink ?? 10 };
}

function isBatterySavingMode(): boolean {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const { downlink } = getConnectionInfo();
  return isMobile && downlink < 1;
}

function hasWebGLSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch { return false; }
}

function calculateScore(cores: number, ram: number | null, downlink: number, hasGPU: boolean): number {
  let score = 0;
  score += Math.min(cores / 16, 1) * 40;
  if (ram !== null) score += Math.min(ram / 16, 1) * 30; else score += 15;
  score += Math.min(downlink / 100, 1) * 20;
  if (hasGPU) score += 10;
  return Math.round(score);
}

function scoreToTier(score: number, isBatterySaving: boolean, isLowMemory: boolean): PerformanceTier {
  if (isBatterySaving || isLowMemory) return "eco";
  if (score >= 75) return "ultra";
  if (score >= 55) return "high";
  if (score >= 35) return "medium";
  return "low";
}

// ─────────────────────────────────────────────────────────────────────────────
// API PÚBLICA
// ─────────────────────────────────────────────────────────────────────────────

let _cachedProfile: DeviceProfile | null = null;

export function detectDevicePerformance(forceRefresh = false): DeviceProfile {
  if (_cachedProfile && !forceRefresh) return _cachedProfile;

  const cores = getCpuCores();
  const ram = getRamGB();
  const { type: connectionType, downlink: connectionDownlink } = getConnectionInfo();
  const hasGPU = hasWebGLSupport();
  const batterySaving = isBatterySavingMode();
  const lowMemory = ram !== null && ram < 1;
  const score = calculateScore(cores, ram, connectionDownlink, hasGPU);
  const tier = scoreToTier(score, batterySaving, lowMemory);

  _cachedProfile = {
    tier, cpuCores: cores, ramGB: ram, hasGPU,
    connectionType, connectionDownlink,
    isBatterySaving: batterySaving, isLowMemory: lowMemory,
    score, settings: TIER_SETTINGS[tier],
  };

  try {
    localStorage.setItem("ml_device_tier", tier);
    localStorage.setItem("ml_device_score", String(score));
    localStorage.setItem("ml_device_detected_at", String(Date.now()));
  } catch { /* ignore */ }

  return _cachedProfile;
}

export function getPerformanceSettings(): PerformanceSettings {
  return detectDevicePerformance().settings;
}

export function getPerformanceTier(): PerformanceTier {
  try {
    const cached = localStorage.getItem("ml_device_tier") as PerformanceTier | null;
    const detectedAt = Number(localStorage.getItem("ml_device_detected_at") ?? 0);
    if (cached && Date.now() - detectedAt < 3600000) return cached;
  } catch { /* ignore */ }
  return detectDevicePerformance().tier;
}

export function getTierLabel(tier: PerformanceTier): string {
  return { ultra: "Ultra HD", high: "Alta Qualidade", medium: "Qualidade Padrão", low: "Economia", eco: "Modo Eco" }[tier];
}

export function getTierColor(tier: PerformanceTier): string {
  return { ultra: "#a855f7", high: "#22c55e", medium: "#3b82f6", low: "#f59e0b", eco: "#6b7280" }[tier];
}

export function overridePerformanceTier(tier: PerformanceTier): void {
  _cachedProfile = null;
  try {
    localStorage.setItem("ml_device_tier_override", tier);
    localStorage.setItem("ml_device_tier", tier);
    localStorage.setItem("ml_device_detected_at", String(Date.now()));
  } catch { /* ignore */ }
}

export const TIER_DESCRIPTIONS: Record<PerformanceTier, string> = {
  ultra:  "120 configurações no máximo: vídeo 1080p, RA completa com 20 objetos, sincronismo labial por IA, áudio lossless 320kbps, 4 requisições IA paralelas, cache ilimitado",
  high:   "Alta qualidade: vídeo 720p, RA com rastreamento facial, sincronismo labial completo, áudio 192kbps, cache 2GB, pré-carregamento de 3 lições",
  medium: "Qualidade padrão: vídeo 480p, RA básica, sincronismo labial simplificado, áudio 128kbps, cache 500MB",
  low:    "Modo economia: vídeo 360p, sem RA, áudio 64kbps mono, cache 100MB — otimizado para conexões lentas",
  eco:    "Modo Eco: consumo mínimo de CPU/bateria/rede, sem animações, sem RA, sem pré-carregamento",
};

/** Conta o total de configurações disponíveis */
export function countSettings(): number {
  return Object.keys(TIER_SETTINGS.ultra).length;
}
