# Manifesto Permanente de Controle do MultiLingue Universal

Este manifesto é a referência de continuidade do projeto. Toda revisão externa de código deve começar por este documento, pelo `todo.md` e pelas regressões relacionadas. Ele não substitui testes nem aprovações humanas; transforma requisitos permanentes em itens verificáveis.

## Controles que não podem ser removidos por conveniência

| Área | Regra permanente | Evidência esperada |
|---|---|---|
| Conteúdo | Visitantes não recebem currículo, progresso, respostas ou material protegido. | Procedimentos protegidos e regressões de acesso anônimo. |
| Professores | Fotos originais preservadas; professor sempre visível em cenas. | Catálogo e regressões de mídia docente. |
| Voz e movimento | James usa voz masculina en-US; Ricardo permanece com boca estática; movimento lateral somente em `audio.onplaying`; `showSyntheticMouth` permanece `false`. | Contratos de voz, mídia e sincronismo. |
| Livro SOS | Sequência do original, correções documentadas, áudio nativo e Pareto separado. | Inventário, matriz de correção e testes curriculares. |
| Áudio do Caderno | Cada palavra salva precisa tocar no clique explícito, com rota própria separada da Cena. | Regressão do Caderno e validação funcional. |
| Progressão pedagógica | O percurso preserva níveis inicial, intermediário, avançado e tecnológico; cada interação segue conceito, prática guiada, resposta, correção e aplicação crescente. | Contrato de progressão de interação e regressões de nível. |
| Continuidade | Uma falha local não pode derrubar a aplicação inteira. | Fronteiras de recuperação, limite por origem e validação de rota. |
| Configurações validadas | Correções aprovadas de áudio, professor, mídia, rota e proteção não podem ser removidas por alteração posterior sem regressão que prove a equivalência. | `todo.md`, contratos centralizados, histórico de checkpoints e testes de regressão. |
| Desempenho | Não manter processos duplicados, evitar carga desnecessária e validar regressões de lentidão. | Auditoria de processos, logs e testes antes de cada marco. |
| Comercial | Vendedor assistido pode explicar serviços, qualificar interesse e preparar rascunhos; não publica campanha, não muda preço, não concede desconto, não cobra e não assina contrato sem aprovação. | `salesAssistantPolicy.ts` e testes correspondentes. |
| Dados de clientes | Conversas, opiniões, contatos e métricas comerciais são privadas e revisáveis pelo proprietário. | Procedimentos autenticados, permissão administrativa e tabelas privadas. |
| Decisão do proprietário | Alertas e relatórios trazem contexto, prioridade, impacto e recomendação; toda ação comercial, de segurança crítica ou de alteração de produto continua dependendo da decisão explícita do proprietário. | Painel privado, trilha de auditoria e procedimentos administrativos protegidos. |
| Comunicação de segurança | A comunicação pública informa proteção de acesso, privacidade, monitoramento e continuidade; não divulga ferramentas, limiares, rotas, regras de bloqueio, eventos ou outros detalhes operacionais. | Textos públicos revisados e ausência de dados defensivos em páginas e APIs públicas. |

## Ordem de decisão

1. Corrigir primeiro a falha reproduzida que afeta uso, segurança ou continuidade.
2. Preferir a opção interna, gratuita e com menos dependências externas.
3. Implementar diretamente mudanças seguras e reversíveis com regressão.
4. Exigir aprovação explícita antes de qualquer publicação externa, gasto, alteração de preço, desconto, cobrança, contrato ou exportação de dado sensível.
5. Publicar um checkpoint somente depois de testes e verificação funcional compatíveis com o escopo.

## Plano preservado para o futuro

O aplicativo começa com recursos internos gratuitos e estáveis. Após monetização comprovada, a evolução poderá avaliar GPU, mídia docente adicional e animações reais por fala, sem transformar esse hardware em requisito para estudo, áudio básico, segurança ou acesso de clientes.

## Como usar em revisões externas

## Segurança e Continuidade Permanente (nunca remover)

| Área | Regra permanente | Evidência esperada |
|---|---|---|
| Anti-hacker | Rate limiting por IP, bloqueio automático após tentativas suspeitas, alerta imediato ao proprietário via notificação. | `securityMiddleware.ts`, logs de segurança e testes de limite. |
| Dados de clientes | Senhas com hash bcrypt, tokens JWT de curta duração, dados pessoais nunca expostos em logs ou respostas de erro. | Auditoria de rotas, testes de acesso anônimo e inventário de dados. |
| Zero downtime | Atualizações assumem o controle sem forçar recarga durante cenas ou lições ativas. Service worker v12+ com SKIP_WAITING e sem recarga automática. | `registerSW.ts` e regressões de navegação. |
| Redundância de IA | A cadeia prioriza Ollama/Qwen 2.5 e LM Studio somente após verificação real de disponibilidade; o fallback integrado é usado quando provedores locais não respondem. Nenhum provedor local é anunciado como ativo sem verificação. | Roteador de provedores, sinais de saúde e testes de fallback. |
| Backup de código | GitHub atualizado após cada marco importante. Push final obrigatório próximo ao dia 25/08 para capturar o máximo de melhorias. | Histórico de commits e confirmação de push. |

## Serviços Automáticos de Qualidade (diferencial comercial)

| Serviço | Descrição | Frequência |
|---|---|---|
| Verificação de cenas | Checar se todas as 29 cenas têm diálogo, hotspots e professor correto. | A cada deploy |
| Verificação de áudio | Confirmar que fontes de áudio são válidas e não produzem player 0:00. | A cada deploy |
| Verificação de professores | Confirmar que James (en-US masculino) e Ingrid estão nas cenas corretas. | A cada deploy |
| Alerta de ataque | Detectar picos anômalos de requisições e notificar o proprietário imediatamente. | Contínuo |
| Feedback de clientes | Canal discreto em todas as telas para sugestões e problemas, com painel privado para o proprietário revisar. | Contínuo |

## Feedback e Melhoria Contínua

- Clientes podem enviar feedback diretamente de qualquer tela do app
- O proprietário recebe notificação de feedbacks críticos
- Feedbacks são armazenados de forma privada e revisáveis apenas pelo proprietário
- Sugestões de melhoria são registradas como itens no `todo.md` após aprovação do proprietário
- O sistema nunca usa feedback de clientes para alterar preços, planos ou conteúdo sem aprovação explícita

## Relatórios para decisão e tranquilidade do proprietário

Os relatórios privados reúnem incidentes de segurança, disponibilidade, qualidade das cenas, áudio, matriz docente, uso e feedbacks. Cada item deve indicar prioridade, impacto observável, recomendação reversível e a aprovação necessária. O sistema pode detectar, organizar e sugerir; não toma decisões comerciais, não altera preços e não executa medidas irreversíveis sem autorização explícita do proprietário.

## Preços aprovados (não alterar sem aprovação explícita)

| Plano | Valor | Equivalente mensal |
|---|---|---|
| Mensal | R$59,90/mês | R$59,90 |
| Anual | R$549,90/ano | R$45,83/mês |
| 18 meses | R$998,90 | R$55,49/mês |

## Como usar em revisões externas

Qualquer revisão de GitHub deve verificar, sem alterar arquivos automaticamente:

- se uma mudança viola alguma regra permanente desta tabela;
- se o `todo.md` possui a tarefa correspondente;
- se há teste de regressão para o comportamento crítico;
- se a mudança tenta automatizar uma ação comercial ou externa que exige aprovação.
