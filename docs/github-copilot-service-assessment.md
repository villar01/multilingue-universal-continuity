# Serviço de IA do GitHub — Avaliação Inicial

## Serviço identificado

O serviço de IA compatível com a descrição fornecida é o **GitHub Copilot**. A documentação oficial confirma a existência do **Copilot Free** para pessoas físicas elegíveis, sem cartão de crédito, com uso limitado de sugestões e chat. Ele pode auxiliar desenvolvimento, análise de código e tarefas dentro do ambiente GitHub ou de editores compatíveis.

| Aspecto | Estado confirmado |
|---|---|
| Serviço de IA no GitHub | GitHub Copilot existe. |
| Modalidade sem cobrança | Copilot Free existe para desenvolvedores individuais elegíveis. |
| Uso pretendido no MultiLingue | Apoio externo à revisão de código e análise de tarefas, nunca substituição de testes, validação pedagógica ou decisão humana. |
| Estado da conta `villar01` | Ainda não confirmado: a consulta técnica não expôs a elegibilidade da conta e a página pessoal de Copilot precisa ser verificada visualmente. |
| Ação feita | Nenhuma assinatura, teste, pagamento ou ativação foi executado. |

## Evidência de uso real

Em 20/08/2026, a página autenticada do GitHub confirmou visualmente o selo **Copilot Free**, a disponibilidade de créditos incluídos e uso inicial de 0%. Em seguida, foi realizado um pedido de leitura sem alteração para listar os arquivos principais de `villar01/multilingue-universal-continuity`. O Copilot respondeu com a estrutura do repositório, incluindo `server/routers.ts`, `server/_core`, `drizzle/schema.ts`, `client/src`, `package.json` e `README.md`.

Não houve criação de *issue*, *branch*, *commit*, *pull request*, alteração de arquivo, upgrade ou cobrança. Isso comprova acesso externo de leitura ao repositório e disponibilidade real do Copilot Free; ainda não comprova uma revisão técnica completa.

## Primeira revisão externa

Foi solicitada uma revisão somente de leitura sobre a exposição de conteúdo curricular a visitantes sem cadastro. O Copilot analisou a camada de autenticação, `protectedProcedure`, middleware HTTP, limites de acesso, consentimento parental e rotas de conteúdo. A resposta informou que não encontrou exposição curricular anônima e apontou apenas uma rota pública de dicionário como risco menor para conferência.

O resultado é um parecer externo, não uma substituição de regressões. A cópia GitHub examinada está defasada em relação à versão local mais recente; portanto, qualquer achado deve ser comparado com a suíte local antes de ser aceito como diagnóstico definitivo.

### Comparação com a versão local

A regressão local `server/curriculumAnonymousAccess.test.ts` foi executada após a revisão externa e foi aprovada. Ela confirma que chamadas diretas de visitante são recusadas antes da entrega de qualquer material curricular. Assim, o parecer externo e a verificação local concordam no ponto analisado, sem necessidade de alteração de código.

## Limite importante

Copilot Free é um apoio de desenvolvimento com uso limitado. A utilização dele não cria, por si só, uma rotina autônoma de correção do aplicativo. Para ser considerado parte real do fluxo, deve ser aberto na conta, ter seu estado confirmado e realizar uma revisão de teste com resultado verificável.

## Fontes oficiais

1. [Plans for GitHub Copilot](https://docs.github.com/en/copilot/get-started/plans)
2. [GitHub Copilot Plans](https://github.com/features/copilot/plans)
