import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const schema = readFileSync(resolve(root, 'drizzle/schema.ts'), 'utf8');
const parentalRouter = readFileSync(resolve(root, 'server/parental-control-router.ts'), 'utf8');
const safetyGate = readFileSync(resolve(root, 'server/conversationSafetyGate.ts'), 'utf8');
const panel = readFileSync(resolve(root, 'client/src/pages/ParentalControlPanel.tsx'), 'utf8');

describe('child profile parental consent', () => {
  it('persists explicit consent with a false-safe default', () => {
    expect(schema).toContain('parentalConsentGiven: boolean("parentalConsentGiven").default(false).notNull()');
    expect(schema).toContain('parentalConsentAt: timestamp("parentalConsentAt")');
  });

  it('requires explicit consent when creating and linking a child profile', () => {
    expect(parentalRouter).toContain('parentalConsent: z.literal(true)');
    expect(parentalRouter).toContain('parentalConsentGiven: true');
    expect(parentalRouter).toContain('Confirme o consentimento do responsável antes de vincular este perfil.');
  });

  it('blocks linked child conversations without recorded profile consent', () => {
    expect(safetyGate).toContain('if (!child.parentalConsentGiven)');
    expect(safetyGate).toContain('consentimento explícito do responsável');
  });

  it('requires a guardian confirmation in the child-profile form', () => {
    expect(panel).toContain('newChildConsent');
    expect(panel).toContain('parentalConsent: true');
    expect(panel).toContain('child-parental-consent');
  });
});
