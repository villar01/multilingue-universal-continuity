# Kit de Recuperação de Crise Total

## Objetivo

Este kit define o que deve existir para restabelecer o MultiLingue Universal depois de uma falha total. Ele não executa restauração automática, não apaga dados e não substitui cópias existentes. O uso é deliberado, confirmado e orientado.

## Conjunto mínimo recuperável

| Camada | O que precisa existir | Verificação |
|---|---|---|
| Código e configuração | Checkpoint publicado e repositório privado atualizado | Versão conhecida e identificável |
| Dados do aplicativo | Exportação de dados e referência de esquema | Arquivo disponível e conferido antes de guardar |
| Mídia e documentos | Arquivos de referência e URLs de armazenamento | Lista de ativos e acesso confirmado |
| Cópia local | Arquivo exportado baixado para o notebook do proprietário | Presença em Downloads e tamanho diferente de zero |
| Procedimento | Passos curtos de recuperação e ponto de decisão | Nenhuma restauração iniciada sem confirmação |

## Rotina de preservação

1. Criar um checkpoint após cada marco funcional comprovado.
2. Usar o fluxo oficial de exportação de dados quando ele estiver disponível.
3. Baixar a exportação para o notebook e manter pelo menos duas cópias em locais distintos.
4. Registrar data, nome do arquivo, tamanho e resultado da verificação.
5. Não importar ou restaurar uma cópia apenas para testar sem uma decisão explícita: preservar primeiro, restaurar somente diante de necessidade real.

## Procedimento de crise

1. **Parar e identificar o último checkpoint publicado estável.**
2. **Verificar se o problema é de código, dados, mídia ou acesso.**
3. **Escolher a recuperação menos destrutiva:** restaurar somente o código publicado ou preparar recuperação de dados separadamente.
4. **Confirmar a cópia local no notebook antes de qualquer ação irreversível.**
5. **Executar a recuperação selecionada e validar acesso, autenticação, conteúdo e áudio.**
6. **Criar novo checkpoint somente após a validação.**

## Regras de segurança

- Não depender de uma única cópia.
- Não chamar uma exportação de "backup" se ela não tiver sido baixada e conferida.
- Não restaurar às cegas nem sobrescrever dados sem confirmação do proprietário.
- Separar recuperação de código de recuperação de dados para reduzir perdas acidentais.
- Registrar cada teste e cada falha no `todo.md` e no histórico de checkpoints.
