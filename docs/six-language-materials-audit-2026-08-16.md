# Auditoria de Materiais — Base Inicial de Seis Línguas

## Escopo confirmado

A primeira versão comercial concentra materiais completos em **português, inglês, espanhol, francês, italiano e alemão**. A arquitetura não limita a plataforma a essas seis línguas: cada contrato usa códigos BCP-47 e permite acrescentar os demais idiomas até a meta de 143 sem duplicar cenários, telas ou regras de acesso.

| Área | Situação identificada | Ação necessária para a base comercial |
| --- | --- | --- |
| Cenas imersivas | Há 29 cenários, mas os diálogos e hotspots estão definidos por idioma de cena no cliente. | Separar o cenário visual do material do idioma-alvo e resolver o material por dupla de idiomas após autenticação. |
| Professores e vozes | O catálogo declara professores e vozes regionais para os idiomas iniciais; 48 perfis possuem retrato publicado. | Resolver professor pela família do idioma-alvo; preservar a foto-base quando faltar retrato próprio e nunca atribuir foto de uma pessoa a outro professor. |
| Pareto canônico | O conteúdo protegido no servidor cobre atualmente PT-BR ↔ EN-US, incluindo variantes en-GB. | Transformar cada palavra em registro multilíngue por idioma-alvo e idioma nativo, mantendo frequência, nível, cena e ciclos de prática. |
| Pareto no cliente | Existe uma cópia estática de vocabulário inglês ↔ português no pacote do navegador. | Migrar a entrega de palavras para o procedimento protegido já existente antes de ampliar as seis línguas. |
| Apoio nativo | A rota de tradução de diálogo é protegida por sessão. | Reutilizar somente como apoio nativo; o texto e a voz da lição continuam no idioma estudado. |
| Curso PDF | Não há artefato PDF curricular ativo nem fonte única de curso identificada no projeto. | Modelar o curso como unidades estruturadas protegidas e gerar o PDF sob demanda a partir do material autorizado da dupla de idiomas. |
| Liberação comercial | O roteador curricular já aplica autorização por lição e limita conteúdo de experiência inicial. | Estender a mesma autorização para Pareto, curso PDF e materiais de cena das seis línguas. |

## Ordem de implementação

Primeiro, será introduzido um contrato único de material com `targetLanguage`, `nativeLanguage`, `teacherVoiceLanguage` e `sceneId`. Em seguida, a tela consumirá somente o material resolvido e autorizado, enquanto as estruturas visuais continuam reutilizáveis. A expansão de cada idioma acrescentará conteúdo e perfis sem copiar as 29 cenas.

> Nenhuma combinação é declarada pronta sem vocabulário, diálogo, exemplo, voz compatível, apoio nativo e teste de acesso. A ausência de retrato ou de clipe não será mascarada: a foto-base estável permanece até a mídia correta estar disponível.
