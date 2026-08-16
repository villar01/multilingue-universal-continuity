export const LIP_SYNC_GUIDE_STORAGE_KEY = "ml-lip-sync-setup-guide-seen";

export const LIP_SYNC_SETUP_STEPS = [
  {
    title: "Use o aplicativo normalmente",
    description:
      "As lições, a voz e os exercícios continuam disponíveis. O retrato do Professor Ricardo permanece propositalmente estático, mesmo quando a voz está ativa.",
  },
  {
    title: "Confira a placa de vídeo do computador",
    description:
      "No Windows, pressione Ctrl + Shift + Esc, abra Desempenho e selecione GPU. Anote o nome da placa. Uma sincronização facial local natural exige uma placa NVIDIA compatível com CUDA; se não houver NVIDIA, não instale um motor facial local neste computador.",
  },
  {
    title: "Instale Qwen ou Llama somente para texto",
    description:
      "Se desejar prática de texto local, baixe o Ollama do site oficial e execute ollama run qwen2.5. Qwen e Llama respondem, explicam e auxiliam exercícios de texto; eles não movimentam rosto, boca ou lábios.",
  },
  {
    title: "Não deixe o notebook ligado esperando animação",
    description:
      "A instalação de Qwen ou Llama não cria animação facial e o app hospedado não consegue usar automaticamente uma porta local do computador. Deixar o notebook ligado não substitui uma GPU NVIDIA nem inicia um serviço facial.",
  },
  {
    title: "Ative o motor facial apenas em computador compatível",
    description:
      "Quando houver uma GPU NVIDIA com CUDA, será feita uma prova de conceito separada, com consentimento, teste visual e áudio real. Nenhum motor será ativado no curso sem essa validação. Não será usado tremor artificial como substituto de movimento labial.",
  },
] as const;
