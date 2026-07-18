/**
 * Sistema avançado de sincronização labial com movimentos naturais de cabeça
 * Usa phoneme-based lip sync + head movement para animação realista
 */

interface PhonemeFrame {
  phoneme: string;
  startTime: number;
  endTime: number;
  intensity: number; // 0-1
}

interface HeadMovement {
  type: 'nod' | 'shake' | 'tilt' | 'turn';
  startTime: number;
  duration: number;
  intensity: number; // 0-1
}

// Mapeamento de fonemas para posições de boca
const PHONEME_MOUTH_SHAPES: Record<string, { scaleX: number; scaleY: number; rotation: number }> = {
  // Vogais
  'a': { scaleX: 1.2, scaleY: 1.3, rotation: 0 },      // Boca aberta
  'e': { scaleX: 1.1, scaleY: 0.9, rotation: 0 },      // Sorriso
  'i': { scaleX: 0.8, scaleY: 0.7, rotation: 0 },      // Boca fechada com sorriso
  'o': { scaleX: 1.0, scaleY: 1.2, rotation: 0 },      // Boca redonda
  'u': { scaleX: 0.9, scaleY: 1.1, rotation: 0 },      // Boca arredondada
  
  // Consoantes labiais
  'p': { scaleX: 0.6, scaleY: 0.5, rotation: 0 },      // Lábios juntos
  'b': { scaleX: 0.6, scaleY: 0.5, rotation: 0 },      // Lábios juntos
  'm': { scaleX: 0.6, scaleY: 0.5, rotation: 0 },      // Lábios juntos
  'f': { scaleX: 0.7, scaleY: 0.6, rotation: 0 },      // Lábio inferior para frente
  'v': { scaleX: 0.7, scaleY: 0.6, rotation: 0 },      // Lábio inferior para frente
  
  // Consoantes dentais
  't': { scaleX: 0.5, scaleY: 0.4, rotation: 0 },      // Boca quase fechada
  'd': { scaleX: 0.5, scaleY: 0.4, rotation: 0 },      // Boca quase fechada
  'n': { scaleX: 0.5, scaleY: 0.4, rotation: 0 },      // Boca quase fechada
  
  // Consoantes alveolares
  's': { scaleX: 0.6, scaleY: 0.5, rotation: 0 },      // Boca levemente aberta
  'z': { scaleX: 0.6, scaleY: 0.5, rotation: 0 },      // Boca levemente aberta
  
  // Consoantes palatais
  'sh': { scaleX: 0.7, scaleY: 0.6, rotation: 0 },     // Boca arredondada
  'ch': { scaleX: 0.7, scaleY: 0.6, rotation: 0 },     // Boca arredondada
  
  // Consoantes velares
  'k': { scaleX: 0.5, scaleY: 0.4, rotation: 0 },      // Boca quase fechada
  'g': { scaleX: 0.5, scaleY: 0.4, rotation: 0 },      // Boca quase fechada
  
  // Silêncio/neutro
  'rest': { scaleX: 0.5, scaleY: 0.5, rotation: 0 },   // Posição neutra
};

/**
 * Gerar frames de phonema a partir de texto
 * Usa heurística simples para mapear caracteres a fonemas
 */
export function generatePhonemeFrames(text: string, duration: number): PhonemeFrame[] {
  const frames: PhonemeFrame[] = [];
  const textLower = text.toLowerCase().replace(/[^a-z\s]/g, '');
  const words = textLower.split(/\s+/).filter(w => w.length > 0);
  
  if (words.length === 0) return frames;
  
  const timePerWord = duration / words.length;
  let currentTime = 0;
  
  for (const word of words) {
    const timePerPhoneme = timePerWord / Math.max(word.length, 1);
    
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      let phoneme = char;
      
      // Mapear digrafos comuns
      if (i < word.length - 1) {
        const digraph = word.substring(i, i + 2);
        if (['sh', 'ch', 'th', 'ng'].includes(digraph)) {
          phoneme = digraph;
        }
      }
      
      frames.push({
        phoneme,
        startTime: currentTime,
        endTime: currentTime + timePerPhoneme,
        intensity: 0.8,
      });
      
      currentTime += timePerPhoneme;
    }
    
    // Pequena pausa entre palavras
    currentTime += timePerWord * 0.1;
  }
  
  return frames;
}

/**
 * Gerar movimentos de cabeça naturais
 * Sincronizados com o áudio
 */
export function generateHeadMovements(duration: number, intensity: number = 0.7): HeadMovement[] {
  const movements: HeadMovement[] = [];
  
  // Padrão natural de movimentos de cabeça durante fala
  const patterns = [
    { type: 'nod' as const, delay: 0.5, duration: 0.4, intensity: 0.6 },
    { type: 'tilt' as const, delay: 1.5, duration: 0.5, intensity: 0.5 },
    { type: 'nod' as const, delay: 2.8, duration: 0.4, intensity: 0.7 },
    { type: 'turn' as const, delay: 4.0, duration: 0.6, intensity: 0.4 },
    { type: 'nod' as const, delay: 5.2, duration: 0.4, intensity: 0.6 },
  ];
  
  for (const pattern of patterns) {
    if (pattern.delay < duration) {
      movements.push({
        type: pattern.type,
        startTime: pattern.delay,
        duration: Math.min(pattern.duration, duration - pattern.delay),
        intensity: pattern.intensity * intensity,
      });
    }
  }
  
  return movements;
}

/**
 * Calcular posição de boca em tempo real
 */
export function getMouthShapeAtTime(
  phonemeFrames: PhonemeFrame[],
  currentTime: number
): { scaleX: number; scaleY: number; rotation: number } {
  // Encontrar phonema atual
  const currentFrame = phonemeFrames.find(
    f => currentTime >= f.startTime && currentTime < f.endTime
  );
  
  if (!currentFrame) {
    return PHONEME_MOUTH_SHAPES['rest'];
  }
  
  const shape = PHONEME_MOUTH_SHAPES[currentFrame.phoneme] || PHONEME_MOUTH_SHAPES['rest'];
  
  // Interpolar com o próximo phonema para transição suave
  const nextFrame = phonemeFrames.find(f => f.startTime >= currentFrame.endTime);
  if (nextFrame) {
    const transitionProgress = (currentTime - currentFrame.startTime) / (currentFrame.endTime - currentFrame.startTime);
    const nextShape = PHONEME_MOUTH_SHAPES[nextFrame.phoneme] || PHONEME_MOUTH_SHAPES['rest'];
    
    if (transitionProgress > 0.7) {
      // Começar transição para próximo phonema
      const blendFactor = (transitionProgress - 0.7) / 0.3;
      return {
        scaleX: shape.scaleX + (nextShape.scaleX - shape.scaleX) * blendFactor,
        scaleY: shape.scaleY + (nextShape.scaleY - shape.scaleY) * blendFactor,
        rotation: shape.rotation + (nextShape.rotation - shape.rotation) * blendFactor,
      };
    }
  }
  
  return shape;
}

/**
 * Calcular movimento de cabeça em tempo real
 */
export function getHeadMovementAtTime(
  movements: HeadMovement[],
  currentTime: number
): { rotationX: number; rotationY: number; rotationZ: number } {
  let totalRotX = 0;
  let totalRotY = 0;
  let totalRotZ = 0;
  
  for (const movement of movements) {
    if (currentTime >= movement.startTime && currentTime < movement.startTime + movement.duration) {
      const progress = (currentTime - movement.startTime) / movement.duration;
      const easeProgress = Math.sin(progress * Math.PI); // Easing suave
      
      switch (movement.type) {
        case 'nod':
          totalRotX += easeProgress * movement.intensity * 15; // 15 graus máximo
          break;
        case 'shake':
          totalRotY += Math.sin(progress * Math.PI * 2) * movement.intensity * 20; // 20 graus
          break;
        case 'tilt':
          totalRotZ += easeProgress * movement.intensity * 10; // 10 graus
          break;
        case 'turn':
          totalRotY += easeProgress * movement.intensity * 25; // 25 graus
          break;
      }
    }
  }
  
  return {
    rotationX: totalRotX,
    rotationY: totalRotY,
    rotationZ: totalRotZ,
  };
}

/**
 * Aplicar animações ao elemento da imagem do professor
 */
export function applyAnimationsToTeacher(
  imageElement: HTMLImageElement | null,
  phonemeFrames: PhonemeFrame[],
  headMovements: HeadMovement[],
  currentTime: number
) {
  if (!imageElement) return;
  
  const mouthShape = getMouthShapeAtTime(phonemeFrames, currentTime);
  const headMovement = getHeadMovementAtTime(headMovements, currentTime);
  
  // Aplicar transformações CSS
  const transform = `
    perspective(1000px)
    rotateX(${headMovement.rotationX}deg)
    rotateY(${headMovement.rotationY}deg)
    rotateZ(${headMovement.rotationZ}deg)
    scaleX(${mouthShape.scaleX})
    scaleY(${mouthShape.scaleY})
  `;
  
  imageElement.style.transform = transform;
  imageElement.style.transition = 'transform 0.05s ease-out'; // Transição suave
}

/**
 * Sincronizar animação com áudio
 * Retorna função de cleanup
 */
export function syncAnimationsWithAudio(
  audioElement: HTMLAudioElement,
  imageElement: HTMLImageElement | null,
  text: string
): () => void {
  const duration = audioElement.duration || 5; // Fallback
  const phonemeFrames = generatePhonemeFrames(text, duration);
  const headMovements = generateHeadMovements(duration, 0.8);
  
  let animationFrameId: number;
  
  const animate = () => {
    const currentTime = audioElement.currentTime;
    applyAnimationsToTeacher(imageElement, phonemeFrames, headMovements, currentTime);
    
    if (!audioElement.paused) {
      animationFrameId = requestAnimationFrame(animate);
    }
  };
  
  // Iniciar animação quando áudio começar
  audioElement.addEventListener('play', () => {
    animationFrameId = requestAnimationFrame(animate);
  });
  
  // Parar animação quando áudio pausar
  audioElement.addEventListener('pause', () => {
    cancelAnimationFrame(animationFrameId);
  });
  
  // Retornar função de cleanup
  return () => {
    cancelAnimationFrame(animationFrameId);
    audioElement.removeEventListener('play', animate);
    audioElement.removeEventListener('pause', animate);
  };
}
