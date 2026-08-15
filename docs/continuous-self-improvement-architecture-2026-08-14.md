# Arquitetura de autoaperfeiçoamento contínuo e animação facial

## Decisão resumida

A opção gratuita inicial mais adequada para sincronização labial é **MuseTalk 1.5 executado no computador local com GPU NVIDIA**, quando houver hardware compatível. O código e os pesos oficiais permitem uso acadêmico e comercial, mas o próprio projeto informa que o desempenho realmente em tempo real foi medido em uma Tesla V100; em uma RTX 3050 Ti de 4 GB, um vídeo de oito segundos levou aproximadamente cinco minutos em FP16. Portanto, não se deve prometer tempo real em qualquer notebook.

**LivePortrait** é útil como segunda etapa para movimento de cabeça, olhos e expressões, porém seu fluxo oficial é dirigido por vídeo ou template de movimento; sozinho, não substitui um motor de sincronização labial dirigido diretamente pelo áudio.

**Wav2Lip aberto não deve ser usado neste aplicativo comercial**, porque o repositório oficial restringe os resultados do modelo aberto a pesquisa, uso acadêmico ou pessoal e proíbe uso comercial.

## Comparação

| Opção | Papel recomendado | Custo de licença inicial | Limite decisivo |
|---|---|---:|---|
| MuseTalk 1.5 | Lábios dirigidos pelo áudio e geração de vídeo facial | Sem custo de licença do código/modelo oficial | Exige GPU e pode ser lento em GPU básica; ainda apresenta jitter e perda de detalhes |
| LivePortrait | Cabeça, olhos, expressão e animação de retrato por movimento-guia | Projeto aberto, sujeito às licenças das dependências | Não é, isoladamente, o sincronizador de áudio necessário |
| Wav2Lip aberto | Prova de conceito não comercial | Sem custo apenas para pesquisa/pessoal | Uso comercial explicitamente proibido pelo projeto oficial |

## Autoaperfeiçoamento permanente

O projeto já possui telemetria persistida em `app_telemetry`, insights em `ai_insights`, histórico em `system_improvements` e uma rotina `server/scheduled/ai-self-improve.ts`. O primeiro núcleo seguro deve reaproveitar isso em vez de criar outro sistema.

O ciclo permanente adotado será:

1. coletar telemetria minimizada, sem conteúdo sensível;
2. executar diagnóstico determinístico gratuito em cada agendamento;
3. usar Qwen 2.5 local como enriquecimento quando uma conexão local válida estiver disponível;
4. registrar propostas no banco e, futuramente, em uma branch ou pull request no GitHub;
5. executar TypeScript, testes e validações antes de qualquer aceitação;
6. exigir checkpoint e revisão antes de publicar;
7. nunca alterar automaticamente autenticação, pagamentos, banco, segurança ou dados de usuários.

O cliente LLM atual prioriza Ollama somente em pedidos de texto simples. A rotina de autoaperfeiçoamento usa saída JSON estruturada e, por isso, pula o caminho local e cai no modelo remoto. Isso deverá ser corrigido para que o diagnóstico recorrente tenha um modo determinístico sem custo e Qwen local opcional, sem fallback remoto automático em toda execução.

## Fontes oficiais

1. MuseTalk: <https://github.com/TMElyralab/MuseTalk>
2. LivePortrait: <https://github.com/KlingAIResearch/LivePortrait>
3. Wav2Lip: <https://github.com/Rudrabha/Wav2Lip>
