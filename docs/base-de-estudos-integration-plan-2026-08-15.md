# Plano Técnico — Base de Estudos Integrada

**Status:** planejamento de implementação. Nenhuma interface ou conteúdo novo foi publicado por este documento.  
**Objetivo:** transformar a pesquisa de conhecimento em uma ação de aprendizado dentro do aplicativo, com conteúdo original, Pareto, professor virtual e proteção por perfil.

## Base existente confirmada

| Recurso atual | Situação | Reutilização planejada |
| --- | --- | --- |
| `LessonDictionary` | Já oferece pesquisa local de vocabulário da aula e fala nos dois idiomas. | Será preservado como dicionário restrito à aula; a Base de Estudos o ampliará para pesquisa por conceito, tema e CEFR. |
| `ParetoPanel` | Já filtra vocabulário, permite busca, fala neural, favoritos e inicia ciclo de prática. | Será a entrada de prática para resultados Pareto e cenas, sem duplicar seu ciclo de lembrar, escrever e criar frase. |
| `ParetoPracticeCycle` | Já conduz recuperação ativa dentro do painel. | Será aberto por ação explícita a partir de um resultado da Base de Estudos. |
| `ImmersiveScene` e tutor contextual | Já sustentam pergunta livre inicial sobre objetos e segurança de resposta. | Receberão contexto curricular estruturado para responder sobre a unidade, não somente sobre hotspots. |
| Dados Pareto atuais | O contrato atual é prioritariamente PT-BR ↔ inglês, com variantes locais limitadas. | Não será usado como prova de cobertura multilíngue; cada idioma novo exigirá pacote próprio validado. |

## Arquitetura proposta

O atalho abre uma tela ou painel de **Base de Estudos** e preserva o contexto de onde o aluno veio: lição, cena, termo Pareto, professor, idioma nativo, idioma-alvo e CEFR. A pesquisa retorna apenas conhecimento curricular original que esteja liberado para esse perfil. Nenhum PDF é armazenado, indexado ou exibido ao aluno.

```text
Atalho no painel, aula ou cena
        ↓
Base de Estudos (busca e filtros)
        ↓
Resultado curricular original
        ↓
Ouvir | Entender | Praticar Pareto | Perguntar ao professor | Abrir cena/diálogo | Revisar
        ↓
Progresso e próxima revisão
```

## Modelo de dados a implementar após o piloto

| Entidade | Campos essenciais | Finalidade |
| --- | --- | --- |
| `curriculum_units` | idioma-alvo, CEFR, objetivo comunicativo, sequência, status editorial | Define cada unidade original e sua progressão. |
| `study_entries` | tipo de entrada, título, explicação no idioma nativo, idioma-alvo, termo, pronúncia figurativa, conteúdo seguro por idade | Alimenta a busca por palavra, tema e gramática. |
| `study_entry_links` | unidade, cena, diálogo, item Pareto, exercício, revisão | Liga a explicação diretamente a uma ação real do aplicativo. |
| `language_grammar_profiles` | idioma, conceito, regra autoral, contraexemplos, diferenças por idioma nativo quando relevantes | Impede que uma explicação de gramática seja reaproveitada incorretamente em outro idioma. |
| `study_search_index` | idioma, CEFR, tipo, termo normalizado, sinônimos autorizados e estado editorial | Permite pesquisa determinística sem expor conversas pessoais. |

O banco armazenará somente conteúdo curricular original e metadados de progresso. Termos de busca e perguntas livres não serão transformados em material público; estarão sujeitos às regras de minimização de dados e segurança já definidas no projeto.

## Contrato do professor virtual na Base de Estudos

Antes de chamar IA, a interface deve recuperar o registro curricular correspondente. O professor recebe apenas o contexto necessário para orientar uma resposta curta: idioma nativo, idioma-alvo, CEFR, unidade, termos liberados, conceito gramatical, cena e regra de segurança etária. O retorno deve usar a língua nativa para explicar e o idioma estudado para demonstrar, sempre com pronúncia figurativa quando aplicável.

| Pergunta do aluno | Comportamento exigido do professor |
| --- | --- |
| “O que significa esta palavra?” | Definir no contexto da unidade, tocar áudio regional e pedir uma frase curta. |
| “Por que esta estrutura é assim?” | Explicar a regra do idioma-alvo com contraste seguro para a língua nativa, sem inventar equivalência. |
| “Como digo isto em uma situação real?” | Oferecer exemplo original, ligar à cena ou iniciar diálogo guiado. |
| Resposta escrita do aluno | Corrigir apenas o ponto mais importante, reconhecer o acerto e propor nova tentativa. |
| Pergunta fora do nível | Indicar que o tema pertence a outra etapa e oferecer versão adequada ao CEFR atual. |
| Conteúdo ofensivo, impróprio ou perigoso | Interromper a geração normal, aplicar moderação e seguir o protocolo de proteção existente. |

## Atalhos e fluxos prioritários

O atalho será apresentado como **Base de Estudos** e deverá estar acessível em quatro pontos: painel principal, aula estruturada, cena imersiva e painel Pareto. Cada ponto abre a mesma experiência, com filtro de origem ativo, e oferece saída clara de volta para a atividade anterior.

| Origem | Filtro inicial | Próxima ação prioritária |
| --- | --- | --- |
| Painel principal | Idioma e CEFR do perfil | Retomar unidade, tema ou revisão. |
| Aula | Unidade, objetivo e termos atuais | Perguntar, ouvir, praticar ou ver explicação. |
| Cena imersiva | Cena, objetos e diálogo atuais | Abrir objeto, pergunta contextual ou ciclo Pareto da cena. |
| Pareto | Item, categoria e nível | Ouvir, praticar, criar frase ou abrir unidade relacionada. |

## Entrega por etapas

| Etapa | Escopo de implementação | Critério de aceite |
| --- | --- | --- |
| 1. Piloto A1 PT-BR → inglês | Base de Estudos com busca de termos Pareto e conteúdos autorais das quatro primeiras unidades. | Busca encontra termo, áudio correto toca após gesto, prática abre, e professor responde no contexto. |
| 2. Gramática e temas | Busca por conceito, tema, situação e CEFR; ligações com aulas e cenas. | Resultado não apresenta regra de outro idioma nem conteúdo fora do nível. |
| 3. Tutor ampliado | Professor contextual em todas as atividades do piloto, com escrita e fala. | Perguntas livres recebem resposta visível, segura e ligada à unidade. |
| 4. Expansão por idioma | Pacote editorial e técnico por idioma-alvo disponível. | Conteúdo, voz, professor, pronúncia e testes específicos são aprovados por idioma. |
| 5. Gamificação e revisão | Missões e revisões passam a usar resultados da Base de Estudos. | A pesquisa leva a prática e o desempenho altera somente a revisão do aluno. |

## Testes obrigatórios antes de publicar

O desenvolvimento exigirá testes de contrato para filtros de idioma e CEFR, autorização, moderação, retorno do professor, ligação de resultado à prática Pareto e ausência de fallback de voz/idioma incompatível. A validação funcional deverá confirmar que o atalho abre, pesquisa mostra resultado correto, o áudio toca sob gesto do aluno, a pergunta ao professor gera resposta visível e a ação de prática retorna à atividade sem perda de contexto.

Nenhum item será marcado como concluído só com tela estática ou teste unitário. A publicação exigirá TypeScript sem erros, suíte de regressão aprovada, verificação visual e confirmação de comportamento no domínio publicado.
