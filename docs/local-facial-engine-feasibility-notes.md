# Evidências iniciais — sincronização facial local

## Constatações verificadas

| Fonte | Constatação | Consequência para o aplicativo |
| --- | --- | --- |
| MediaPipe Face Landmarker | O componente aceita imagens, quadros de vídeo e fluxo ao vivo; entrega malha facial, pontuações de *blendshapes* e matrizes de transformação. O modo de fluxo ao vivo entrega resultado assíncrono. [1] | É um candidato para **detectar** movimentos em uma câmera local ou controlar um avatar 3D, mas não transforma sozinho o áudio do professor em boca sincronizada em uma foto estática. |
| Wav2Lip | O repositório direciona a versão comercial a um serviço separado; portanto, não pode ser adotado como motor gratuito comercial sem revisão de licença e modelo. [2] | Fica excluído da prova gratuita comercial até existir autorização compatível e uma avaliação técnica independente. |
| MuseTalk | O repositório declara código e modelos sob licença MIT, afirma inferência em tempo real acima de 30 fps em NVIDIA Tesla V100 e exige processamento de áudio e imagem por seu modelo. [3] | É o único candidato pesquisado para um piloto local com geração facial real; porém requer um componente local opt-in, GPU NVIDIA compatível, limites de privacidade e validação visual antes de qualquer uso publicado. |
| Rhubarb Lip Sync | A ferramenta de linha de comando analisa áudio existente e produz informações de animação de boca em formatos como JSON. [4] | Pode apoiar uma etapa offline de visemas para personagens 2D, mas não resolve a geração fotorrealista de boca em fotografia; não é o motor do professor publicado. |

## Salvaguardas já presentes

O aplicativo já exige par audiovisual exato para vídeo roteirizado e mantém **retrato estável** quando a resposta é dinâmica. O modo de visemas locais só é elegível em dispositivo capaz, com `AudioWorklet`, ausência de redução de movimento e validação explícita. Essas regras permanecem inalteradas durante a avaliação.

## Decisão de viabilidade

> **Decisão: não ativar um motor facial dinâmico nos professores publicados agora.**

O caminho de baixo risco é manter o vídeo de par exato para falas roteirizadas e o retrato estável para respostas novas. O MediaPipe é útil para leitura de marcos e expressões em vídeo, mas não é um gerador de movimento de boca por áudio para a fotografia do professor. [1] O Rhubarb produz dados de boca voltados a animação 2D e não entrega um rosto fotorrealista. [4] O Wav2Lip não entra na trilha gratuita comercial sem uma licença específica. [2]

O MuseTalk é o único candidato pesquisado que satisfaz, em princípio, licença MIT e geração de sincronização guiada por áudio. Contudo, a própria documentação associa a alegação de tempo real a uma NVIDIA Tesla V100. [3] Portanto, ele é **viável apenas como prova local futura**, executada em um componente local explicitamente autorizado pelo aluno em equipamento compatível; não é viável como recurso padrão do site atual nem como serviço remoto oculto.

| Critério de admissão para uma prova futura | Estado atual |
| --- | --- |
| Execução exclusivamente local, sem GPU remota e sem porta pública | Exigido; ainda não iniciado |
| Consentimento explícito antes de instalar ou usar o componente local | Exigido; ainda não solicitado |
| GPU NVIDIA/CUDA compatível e capacidade medida no equipamento real | Exigido; não verificado no dispositivo do aluno |
| Foto do professor e áudio tratados localmente, sem envio externo | Exigido; arquitetura de prova ainda não construída |
| Teste de latência, continuidade visual, privacidade e sincronização por auditor humano | Exigido; pendente |
| Reversão imediata a retrato estável sem retirar áudio ou aprendizagem | Já implementada por política e regressão |

Enquanto todos os critérios não forem cumpridos, nenhuma resposta online deve receber movimento de boca, vídeo facial automático ou alternativa paga obrigatória. O modo gratuito permanece com voz, retrato estável e recursos pedagógicos intactos.

## Referências

[1] [Google AI Edge — Face Landmarker](https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker)

[2] [Rudrabha/Wav2Lip — repositório oficial](https://github.com/Rudrabha/Wav2Lip)

[3] [TMElyralab/MuseTalk — repositório oficial](https://github.com/TMElyralab/MuseTalk)

[4] [DanielSWolf/rhubarb-lip-sync — repositório oficial](https://github.com/DanielSWolf/rhubarb-lip-sync)
