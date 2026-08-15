# Auditoria Inicial de Segurança e Entrega de Conteúdo

**Data:** 15 de agosto de 2026  
**Escopo:** Rotas de aprendizagem, inscrição, aceite, entrega de lições e teste gratuito.  
**Estado:** Achados iniciais; não substitui teste de intrusão independente nem registros de infraestrutura.

## Resultado executivo

O aplicativo passou a ter um portão visual de inscrição e aceite antes das rotas pedagógicas, e os endpoints principais de lição deixaram de aceitar chamadas anônimas. Isso reduz a exposição imediata. Contudo, a auditoria identificou lacunas críticas que impedem declarar o conteúdo plenamente protegido: materiais curriculares ainda estão embutidos nos arquivos JavaScript enviados ao navegador, e o limite gratuito de dez lições ainda não é aplicado por todos os endpoints que entregam lições.

| Área auditada | Evidência | Estado | Ação obrigatória |
|---|---|---|---|
| Rotas de interface | `LearningAccessGate` envolve `Router` em `client/src/App.tsx` e bloqueia toda rota fora da lista pública | Parcialmente protegido | Validar em sessão anônima real e manter falha fechada quando a autorização não responder |
| Inscrição e aceite | O portão exige sessão e `compliance.checkAcceptance` antes de renderizar área pedagógica | Parcialmente protegido | Incluir todos os requisitos de idade e consentimento aplicáveis no mesmo contrato de liberação |
| Endpoints de lição | `lessons.getByCourse`, `list`, `listByLevel`, `getByLanguage` e `getById` usam sessão autenticada | Proteção contra anônimo aplicada | Conectar cada endpoint ao direito de teste ou assinatura antes de retornar conteúdo |
| Período gratuito | `trialAccess.authorizeLesson` persiste conta, aceite e até dez chaves de acesso distintas | Estrutura criada | Usar a mesma autorização no servidor antes de listar ou entregar cada lição |
| Conteúdo em navegador | Cartilha A1, vocabulário Pareto e blocos de linguagem são exportados por módulos em `client/src/lib/` | **Risco crítico** | Migrar conteúdos para entrega autorizada pelo servidor; não embutir material pedagógico completo no pacote público |
| Métricas de visita | Painel atual apresenta tráfego agregado, não percurso pedagógico autorizado | Insuficiente para auditoria de conteúdo | Registrar funil agregado de inscrição e acesso autorizado, sem dados de conversa ou identidade técnica individual |

## Achado crítico: conteúdo incluído no pacote do navegador

Os módulos `studyBase.ts`, `vocab-pareto.ts` e `languageBlocks.ts` contêm dados de cartilha, vocabulário e expressões no lado do cliente. Um portão de interface impede a renderização normal, mas não impede que um visitante obtenha os arquivos JavaScript que o navegador precisa baixar para executar a aplicação. Esse material deve deixar de ser distribuído em módulos do cliente e passar a ser retornado pelo servidor somente após verificar conta, aceite e direito de acesso.

> A autenticação da página é necessária, mas não é suficiente quando o próprio conteúdo já foi enviado ao navegador.

## Limites desta auditoria

Esta auditoria verifica o código e a configuração acessível no projeto. Ela não fornece acesso a logs de infraestrutura, identidade de visitantes, histórico de downloads de arquivos estáticos, dispositivos dos usuários ou investigações forenses externas. Não foi encontrada evidência, neste escopo, que prove cópia ou extração anterior de conteúdo; tampouco é possível garantir que isso nunca ocorreu.

## Próxima correção obrigatória

Antes de novas funções pedagógicas, será implementada entrega protegida de conteúdos curriculares pelo servidor e a aplicação do limite de dez lições em toda rota que retorna lição, exercício, texto ou vocabulário.
