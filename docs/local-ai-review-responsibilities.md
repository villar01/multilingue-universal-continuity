# Responsabilidades de Diagnóstico Local e Revisão Externa

Este documento separa as funções de diagnóstico, revisão e decisão para evitar promessas de automação inexistente ou alterações sem controle humano.

| Componente | Pode fazer | Não pode fazer | Evidência exigida |
|---|---|---|---|
| Qwen 2.5 local | Quando o serviço e o modelo estiverem comprovadamente disponíveis, pode resumir logs locais, classificar falhas e elaborar **propostas** de correção no ambiente local. | Não declara disponibilidade sem processo e modelo verificados; não publica, não altera banco, não muda preço, não executa scripts ou comandos por conta própria. | Verificação local do serviço/modelo, proposta revisável, TypeScript, testes e checkpoint humano. |
| GitHub | Mantém histórico, revisões externas de leitura, pull requests e CI quando configurado pelo proprietário. | Não edita arquivos automaticamente, não envia conteúdo privado sem autorização e não aprova ações comerciais. | Revisão humana do diff e decisão explícita do proprietário. |
| Aplicativo MultiLingue | Exibe recursos já publicados e aplica guardas de acesso, currículo, idade e consentimento. | Não se apresenta como possuidor de GPU local, modelo local ativo ou animação facial natural quando não houver prova operacional. | Regressões, validações funcionais e texto público verificável. |
| Proprietário | Aprova checkpoints e decisões sensíveis de produto, segurança, dados e comércio. | Não delega publicação externa, preços, descontos, cobrança, contrato ou exportação de dados a um processo automático. | Aprovação explícita registrada antes de qualquer ação sensível. |

## Ciclo permitido

1. Um erro reproduzível, log ou regressão abre uma tarefa no `todo.md`.
2. Um diagnóstico local opcional pode propor uma alteração, sem executá-la autonomamente.
3. A alteração passa por revisão de código, TypeScript, testes e validação proporcional ao risco.
4. Um checkpoint preserva o estado verificado; decisões comerciais ou externas continuam exigindo autorização explícita.

> O serviço local de IA é **opcional**. A ausência de Ollama, Qwen ou GPU nunca pode bloquear estudo, segurança, conteúdo autenticado ou a continuidade do aplicativo.
