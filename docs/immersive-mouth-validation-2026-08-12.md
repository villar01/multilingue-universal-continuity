# Validação da boca facial — cena imersiva

Data: 2026-08-12

## Verificado

- A cena **Praia Tropical** não exibe mais a barra auxiliar de som sob o professor.
- O diálogo ainda precisa ser iniciado pelo botão **Iniciar Diálogo** para observar movimento em tempo real.
- O código facial usa o relógio do áudio neural e distingue abertura, arredondamento, dentes e língua conforme o visema cronometrado.
- Os testes de visemas e voz neural passaram após a alteração.

## Inicialização de cena

A validação posterior confirmou que a cena Praia Tropical abriu com fundo, nome, hotspots e saudação de praia coerentes. A ativação de qualquer nova cena agora encerra áudio e diálogo anteriores antes de criar a saudação da nova cena.
