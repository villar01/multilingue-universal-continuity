# Validação técnica — controle único de áudio do diálogo

## Defeito confirmado

No diálogo publicado de James, o controle visível mostrava **0:00 / 0:01** e o aluno não ouvia a fala, embora a rota de voz retornasse sucesso.

## Evidência de origem

Uma chamada direta, tanto ao ambiente de desenvolvimento quanto ao domínio publicado, retornou o mesmo MP3: **84.384 bytes**, MPEG Layer III, 24 kHz mono, 96 kbps e duração medida de **7,032 segundos**. Portanto, a origem não corresponde à duração de um segundo vista no controle.

## Correção confinada

A Cena Imersiva deixou de criar e anexar um segundo `Audio` oculto ao documento. A mesma instância de áudio que o aluno vê agora recebe a fonte neural, tenta a reprodução e preserva a fonte para nova tentativa manual se a execução automática for bloqueada. A análise de visemas não é conectada a esta saída; não há simulação de boca para compensar áudio ausente.

## Verificações realizadas

| Verificação | Resultado |
| --- | --- |
| TypeScript | Sem erros |
| Regressões do diálogo, deduplicação e fonte | 9 testes aprovados |
| Suíte integral | 199 arquivos e 470 testes aprovados |
| Conteúdo, Pareto, cadastro, segurança e catálogo | Não alterados nesta correção |

## Limite pendente

A confirmação de que o som sai no navegador do aluno continua pendente. Não há declaração de correção final sem essa confirmação auditiva.
