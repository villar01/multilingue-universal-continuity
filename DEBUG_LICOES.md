# Debug - Lições não carregando

## Problema
Lições não aparecem na seção "Suas Lições" mesmo com English selecionado.

## Achados
1. Dashboard mostra "Selecione um idioma para ver as lições" mesmo com English selecionado
2. Router `lessons.getByLanguage` foi corrigido para usar destructuring correto: `const [coursesResult] = await database.execute(...)`
3. Banco de dados tem 20 lições em inglês (languageId=1)
4. Existem 7 cursos de inglês no banco

## Próximos passos
1. Verificar se DashboardReal.tsx está chamando o router correto
2. Adicionar logs no router para debug
3. Verificar console do navegador para erros específicos
