# Diagnóstico da Cena Imersiva — 19/08/2026

## Evidência recebida

A tela da Cena Imersiva caiu repetidamente para a fronteira de erro com a mensagem “Algo deu errado”. A captura mostra que a falha ocorre após a abertura da cena em modo tela cheia.

## Tentativa de reprodução sem sessão

As verificações no domínio publicado e no ambiente de desenvolvimento responderam `learning-authentication-required` antes de carregar a interface. Portanto, a exceção exibida não pode ser reproduzida sem uma sessão autorizada e será isolada por contratos de renderização, registros locais e inspeção de código, sem liberar conteúdo curricular a visitantes.

## Limites preservados

Nenhuma foto docente, mídia, áudio, Livro SOS, conteúdo curricular, controle parental ou autorização foi alterado durante este diagnóstico.
