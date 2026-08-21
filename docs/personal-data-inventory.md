# Inventário de Dados Pessoais e Superfícies de Acesso

**Escopo da verificação:** código e esquema do aplicativo MultiLingue Universal, revisados em 21 de agosto de 2026. Este documento registra o que foi localizado no repositório, os controles observados e os limites da revisão. Ele **não declara inexistência de incidente**, nem substitui análise de dados efetivamente existentes no banco, nos registros do provedor de hospedagem ou em serviços externos.

> A conclusão desta revisão é limitada ao código analisado: não foi identificada uma rota administrativa ativa de exportação de conversas com conteúdo integral após as correções desta sequência. Isso não equivale a comprovação de que nunca houve acesso indevido, cópia externa ou retenção fora do aplicativo.

## Dados de conta e de aprendizagem

A tabela de usuários contém o identificador de autenticação, nome e e-mail retornados pelo provedor de login, além de preferências de idioma, metas de estudo, progresso, preferências de professor, tipo de assinatura e datas de acesso. Esses dados servem à identificação da conta e à continuidade pedagógica; o inventário não encontrou justificativa para expô-los nas telas públicas. [1]

| Categoria | Campos/elementos localizados | Armazenamento e acesso observado | Controle e limite atual |
|---|---|---|---|
| Identidade de conta | `openId`, `name`, `email`, papel de usuário | Tabela `users` | A autenticação é construída no contexto protegido. Esta revisão não revalidou cada procedimento que retorna perfis. [1] |
| Preferências e progresso | Idioma nativo, idioma alvo, metas, XP, sequência, nível, professor preferido | Tabela `users` e estruturas pedagógicas relacionadas | São dados vinculáveis ao aluno; devem permanecer fora de exportações administrativas gerais. [1] |
| Conteúdo de conversação | Mensagem do aluno, resposta e resposta original da IA | Esquema `conversation_logs` | Conteúdo integral continua sendo um dado potencialmente sensível no armazenamento. A listagem e a exportação administrativas foram reduzidas a metadados nesta sequência. [2] [3] |

## Menores e consentimento parental

O consentimento parental recebe nome do responsável e vínculo como dados necessários para o registro. Documento e e-mail são opcionais na validação de entrada. A inserção de consentimento analisada não envia IP nem agente de usuário, embora essas colunas ainda existam no esquema histórico; não se deve concluir, apenas pela existência dessas colunas, que tais valores estejam sendo gravados nesse fluxo. [4] [5]

| Elemento | Situação observada | Retenção/controle verificável |
|---|---|---|
| Nome e vínculo do responsável | Obrigatórios na rota de consentimento | Permanecem necessários ao registro de autorização; não há prazo de exclusão implementado nesta revisão. [4] |
| Documento e e-mail do responsável | Opcionais | A rotina de retenção apaga os dois campos após 30 dias de revogação ou inatividade, preservando apenas o estado e as confirmações necessários ao portão de acesso. [6] |
| Idade do menor e confirmações | Coletadas para o consentimento | Limitadas ao intervalo de 5 a 17 anos e usadas para os indicadores de autorização. [4] |
| IP e agente de usuário | Colunas presentes em `parental_consents`, mas ausentes da inserção revisada | Permanecem como superfície de esquema a reavaliar em migração futura; a rota de aceite de termos já possui regressão contra coleta desses campos. [5] [7] |

As notificações de consentimento destinadas ao proprietário são deliberadamente não identificadoras e não incluem nome, contato ou documento do responsável. [8]

## Moderação, exportações e acessos administrativos

Os dados de moderação exigem cautela adicional porque mensagens podem conter dados pessoais introduzidos livremente pelo aluno. Foram aplicadas três barreiras verificáveis. A exportação CSV contém somente horário, classificação de violação, faixa etária, score e indicadores de bloqueio ou reformulação. O resumo de registros recentes omite identificadores, país, religião e conteúdo. Os alertas pendentes também omitem o conteúdo detectado e o identificador do aluno, mantendo apenas a classificação e o estado necessários à revisão. [3] [9] [10]

| Superfície administrativa | Dados disponíveis após a revisão | Dados bloqueados no contrato/interface |
|---|---|---|
| Exportação CSV de moderação | Horário, tipo/severidade de violação, faixa etária, score, bloqueio e reformulação | ID, identificador de usuário, país, religião, mensagens, respostas e conteúdo detectado. [3] |
| Resumo de registros recentes | Tipo de interação, faixa etária, score, status e horário | ID do aluno, mensagens, respostas, país, religião e resposta original. [9] |
| Alertas pendentes | Identificador técnico do alerta, tipo, severidade, status, ação e horário | ID do aluno, conteúdo detectado, regras detalhadas e notas de revisão. [10] |
| Atendimento ao cliente | Assunto e mensagens são armazenados em estruturas próprias de suporte | Mensagens de suporte não fazem parte de exportações de moderação; o fluxo administrativo permanece uma superfície separada para auditoria específica. [11] |

## Registros técnicos, telemetria e configurações

O agente de usuário é usado em memória para detecção de automação no contexto de requisição e no middleware de segurança. Um módulo de monitoramento legado possui capacidade de gravar IP e agente de usuário, mas a busca de consumidores no servidor não localizou uma chamada ativa desse módulo fora dele próprio. Esse resultado é evidência de ausência de consumidor no código pesquisado, não prova de que o banco não possua registros legados. [12] [13]

| Área | Evidência encontrada | Limite/ação necessária |
|---|---|---|
| Detecção de bots | Leitura do cabeçalho `user-agent` para classificar a requisição | Há saída de aviso técnico para agentes detectados; a retenção dessa saída depende da infraestrutura de hospedagem. [12] |
| Monitoramento de segurança | Módulo capaz de receber IP e agente de usuário | Não há consumidor ativo localizado nesta revisão. Qualquer reativação deve justificar a coleta, limitar retenção e incluir regressão. [13] |
| Configuração e segredos | Variáveis de ambiente e conectores são usados fora do código-fonte versionado | Valores de segredos não foram lidos nem registrados neste inventário. A proteção de logs, backups e acesso no provedor é uma responsabilidade de infraestrutura. |

## Conclusões e próximos controles

As correções desta sequência reduzem a exposição administrativa rotineira de conteúdo de conversas. Elas não removem automaticamente conteúdo já persistido em `conversation_logs`, não alteram as políticas de retenção de suporte e não verificam cópias, backups ou logs do provedor. A execução futura deve separar cada uma dessas frentes, com critérios de retenção, autorização e exclusão testáveis, antes de declarar qualquer conformidade abrangente.

Em especial, permanece recomendada uma revisão do desenho de retenção de mensagens de conversa, das colunas técnicas não utilizadas no esquema parental e da rota de comunicação de suporte. Nenhuma dessas pendências deve ser interpretada como evidência de vazamento; elas são limites explícitos desta auditoria de código.

## Referências de código

[1]: ../drizzle/schema.ts#L13-L49 "Estrutura de usuários"
[2]: ../drizzle/schema.ts#L1634-L1666 "Estrutura de logs de conversação"
[3]: ../server/moderation-router.ts#L303-L375 "Exportação minimizada de moderação"
[4]: ../server/compliance-router.ts#L99-L143 "Entrada e gravação de consentimento parental"
[5]: ../drizzle/schema.ts#L2217-L2238 "Estrutura de consentimento parental"
[6]: ../server/parentalDataRetention.ts#L3-L48 "Expurgo proporcional de documento e e-mail opcionais"
[7]: ../server/termsDataMinimization.test.ts "Regressão de minimização no aceite de termos"
[8]: ../server/parentalConsentPrivacy.ts "Notificação parental não identificadora"
[9]: ../server/moderation-router.ts#L162-L187 "Resumo administrativo de registros recentes"
[10]: ../server/moderation-router.ts#L141-L166 "Alertas pendentes minimizados"
[11]: ../drizzle/schema.ts#L2465-L2494 "Estruturas de atendimento ao cliente"
[12]: ../server/_core/context.ts#L20-L22 "Uso em memória do agente de usuário"
[13]: ../server/security-monitor.ts "Módulo de monitoramento técnico sem consumidor ativo localizado"
