# Contrato Canônico de Cenas Imersivas por Dupla de Idiomas

## Finalidade

Cada cena imersiva deixa de ser um material fixo de um único idioma. A cena passa a ser uma **estrutura visual reutilizável** — cenário, objetos, posições e nível — à qual se associa um material do idioma estudado e um apoio no idioma nativo do aluno. A seleção de professor, retrato, voz e mídia é sempre vinculada ao idioma estudado; a explicação e a tradução são vinculadas exclusivamente ao idioma nativo.

| Camada | Responsabilidade | Regra de segurança e qualidade |
| --- | --- | --- |
| Cenário | Fundo, objetos, posições, nível CEFR e identificador da cena | Não contém diálogo, vocabulário ou respostas expostos no pacote do navegador. |
| Material do idioma estudado | Saudação, diálogo, opções, vocabulário, exemplos, pronúncia e respostas | Usa somente o idioma-alvo da sessão e é entregue somente após a autenticação. |
| Apoio nativo | Traduções, explicações e mensagens de correção | Usa somente o idioma nativo selecionado; não substitui o idioma estudado nem a voz do professor. |
| Professor | Nome, retrato, voz regional, gênero e mídia roteirizada disponível | A voz deve pertencer à mesma família do idioma-alvo; jamais recebe fallback para outro idioma. |
| Mídia docente | Clipes roteirizados de abertura, objeto, acerto e nova tentativa | Só aparece para o professor e o idioma exatos; ao falhar, retorna à foto original. |

## Contexto de resolução

```ts
type ImmersiveLanguagePairContext = {
  sceneId: string;
  targetLanguage: string; // BCP-47, por exemplo: "en-US"
  nativeLanguage: string; // BCP-47, por exemplo: "pt-BR"
  selectedTeacherId?: string;
  authenticatedUserId: number;
};

type ResolvedImmersivePair = {
  sceneId: string;
  targetMaterial: SceneTargetMaterial;
  nativeSupport: SceneNativeSupport;
  teacher: ResolvedSceneTeacher;
  media: SceneTeacherMedia;
};
```

O `targetLanguage` determina o material pedagógico, o professor e a voz. O `nativeLanguage` determina apenas o apoio. Uma preferência de professor é aceita somente se o professor tiver voz compatível com a família do idioma estudado.

## Resolução de professor e retrato

| Ordem | Regra |
| --- | --- |
| 1 | Usar o professor escolhido pelo aluno quando ele possuir voz regional compatível e retrato publicado. |
| 2 | Usar outro professor com voz regional compatível e retrato publicado. |
| 3 | Manter o professor-base e o retrato original da cena quando não houver retrato publicado para a combinação solicitada. |
| 4 | Não declarar que uma foto pertence a um professor diferente. A combinação sem retrato próprio fica marcada como `portrait_pending`, sem ocultar a foto-base. |

O fallback visual nunca remove a foto existente. A voz regional não degrada para outro idioma. Quando não houver mídia roteirizada para o professor resolvido, a cena permanece com retrato estável e voz neural do idioma estudado.

## Cobertura inicial auditada

| Item | Situação atual | Consequência de implementação |
| --- | --- | --- |
| Cenas imersivas | 29 estruturas de cenário | Todas usam o mesmo resolvedor por dupla. |
| Catálogo docente | 94 professores com vozes regionais declaradas | A compatibilidade é calculada pela família BCP-47 do idioma-alvo. |
| Retratos publicados no catálogo | 48 perfis | Os demais preservam a foto-base da cena até receberem retrato próprio. |
| Idiomas de voz do catálogo | 57 variantes regionais | Permitem expandir material sem criar uma cena duplicada por idioma. |
| Clipes roteirizados atuais | James na Praia Tropical e Sophie no Café Parisiense | Só aparecem quando professor, cena e idioma coincidem exatamente. |

## Entrega protegida de materiais

O conteúdo pedagógico por dupla de idiomas deve residir no servidor e ser entregue por procedimento protegido. O cliente recebe somente o material da cena já resolvido para a sessão autenticada. Materiais de outra combinação, listas curriculares completas, prompts e bancos de conteúdo não devem integrar o pacote público do navegador.

> Uma cena visual pode permanecer disponível como estrutura de navegação; o diálogo, as respostas, os exemplos, o vocabulário e a correção pertencem ao material protegido da dupla de idiomas.

## Regra de expansão

Um novo idioma ou uma nova dupla não exige copiar 29 cenas. Basta acrescentar o material do idioma estudado para os cenários desejados, o apoio nativo necessário e um professor compatível. A infraestrutura mantém o mesmo contrato para cada combinação, e a cobertura aumenta sem interromper as cenas já ativas.
