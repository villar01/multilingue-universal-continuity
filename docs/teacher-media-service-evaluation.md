# Avaliação de Serviço para Vídeo Docente

## Objetivo

Substituir experiências improvisadas de movimento por um fluxo externo que receba roteiro ou áudio aprovado, produza um arquivo de vídeo e só permita a publicação depois de uma revisão visual. Nenhum retrato, voz, roteiro ou vídeo docente será enviado a um serviço externo sem autorização do titular e credenciais configuradas no servidor.

| Opção | Capacidade verificada | Condição mínima de uso | Adequação inicial |
|---|---|---|---|
| Adobe Avatar API | Gera vídeo de avatar a partir de texto ou áudio fornecido; permite acompanhar o resultado assíncrono e usar mídia de fundo. | Client ID, client secret e autorização para usar o retrato/voz. | Preferível para testar um par exato de áudio e vídeo aprovado. |
| Microsoft Text to Speech Avatar | Produz vídeo de avatar falante por API, em lote ou em tempo real; oferece avatares de foto e vídeo. | Conta Azure, região suportada, consentimento e configuração de credenciais. | Alternativa para futura avaliação de avatar customizado, não para publicação automática. |
| HeyGen API | Cria vídeo por roteiro ou por configuração explícita de avatar, voz e script; retorna estado e arquivo resultante. | Chave de API e autorização de avatar/voz. | Alternativa comercial a ser avaliada somente após definir custos e política de retrato. |
| Synthesia API | Cria vídeo de teste a partir de roteiro, avatar e voz e disponibiliza consulta do processamento. | Chave de API da conta e autorização de uso. | Alternativa comercial para piloto isolado. |

## Controle obrigatório

1. Gerar mídia somente para uma fala com roteiro e áudio aprovados.
2. Manter o retrato estável enquanto não existir vídeo aprovado para aquela fala exata.
3. Revisar vídeo, áudio, voz, texto, pronúncia e sincronia antes de inserir a mídia no catálogo.
4. Executar TypeScript, regressões de cena e prévia autenticada antes de publicar a alteração.
5. Se qualquer verificação falhar, manter a versão publicada intacta e rejeitar a nova mídia.

## Referências

[1] [Adobe Avatar API](https://developer.adobe.com/audio-video-firefly-services/guides/avatar/)

[2] [Microsoft Text to Speech Avatar](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech-avatar/what-is-text-to-speech-avatar)

[3] [HeyGen API Quick Start](https://developers.heygen.com/docs/quick-start)

[4] [Synthesia API Quick Start](https://docs.synthesia.io/reference/synthesia-api-quickstart)
