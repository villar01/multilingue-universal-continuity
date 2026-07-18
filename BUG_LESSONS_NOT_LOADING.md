# Bug: Lições Não Aparecem no Dashboard

## Problema
Dashboard mostra "Selecione um idioma para ver as lições" mesmo com inglês selecionado.

## Dados Confirmados

### Backend (✅ FUNCIONANDO)
- Banco de dados tem lições reais
- Curso ID: 120064 (English - Beginner)
- 10 lições criadas (IDs 152461-152470)
- Títulos corretos: "Greetings", "Numbers", "Colors", etc.
- Query SQL funciona: `SELECT * FROM lessons WHERE courseId = 120064`

### Router tRPC (✅ FUNCIONANDO)
- Endpoint existe: `lessons.getByCourse`
- Aceita parâmetro `courseId`
- Retorna `await db.getLessonsByCourse(input.courseId)`

### Frontend (❌ NÃO FUNCIONA)
- Arquivo: `/client/src/pages/DashboardReal.tsx`
- Query: `trpc.lessons.getByCourse.useQuery({ courseId: firstCourse?.id! }, { enabled: !!firstCourse })`
- Problema: Query não retorna dados para o componente React
- Console.log não aparece (código React pode não estar executando)

## Tentativas de Correção

1. ✅ Removi parâmetro `limit` inválido
2. ✅ Adicionei `useEffect` para selecionar inglês automaticamente
3. ✅ Adicionei logs de debug
4. ❌ Logs não aparecem no console (React não está executando?)

## Próximos Passos

1. Verificar se há erro de compilação TypeScript impedindo execução
2. Verificar se `firstCourse` está sendo populado corretamente
3. Testar query tRPC diretamente no console do navegador
4. Criar página de teste isolada para validar query tRPC
