# Defesa Proporcional do Conteúdo Pedagógico

**Escopo:** controles implementados no aplicativo em 21 de agosto de 2026. O objetivo é reduzir o acesso, a automação e a redistribuição não autorizados sem tratar dados pedagógicos ou de menores como material de rastreamento.

> Nenhuma defesa de aplicativo elimina integralmente a possibilidade de uma captura de tela feita por um aluno que já recebeu autorização legítima para visualizar uma lição. A estratégia aplicada é reduzir acesso indevido, limitar automação e manter rastreabilidade proporcional, sem prometer impossibilidades técnicas.

## Camadas aplicadas

O conteúdo pedagógico é liberado após sessão, aceite de proteção, consentimento parental quando aplicável e verificação de plano ou de avaliação. A avaliação é limitada a dez lições e quatorze dias; acessos já liberados são verificados por chave de lição, em vez de a lista pública ser tratada como licença curricular. [1] [2]

| Camada | Controle verificável | Dados tratados | Limite conhecido |
|---|---|---|---|
| Autorização no servidor | Portões de currículo exigem conta, aceite e autorização de avaliação ou assinatura | ID interno de conta e chave técnica da lição | Não protege uma captura feita após a liberação válida. [1] |
| Limitação de requisições | APIs possuem orçamento por origem e orçamento global; login recebe limite mais estrito | Origem técnica temporária em memória | É controle por instância e não substitui proteção de borda do provedor. [3] |
| Detecção de automação | Agentes de varredura, padrões maliciosos e repetição de 403 geram bloqueio temporário | Sinal técnico em memória; nenhuma mensagem pedagógica é registrada | A retenção e a capacidade de bloquear rede no provedor permanecem externas. [3] [4] |
| Limite de avaliação | Após 12 tentativas de liberar novas lições em 60 segundos, a conta é pausada por 15 minutos | Somente ID numérico da conta em memória | A pausa não atravessa reinício ou múltiplas instâncias; o limite de 10 lições e 14 dias continua no banco. [5] [2] |
| Registro de acesso | `trial_lesson_accesses` registra somente ID interno e chave de lição, sem conteúdo ou conversa | ID interno e chave técnica da lição | Não é um registro forense de dispositivo ou localização. [6] |
| Marca d’água | Lição protegida usa “Acesso protegido” e ID interno mínimo quando aplicável | ID interno, sem nome ou e-mail | É elemento dissuasório e de rastreabilidade, não bloqueio de captura. [7] |
| Exportações | CSV e painel administrativo de moderação foram reduzidos a metadados, sem conteúdo integral de conversa | Metadados de moderação necessários | Não abrange auditorias futuras de outros módulos de exportação. [8] |

## Regras de continuidade

Qualquer rota nova que entregue texto, exercício, vocabulário ou diálogo deve usar o mesmo portão de autorização antes de consultar as sementes curriculares. Mudanças no limite de avaliação, na marca d’água ou na exportação administrativa exigem regressão correspondente e validação de TypeScript antes da publicação.

As proteções em memória devem permanecer sem temporizadores autônomos: a limpeza ocorre de forma oportunista nas próprias requisições. Caso a necessidade evolua para bloqueio distribuído entre instâncias ou revogação de sessão pelo provedor de identidade, a implementação exigirá controle de infraestrutura ou de identidade confirmado, não uma promessa feita apenas no cliente.

## Referências de código

[1]: ../server/trial-access-router.ts "Portão, autorização de lição e chaves de avaliação"
[2]: ../server/trial-access-policy.ts "Validade de 14 dias e acesso curricular completo"
[3]: ../server/securityMiddleware.ts "Limites, detecção e cabeçalhos de segurança"
[4]: ../server/_core/abuseProtection.ts "Sinais técnicos e bloqueio temporário"
[5]: ../server/trial-authorization-abuse-guard.ts "Pausa proporcional por novas liberações anômalas"
[6]: ../drizzle/schema.ts "Tabela trial_lesson_accesses"
[7]: ../client/src/components/ContentProtection.tsx "Marca d’água mínima de conta"
[8]: ../server/moderation-router.ts "Exportação e interfaces administrativas minimizadas"
