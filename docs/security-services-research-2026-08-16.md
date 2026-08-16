# Pesquisa de controles externos de segurança

## Escopo

Esta nota avalia controles atuais para complementar a proteção já implementada no aplicativo. Nenhum serviço externo está integrado por esta pesquisa e nenhum dado pessoal deve ser enviado sem aprovação explícita, contrato de tratamento de dados e configuração de minimização.

## Achados oficiais

| Serviço | Uso possível | Limite relevante |
|---|---|---|
| Cloudflare WAF e Bot Management | Proteção de borda, desafios e bloqueio de automação antes de o tráfego chegar ao aplicativo. | O Bot Management completo é um complemento Enterprise pago; não deve ser descrito como recurso gratuito ou já ativo. |
| Sentry | Monitoramento de erros com descarte de dados sensíveis antes da persistência. | Eventos de erro podem conter dados pessoais se a sanitização não for configurada; não integrar enquanto o aplicativo já tiver telemetria local minimizada e não houver aprovação para enviar eventos a terceiro. |
| Cofre de segredos gerenciado | Centralizar, limitar e revogar credenciais de serviços. | Exige definir provedor, responsabilidades e acesso administrativo; não é justificativa para mover dados pessoais. |

## Diretriz inicial

O controle de maior ganho potencial é uma proteção de borda/WAF, mas sua ativação exige domínio e configuração de DNS, que não será solicitada sem instrução passo a passo, avaliação de impacto e confirmação do proprietário. O monitoramento externo não será integrado enquanto houver risco de transferência desnecessária de telemetria.

## Fontes

1. Cloudflare, [Bot Management](https://developers.cloudflare.com/bots/get-started/bot-management/), consultado em 2026-08-16.
2. Sentry, [Data Scrubbing](https://docs.sentry.io/security-legal-pii/scrubbing/), consultado em 2026-08-16.

## Práticas de supervisão e consentimento parental

| Fonte | Prática relevante | Aplicação proporcional no MultiLingue |
|---|---|---|
| FTC / COPPA | O método de consentimento deve ser razoavelmente desenhado, conforme a tecnologia disponível, para assegurar que quem consente é responsável pelo menor; a regra não impõe um único método. | Não tratar um documento digitado como prova automática. Manter registro de aceite, conta e controles parentais; usar verificação mais forte somente quando houver obrigação concreta e aprovação jurídica. |
| Google Family Link | A supervisão familiar permite que responsáveis gerenciem configurações da conta da criança, atividades salvas, ajustes e exclusão de conta. | Priorizar uma relação responsável–menor com controles, revisão e opção de exclusão, em vez de coletar selfie ou biometria. |

As práticas pesquisadas favorecem controle da conta, transparência, revisão de atividade e exclusão. Elas não justificam identificar visitantes anônimos ou exigir cópias de documento em toda inscrição.

## Fontes adicionais

3. FTC, [Verifiable Parental Consent and the Children’s Online Privacy Rule](https://www.ftc.gov/business-guidance/privacy-security/verifiable-parental-consent-childrens-online-privacy-rule), consultado em 2026-08-16.
4. Google For Families, [Manage your child's Google Account with Family Link](https://support.google.com/families/answer/7103262?hl=en), consultado em 2026-08-16.

## WhatsApp Business para notificações ao responsável

A documentação oficial da Meta exige opt-in antes que uma empresa envie mensagens pelo WhatsApp. O opt-in deve deixar claro que a pessoa receberá comunicações, o nome da empresa e a observância das leis aplicáveis. A Meta recomenda separar categorias de mensagens, oferecer instruções claras de opt-out e respeitar a escolha do destinatário.

Aplicação no aplicativo: somente o responsável pelo aplicativo poderá optar por receber resumos de segurança, sugestões e atividade agregada. A mensagem nunca terá conteúdo de conversa de menor, áudio, documento, IP, identificação de dispositivo, e-mail ou nome de menor. A ativação dependerá de conta e número oficial do WhatsApp Business, credenciais e configuração de webhooks, que não foram solicitados nem configurados nesta etapa.

5. Meta for Developers, [Get opt-in for WhatsApp](https://developers.facebook.com/documentation/business-messaging/whatsapp/getting-opt-in), consultado em 2026-08-16.

### Eventos e proteção do endpoint

A plataforma oficial suporta webhooks para status de mensagens, mensagens recebidas, eventos de conta e alterações de qualidade. O endpoint recebe JSON de servidores da Meta e pode usar mTLS como camada adicional; tentativas de entrega podem ocorrer por até sete dias e podem ser duplicadas. Portanto, a implementação deverá aceitar somente eventos necessários, verificar a origem/assinatura, tornar o processamento idempotente, responder sem conteúdo sensível e nunca persistir corpo de mensagens de usuários.

6. Meta for Developers, [WhatsApp Business Platform Webhooks](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview), consultado em 2026-08-16.
