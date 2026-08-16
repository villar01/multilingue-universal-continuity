# Arquitetura híbrida de mídia docente

## Objetivo

A plataforma poderá melhorar a presença visual do professor sem exigir GPU no notebook do aluno e sem usar animação artificial. A decisão é separar conteúdo repetível e roteirizado de respostas novas do professor.

| Situação | Entrega prevista | GPU do aluno | Estado atual |
| --- | --- | --- | --- |
| Saudação, pronúncia-chave, instrução, repetição e conclusão já aprovadas | Vídeo pré-gerado do professor | Não | Depende de produzir e aprovar cada vídeo original |
| Pergunta livre, correção personalizada e resposta contextual | Áudio neural e retrato estável | Não | Caminho existente; áudio publicado ainda requer confirmação humana |
| Animação facial personalizada por pedido | Serviço externo de GPU, opcional | Não | Não habilitado, não contratado e não cobrado |
| Animação facial local | Motor facial local | Sim, NVIDIA/CUDA | Não disponível no notebook atual sem GPU compatível |

## Regra de seleção

1. Uma frase roteirizada só poderá reproduzir vídeo se existir um ativo previamente aprovado para aquele professor, idioma, variante regional e texto.
2. Se não existir vídeo aprovado, ou se a pergunta for nova, o professor responde por áudio neural com retrato estável. O sistema não simula movimento facial.
3. Um serviço de GPU externa nunca poderá substituir silenciosamente o canal de áudio ou enviar dados de alunos por padrão.

## Conteúdo recomendado para os primeiros vídeos

Os primeiros ativos devem ser frases reutilizáveis e de grande valor pedagógico: saudação de abertura, instrução de escuta, pronúncia de uma palavra central, convite a repetir, explicação curta de gramática, reforço positivo e encerramento. Esses vídeos precisam ser originais, produzidos para a plataforma e associados a metadados de professor, idioma, variante e texto exato.

## Futuro serviço de GPU externa

Uma oferta opcional só poderá ser avaliada depois de cumprir todos os pontos abaixo:

| Condição | Regra obrigatória |
| --- | --- |
| Consentimento | Escolha separada e reversível antes de processar qualquer áudio, imagem ou texto no serviço. |
| Transparência | Informar fornecedor, finalidade, dados enviados, prazo de retenção, custo e alternativa sem serviço. |
| Menores | Não ativar para perfil infantil sem autorização parental específica e avaliação jurídica. |
| Custo | Limite por conta, medição por solicitação e bloqueio antes de exceder o orçamento aprovado. |
| Segurança | Credenciais no servidor, URLs temporárias, autorização por conta e exclusão do material temporário após processamento. |
| Qualidade | Teste visual e auditivo por professor, idioma e cenário antes de oferecer ao aluno. |
| Retorno seguro | Falha do serviço volta a áudio neural com retrato estável, sem bloquear a aula. |

> Esta arquitetura não ativa pagamento, GPU externa, D-ID, vídeo gerado sob demanda nem coleta adicional. Ela prepara uma seleção segura entre mídia pré-gerada e conteúdo dinâmico, preservando o funcionamento atual.
