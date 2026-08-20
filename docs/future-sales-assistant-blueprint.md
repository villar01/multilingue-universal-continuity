# Vendedor Assistido e Funil Comercial — Especificação Preservada

## Finalidade

Este documento preserva o desenho comercial futuro do MultiLingue Universal. Ele **não ativa campanhas**, não publica conteúdo em redes sociais, não altera preços e não cria cobranças. Sua função é impedir que o plano seja perdido enquanto a prioridade continua sendo a estabilidade e a qualidade do aplicativo.

## Modelo escolhido

O atendimento comercial inicial será feito por um **vendedor assistido por IA**, sem vendedores humanos externos. O assistente poderá explicar somente serviços aprovados, organizar interesse, coletar consentimento e preparar rascunhos. Qualquer ação que possa gerar obrigação financeira, publicidade externa ou mudança comercial permanece dependente do proprietário.

| Capacidade | Estado planejado | Condição |
|---|---|---|
| Explicar serviços já aprovados | Permitida | Texto baseado em catálogo aprovado |
| Qualificar interesse | Permitida | Registro privado por conta autenticada |
| Receber opinião e pedido de melhoria | Permitida | Encaminhamento para revisão do proprietário |
| Preparar rascunho de campanha | Permitida | Sem postagem automática |
| Publicar anúncio | Bloqueada | Aprovação explícita do proprietário |
| Alterar orçamento, preço ou desconto | Bloqueada | Aprovação explícita do proprietário |
| Criar contrato ou cobrança | Bloqueada | Aprovação explícita do proprietário |

## Canal privado de comunicação

O canal de suporte é privado por conta autenticada. Cada cliente só poderá ler e escrever em suas próprias conversas. O proprietário poderá revisar solicitações, responder e encerrar os casos. O canal inclui limite de mensagens para reduzir abuso e preserva um histórico verificável.

## Funil futuro

1. Uma pessoa chega ao aplicativo por origem consentida, como link de campanha ou indicação.
2. O aplicativo registra apenas a origem necessária e o interesse informado pelo visitante autenticado.
3. O vendedor assistido responde sobre serviços aprovados e organiza a intenção em categorias simples: ajuda, demonstração, opinião, ideia ou segurança.
4. O proprietário acompanha gráficos de origem, interesse, cadastro, início de estudo e solicitação de serviço.
5. Somente após revisão do proprietário uma proposta comercial, anúncio, preço ou cobrança poderá ser preparado para execução externa.

## Dados e proteção

O funil deve armazenar somente os dados necessários ao atendimento e à análise de conversão consentida. Contatos, métricas e registros comerciais devem ficar restritos ao proprietário. O acesso de clientes não pode expor listas de contato, propostas, valores, atividades ou métricas de outros usuários.

## Marcos para incorporação futura

- [ ] Expor a tela privada de suporte para usuários autenticados.
- [ ] Expor o painel privado do proprietário para revisão de conversas e opiniões.
- [ ] Restringir o CRM comercial ao proprietário.
- [ ] Criar métricas sem dados simulados para origem, cadastro, início de estudo e interesse.
- [ ] Criar rascunhos de campanha a partir do catálogo aprovado.
- [ ] Integrar redes sociais somente após aprovação do proprietário e confirmação das credenciais necessárias.
- [ ] Manter bloqueios de publicação, orçamento, preço, desconto, contrato e cobrança até aprovação explícita.

## Proteções de regressão já iniciadas

A política `server/salesAssistantPolicy.ts` mantém em código os bloqueios de ações comerciais sensíveis. A regressão correspondente exige que publicação, orçamento, preço, desconto, contrato e cobrança permaneçam desativados até uma autorização própria e auditável.
