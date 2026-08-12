import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onLipSyncAmplitude, stopEdgeTTS } from '../client/src/lib/edgeTTSClient';

describe('Edge TTS lip-sync lifecycle', () => {
  const originalWindow = globalThis.window;
  const cancel = vi.fn();

  beforeEach(() => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { speechSynthesis: { cancel } },
    });
  });

  afterEach(() => {
    onLipSyncAmplitude(null);
    cancel.mockReset();
    Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
  });

  it('clears the live mouth amplitude when speech is stopped', () => {
    const amplitudes: number[] = [];
    onLipSyncAmplitude((amplitude) => amplitudes.push(amplitude));

    stopEdgeTTS();

    expect(amplitudes).toEqual([0]);
    expect(cancel).toHaveBeenCalledOnce();
  });
});
