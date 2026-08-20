# Auditoria da Integração Manus no GitHub — 19/08/2026

## Evidências encontradas

| Item | Evidência verificada | Situação |
|---|---|---|
| Aplicativo instalado | A conta `villar01` possui a instalação `manus-connector`. | Instalado. |
| Repositórios vinculados | `desktop-tutorial`, `mudificao_app`, `multilingue_universal_ia` e `multilingue-universal-continuity`. | Seleção limitada a esses quatro repositórios. |
| Workflows GitHub Actions | Os três repositórios com conteúdo não possuem diretório `.github/workflows`; o repositório `mudificao_app` está vazio. | Não há workflow de IA agendado ou acionável encontrado. |
| Execuções de Actions | A conta usada para diagnóstico recebe `403` ao consultar Actions. | Não há evidência de execução de workflow; o acesso de Actions não foi concedido à integração consultada. |
| Permissões do aplicativo Manus | A instalação possui permissões de conteúdo, administração, pull requests, issues e metadados, mas não declara permissão de Actions. | O aplicativo pode operar sobre repositórios, mas não é um executor de IA automática pelo GitHub. |

## Conclusão objetiva

O serviço que aparece como Manus no GitHub **existe e está instalado**, mas não há workflow de IA, tarefa agendada ou execução automática identificável nos repositórios selecionados. Portanto, ele não deve ser apresentado como uma IA ativa corrigindo o aplicativo. A instalação atual é uma integração de repositório; para executar automação no GitHub seria necessário existir um workflow específico e permissões de Actions compatíveis, ambos ausentes na auditoria.

A documentação oficial descreve a integração GitHub como sincronização bidirecional de código e gestão de repositórios, *issues*, *pull requests* e projetos. Ela não descreve uma IA que revise ou corrija o aplicativo automaticamente dentro do GitHub sem que uma tarefa Manus seja solicitada. A integração está correta como continuidade do código, mas não substitui uma revisão independente nem cria um serviço autônomo de qualidade.

## Regra para ativação futura

Nenhum workflow será criado ou ativado antes de verificar: finalidade concreta, permissões mínimas, ausência de cobrança não autorizada, execução de teste e registro de resultado. O aplicativo Manus no GitHub permanece instalado, porém não é considerado uma IA de revisão ativa.

## Fonte oficial

[GitHub Integration — Manus Documentation](https://manus.im/docs/website-builder/github-integration)
