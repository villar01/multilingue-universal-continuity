# Fronteira de Segurança entre Aplicativo e Hospedagem

## Controles verificados no aplicativo

| Controle | Evidência no projeto | Limite declarado |
|---|---|---|
| Autorização curricular | Portão HTTP, `protectedProcedure` e regressões de entrega pedagógica. | Não substitui proteção de rede do provedor. |
| Controle de abuso | Limitação de API, autenticação, ativos e sinais pseudonimizados em memória. | Não identifica pessoas, endereços IP brutos ou dispositivos. |
| Navegador | CSP, HSTS, política de referência, permissões e proteção de enquadramento. | Cabeçalhos não eliminam riscos de extensões, dispositivos comprometidos ou captura de tela autorizada. |
| Conteúdo pedagógico | Catálogo público visual e material canônico autenticado no servidor. | Um usuário autorizado ainda pode visualizar o conteúdo liberado. |
| Segredos | Variáveis de ambiente do projeto; cliente não recebe segredos do servidor. | A proteção física, credenciais da conta de hospedagem e camada de rede permanecem responsabilidade do provedor e do proprietário. |

## Camada de hospedagem

Os detalhes de firewall, mitigação de DDoS, rede, backups de infraestrutura, isolamento físico, disponibilidade e retenção do provedor **não são inferidos** pelo código do aplicativo. Eles devem ser confirmados apenas por documentação oficial, painel de hospedagem ou contrato aplicável.

> Nenhuma configuração manual de DigitalOcean, outro provedor, firewall externo ou integração de terceiros é exigida para os controles acima funcionarem. Caso uma necessidade externa seja identificada no futuro, ela deve ser apresentada com motivo, impacto, instruções reversíveis e aprovação explícita antes de qualquer ativação.
