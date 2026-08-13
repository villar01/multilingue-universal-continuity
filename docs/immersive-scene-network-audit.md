# Auditoria de Rede — Cena Imersiva

## Observação em 12 de agosto de 2026

A abertura direta de `/immersive-scene?scene=beach` carregou a interface da praia sem resposta 429 visível. A inspeção de `performance.getEntriesByType('resource')` mostrou, porém, um lote indevido de chamadas `lessons.getExercises` para numerosas lições durante a abertura da cena, além da consulta agrupada inicial e de `system.health`.

Esse volume não pertence ao conteúdo da cena de praia, que só precisa do estado da cena ativa. A próxima correção deve impedir o pré-carregamento de exercícios de todo o catálogo ao abrir uma cena imersiva e manter apenas a consulta estritamente necessária para a tela atual.

## Critério de validação

Após a correção, a abertura direta de uma cena deve permanecer sem respostas 429 e sem o lote de `lessons.getExercises` para lições não relacionadas. O limitador continuará bloqueando excesso de chamadas de API acima do orçamento definido.

## Validação após a correção

Na reabertura direta de `/immersive-scene?scene=beach`, o navegador registrou somente três chamadas de API, incluindo analytics, a consulta agrupada de lições/idiomas/autenticação e `system.health`. A contagem de `lessons.getExercises` foi **zero**. A cena permaneceu carregada e não exibiu resposta 429.
