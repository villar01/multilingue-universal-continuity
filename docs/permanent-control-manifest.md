# Manifesto Permanente de Controle do MultiLingue Universal

Este manifesto é a referência de continuidade do projeto. Toda revisão externa de código deve começar por este documento, pelo `todo.md` e pelas regressões relacionadas. Ele não substitui testes nem aprovações humanas; transforma requisitos permanentes em itens verificáveis.

## Controles que não podem ser removidos por conveniência

| Área | Regra permanente | Evidência esperada |
|---|---|---|
| Conteúdo | Visitantes não recebem currículo, progresso, respostas ou material protegido. | Procedimentos protegidos e regressões de acesso anônimo. |
| Professores | Fotos originais preservadas; professor sempre visível em cenas. | Catálogo e regressões de mídia docente. |
| Voz e movimento | James usa voz masculina en-US; Ricardo permanece com boca estática; movimento lateral somente em `audio.onplaying`; `showSyntheticMouth` permanece `false`. | Contratos de voz, mídia e sincronismo. |
| Livro SOS | Sequência do original, correções documentadas, áudio nativo e Pareto separado. | Inventário, matriz de correção e testes curriculares. |
| Áudio do Caderno | Cada palavra salva precisa tocar no clique explícito, com rota própria separada da Cena. | Regressão do Caderno e validação funcional. |
| Progressão pedagógica | O percurso preserva níveis inicial, intermediário, avançado e tecnológico; cada interação segue conceito, prática guiada, resposta, correção e aplicação crescente. | Contrato de progressão de interação e regressões de nível. |
| Continuidade | Uma falha local não pode derrubar a aplicação inteira. | Fronteiras de recuperação, limite por origem e validação de rota. |
| Configurações validadas | Correções aprovadas de áudio, professor, mídia, rota e proteção não podem ser removidas por alteração posterior sem regressão que prove a equivalência. | `todo.md`, contratos centralizados, histórico de checkpoints e testes de regressão. |
| Desempenho | Não manter processos duplicados, evitar carga desnecessária e validar regressões de lentidão. | Auditoria de processos, logs e testes antes de cada marco. |
| Comercial | Vendedor assistido pode explicar serviços, qualificar interesse e preparar rascunhos; não publica campanha, não muda preço, não concede desconto, não cobra e não assina contrato sem aprovação. | `salesAssistantPolicy.ts` e testes correspondentes. |
| Dados de clientes | Conversas, opiniões, contatos e métricas comerciais são privadas e revisáveis pelo proprietário. | Procedimentos autenticados, permissão administrativa e tabelas privadas. |

## Ordem de decisão

1. Corrigir primeiro a falha reproduzida que afeta uso, segurança ou continuidade.
2. Preferir a opção interna, gratuita e com menos dependências externas.
3. Implementar diretamente mudanças seguras e reversíveis com regressão.
4. Exigir aprovação explícita antes de qualquer publicação externa, gasto, alteração de preço, desconto, cobrança, contrato ou exportação de dado sensível.
5. Publicar um checkpoint somente depois de testes e verificação funcional compatíveis com o escopo.

## Plano preservado para o futuro

O aplicativo começa com recursos internos gratuitos e estáveis. Após monetização comprovada, a evolução poderá avaliar GPU, mídia docente adicional e animações reais por fala, sem transformar esse hardware em requisito para estudo, áudio básico, segurança ou acesso de clientes.

## Como usar em revisões externas

Qualquer revisão de GitHub deve verificar, sem alterar arquivos automaticamente:

- se uma mudança viola alguma regra permanente desta tabela;
- se o `todo.md` possui a tarefa correspondente;
- se há teste de regressão para o comportamento crítico;
- se a mudança tenta automatizar uma ação comercial ou externa que exige aprovação.
