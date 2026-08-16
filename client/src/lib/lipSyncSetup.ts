export const LIP_SYNC_GUIDE_STORAGE_KEY = "ml-lip-sync-setup-guide-seen";

export const LIP_SYNC_SETUP_STEPS = [
  {
    title: "Comece a aprender agora",
    description:
      "As lições, a voz neural, os exercícios e os clipes pedagógicos já estão disponíveis. O retrato do Professor Ricardo foi planejado para permanecer estável enquanto a voz acompanha a atividade.",
  },
  {
    title: "Conheça a capacidade de vídeo do computador",
    description:
      "No Windows, pressione Ctrl + Shift + Esc, abra Desempenho e selecione GPU. Anote o nome da placa: uma GPU NVIDIA compatível com CUDA pode habilitar, em uma etapa futura e opcional, interações faciais locais mais avançadas.",
  },
  {
    title: "Amplie a prática de texto com Qwen ou Llama",
    description:
      "Se desejar prática de texto local, baixe o Ollama do site oficial e execute ollama run qwen2.5. Qwen e Llama podem responder, explicar e apoiar exercícios escritos; os clipes pedagógicos continuam oferecendo a camada visual da experiência.",
  },
  {
    title: "Escolha a configuração adequada ao seu objetivo",
    description:
      "A plataforma funciona normalmente com os recursos já disponíveis. A preparação local de IA de texto amplia a prática escrita, enquanto a futura configuração facial será apresentada como uma etapa separada e orientada.",
  },
  {
    title: "Adicione recursos faciais com verificação guiada",
    description:
      "Quando houver uma GPU NVIDIA com CUDA, a plataforma poderá oferecer uma prova de conceito separada, com consentimento, teste visual e áudio real. A ativação será feita somente após uma validação completa, preservando uma apresentação estável e profissional em cada etapa.",
  },
] as const;

export const GPU_INTERACTION_NOTICE = {
  withCuda:
    "Uma GPU NVIDIA compatível com CUDA poderá processar, depois de configuração e validação separadas, interações visuais mais complexas: resposta facial por áudio, movimentos naturais, vídeos dinâmicos e reações a objetos da cena.",
  withoutCuda:
    "A experiência disponível inclui texto, voz, exercícios, vídeos pedagógicos pré-gerados e vocabulário. Esses recursos formam uma jornada completa enquanto as interações visuais avançadas permanecem como uma expansão opcional.",
  availability:
    "Os recursos visuais avançados serão apresentados separadamente, com configuração clara e validação antes de cada ativação.",
} as const;
