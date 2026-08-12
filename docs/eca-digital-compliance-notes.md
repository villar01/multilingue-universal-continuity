# ECA Digital — requisitos de produto a verificar

> **Nota de escopo:** este material orienta implementação e revisão técnica; não substitui parecer jurídico. A configuração final deve ser revisada por assessoria jurídica qualificada antes de qualquer declaração pública de conformidade.

## Fontes oficiais consultadas

| Fonte | Pontos relevantes ao aplicativo |
|---|---|
| [Lei nº 15.211/2025 — Planalto](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15211.htm) | A lei alcança produtos ou serviços com provável acesso de crianças e adolescentes. Prioriza melhor interesse, proteção por padrão, prevenção de conteúdo e contato inadequados, classificação etária, minimização de dados e supervisão parental. |
| [ECA Digital — Ministério da Justiça](https://www.gov.br/mj/pt-br/assuntos/sua-protecao/sedigi/eca-digital/eca-digital-1) | O Ministério informa a vigência em 17 de março de 2026 e destaca segurança por padrão, aferição de idade em contextos previstos, supervisão parental acessível e moderação/reporte de conteúdo. |

## Tradução para controles verificáveis

| Exigência de produto | Controle a implementar ou verificar |
|---|---|
| Melhor interesse e proteção por padrão | Perfil de menor com modo protegido ativo inicialmente; recursos de risco não devem ser habilitados por padrão. |
| Conteúdo e contatos inadequados | Filtro de entrada e saída em conversa, classificação etária por fluxo, bloqueio e motivo auditável para responsável. |
| Supervisão parental | Controles de tempo, preferências de segurança, visão consolidada de uso e alertas sem exposição desnecessária do conteúdo do menor. |
| Dados de menores | Coletar o mínimo necessário, separar dado de idade/consentimento de dados pedagógicos e restringir o uso de sinais etários à proteção. |
| IA e segurança | Revisar periodicamente guardas de IA, manter logs de eventos de segurança e oferecer recurso para desativar funcionalidades não essenciais quando aplicável. |

## Limite de implementação

As regras específicas de verificação de idade, reporte e requisitos técnicos dependem de regulamentação e do contexto de risco de cada funcionalidade. O aplicativo não deve alegar certificação ou conformidade integral sem a revisão jurídica e técnica correspondente.
