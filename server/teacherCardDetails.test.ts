import { describe, expect, it } from 'vitest';
import { getTeacherCardDetails } from '../client/src/lib/teacherCardDetails';

describe('teacher card regional guidance', () => {
  it('identifies James with British English and a native male voice', () => {
    expect(getTeacherCardDetails({ voiceLanguageCode: 'en-GB', gender: 'male' }, 'en-US')).toMatchObject({
      regionalLabel: 'Inglês britânico',
      nativeVoiceLabel: 'Voz masculina nativa',
    });
  });

  it('identifies Sarah with American English and a native female voice', () => {
    expect(getTeacherCardDetails({ voiceLanguageCode: 'en-US', gender: 'female' }, 'en-US')).toMatchObject({
      regionalLabel: 'Inglês americano',
      nativeVoiceLabel: 'Voz feminina nativa',
    });
  });
});
