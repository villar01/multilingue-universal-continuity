# Integração D-ID API para Lip-Sync Realista

## Visão Geral

**D-ID** é uma API de IA que transforma fotos estáticas em vídeos de talking heads com sincronização labial perfeita.

**Características:**
- Cria vídeos realistas a partir de uma foto + texto/áudio
- Sincronização labial automática (lip-sync) com IA
- Suporta 100+ idiomas e vozes TTS
- Renderização 100 FPS (4x mais rápido que tempo real)
- Suporta streaming em tempo real via WebRTC

## Endpoint Principal

```bash
POST https://api.d-id.com/talks
```

## Exemplo de Integração

### 1. Criar vídeo talking head

```typescript
const response = await fetch('https://api.d-id.com/talks', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${D_ID_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    source_url: 'https://example.com/professor-ricardo.jpg',
    script: {
      type: 'audio',
      audio_url: 'https://example.com/audio.mp3' // Áudio TTS gerado
    }
  })
});

const { id } = await response.json();
```

### 2. Verificar status do vídeo

```typescript
const statusResponse = await fetch(`https://api.d-id.com/talks/${id}`, {
  headers: {
    'Authorization': `Basic ${D_ID_API_KEY}`
  }
});

const { status, result_url } = await statusResponse.json();

if (status === 'done') {
  // Vídeo pronto em result_url
  videoElement.src = result_url;
}
```

## Pricing (2026)

- **Free Tier**: 20 vídeos/mês (até 5min cada)
- **Lite**: $49/mês - 120 vídeos
- **Pro**: $196/mês - 600 vídeos
- **Enterprise**: Custom pricing

## Vantagens

✅ Sincronização labial perfeita com IA  
✅ Suporta áudio customizado (Google TTS)  
✅ Funciona com qualquer foto fotorrealista  
✅ Streaming em tempo real disponível  
✅ Sem necessidade de múltiplas imagens (sprite sheets)

## Desvantagens

❌ Requer API key (custo adicional)  
❌ Latência de 10-30s para gerar vídeo  
❌ Vídeo expira em 24h (precisa re-gerar)  
❌ Dependência de serviço externo

## Alternativas

1. **Synthesia API** - Similar, mais caro
2. **HeyGen API** - Focado em marketing
3. **Rhubarb Lip-Sync** - Open source, requer sprite sheets
4. **Wav2Lip** - Open source, requer GPU local

## Recomendação

Para **MultiLingue Universal**, D-ID é a melhor opção se:
- Budget permite $49-196/mês
- Latência de 10-30s é aceitável
- Preferência por solução cloud (sem GPU local)

Caso contrário, usar **pulsação sincronizada com áudio** (solução atual) até ter budget para D-ID.
