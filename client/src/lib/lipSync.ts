/**
 * Phoneme-to-Viseme Mapping System for Realistic Lip-Sync Animation
 * 
 * Visemes are visual representations of phonemes (speech sounds).
 * This system maps phonemes to mouth shapes for realistic animation.
 */

// Standard viseme shapes (based on Disney/Pixar animation standards)
export type Viseme = 
  | 'A' // Open mouth (ah, aa)
  | 'B' // Lips together (b, p, m)
  | 'C' // Mouth slightly open (eh, ae)
  | 'D' // Tongue to teeth (th, dh)
  | 'E' // Smile/wide (ee, ih)
  | 'F' // Teeth on lip (f, v)
  | 'G' // Tongue back (k, g, ng)
  | 'H' // Relaxed/neutral (h, schwa)
  | 'X'; // Closed/rest

// Phoneme-to-Viseme mapping for English
export const phonemeToViseme: Record<string, Viseme> = {
  // Vowels
  'AA': 'A', // father
  'AE': 'C', // cat
  'AH': 'A', // cut
  'AO': 'A', // dog
  'AW': 'A', // cow
  'AY': 'C', // hide
  'EH': 'C', // bed
  'ER': 'H', // bird
  'EY': 'E', // ate
  'IH': 'E', // sit
  'IY': 'E', // see
  'OW': 'A', // go
  'OY': 'A', // boy
  'UH': 'A', // book
  'UW': 'A', // too
  
  // Consonants
  'B': 'B',  // bee
  'CH': 'E', // cheese
  'D': 'C',  // dog
  'DH': 'D', // this
  'F': 'F',  // fish
  'G': 'G',  // go
  'HH': 'H', // house
  'JH': 'E', // jump
  'K': 'G',  // cat
  'L': 'C',  // love
  'M': 'B',  // mom
  'N': 'C',  // no
  'NG': 'G', // sing
  'P': 'B',  // pop
  'R': 'H',  // red
  'S': 'E',  // see
  'SH': 'E', // shoe
  'T': 'C',  // top
  'TH': 'D', // think
  'V': 'F',  // very
  'W': 'A',  // we
  'Y': 'E',  // yes
  'Z': 'E',  // zoo
  'ZH': 'E', // measure
  
  // Silence
  'SIL': 'X',
  'SP': 'X',
};

// Simple phoneme extraction from text (approximation)
// In production, use Web Speech API or external phoneme analysis
export function textToPhonemes(text: string): string[] {
  // Simplified mapping - in production use proper phoneme analysis
  const words = text.toLowerCase().split(/\s+/);
  const phonemes: string[] = [];
  
  for (const word of words) {
    // Add silence between words
    if (phonemes.length > 0) {
      phonemes.push('SP');
    }
    
    // Simple character-to-phoneme mapping (very simplified)
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const nextChar = word[i + 1];
      
      // Consonant clusters
      if (char === 't' && nextChar === 'h') {
        phonemes.push('TH');
        i++;
      } else if (char === 's' && nextChar === 'h') {
        phonemes.push('SH');
        i++;
      } else if (char === 'c' && nextChar === 'h') {
        phonemes.push('CH');
        i++;
      } else if (char === 'n' && nextChar === 'g') {
        phonemes.push('NG');
        i++;
      }
      // Single characters
      else if (char === 'a') phonemes.push('AE');
      else if (char === 'e') phonemes.push('EH');
      else if (char === 'i') phonemes.push('IH');
      else if (char === 'o') phonemes.push('AO');
      else if (char === 'u') phonemes.push('UH');
      else if (char === 'b') phonemes.push('B');
      else if (char === 'c') phonemes.push('K');
      else if (char === 'd') phonemes.push('D');
      else if (char === 'f') phonemes.push('F');
      else if (char === 'g') phonemes.push('G');
      else if (char === 'h') phonemes.push('HH');
      else if (char === 'j') phonemes.push('JH');
      else if (char === 'k') phonemes.push('K');
      else if (char === 'l') phonemes.push('L');
      else if (char === 'm') phonemes.push('M');
      else if (char === 'n') phonemes.push('N');
      else if (char === 'p') phonemes.push('P');
      else if (char === 'r') phonemes.push('R');
      else if (char === 's') phonemes.push('S');
      else if (char === 't') phonemes.push('T');
      else if (char === 'v') phonemes.push('V');
      else if (char === 'w') phonemes.push('W');
      else if (char === 'y') phonemes.push('Y');
      else if (char === 'z') phonemes.push('Z');
    }
  }
  
  return phonemes;
}

// Convert phonemes to visemes
export function phonemesToVisemes(phonemes: string[]): Viseme[] {
  return phonemes.map(phoneme => phonemeToViseme[phoneme] || 'H');
}

// Get viseme sequence with timing for animation
export interface VisemeFrame {
  viseme: Viseme;
  startTime: number; // milliseconds
  duration: number; // milliseconds
}

export function getVisemeSequence(
  text: string,
  totalDuration: number // milliseconds
): VisemeFrame[] {
  const phonemes = textToPhonemes(text);
  const visemes = phonemesToVisemes(phonemes);
  
  // Distribute time evenly across visemes
  const frameDuration = totalDuration / visemes.length;
  
  const sequence: VisemeFrame[] = [];
  let currentTime = 0;
  
  for (const viseme of visemes) {
    sequence.push({
      viseme,
      startTime: currentTime,
      duration: frameDuration,
    });
    currentTime += frameDuration;
  }
  
  return sequence;
}

// Interpolate between visemes for smooth transitions
export function interpolateViseme(
  fromViseme: Viseme,
  toViseme: Viseme,
  progress: number // 0 to 1
): number {
  // Return blend factor for smooth transition
  // Use easeInOutCubic for natural mouth movement
  const eased = progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
  
  return eased;
}

// Get CSS transform for viseme (for image-based animation)
export function getVisemeTransform(viseme: Viseme): string {
  const transforms: Record<Viseme, string> = {
    'A': 'scale(1, 1.3)', // Open mouth vertically
    'B': 'scale(0.8, 0.6)', // Lips together
    'C': 'scale(1, 1.1)', // Slightly open
    'D': 'scale(0.9, 1)', // Tongue to teeth
    'E': 'scale(1.2, 0.9)', // Wide smile
    'F': 'scale(0.85, 0.95)', // Teeth on lip
    'G': 'scale(0.9, 1)', // Tongue back
    'H': 'scale(1, 1)', // Neutral
    'X': 'scale(0.95, 0.8)', // Closed
  };
  
  return transforms[viseme];
}
