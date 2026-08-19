# Verificação de acesso curricular em produção

Em 19/08/2026, foi aberta uma sessão sem autenticação no endereço publicado da Cena da Praia Tropical:

`https://multilingua-qfeb6mgx.manus.space/immersive-scene?scene=beach`

O servidor respondeu somente com:

```json
{"code":"learning-authentication-required"}
```

Não foram exibidos cenário, diálogo, Livro SOS, vocabulário ou qualquer conteúdo curricular. Esta verificação confirma o bloqueio de entrega de aprendizado para visitante nesse ponto de entrada público. Ela não substitui as regressões de API, que cobrem as entregas curriculares protegidas individualmente.
