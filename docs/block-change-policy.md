# Política de alteração por bloco

Toda alteração passa a seguir este contrato, aplicável a diálogo, áudio, Pareto, cartilha, segurança, termos, controle parental, idiomas, professores e cenas.

| Etapa | Regra obrigatória |
| --- | --- |
| 1. Escopo | Declarar o bloco afetado e listar os blocos que não podem mudar. |
| 2. Mudança | Alterar apenas os arquivos indispensáveis ao defeito. |
| 3. Regressão | Criar ou atualizar teste que impede o retorno do defeito e protege o contrato do bloco. |
| 4. Verificação | Executar TypeScript, testes do bloco e verificação visual quando houver interface. |
| 5. Publicação | Criar checkpoint reversível somente após as verificações. |
| 6. Confirmação humana | Para áudio, microfone, voz e interação visual, manter pendência até confirmação no navegador do aluno. |

## Ordem operacional

1. Restaurar áudio funcional do diálogo publicado sem tocar no conteúdo ou nos demais módulos.
2. Confirmar o campo Perguntar ao Professor na mesma cena, sem alterar a lógica de áudio se ela estiver estável.
3. Concluir os itens de segurança ainda pendentes: cabeçalhos, retenção parental, auditoria de infraestrutura e restauração de backup.
4. Retomar expansão curricular autoral por blocos de idioma somente depois das validações de segurança.

Nenhuma correção isolada pode reabrir ou reimplementar um bloco já validado sem requisito explícito, testes próprios e ponto de retorno.
