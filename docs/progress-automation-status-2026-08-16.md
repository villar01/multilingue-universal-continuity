# Rotina automática de progresso — estado inicial

## Objetivo

A rotina automática foi limitada deliberadamente a **diagnóstico e recomendação**. Ela não modifica código, banco de dados, controles de segurança, conteúdo pedagógico ou publicação.

| Campo | Valor |
| --- | --- |
| Nome | `daily-safe-progress-audit` |
| Identificador | `iwdL7sVyLSi5ZrJKCV6Pi6` |
| Agenda | Diariamente às 06:35 UTC |
| Primeira execução esperada | 2026-08-16 06:35 UTC |
| Destino | `/api/scheduled/ai-self-improve` |
| Entrada | Telemetria técnica minimizada das últimas 24 horas |
| Saída | Insight administrativo e recomendações revisáveis |
| Modelo permitido | Ollama local do ambiente do aplicativo, sem fallback remoto automático |

## Proteções obrigatórias

1. A rota aceita somente chamadas autenticadas da agenda.
2. A rotina não tem código que aplique correções automaticamente.
3. Qualquer recomendação permanece em revisão até uma alteração explícita, testes, validação e checkpoint.
4. Em ausência de telemetria ou de modelo local, a rotina retorna um resultado seguro sem publicar alterações.

## Rotina já existente

O backup criptografado do banco continua ativo a cada seis horas, separado desta auditoria de progresso.
