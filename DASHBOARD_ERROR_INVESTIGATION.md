# Investigação dos erros do Dashboard — 30/07/2026

## Causa raiz confirmada

### Erro 1 (confirmado): Health check 404
- **Arquivo:** `client/src/hooks/useConnectionQuality.ts`
- **Problema:** O hook chamava `fetch('/api/trpc/health', { method: 'HEAD' })` — rota inexistente (404)
- **Correção aplicada:** Substituído por `fetch(getConnectionHealthUrl(Date.now()))` que usa `/api/trpc/system.health?input=...` (rota tRPC existente)
- **Teste de regressão:** `server/connectionQuality.test.ts` — PASSA (1/1)
- **Validação no navegador:** 8 requisições health, todas 200 OK, zero requisições legacy

### "Erro 2" (esclarecido): Era o mesmo health check disparado duas vezes
- O React 19 StrictMode em desenvolvimento executa `useEffect` duas vezes no mount
- O hook `useConnectionQuality` é usado pelo `OfflineStatusBar` que renderiza no Dashboard
- Cada execução chamava `/api/trpc/health` (404) → 2 erros no badge do Vite overlay
- **Conclusão:** O contador "2 errors" vinha de **uma única causa raiz** (health 404) disparada duas vezes pelo StrictMode
- Após a correção, o badge desaparece (confirmado por screenshot)

## Testes pré-existentes que falham (NÃO causados pela correção)

8 testes em `server/progress.test.ts` e `server/lessons.list.test.ts` falham porque:
- A tabela `lessons` está **vazia** (0 registros) neste projeto copiado
- Os testes tentam inserir em `completedLessons` com `lessonId = 390001` que não existe
- Erro: `ER_NO_REFERENCED_ROW_2` (foreign key constraint fails)
- **Estes testes já falhavam antes da correção do health check** — são um problema de dados, não de código

## Estado atual
- **TypeScript:** Zero erros (`pnpm check` passa)
- **Teste de regressão do health check:** PASSA
- **Teste do MasterLesson (teacherGender):** PASSA (4/4)
- **Testes de voz TTS (Edge TTS):** PASSAM (18/18)
- **Dashboard no preview:** Sem badge de erro, health checks 200 OK
- **Checkpoints de segurança:** `f0f31d11` (antes de tudo) → `797c51fe` (após correções de voz) → próximo checkpoint após este
