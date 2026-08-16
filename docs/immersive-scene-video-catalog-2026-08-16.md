# Catálogo de vídeo pré-gerado para cenas imersivas

## Regra para todas as cenas

Cada cena imersiva pode ter quatro vídeos curtos do professor. A regra é parametrizada por `sceneId`, professor e variante de idioma; portanto, vale para todas as cenas existentes e para as futuras, sem inventar vídeos ou alterar diálogos hoje.

| Segmento | Papel pedagógico | Origem do texto | Máxima recomendada |
| --- | --- | --- | --- |
| `opening` | Apresentar professor, ambiente e objetivo | Saudação inicial da cena | 8 segundos |
| `focus_vocabulary` | Explicar o objeto ou palavra central | Fala docente aprovada e hotspot prioritário | 8 segundos |
| `repeat_instruction` | Convidar repetição e pronúncia | Instrução docente curta | 8 segundos |
| `closing` | Reforçar progresso e próximo passo | Encerramento da cena | 8 segundos |

Por exemplo, a Praia Tropical pode ter James dizendo a abertura, explicando *ocean*, pedindo repetição de *palm tree* e encerrando a prática. A rua de Paris, a cozinha, Tóquio, o aeroporto e todas as demais cenas seguem a mesma estrutura usando seus textos já roteirizados e seus professores correspondentes.

## Fluxo de reprodução

1. Um vídeo é reproduzido somente quando existir ativo original com texto exato, idioma, professor e segmento corretos, revisado como `approved`.
2. A página carrega apenas metadados inicialmente. O vídeo é baixado ao aluno somente quando ele seleciona a fala roteirizada correspondente.
3. Perguntas livres, correções novas e diálogo imprevisível permanecem em texto e áudio neural com retrato estável.
4. Se não houver vídeo, ocorrer falha de rede ou o aluno preferir não carregar mídia, a aula continua com o canal de áudio; nunca com animação falsa.

## Custos reais

Vídeo pré-gerado não exige GPU para cada reprodução. A geração é feita uma vez, e a mesma mídia pode atender vários alunos. Ainda assim, há custos que precisam ser previstos:

| Fonte de custo | Quando ocorre | Como limitar |
| --- | --- | --- |
| Produção e revisão | Uma vez por vídeo original | Começar com os quatro segmentos mais reutilizáveis por cena e idioma |
| Armazenamento | Enquanto o ativo existir | Usar arquivos compactados, versão aprovada única e remoção de rascunhos |
| Entrega de mídia | Quando o aluno reproduz o vídeo | Carregamento sob demanda, clipes curtos, poster e legenda separados |
| GPU externa dinâmica | Somente se ativada no futuro | Não está ativada, não possui cobrança e não será chamada por vídeos pré-gerados |

> Na versão atual, não há criação de vídeos, custo novo de GPU, cobrança adicional ou envio de dados de alunos. O catálogo é uma preparação técnica e editorial para produzir mídia original de forma gradual e segura.
