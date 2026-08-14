# Avaliação de motores faciais locais guiados por áudio

## Objetivo

Substituir a abertura de boca estimada no navegador por uma geração facial orientada por áudio real para retratos fotográficos dos professores. O motor não deve ser tratado como pronto até uma validação visual individual por professor. Ricardo permanece com boca estática.

| Candidato | Entrada e resultado | GPU e operação local | Licença e adequação |
|---|---|---|---|
| **MuseTalk 1.5** | Foto ou vídeo de rosto + áudio; gera vídeo sincronizado | Requer Python, CUDA, PyTorch, FFmpeg e pesos locais; oferece fluxo de preparação do avatar e inferência em tempo real | Código MIT e modelos declarados para uso comercial; **candidato principal** para integração controlada |
| **SadTalker** | Retrato único + áudio; gera vídeo de cabeça falante | Requer ambiente Python, PyTorch CUDA, FFmpeg e pesos locais | Apache 2.0, porém a própria documentação exige revisão de conformidade e não declara serviço direto ao usuário final; manter apenas como alternativa de avaliação |
| **Wav2Lip open source** | Vídeo/foto + áudio; sincroniza boca | Pode rodar localmente com Python e FFmpeg | Código aberto disponível apenas para pesquisa/pessoal conforme README; **não usar no produto comercial** |

## Decisão arquitetural inicial

O aplicativo deve integrar um **serviço local opcional de vídeo facial** com uma interface explícita de disponibilidade. Quando houver GPU e motor instalado, o app envia somente a referência do retrato autorizado do professor e o áudio da fala para a geração de resposta facial. Quando não houver GPU ou o serviço estiver indisponível, o app mantém áudio e um aviso honesto de modo simplificado; não deve simular que há animação facial real.

O primeiro candidato é o MuseTalk 1.5, porque a documentação declara suporte a áudio e foto/vídeo, fluxo de preparo de avatar reutilizável, execução local por CUDA e licença MIT para código/modelos. A avaliação prática ainda é obrigatória: qualidade, latência, preservação de identidade, privacidade e adequação de cada retrato precisam ser validadas antes de substituir o fallback.

## Fontes

1. [MuseTalk README](https://github.com/TMElyralab/MuseTalk) — requisitos de CUDA, fluxo de inferência e termos declarados.
2. [SadTalker README](https://github.com/OpenTalker/SadTalker) — execução local por retrato e áudio, requisitos e aviso de conformidade.
3. [Wav2Lip README](https://github.com/Rudrabha/Wav2Lip) — restrição declarada de uso não comercial do modelo aberto.
