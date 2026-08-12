import { describe, expect, it } from 'vitest';
import { microphoneErrorMessage, selectSupportedAudioMime } from '../client/src/lib/microphoneAccess';

describe('microphone access guidance', () => {
  it('selects a compatible recording format without requiring Opus support', () => {
    expect(selectSupportedAudioMime((mime) => mime === 'audio/webm')).toBe('audio/webm');
    expect(selectSupportedAudioMime(() => false)).toBeUndefined();
  });

  it('gives a distinct actionable message for each recoverable access state', () => {
    expect(microphoneErrorMessage({ code: 'DENIED' })).toContain('cadeado');
    expect(microphoneErrorMessage({ code: 'NOT_FOUND' })).toContain('Nenhum microfone');
    expect(microphoneErrorMessage({ code: 'BUSY' })).toContain('outro aplicativo');
  });
});
