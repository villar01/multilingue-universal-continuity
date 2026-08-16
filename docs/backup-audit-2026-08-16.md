# Auditoria de backup e recuperação controlada

**Data da auditoria:** 16 de agosto de 2026.

## Estado observado

| Item | Evidência | Estado |
| --- | --- | --- |
| Agendamento | Snapshot completo a cada seis horas | Ativo |
| Último snapshot | `backup_scheduled_82724`, concluído em 2026-08-16 00:03:39 UTC | Confirmado por metadados do banco |
| Integridade registrada | 451.519 bytes cifrados, checksum SHA-256, 2.152 registros e status `completed` | Confirmado por metadados; conteúdo não foi lido |
| Histórico recente | Dez snapshots mais recentes retornaram status `completed` | Confirmado por consulta somente leitura |
| Criptografia | AES-256-GCM, formato versionado `MLB1` | Confirmado em código e testes |
| Acesso público | Não há rota HTTP pública para listar, baixar ou restaurar snapshots | Confirmado por mapeamento de rotas |

## Recuperação controlada

Uma restauração nunca é executada por esta auditoria. O mecanismo exige a confirmação literal `RESTORE <id-do-backup>`, valida o checksum do arquivo cifrado, gera um ponto de retorno completo antes de qualquer escrita e usa transação. A recuperação real deve ocorrer somente após aprovação explícita do responsável, em janela de manutenção e com teste em ambiente separado sempre que disponível.

## Limite pendente

Esta auditoria não é um teste destrutivo de restauração. A simulação automatizada cobre o fluxo de confirmação, checksum, ponto de retorno e transação; uma restauração real permanece dependente de aprovação humana e de uma janela controlada.
