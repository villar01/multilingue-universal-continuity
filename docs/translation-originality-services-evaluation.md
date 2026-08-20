# Avaliação de Serviços — Tradução Fiel e Controle de Similaridade

## Decisão de uso

O fluxo proposto separa duas operações. A **tradução autorizada** deve preservar os segmentos do texto de referência para conferência linha a linha. Já o **conteúdo complementar autoral** deve passar por análise de similaridade antes de publicação. Uma verificação de similaridade identifica material potencialmente coincidente; ela não concede licença para reutilizar texto de terceiros.

| Finalidade | Serviço avaliado | Capacidade verificada | Requisito para ativação |
|---|---|---|---|
| Tradução segmentada | DeepL API | Recebe vários textos e retorna as traduções na mesma ordem; oferece glossários, contexto e opções de segmentação/formatação. | Chave de API do titular, mantida somente no servidor. |
| Similaridade e paráfrase | Copyleaks Plagiarism Checker API | Examina texto e documentos contra páginas da web, fontes acadêmicas e acervos privados; declara detectar coincidências idênticas e conteúdo parafraseado. | Credencial comercial autorizada do titular. |
| Alternativa de revisão | Originality.ai API | Aceita texto puro para varredura de plágio e pode registrar resultados por segmento. | Plano empresarial e chave de API do titular; avaliar limites de cobrança antes do uso. |
| Alternativa institucional | Turnitin Core API | Aceita vários formatos documentais e produz relatórios de similaridade sob licença institucional. | Contrato/licença institucional e credenciais da integração. |

## Protocolo obrigatório antes de publicar

1. Registrar cada segmento da referência autorizada com identificador, página, idioma de origem e finalidade didática.
2. Traduzir os segmentos sem juntar, omitir, condensar ou reordenar linhas.
3. Guardar o texto de origem, a tradução retornada, o modelo/serviço e a data de execução para auditoria.
4. Revisar exemplos, instruções, enunciados e respostas esperadas contra o segmento correspondente.
5. Manter qualquer material novo como **complementar autoral**, separado da tradução.
6. Executar a análise de similaridade apenas sobre conteúdo complementar e bloquear publicação quando houver correspondência não autorizada a ser resolvida.
7. Exigir revisão humana final antes de substituir qualquer folha publicada do Livro SOS.

## Limites verificados

O serviço de tradução não é uma aprovação pedagógica automática. O relatório de similaridade também não decide titularidade, licença ou uso permitido. Esses dois resultados são controles técnicos dentro de uma revisão editorial humana e de uma confirmação de que a referência pode ser traduzida e usada no aplicativo.

## Referências

[1] [DeepL API — Translate text](https://developers.deepl.com/api-reference/translate)

[2] [DeepL API — Access and authentication](https://developers.deepl.com/docs/getting-started/auth)

[3] [Copyleaks — Plagiarism Checker API](https://docs.copyleaks.com/concepts/products/plagiarism-checker-api)

[4] [Originality.ai — API v3 documentation](https://docs.originality.ai/)

[5] [Turnitin Core API — Frequently Asked Questions](https://developers.turnitin.com/turnitin-core-api/faq)
