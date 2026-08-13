import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const schema = readFileSync(resolve(root, 'drizzle/schema.ts'), 'utf8');
const router = readFileSync(resolve(root, 'server/parental-control-router.ts'), 'utf8');
const gate = readFileSync(resolve(root, 'server/conversationSafetyGate.ts'), 'utf8');
const panel = readFileSync(resolve(root, 'client/src/pages/ParentalControlPanel.tsx'), 'utf8');

describe('controle parental de conversas por IA', () => {
  it('mantém conversas infantis por IA desativadas por padrão e permite ajuste explícito do responsável', () => {
    expect(schema).toContain('aiConversationsEnabled: boolean("aiConversationsEnabled").default(false).notNull()');
    expect(router).toContain('aiConversationsEnabled: false');
    expect(router).toContain('aiConversationsEnabled: z.boolean().optional()');
    expect(router).toContain('input.aiConversationsEnabled !== undefined');
  });

  it('bloqueia conversas infantis desativadas e disponibiliza o controle no painel', () => {
    expect(gate).toContain('if (!settings.aiConversationsEnabled)');
    expect(gate).toContain('ai_conversations_disabled');
    expect(panel).toContain('Liberar conversas supervisionadas');
    expect(panel).toContain('aiConversationsEnabled,');
  });
});
