# Portão de Validação para Sincronização Facial por Áudio

**Estado atual:** os retratos originais e os clipes pré-gerados aprovados são a experiência publicada. A boca sintética permanece desativada. O adaptador de geração facial não declara disponibilidade e recusa chamadas externas até uma validação humana concluída. [1] [2]

> A presença de uma chave ou de um adaptador não comprova qualidade, privacidade, licença, custo controlado ou compatibilidade entre o professor, a fala e o áudio. Por isso, nenhum motor facial é ativado automaticamente.

## Arquitetura híbrida aprovada para evolução

| Camada | Uso permitido agora | Uso futuro condicionado | Retorno seguro |
|---|---|---|---|
| Frases pedagógicas fixas | Clipe pré-gerado apenas quando fala, professor e áudio já correspondem | Ampliação de catálogo após revisão humana por clipe | Fim ou falha do clipe revela o retrato original. [3] |
| Respostas livres | Áudio neural com retrato estável | Sincronização facial somente após validação individual do motor | Sem geração ao vivo; permanece retrato estável. [2] |
| Estudo e cenas | Estados visuais de pose roteirizada | GPU local ou externa somente em prova isolada aprovada | Mantém controles e áudio mesmo sem vídeo. [3] |

## Prova de conceito isolada

A prova de conceito não altera a Cena Imersiva publicada. Ela usa exclusivamente um retrato já autorizado, uma fala pedagógica fixa, o áudio correspondente e um ambiente isolado. O resultado deve ser descartável e não pode substituir mídia publicada sem aceite humano explícito.

| Requisito | Critério de aprovação | Bloqueio se falhar |
|---|---|---|
| Computação | GPU NVIDIA/CUDA realmente disponível fora da hospedagem atual ou equipamento local escolhido pelo responsável | Não instalar, não gerar e manter retrato estável. |
| Privacidade | Somente retrato autorizado e áudio roteirizado; sem voz, imagem ou conversa do aluno | Interromper o ensaio e apagar o artefato de teste. |
| Identidade docente | Mesmo professor no retrato, na fala e no áudio | Rejeitar o resultado. |
| Qualidade | Boca compatível com o áudio; sem distorção, troca de rosto ou movimento estranho | Rejeitar o resultado e preservar o clipe/retrato atual. |
| Custo e consentimento | Serviço, licença, armazenamento e eventual cobrança aprovados explicitamente antes da execução | Não ativar conector, chave ou geração externa. |
| Retorno | Vídeo isolado removível e fallback de retrato verificado | Não integrar à cena. |

## Limite da infraestrutura atual

A hospedagem do aplicativo é adequada para o fluxo web e a entrega protegida de conteúdo, mas não deve ser tratada como uma GPU de geração facial. A computação persistente disponível sem máquina local também não fornece GPU; portanto, qualquer ensaio com CUDA depende de equipamento local com GPU ou de uma solução externa aprovada pelo responsável. [4]

## Portão de integração

Uma integração futura só começa depois de todos os critérios anteriores, de testes de TypeScript e regressões, de inspeção visual e de uma aprovação humana do resultado. O professor Ricardo permanece com retrato estático e áudio neural; James mantém voz masculina `en-US`; e `showSyntheticMouth` permanece `false` em todas as cenas. [2] [3]

## Referências de código

[1]: ../server/musetalk-router.ts "Status bloqueado e pré-condição para geração facial"
[2]: ../client/src/pages/ImmersiveScene.tsx "Retrato estável e boca sintética desativada"
[3]: ../server/teacherAnimationPolicy.test.ts "Política de clipes roteirizados e identidade docente"
[4]: /home/ubuntu/skills/persistent-computing/SKILL.md "Limites de GPU da hospedagem e computação persistente"
