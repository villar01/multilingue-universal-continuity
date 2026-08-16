# Validação publicada do diálogo — 2026-08-16

## Estado técnico

- A rota pública de voz retornou áudio MP3 não vazio na verificação técnica: 44.928 bytes com cabeçalho de frame MPEG válido.
- A correção candidata está publicada no checkpoint `81cf7ce7`.
- TypeScript não apresentou erros e a suíte aprovou 468 testes.

## Limite da validação automatizada

A Cena Imersiva exige sessão autenticada. A verificação pelo navegador de sandbox foi redirecionada para autenticação e, por isso, não conseguiu acionar o diálogo, ouvir o áudio ou enviar uma pergunta no contexto de aluno.

## Confirmação ainda necessária

Em uma sessão autenticada no domínio publicado, confirmar que:

1. O áudio de James mostra duração maior que `0:00` e toca.
2. O campo **Perguntar** aceita texto durante resposta lenta.
3. O professor devolve resposta escrita visível e, quando disponível, fala audível.
