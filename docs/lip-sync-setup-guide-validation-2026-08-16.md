# Validação do guia inicial de IA local e animação facial

**Data:** 16 de agosto de 2026

O guia de preparação foi incluído na abertura pública (`/`) e no onboarding. Ele aparece antes do uso do aplicativo e fica marcado como lido apenas no armazenamento local do navegador, sem registrar dados pessoais nem acessar arquivos do computador.

| Verificação | Resultado |
| --- | --- |
| Orientação no início do aplicativo | Confirmada visualmente em desktop e celular |
| Responsividade e legibilidade | Confirmadas em 1280×720 e 375×812 |
| Declaração sobre Qwen/Llama | Confirma que servem para texto e não movimentam rosto, boca ou lábios |
| Limitação sem GPU NVIDIA | Explicada sem prometer sincronização natural ou tremor falso |
| Professor Ricardo | Declarado como retrato propositalmente estático |
| TypeScript | Sem erros |
| Regressões | 199 arquivos e 470 testes aprovados |

## Limite deliberado

O guia não instala software, não verifica o notebook remotamente e não ativa animação facial. A instalação de um motor facial só pode começar após identificação de uma GPU NVIDIA compatível com CUDA e uma prova visual e auditiva separada.
