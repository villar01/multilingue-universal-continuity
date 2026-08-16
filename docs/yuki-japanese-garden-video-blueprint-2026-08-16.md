# Piloto de Mídia Docente — Yuki no Jardim Japonês

## Objetivo e parâmetros globais

O piloto cria uma camada visual opcional para a cena **Jardim Japonês**. Os vídeos são curtos, em japonês e preservam a foto original de Yuki como superfície padrão e retorno imediato ao término ou a falhas de mídia. Cada clipe apresenta uma ação pedagógica única, fala gerada dentro do próprio vídeo e somente ambiência discreta de jardim, sem música de fundo.

| Campo | Definição |
| --- | --- |
| Cena | Jardim Japonês (`garden`) |
| Professora | Yuki, japonês `ja-JP` |
| Público | Alunos em prática de japonês na cena imersiva |
| Formato | Vídeo horizontal 16:9, 720p, duração de 4 a 6 segundos por clipe |
| Estilo | Vídeo fotorrealista, luz natural suave de jardim japonês, enquadramento médio, postura acolhedora e profissional |
| Identidade visual | Mulher adulta japonesa, cabelo escuro, aparência profissional e expressão serena; preservar os traços e o figurino do retrato original |
| Áudio | Fala japonesa nativa gerada no vídeo e ambiência leve de jardim; sem música de fundo |
| Fallback obrigatório | Foto original de Yuki; nenhum clipe substitui, remove ou altera o retrato base |

## Roteiro dos quatro clipes

| ID | Gatilho | Duração | Fala em japonês | Ação pedagógica e transição |
| --- | --- | --- | --- | --- |
| `yuki-garden-greeting` | `scene_open` | 6s | “ようこそ！私はゆきです。この日本庭園は美しいですね！” | Yuki já aparece em enquadramento médio no jardim desde o primeiro quadro. Ela faz um pequeno gesto de boas-vindas, fala olhando para o aluno e termina em postura tranquila. Cerejeiras, ponte, pedras e luz suave permanecem presentes durante todo o clipe. |
| `yuki-garden-point-sakura` | `object_focus` | 4s | “桜を見てください。桜が美しいです。” | Yuki permanece no mesmo jardim, com flores de cerejeira visíveis desde o início. Ela abre a mão em direção às flores, volta o olhar ao aluno e pronuncia a palavra com clareza. A câmera e o cenário permanecem estáveis até o término. |
| `yuki-garden-praise` | `correct_answer` | 4s | “素晴らしい！とても上手です。続けましょう。” | Yuki começa com um sorriso de aprovação e um breve aceno afirmativo. Ela oferece um gesto discreto de incentivo e termina pronta para a próxima atividade. A composição do jardim e o figurino permanecem constantes. |
| `yuki-garden-retry` | `retry_answer` | 4s | “もう一度聞いてください。桜。” | Yuki começa com expressão paciente, toca de leve a região próxima à orelha para convidar à escuta e direciona a mão aberta às flores de cerejeira. Ela termina com um sorriso encorajador, sem inserir ou remover elementos do cenário. |

## Referência visual necessária

Uma referência horizontal 16:9 de Yuki no Jardim Japonês será criada a partir do retrato original publicado, preservando identidade, cabelo, figurino e expressão. A composição deve manter Yuki em enquadramento médio, com espaço lateral para gestos de boas-vindas e indicação das cerejeiras. Não deve conter texto, logotipos, rótulos ou marcas d’água.
