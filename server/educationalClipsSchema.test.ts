import { describe, expect, it } from 'vitest';
import { educationalClips } from '../drizzle/schema';

describe('educational clip schema', () => {
  it('includes typed instructor attribution fields for the clip library', () => {
    expect(educationalClips.instructorName.name).toBe('instructorName');
    expect(educationalClips.instructorPhotoUrl.name).toBe('instructorPhotoUrl');
  });
});
