import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const routers = readFileSync(resolve(root, 'server/routers.ts'), 'utf8');
const component = readFileSync(resolve(root, 'client/src/components/VideoCharacterChat.tsx'), 'utf8');
const characterChat = routers.slice(routers.indexOf('chatWithCharacter:'), routers.indexOf('  // Admin: Geração de Lições'));

describe('chat de personagens protegido', () => {
  it('exige sessão e filtra mensagens de entrada e saída antes de responder', () => {
    expect(characterChat).toContain('chatWithCharacter: protectedProcedure');
    expect(characterChat).not.toContain('chatWithCharacter: publicProcedure');
    expect(characterChat).toContain('await ensureConversationAccess(ctx.user.id);');
    expect(characterChat).toContain('await assessConversationText(ctx.user.id, input.userMessage, "en")');
    expect(characterChat).toContain('await assessConversationOutput(ctx.user.id, input.userMessage, aiResponse, "en")');
  });

  it('não permite envio na interface antes da sessão', () => {
    expect(component).toContain('!isAuthenticated || authLoading');
    expect(component).toContain('Entre para iniciar uma conversa segura com o personagem.');
  });
});
