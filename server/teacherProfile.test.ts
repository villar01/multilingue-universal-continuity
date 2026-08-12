import { describe, expect, it } from 'vitest';
import { enrichTeacherProfile } from '../client/src/lib/teacherProfile';

describe('lesson teacher profile enrichment', () => {
  it('keeps James on his canonical male British profile in lesson sections', () => {
    const profile = enrichTeacherProfile({
      id: 99,
      name: 'Teacher James Williams',
      gender: 'male',
      voice_language_code: 'en-GB',
    });

    expect(profile).toMatchObject({
      photoUrl: '/manus-storage/teacher-james-williams-v2_6511d727.png',
      gender: 'male',
      specialty: 'Literature & formal English',
      origin: 'London, UK',
      voiceLanguageCode: 'en-GB',
    });
  });
});
