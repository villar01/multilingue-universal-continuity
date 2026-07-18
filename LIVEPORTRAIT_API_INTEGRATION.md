# LivePortrait API Integration Guide

## API Endpoint

**Space:** `KlingTeam/LivePortrait`  
**URL:** `https://klingteam-liveportrait.hf.space`  
**API Name:** `/gpu_wrapped_execute_image`

## Python Client Example (from Gradio docs)

```python
from gradio_client import Client, handle_file

client = Client("KlingTeam/LivePortrait")
result = client.predict(
    param_0=0,  # float: target eyes-open ratio
    param_1=0,  # float: target lip-open ratio
    param_2=handle_file('https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png'),  # filepath: Source Portrait
    param_3=True,  # bool: do crop checkbox
    api_name="/gpu_wrapped_execute_image"
)
print(result)
```

## JavaScript/Node.js Integration

**Instalação:**
```bash
npm install @gradio/client
```

**Código:**
```javascript
import { Client } from "@gradio/client";

const client = await Client.connect("KlingTeam/LivePortrait");
const result = await client.predict("/gpu_wrapped_execute_image", {
  param_0: 0,  // eyes-open ratio
  param_1: 0,  // lip-open ratio
  param_2: "https://url-to-portrait-image.jpg",  // Source Portrait URL
  param_3: true,  // do crop
});

console.log(result.data);
// result.data contém URL do vídeo animado gerado
```

## Parâmetros

| Parâmetro | Tipo | Descrição | Padrão |
|-----------|------|-----------|--------|
| `param_0` | `float` | Target eyes-open ratio (0-1) | 0 |
| `param_1` | `float` | Target lip-open ratio (0-1) | 0 |
| `param_2` | `filepath` | Source Portrait (URL ou file path) | **Required** |
| `param_3` | `bool` | Do crop (auto-crop face) | true |

## Fluxo de Integração no MultiLingue Universal

### 1. Backend (Node.js)

Criar router `livePortrait.animate`:

```typescript
// server/_core/liveportrait.ts
import { Client } from "@gradio/client";

export async function animatePortrait(
  imageUrl: string,
  audioUrl: string
): Promise<string> {
  const client = await Client.connect("KlingTeam/LivePortrait");
  
  const result = await client.predict("/gpu_wrapped_execute_image", {
    param_0: 0,
    param_1: 0,
    param_2: imageUrl,
    param_3: true,
  });
  
  return result.data as string; // URL do vídeo animado
}
```

### 2. Router tRPC

```typescript
// server/routers.ts
livePortrait: router({
  animate: protectedProcedure
    .input(z.object({
      imageUrl: z.string().url(),
      audioUrl: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      const videoUrl = await animatePortrait(input.imageUrl, input.audioUrl);
      return { videoUrl };
    }),
}),
```

### 3. Frontend Integration

```typescript
// client/src/components/VoiceConversation.tsx
const animateMutation = trpc.livePortrait.animate.useMutation();

async function handleSendMessage() {
  // 1. Gravar áudio do microfone
  const audioBlob = await recordAudio();
  
  // 2. Upload áudio para S3
  const audioUrl = await uploadToS3(audioBlob);
  
  // 3. Gerar vídeo animado com LivePortrait
  const { videoUrl } = await animateMutation.mutateAsync({
    imageUrl: "https://storage.com/professor-ricardo.jpg",
    audioUrl,
  });
  
  // 4. Exibir vídeo animado
  setVideoSrc(videoUrl);
}
```

## Limitações

- **Latência:** 10-30 segundos por vídeo
- **Limite gratuito:** 1000 requisições/dia
- **Requer internet:** Não funciona offline

## Próximos Passos

1. Instalar `@gradio/client` no projeto
2. Criar `server/_core/liveportrait.ts`
3. Adicionar router `livePortrait.animate`
4. Integrar no `VoiceConversation.tsx`
5. Testar com foto do Professor Ricardo
