# Retenção de dados parentais opcionais

**Decisão confirmada pelo responsável em 16 de agosto de 2026:** e-mail e documento opcionais do responsável serão eliminados após **30 dias** de revogação do consentimento ou de inatividade da conta do aluno.

| Categoria | Após o prazo | Motivo técnico |
| --- | --- | --- |
| `guardian_document` | Eliminado (`NULL`) | Campo opcional; não é necessário para bloquear o acesso do menor. |
| `guardian_email` | Eliminado (`NULL`) | Campo opcional; não é necessário para bloquear o acesso do menor. |
| Nome e vínculo | Preservados | Mantém o mínimo do registro formal de consentimento. |
| Data, versão, confirmações e revogação | Preservadas | Mantêm evidência mínima e não restauram acesso. |
| Acesso do menor | Bloqueado na revogação | O bloqueio não aguarda os 30 dias. |

> A rotina é idempotente: ela só atualiza linhas que ainda possuam documento ou e-mail e já tenham atingido o prazo. Ela não apaga conta, lições, histórico de aprendizagem, nome, vínculo, versão, confirmação, data nem estado de revogação.

## Critério técnico

O prazo inicia na data de revogação, quando ela existe. Para consentimento não revogado, a limpeza só se aplica após trinta dias sem login da conta associada. A execução é autenticada por tarefa agendada e aceita exclusivamente o identificador cadastrado na configuração interna.

## Limite e revisão

O prazo de trinta dias foi definido pelo responsável do projeto; não é apresentado como prazo legal universal. Ele deve ser revisto por profissional jurídico antes de uma operação comercial em escala ou diante de obrigação específica de guarda. A base técnica segue os princípios de finalidade, necessidade, transparência e eliminação após o encerramento do tratamento, conforme a LGPD.[1]

## Referências

[1]: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm "Lei nº 13.709/2018 — LGPD"
