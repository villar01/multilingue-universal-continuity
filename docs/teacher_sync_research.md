# Pesquisa de Sincronização Facial Local

## Conclusão operacional

A etapa gratuita e local deve usar o mesmo elemento de áudio já reproduzido na página para derivar visemas simples. Ela é um modo intermediário, não substitui um par de vídeo com áudio embutido para falas fixas nem autoriza clipes genéricos.

## Fontes consultadas

| Fonte | Aplicação no projeto | Limite relevante |
|---|---|---|
| [lipsync-engine](https://github.com/Amoner/lipsync-engine) | Mostra uma arquitetura local de análise de áudio com AudioWorklet e Web Audio API, emitindo visemas para qualquer renderizador. | Repositório recente; usar apenas em prova isolada e validação humana antes de ativar. |
| [MediaPipe Face Landmarker](https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker) | Referência para blendshapes e expressões faciais em fluxo de vídeo ao vivo, caso a evolução futura tenha modelo 3D apropriado. | Analisa uma face de entrada; não resolve sozinho a animação de uma foto estática. |
| [Rhubarb Lip Sync WASM](https://github.com/danieloquelis/rhubarb-lip-sync-wasm) | Alternativa local para gerar pistas de boca a partir de áudio conhecido. | O projeto se declara beta e exige PCM de 16 kHz; não deve ser habilitado sem testes de latência. |
| [Wawa Lipsync](https://wawasensei.dev/tuto/real-time-lipsync-web) | Referência de execução local no navegador com Web Audio API para personagem 3D. | Destinado a React Three Fiber/Three.js; não é integração direta com retratos fotográficos atuais. |

## Regras permanentes

1. Vídeo somente quando o áudio estiver embutido no mesmo ativo ou houver par exato validado.
2. Visemas locais só podem ser ativados depois de teste de capacidade e validação visual humana.
3. Pausa, término ou erro de áudio fecham imediatamente o estado visual de fala.
4. O modo gratuito local não pode ser degradado por uma melhoria opcional futura.
