# Experiência visual das cenas: padrão e GPU local opcional

## Decisão de produto

Toda pessoa recebe a mesma experiência pedagógica base: a cena permanece aberta, o professor fica visível, o aluno mantém acesso a áudio, texto, hotspots, exercícios, Pareto e Consulta Rápida. A qualidade pedagógica não depende de possuir uma GPU NVIDIA.

| Modo | Quando pode ser usado | O que entrega | O que não faz |
| --- | --- | --- | --- |
| Padrão | Sempre | Retrato estável, futura mídia pré-gerada autorizada, áudio, texto e atividades da cena | Não acessa o notebook, não instala software e não cria rosto dinâmico localmente |
| Visual avançado local | Somente após consentimento, componente local instalado, GPU NVIDIA/CUDA confirmada e conexão local disponível | Mantém tudo do padrão e fica elegível a futuro motor facial local baseado em áudio | Não é ativado só por detectar GPU; não usa GPU remota nem envia dados pessoais automaticamente |

## Duas camadas de movimento

| Camada | Disponibilidade | Uso na cena | Limite honesto |
| --- | --- | --- | --- |
| Poses pré-geradas | Todos os alunos, sem GPU | O professor pode saudar, apontar um objeto, incentivar, corrigir e encerrar por uma sequência curta de poses ou clipe gravado | Não é apresentada como boca sincronizada em tempo real |
| Boca dinâmica futura | Somente com GPU NVIDIA/CUDA, componente local e validação | Pode complementar falas novas com movimento facial orientado pelo áudio | Se falhar, retorna à pose pré-gerada ou ao retrato neutro |

## Regra de continuidade

O modo avançado não cria outra versão da cena. Ele apenas melhora recursos visuais futuros dentro da mesma cena e não remove as poses pré-geradas. Se a GPU, o componente local ou a conexão local não estiverem disponíveis, o aplicativo retorna imediatamente ao modo padrão, sem tela vazia, sem perda de hotspot e sem interromper a atividade.

## Privacidade e controle

O componente local futuro exige escolha explícita do aluno ou responsável. Não há instalação silenciosa, porta pública de entrada no notebook, leitura de documentos pessoais ou envio automático de foto, áudio ou vídeo. Uma implementação futura deve apresentar permissão específica antes de processar qualquer mídia pessoal.

## Estado desta versão

Este documento e o contrato compartilhado são preparatórios. Eles não detectam GPU, não se conectam ao notebook, não habilitam GPU externa, não geram vídeo e não alteram o diálogo ou as cenas atuais.
