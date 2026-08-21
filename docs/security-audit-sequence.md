# Auditoria Sequencial de Segurança

Esta auditoria consolida controles verificáveis no aplicativo. Ela não declara segurança absoluta e não infere proteções da rede do provedor sem evidência externa.

| Etapa | Achado e evidência | Correção verificada | Limite técnico declarado |
|---|---|---|---|
| Rotas de aprendizagem | Rotas de lição, Pareto, cartilha, cenas e práticas precisam de barreira antes do fallback público. | Portão HTTP e `protectedProcedure` retornam 401/403; regressões auditam as rotas pedagógicas. | Um usuário autorizado pode visualizar o material liberado. |
| Aceite e parentalidade | Conteúdo não pode alcançar conta sem aceite, nem menor com consentimento revogado. | Integração bloqueia os dois casos antes de avaliação e conteúdo. | A veracidade da idade ou do vínculo não é provada por coleta excessiva. |
| Avaliação gratuita | Contas precisam de limite temporal e quantitativo. | 10 lições ou 14 dias; a 11ª lição é bloqueada. | Não substitui decisão comercial posterior autorizada. |
| Endpoints e conversa | Continuação de conversa por voz não pode processar dados antes do direito curricular. | Guarda executa antes de modelo, filtro ou registro; fallback offline não é usado em 401/403. | Fallback técnico local só ocorre após autorização e não substitui auditoria do modelo. |
| Abuso e registros | A aplicação precisa conter excesso de chamadas sem formar perfil técnico. | Limitação proporcional usa chaves pseudonimizadas temporárias; resumo administrativo é agregado. | Não elimina ataques de rede fora do aplicativo. |
| Navegador e conteúdo | Catálogo público não pode levar currículo e navegador precisa de cabeçalhos restritivos. | CSP, HSTS, referência, permissões e regressão de fronteira curricular estão ativos. | Captura de tela por usuário autorizado não é tecnicamente eliminável. |
| Dados pessoais | Aceite de termos não precisa de selfie, IP ou agente de usuário. | Regressão confirma somente confirmações necessárias; etapa usa o nome privacidade. | Inventário completo de todos os dados e acessos administrativos continua uma tarefa separada. |
| Automação e infraestrutura | Diagnóstico não pode alterar produção; controles de hospedagem não podem ser presumidos. | Propostas permanecem auditáveis; documentação separa aplicação e provedor. | Garantias de rede e disponibilidade dependem do provedor. |

> Próximas revisões devem registrar somente nova evidência, correção correspondente e limite residual. Não devem reabrir controles já aprovados sem alteração material ou nova evidência de risco.
