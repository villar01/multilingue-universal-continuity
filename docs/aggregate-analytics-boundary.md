# Fronteira de Métricas Agregadas

## Eventos atualmente emitidos

| Evento fixo | Momento | Dados enviados |
|---|---|---|
| `open_public_home` | Abertura da página pública | Somente o nome fixo do evento. |
| `begin_signup` | Antes do redirecionamento de cadastro | Somente o nome fixo do evento. |
| `open_abc_book` | Abertura da cartilha | Somente o nome fixo do evento. |
| `open_pareto` | Abertura da prática Pareto | Somente o nome fixo do evento. |
| `open_immersive_scene` | Abertura da Cena Imersiva | Somente o nome fixo do evento. |
| `open_teacher` | Abertura do Professor | Somente o nome fixo do evento. |

O emissor aceita somente esses nomes fixos. Ele não encaminha perfil, cena específica, resposta, texto de conversa, URL detalhada ou identificador de conta.

## Interpretação permitida

Os números devem ser apresentados apenas com a definição fornecida pelo painel de métricas configurado. Sem essa definição, uma contagem como “103 visitas” **não pode** ser interpretada como visitantes únicos, sessões, visualizações, intenção de compra ou receita.

O evento de início de cadastro mede uma tentativa agregada antes do redirecionamento. A conclusão de cadastro não é emitida pelo aplicativo enquanto o retorno do provedor de autenticação não oferecer um sinal agregado, verificável e sem identidade. Essa lacuna permanece intencional para evitar contagem imprecisa ou associação de identidade ao funil.

> A expansão de métricas depende de uma definição verificável do provedor e deve preservar o contrato de evento sem parâmetros. Eventos de conversa, áudio, respostas, idioma, professor, perfil, cena específica e dados técnicos identificáveis continuam proibidos.
