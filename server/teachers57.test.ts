import { describe, expect, it } from 'vitest';
import { TEACHERS_57 } from '../client/src/data/teachers57';

describe('English teacher catalog', () => {
  it('keeps gender and durable professional portrait metadata for Sarah and James', () => {
    const sarah = TEACHERS_57.find((teacher) => teacher.id === 'prof-en-us');
    const james = TEACHERS_57.find((teacher) => teacher.id === 'prof-en-gb');

    expect(sarah).toMatchObject({
      gender: 'female',
      photo: '/manus-storage/teacher-sarah-mitchell_91c289f4.png',
    });
    expect(james).toMatchObject({
      gender: 'male',
      photo: '/manus-storage/teacher-james-williams-v2_6511d727.png',
    });
  });
});
