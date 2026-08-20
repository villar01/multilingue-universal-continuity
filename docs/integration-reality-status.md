# Estado Real das Integrações — Verificado em 19/08/2026

## Resultado

| Integração | Evidência verificada | Estado real | Regra de comunicação |
|---|---|---|---|
| GitHub | Conector GitHub habilitado; repositório privado `villar01/multilingue-universal-continuity` acessível; último envio remoto identificado em `42563fc`; cópia local em `4faa1bc`. | **Disponível para continuidade de código**, mas a cópia local não está sincronizada com esse remoto e há arquivos locais ainda não publicados. | Não apresentar GitHub como revisão automática de código ou correção de conteúdo. |
| Claude / Anthropic | Configuração da sessão contém o conector Anthropic desabilitado; não há evidência de chamadas produtivas nesta correção. | **Inativo.** | Não apresentar Claude como colaborador ativo até habilitação e execução registrada. |
| Ollama | Não há binário `ollama`, processo `ollama serve` nem resposta da API local na porta 11434. | **Inativo e indisponível neste ambiente.** | Não apresentar Ollama como ativo. |
| Qwen 2.5 | Qwen dependia do serviço Ollama local; não existe serviço nem modelo acessível neste ambiente. | **Inativo e indisponível neste ambiente.** | Não apresentar Qwen 2.5 como ativo. |

## Consequência prática

Nenhuma dessas integrações deve ser usada como prova de que o Livro SOS foi revisado, que a animação docente foi validada ou que o aplicativo está protegido contra regressões. A partir deste diagnóstico, toda integração só poderá ser marcada como operacional após demonstrar conexão, execução bem-sucedida e registro da evidência.

## Próximas ações possíveis

1. Sincronizar e comparar o repositório GitHub antes de utilizar sua cópia como continuidade.
2. Habilitar Claude somente após autorização e testar uma chamada real de revisão, com resultado rastreável.
3. Instalar ou apontar para um servidor Ollama real, carregar o modelo Qwen 2.5 e validar uma geração local antes de mostrar o provedor como disponível.
4. Manter o aplicativo com o provedor atualmente funcional até que as validações acima sejam concluídas.
