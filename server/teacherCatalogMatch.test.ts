import { describe, expect, it } from 'vitest';
import { TEACHERS_57 } from '../client/src/data/teachers57';
import { matchTeacherCatalog } from '../client/src/lib/teacherCatalogMatch';

describe('regional teacher catalog matching', () => {
  it('matches James to en-GB before falling back to generic English', () => {
    const james = matchTeacherCatalog(TEACHERS_57, { voiceLanguageCode: 'en-GB', gender: 'male' });
    expect(james).toMatchObject({
      id: 'prof-en-gb',
      name: 'Teacher James Williams',
      gender: 'male',
      specialty: 'Literature & formal English',
    });
  });

  it('keeps Sarah associated with her en-US profile', () => {
    const sarah = matchTeacherCatalog(TEACHERS_57, { voiceLanguageCode: 'en-US', gender: 'female' });
    expect(sarah).toMatchObject({ id: 'prof-en-us', name: 'Teacher Sarah Mitchell', gender: 'female' });
  });
});
