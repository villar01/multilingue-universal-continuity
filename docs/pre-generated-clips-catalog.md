# Catálogo de Clipes Pré-gerados para Cenas Imersivas

**Estado:** plano de produção. Este catálogo não cria imagens, vídeos, áudios, tarefas em GPU, conectores ou cobranças. As fotos originais permanecem a camada visual padrão; um clipe só pode sobrepor o retrato quando for aprovado e corresponder ao professor, à fala e ao áudio exatos. [1] [2]

> A identidade do professor deve ser resolvida no momento da produção pelo resolvedor de professor e pelo par de idiomas da lição. O catálogo de prévias não autoriza reutilizar a voz, a foto ou a gravação de outro professor. [3]

## Slots de mídia por cena

| Slot | Gatilho | Pose permitida | Par de áudio exigido | Fallback |
|---|---|---|---|---|
| Abertura | `scene_open` | Saudação | Saudação roteirizada do mesmo professor | Retrato + áudio existente |
| Objeto-chave | `object_focus` | Apontar | Palavra ou frase roteirizada do objeto | Retrato + áudio existente |
| Pronúncia | Atividade roteirizada | Neutra ou apontar | Pronúncia fixa do mesmo professor | Retrato + áudio neural |
| Instrução | Exercício roteirizado | Neutra | Instrução fixa | Retrato + áudio existente |
| Repetição | Exercício roteirizado | Incentivo | Convite curto de repetição | Retrato + áudio existente |
| Correção | `retry_answer` | Correção calma | Feedback fixo de nova tentativa | Retrato + áudio existente |
| Encerramento | `scene_close` | Encerramento | Fecho roteirizado | Retrato + áudio existente |

As respostas livres não recebem vídeo nem boca dinâmica. Elas permanecem no modo de áudio neural com retrato estável. [2]

## Cobertura das 29 cenas

| Ordem | Cena | Slots planejados | Professor e idioma na produção | Situação atual |
|---:|---|---|---|---|
| 1 | Paris, França | 7 slots | Resolvidos pelo par ativo | Planejado |
| 2 | Praia Tropical | 7 slots | Resolvidos pelo par ativo | Piloto James aprovado; demais slots planejados |
| 3 | Floresta Encantada | 7 slots | Resolvidos pelo par ativo | Planejado |
| 4 | Tóquio, Japão | 7 slots | Resolvidos pelo par ativo | Planejado |
| 5 | Nova York, EUA | 7 slots | Resolvidos pelo par ativo | Planejado |
| 6 | Cozinha Moderna | 7 slots | Resolvidos pelo par ativo | Planejado |
| 7 | Restaurante Brasileiro | 7 slots | Resolvidos pelo par ativo | Planejado |
| 8 | Aeroporto Internacional | 7 slots | Resolvidos pelo par ativo | Planejado |
| 9 | Hotel de Luxo | 7 slots | Resolvidos pelo par ativo | Planejado |
| 10 | Supermercado | 7 slots | Resolvidos pelo par ativo | Planejado |
| 11 | Sala de Aula | 7 slots | Resolvidos pelo par ativo | Planejado |
| 12 | Hospital | 7 slots | Resolvidos pelo par ativo | Planejado |
| 13 | Parque da Cidade | 7 slots | Resolvidos pelo par ativo | Planejado |
| 14 | Montanha Nevada | 7 slots | Resolvidos pelo par ativo | Planejado |
| 15 | Deserto do Saara | 7 slots | Resolvidos pelo par ativo | Planejado |
| 16 | Fazenda Campestre | 7 slots | Resolvidos pelo par ativo | Planejado |
| 17 | Museu de Arte | 7 slots | Resolvidos pelo par ativo | Planejado |
| 18 | Cinema Moderno | 7 slots | Resolvidos pelo par ativo | Planejado |
| 19 | Academia de Ginástica | 7 slots | Resolvidos pelo par ativo | Planejado |
| 20 | Biblioteca | 7 slots | Resolvidos pelo par ativo | Planejado |
| 21 | Escritório Moderno | 7 slots | Resolvidos pelo par ativo | Planejado |
| 22 | Metrô de Paris | 7 slots | Resolvidos pelo par ativo | Planejado |
| 23 | Porto Mediterrâneo | 7 slots | Resolvidos pelo par ativo | Planejado |
| 24 | Mercado Medieval | 7 slots | Resolvidos pelo par ativo | Planejado |
| 25 | Spa & Bem-Estar | 7 slots | Resolvidos pelo par ativo | Planejado |
| 26 | Jardim Japonês | 7 slots | Resolvidos pelo par ativo | Planejado |
| 27 | Café Parisiense | 7 slots | Resolvidos pelo par ativo | Planejado |
| 28 | Casa da Família | 7 slots | Resolvidos pelo par ativo | Planejado |
| 29 | Família no Aeroporto | 7 slots | Resolvidos pelo par ativo | Planejado |

## Produção, armazenamento e entrega

| Fase | Regra | Custo/infraestrutura atual |
|---|---|---|
| Produção | Iniciar somente após autorização do retrato, roteiro, áudio e primeiro plano do professor | Nenhum fornecedor ou GPU é ativado por este plano. |
| Revisão | Validar visualmente e ouvir cada par fala–áudio antes de integrar | Não aprovar por metadado ou credencial. |
| Armazenamento | Publicar somente clipes aprovados em armazenamento do aplicativo, com metadados de professor, fala, áudio e cena | Nenhum novo arquivo foi criado. |
| Entrega | Reproduzir apenas durante o áudio exato; no fim, erro ou falta de rede, revelar o retrato original | Sem custo adicional habilitado por este documento. |
| Retenção | Substituir ou remover um clipe sem remover o retrato original | Reversão por remoção do ativo de clipe. |

## Sequência de execução segura

O piloto da Praia Tropical permanece a referência de processo, não um molde de mídia reutilizável. O próximo clipe só pode ser produzido depois de confirmar professor, idioma, roteiro e áudio da cena específica. Após cada lote, a verificação mínima inclui identidade docente, ausência de boca sintética em respostas livres, reprodução somente durante o áudio correspondente, fallback de retrato e regressões do projeto.

## Referências de código

[1]: ../client/src/lib/immersiveScenesCatalog.ts "Catálogo de 29 cenas e retratos de prévia"
[2]: ../shared/teacherMediaStrategy.ts "Gatilhos, pares exatos de áudio–vídeo e fallback"
[3]: ../client/src/lib/sceneTeacherResolver.ts "Resolvedor docente por par de idiomas"
