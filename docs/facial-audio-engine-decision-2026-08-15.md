# Decisão Técnica — Sincronização Labial Natural por Áudio

## Objetivo

Substituir o retrato estático apenas quando houver um fluxo que produza **sincronização labial natural com a voz real**, sem tremor artificial. O professor Ricardo permanece excluído: sua boca é estática por requisito permanente.

## Alternativas avaliadas

| Alternativa | Adequação ao retrato fotográfico atual | Situação para o aplicativo |
|---|---|---|
| **MuseTalk 1.5 local** | Converte áudio e vídeo/foto do rosto em vídeo de fala. O projeto declara execução em tempo real em hardware NVIDIA de referência, mas também descreve preparação do avatar, dependências CUDA/PyTorch/FFmpeg e limitações de preservação de identidade e jitter. | **Candidato para prova de conceito local com GPU dedicada.** Não deve ser inserido no servidor autoscalável atual sem ambiente persistente com GPU e avaliação visual por professor. |
| **Wav2Lip open source** | Pode sincronizar áudio e vídeo, mas o repositório declara o modelo open source como restrito a pesquisa/uso pessoal e não adequado ao uso comercial do aplicativo. | **Descartado para produção.** Não será integrado. |
| **MetaHuman Audio Driven Animation** | Produz animação facial a partir de áudio em um pipeline Unreal/MetaHuman com ativos 3D; a documentação distingue processamento offline de animação em tempo real. | **Alternativa futura para avatares 3D próprios**, não solução direta para os retratos fotográficos React atuais. |

## Decisão atual

O aplicativo mantém os retratos estáveis enquanto a voz funciona. Não será aplicada movimentação aproximada de boca, oscilação ou tremor como substituto de sincronização real.

A próxima etapa é uma prova de conceito isolada com MuseTalk em ambiente persistente com GPU: uma voz neural curta e uma única identidade autorizada, avaliação humana de sincronismo, identidade, artefatos e latência. Somente após aprovação visual e análise de infraestrutura poderá ser planejada uma integração ao produto. A geração deve armazenar apenas resultados autorizados e respeitar controles de idade, LGPD e consentimento de uso de imagem.

## Referências

1. [MuseTalk — repositório, requisitos e limitações](https://github.com/TMElyralab/MuseTalk)
2. [Wav2Lip — aviso de uso não comercial do modelo open source](https://github.com/Rudrabha/Wav2Lip)
3. [Epic Games — MetaHuman Audio Driven Animation](https://dev.epicgames.com/documentation/metahuman/audio-driven-animation?lang=en-US)
