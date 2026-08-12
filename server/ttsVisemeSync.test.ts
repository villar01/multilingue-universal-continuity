import { describe, expect, it } from 'vitest';
import { ADVANCED_VISEME_MAP, extractPhonemesWithTiming } from '../client/src/lib/tts-viseme-sync';

describe('audio-clock viseme mouth poses', () => {
  it('keeps visibly distinct open, rounded, closed, teeth, and tongue mouth signals', () => {
    expect(ADVANCED_VISEME_MAP.A.mouthHeight).toBeGreaterThan(ADVANCED_VISEME_MAP.B.mouthHeight);
    expect(ADVANCED_VISEME_MAP.U.lipRound).toBeGreaterThan(ADVANCED_VISEME_MAP.A.lipRound);
    expect(ADVANCED_VISEME_MAP.E.mouthWidth).toBeGreaterThan(ADVANCED_VISEME_MAP.U.mouthWidth);
    expect(ADVANCED_VISEME_MAP.T.tongueVisible).toBe(true);
    expect(ADVANCED_VISEME_MAP.B.tongueVisible).toBe(false);
  });

  it('generates the corresponding timed sequence from spoken text', () => {
    const sequence = extractPhonemesWithTiming('a e u tom');
    expect(sequence.map((entry) => entry.phoneme)).toEqual(expect.arrayContaining(['A', 'E', 'U', 'T', 'O', 'M']));
    expect(sequence.every((entry) => entry.duration > 0)).toBe(true);
  });
});
