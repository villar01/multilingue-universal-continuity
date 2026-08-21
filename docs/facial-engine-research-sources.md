# Fontes de pesquisa — motores faciais locais

Esta nota preserva os fatos técnicos e as fontes primárias usados para a decisão de motor facial. Ela não ativa nenhum motor, GPU, serviço persistente ou processamento de retratos.

| Motor | Pontos confirmados na fonte primária | Impacto para o MultiLingue |
|---|---|---|
| LivePortrait | A implementação oficial exige Git, Conda e FFmpeg; usa Python 3.10 e oferece inferência de retrato a partir de imagem/vídeo de origem e vídeo condutor. Há caminho para macOS Apple Silicon, porém o próprio projeto informa desempenho possivelmente cerca de 20 vezes menor que uma RTX 4090. Também documenta templates de movimento como recurso de privacidade. [1] | Candidato inicial para **movimento de retrato pré-gerado**, não para prometer sincronização labial neural em tempo real. Exige validação local de desempenho, qualidade e consentimento para cada foto docente. |
| MuseTalk 1.5 | O repositório oficial descreve sincronização labial dirigida por áudio, configuração Python 3.10/CUDA 11.7–11.8, pesos adicionais e FFmpeg. Documenta inferência em tempo real com preparação prévia do avatar e 30 fps ou mais em uma Tesla V100; também relata que uma GPU laptop RTX 3050 Ti de 4 GB levou aproximadamente 5 minutos para gerar 8 segundos no modo fp16. [2] | Candidato condicional para **sincronização labial com áudio** após GPU NVIDIA, preparação do avatar e medição local. Não deve ser liberado sem ensaio de sincronismo, estabilidade e privacidade. |

As fontes de MuseTalk distinguem licença do código (MIT) e disponibilidade comercial declarada dos modelos, mas lembram que componentes dependentes possuem licenças próprias e que dados de teste têm escopo não comercial. A revisão de todas as licenças dos pesos e dependências é obrigatória antes de uso comercial. [2] [3]

## Decisão condicional

| Decisão | Justificativa | Gate obrigatório |
|---|---|---|
| **Não integrar motor facial agora.** | O aplicativo continua seguro e pedagógico com retratos estáveis, áudio neural e clipes já aprovados. Nenhuma GPU foi verificada para esta implantação. | `showSyntheticMouth` permanece `false`; nenhum retrato é enviado a serviço externo. |
| **Avaliar LivePortrait primeiro para ensaio local pré-gerado.** | A documentação oficial mostra um fluxo mais simples para retrato dirigido por vídeo e templates de movimento que podem reduzir o tratamento de vídeo condutor. [1] | Executar somente na máquina autorizada, com foto docente aprovada, áudio sintético de teste, avaliação humana de artefatos e exclusão dos arquivos de teste. |
| **Avaliar MuseTalk apenas em uma segunda etapa de sincronização labial.** | MuseTalk é voltado à fala guiada por áudio e documenta preparo de avatar para tempo real, mas também dependências CUDA, pesos adicionais, limites de identidade e jitter. [2] [3] | GPU NVIDIA e CUDA realmente verificados, licenças de todos os pesos revisadas, teste de sincronismo por fala e aprovação visual antes de disponibilizar qualquer mídia. |

> A escolha operacional inicial é **LivePortrait para avaliação local pré-gerada**; MuseTalk permanece uma alternativa posterior para sincronização labial, não uma função ativa do aplicativo. A implantação deve abortar ao primeiro sinal de voz, retrato, movimento, licença, desempenho ou privacidade incompatíveis.

## Critérios mínimos de aceitação local

1. A foto pertence ao professor aprovado e permanece em pasta autorizada.
2. O áudio de ensaio possui autorização e a saída não troca professor, gênero, idioma ou sotaque.
3. A avaliação humana confirma sincronismo, ausência de tremor perceptível, preservação de identidade e movimentação somente durante áudio real.
4. As fontes, pesos e dependências recebem revisão de licença antes de qualquer uso comercial.
5. Falha de GPU, modelo, licenciamento ou qualidade mantém o retrato estático; ela nunca derruba a lição nem ativa uma substituição sintética.

## Fontes

[1]: https://github.com/KlingAIResearch/LivePortrait "KlingAIResearch/LivePortrait — documentação oficial"
[2]: https://github.com/TMElyralab/MuseTalk "TMElyralab/MuseTalk — documentação oficial"
[3]: https://huggingface.co/TMElyralab/MuseTalk "TMElyralab/MuseTalk — cartão do modelo no Hugging Face"
