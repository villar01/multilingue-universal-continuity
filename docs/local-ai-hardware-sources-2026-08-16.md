# Fontes técnicas de IA local e animação facial

| Tema | Evidência registrada | Fonte |
| --- | --- | --- |
| MuseTalk — mínimo testado | O projeto informa teste em Windows com NVIDIA GeForce RTX 3050 Ti Laptop GPU de 4 GB de VRAM, em FP16. Isso é limite de prova de conceito, não garantia de produção estável ou qualidade máxima. | https://github.com/TMElyralab/MuseTalk |
| Ollama — Modelfile | `PARAMETER num_ctx` define a janela de contexto e `PARAMETER num_predict` limita tokens previstos; os dois podem ser usados para controlar uso de memória e extensão de respostas. | https://docs.ollama.com/modelfile |
| Ollama — contexto e memória | A documentação informa que aumentar contexto aumenta a memória necessária e orienta verificar o processador/contexto com `ollama ps`. | https://docs.ollama.com/context-length |

> Qwen e Llama são modelos de texto. Eles não substituem CUDA, não aumentam VRAM e não produzem animação facial natural. A seleção de hardware para um motor facial deve ser validada com prova visual e auditiva antes de uso por alunos.
