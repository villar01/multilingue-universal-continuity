# Inventário de verificação — 2026-08-14

## Controle mestre

O arquivo `todo.md` está presente com **1.307 linhas**, **857 itens concluídos** e **136 itens pendentes** no momento da auditoria. O histórico de itens anteriores continua no arquivo; não foi identificada remoção do controle mestre.

## Evidências preservadas

Há **168 arquivos de regressão** em `server/*.test.ts`. Entre as verificações preservadas estão cobertura de CEFR, modo batalha, backup e restauração, controle parental, ciclo Pareto, diálogo, cenas imersivas, voz e visemas.

Também permanecem documentos de validação em `docs/`, incluindo auditorias de cena imersiva, recuperação de retratos, conformidade ECA Digital, seleção de professores, validação móvel e avaliação do motor facial local.

## Checkpoints recentes confirmados

O histórico do repositório mantém os checkpoints recentes de batalha CEFR, hub de lições, clipes, backup/restauração, progresso persistido, painel parental, jogo de memória, diálogo imersivo e deduplicação de áudio. As verificações funcionais que falharam ou continuam pendentes foram reabertas no `todo.md`; não foram marcadas como concluídas apenas por teste estático.

## Estado atual não publicado

As alterações locais em andamento para o Pareto guiado por cena, documentação de diálogo e seus testes ainda não foram publicadas. Elas permanecem separadas das verificações históricas até passarem em validação completa.

## Validação visual do Pareto guiado por cena

Na rota `/immersive-scene`, o painel Pareto apresentou as instruções de uso da cena, o contador **0/122 palavras concluídas** e o botão **Começar ciclo da cena**. Ao iniciar, a primeira palavra abriu na sequência **Observe → Lembre → Escreva → Crie**, com enunciado bilíngue e transição comprovada do passo de observação para a memória ativa. A publicação ainda depende da suíte completa.
