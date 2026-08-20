# Fontes para evolução contínua e segurança

Consulta registrada em 20/08/2026 para orientar decisões futuras, sem ativar automações, serviços externos ou cobrança.

| Tema | Constatação aplicável | Fonte |
|---|---|---|
| GitHub Copilot Free | O plano gratuito permanece disponível para desenvolvedores individuais elegíveis, com limites mensais de uso; a página de planos informa 2.000 conclusões por mês e uso limitado de chat/agentes. | [GitHub Copilot Plans](https://github.com/features/copilot/plans) |
| Limites de uso | Limites temporários devem ser tratados como limitação de capacidade; não afetam o repositório ou a publicação do aplicativo. | [GitHub Docs — Usage limits](https://docs.github.com/en/copilot/concepts/usage-limits) |
| Segurança de APIs | Autorização por objeto e função, autenticação, consumo de recursos, fluxos sensíveis, SSRF e inventário de endpoints exigem controles explícitos. | [OWASP API Security Top 10](https://owasp.org/www-project-api-security/) |
| DDoS | A defesa precisa abranger ataques volumétricos, de protocolo e de aplicação, com plano de resposta e proteção de borda. | [CISA — DDoS guidance](https://www.cisa.gov/resources-tools/resources/understanding-and-responding-distributed-denial-service-attacks) |

## Limites de infraestrutura relevantes

O aplicativo publicado atende a fluxos web gerenciados. Processos contínuos, GPU ou execução local precisam ser escolhidos por requisito concreto: revisão periódica e determinística pode permanecer no serviço web; uma instalação no computador do cliente usa o hardware local e depende de a máquina permanecer ligada; GPU não deve ser presumida no ambiente publicado atual. Nenhuma dessas opções está ativa neste registro.
