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
2. Métricas agregadas permitidas, logs sanitizados e regressões podem orientar um diagnóstico local opcional, que apenas propõe uma alteração revisável.
3. Uma pessoa abre e revisa a alteração proposta; nenhuma sugestão altera arquivos, banco, mídia, preço, segurança ou produção sozinha.
4. A alteração passa por TypeScript, testes e validação visual proporcional ao risco.
5. Um checkpoint preserva o estado verificado; decisões comerciais ou externas continuam exigindo autorização explícita.

> O serviço local de IA é **opcional**. A ausência de Ollama, Qwen ou GPU nunca pode bloquear estudo, segurança, conteúdo autenticado ou a continuidade do aplicativo.

## Implantação gradual e necessidade de GPU

| Etapa | Recursos liberados | Infraestrutura necessária | Critério para avançar |
|---|---|---|---|
| Inicial | Lições, cenas imersivas, retratos estáveis, voz neural, conversa protegida e recuperação local. | Hospedagem atual e recursos internos do aplicativo. | Nenhuma GPU é necessária. |
| Diagnóstico local opcional | Propostas de correção e análise local de logs sanitizados. | Computador do proprietário com serviço e modelo realmente verificados. | O diagnóstico deve continuar opcional e revisável. |
| Animação facial natural | Movimento facial sincronizado por fala, somente para professores e clipes aprovados. | GPU local compatível e motor facial validado; o computador deve permanecer disponível durante o processamento. | Qualidade visual, sincronismo, privacidade, estabilidade e custo operacional precisam ser medidos antes de disponibilização ao aluno. |
| Escala hospedada | Processamento facial para muitos alunos simultâneos. | Serviço de GPU hospedado deliberadamente escolhido após análise de volume e custo. | Aprovação explícita do proprietário; não é habilitado automaticamente nem se torna requisito de estudo. |

> A sequência padrão começa sem custo adicional de GPU. GPU local é considerada somente para animação facial natural validada; GPU hospedada é considerada apenas quando houver demanda medida que não caiba no processamento local opcional.
