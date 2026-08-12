import { describe, expect, it } from 'vitest';
import { FAMILY_CLIPS, FAMILY_CLIP_INSTRUCTOR } from '../client/src/components/FamilyVocabularyClips';

describe('family vocabulary clips', () => {
  it('keeps the five A1 clips paired with Ingrid’s durable teacher portrait', () => {
    expect(FAMILY_CLIPS.map((clip) => clip.id)).toEqual([
      'mother', 'father', 'brother', 'sister', 'family',
    ]);
    expect(FAMILY_CLIPS.every((clip) => clip.url.startsWith('/manus-storage/family-'))).toBe(true);
    expect(FAMILY_CLIP_INSTRUCTOR).toMatchObject({
      name: 'Professora Ingrid Larsen',
      photo: '/manus-storage/teacher-ingrid-english_b938d99a.png',
    });
  });
});
