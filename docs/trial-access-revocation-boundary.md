# Revogação do Acesso de Avaliação

O aplicativo agora permite encerrar de forma persistente o **acesso de avaliação ao conteúdo curricular**. A revogação grava o estado `revoked` na conta de avaliação e impede novas autorizações de lição e todas as entregas curriculares que dependem desse direito. O estado é distinto de expiração, limite de lições e assinatura ativa.

| Situação | Efeito dentro do aplicativo | Sessão OAuth externa |
|---|---|---|
| Avaliação ativa | Pode autorizar novas lições dentro dos limites de 10 lições e 14 dias | Não alterada |
| Avaliação expirada ou limitada | Não autoriza novas lições | Não alterada |
| Avaliação revogada | Não autoriza novas lições e mostra o encerramento no portão pedagógico | Não alterada |
| Assinatura ou administração ativa | Mantém direito curricular próprio | Não alterada |

> A revogação implementada é uma proteção de **acesso curricular no aplicativo**. Ela não afirma revogar, invalidar ou controlar a sessão OAuth administrada pelo provedor externo.

O fluxo não adiciona e-mail, IP, agente de usuário, conteúdo de estudo ou dados de menores. A revogação pode ser aplicada mesmo antes de a conta consumir uma lição, e a interface do portão pedagógico comunica o estado sem confundi-lo com o fim das dez lições.

## Referências de código

[1]: ../server/trial-access-router.ts "Estado revogado, bloqueio de entrega e procedimento de revogação"
[2]: ../server/trial-access-policy.ts "Fronteira entre acesso de avaliação e sessão OAuth"
[3]: ../client/src/components/LearningAccessGate.tsx "Mensagem de acesso de avaliação encerrado"
