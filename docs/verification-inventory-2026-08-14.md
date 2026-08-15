# Inventário de verificação — 2026-08-14

## Controle mestre

O arquivo `todo.md` está presente com **1.307 linhas**, **857 itens concluídos** e **136 itens pendentes** no momento da auditoria. O histórico de itens anteriores continua no arquivo; não foi identificada remoção do controle mestre.

## Evidências preservadas

Há **168 arquivos de regressão** em `server/*.test.ts`. Entre as verificações preservadas estão cobertura de CEFR, modo batalha, backup e restauração, controle parental, ciclo Pareto, diálogo, cenas imersivas, voz e visemas.

Também permanecem documentos de validação em `docs/`, incluindo auditorias de cena imersiva, recuperação de retratos, conformidade ECA Digital, seleção de professores, validação móvel e avaliação do motor facial local.

## Checkpoints recentes confirmados

O histórico do repositório mantém os checkpoints recentes de batalha CEFR, hub de lições, clipes, backup/restauração, progresso persistido, painel parental, jogo de memória, diálogo imersivo e deduplicação de áudio. As verificações funcionais que falharam ou continuam pendentes foram reabertas no `todo.md`; não foram marcadas como concluídas apenas por teste estático.

## Estado publicado

O Pareto guiado por cena foi publicado no checkpoint `26b28d23`. A documentação de diálogo permanece como evidência de regressão, sem afirmar qualidade de voz ou animação labial ainda não confirmada pelo usuário.

## Validação visual do Pareto guiado por cena

Na rota `/immersive-scene`, o painel Pareto apresentou as instruções de uso da cena, o contador **0/122 palavras concluídas** e o botão **Começar ciclo da cena**. Ao iniciar, a primeira palavra abriu na sequência **Observe → Lembre → Escreva → Crie**, com enunciado bilíngue e transição comprovada do passo de observação para a memória ativa. A suíte completa terminou com **168 arquivos e 377 testes aprovados**, sem erros de TypeScript, antes do checkpoint `26b28d23`.

## Revalidação publicada — 2026-08-15

No domínio publicado, o painel Pareto continua disponível com **1.130 palavras**, filtra **122 palavras** relacionadas à Praia Tropical, mostra a orientação de cinco passos e abre o ciclo na palavra **Hello — Olá**. Os checkpoints `26b28d23`/`9299c2dc` permanecem no histórico. A verificação do diálogo deve ser feita com o painel Pareto fechado para impedir que a sobreposição capture o clique; a qualidade de voz e animação labial natural continua aberta e não foi reclassificada como concluída.

## Revalidação publicada do diálogo — 2026-08-15

Com o painel Pareto fechado, o botão **Iniciar Diálogo** abriu o painel identificado como **Diálogo da cena** acima dos controles inferiores. A primeira fala de James mostrou texto-alvo em inglês, apoio em PT-BR, aviso honesto de que a voz neural e resposta por microfone exigem sessão e o controle **Continuar**. A presença de voz autenticada e de animação facial natural não foi inferida nesta verificação visual sem sessão.

## Fechamento acessível do Pareto — prévia 2026-08-15

O painel Pareto passou a apresentar um botão textual **Fechar**, com rótulo acessível e dica explícita **Fechar vocabulário Pareto**, ao lado do filtro da cena. Na prévia, o clique fechou integralmente a sobreposição e devolveu o foco à cena, com **Iniciar Diálogo** novamente disponível. O botão encerra qualquer prática e áudio da palavra antes de devolver o foco à cena. A suíte completa terminou com **170 arquivos e 383 testes aprovados**, sem erros de TypeScript.

## Repetição da fala inglesa — prévia 2026-08-15

Na Praia Tropical, o painel de diálogo passou a mostrar o controle explícito **Ouvir inglês**, ao lado de **Ouvir ajuda PT**. A prévia sem sessão apresentou corretamente o texto bilíngue e o aviso de que a voz neural requer sessão; nessa condição, o botão aciona a fala disponível no navegador como alternativa, sem afirmar que ela equivale à voz neural. A verificação auditiva autenticada continua necessária.

Após corrigir a ordem de inicialização da voz pública, a cena carregou sem erro de referência e o painel continuou mostrando **Ouvir inglês** com o professor estável, sem a combinação anterior de `teacher-talk` e `head-sway` durante a fala. A confirmação auditiva da rota neural Edge continua pendente de sessão ou de resposta bem-sucedida do provedor.

O teste sem sessão acionou a fala roteirizada por Edge e o botão mudou de **Preparando inglês…** para **Reiniciar inglês**, que é o estado visual controlado por `isSpeaking` após o início de `HTMLAudioElement.play()`. O painel permaneceu aberto, com texto bilíngue e sem erro de inicialização; a percepção auditiva final ainda deve ser confirmada pelo usuário no navegador com volume ativo.

A validação final da implementação terminou com **TypeScript sem erros, 173 arquivos e 390 testes aprovados**. A checagem auditiva no navegador do usuário continua propositalmente aberta, pois os testes e o estado de reprodução não substituem escutar a fala.

O diálogo continuou abrindo com **Ouvir inglês** disponível após a inclusão do limite de espera de 12 segundos para a síntese pública. A tela não apresentou erro de inicialização e o controle permaneceu pronto para nova tentativa; a confirmação de som audível no dispositivo do usuário continua pendente.

No domínio publicado, o clique em **Ouvir inglês** acionou `sceneDialogueVoice.speak` e recebeu uma resposta de áudio de **112.651 bytes** em aproximadamente **1,7 segundo**; o botão retornou a **Ouvir inglês** depois da reprodução curta. Isso confirma solicitação e carga de áudio, mas não substitui confirmar que o som está audível no dispositivo do aluno.
