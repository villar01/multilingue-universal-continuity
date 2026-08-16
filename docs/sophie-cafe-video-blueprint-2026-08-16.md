# Piloto de Mídia Docente — Sophie no Café Parisiense

## Objetivo e parâmetros globais

Este piloto cria uma camada visual opcional para a cena **Café Parisiense**. Os clipes serão curtos, em francês e destinados a estudantes iniciantes; o retrato original de Sophie continua como a superfície padrão e como retorno imediato ao término ou a qualquer falha de mídia. Cada clipe tem uma única ação pedagógica e utiliza a voz gerada dentro do próprio vídeo, sem trilha musical de fundo.

| Campo | Definição |
| --- | --- |
| Cena | Café Parisiense (`cafe`) |
| Professora | Sophie, francês `fr-FR` |
| Público | Alunos iniciantes de francês na cena imersiva |
| Formato | Vídeo horizontal 16:9, 720p, duração de 4 a 6 segundos por clipe |
| Estilo | Vídeo fotorrealista, iluminação quente de café parisiense, enquadramento médio, aparência profissional e acolhedora |
| Identidade visual | Mulher adulta de cabelo castanho-escuro ondulado, olhos castanhos, blusa azul-marinho, colar discreto e expressão cordial; preservar esses traços em todos os clipes |
| Áudio | Fala francesa nativa gerada no vídeo; ambiência discreta de café, sem música de fundo |
| Fallback obrigatório | Foto original de Sophie; nenhum clipe substitui, remove ou altera o retrato base |

## Roteiro dos quatro clipes

| ID | Gatilho | Duração | Fala em francês | Ação pedagógica e transição |
| --- | --- | --- | --- | --- |
| `sophie-cafe-greeting` | `scene_open` | 6s | “Bonjour ! Je m’appelle Sophie. Bienvenue au café !” | Sophie já aparece enquadrada diante de um balcão de café desde o primeiro quadro. Ela sorri, faz um gesto de boas-vindas com uma mão e mantém contato visual enquanto pronuncia a saudação. Xícaras, vitrine e luz quente permanecem visíveis ao fundo durante todo o clipe. |
| `sophie-cafe-point-croissant` | `object_focus` | 4s | “Regardez le croissant. Un croissant, s’il vous plaît.” | Sophie permanece em primeiro plano no café, com um prato e um croissant visíveis ao lado desde o início. Ela estende a mão aberta em direção ao croissant e retorna o olhar ao aluno ao repetir a expressão. A câmera permanece estável e todos os objetos continuam presentes até o final. |
| `sophie-cafe-praise` | `correct_answer` | 4s | “Excellent ! Votre français est superbe. Continuons.” | Sophie inicia com expressão orgulhosa e faz um aceno afirmativo curto. Ela sorri, levanta discretamente a mão em sinal de incentivo e termina em postura neutra, pronta para a próxima etapa. O ambiente de café e o figurino permanecem constantes. |
| `sophie-cafe-retry` | `retry_answer` | 4s | “Essayons encore. Écoutez : un croissant, s’il vous plaît.” | Sophie começa com expressão paciente e acolhedora. Ela aponta brevemente para a própria orelha para convidar a escuta, depois abre a mão em direção ao croissant. A ação termina com um sorriso de incentivo, sem desaparecer nenhum objeto do cenário. |

## Referência visual necessária

Uma referência horizontal 16:9 de Sophie no café deve ser criada a partir do retrato original publicado, preservando identidade, cabelo, blusa azul-marinho, colar e iluminação natural. A composição deve manter Sophie em enquadramento médio com espaço lateral suficiente para os gestos de boas-vindas e de indicação do croissant. Não deve conter texto, logotipos, rótulos ou marcas d’água.
