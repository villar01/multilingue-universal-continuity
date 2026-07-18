/**
 * D-ID Talking Avatar Integration
 * Documentação: https://docs.d-id.com/reference/createtalk
 */

interface DIDConfig {
  apiKey: string;
  baseUrl: string;
}

interface CreateTalkParams {
  sourceUrl?: string; // URL da imagem do avatar
  text: string; // Texto para o avatar falar
  voiceId?: string; // ID da voz (opcional)
  languageCode?: string; // Código do idioma
}

interface TalkResponse {
  id: string;
  status: string;
  result_url?: string; // URL do vídeo gerado
  created_at: string;
}

export class DIDService {
  private config: DIDConfig;

  constructor() {
    this.config = {
      apiKey: process.env.DID_API_KEY || '',
      baseUrl: 'https://api.d-id.com'
    };
  }

  /**
   * Criar talking avatar (avatar falante)
   */
  async createTalk(params: CreateTalkParams): Promise<TalkResponse> {
    const {
      sourceUrl = 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg',
      text,
      voiceId,
      languageCode = 'en-US'
    } = params;

    const payload = {
      source_url: sourceUrl,
      script: {
        type: 'text',
        input: text,
        provider: {
          type: 'microsoft',
          voice_id: voiceId || this.getDefaultVoice(languageCode)
        }
      },
      config: {
        fluent: true,
        pad_audio: 0,
        stitch: true
      }
    };

    const response = await fetch(`${this.config.baseUrl}/talks`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': `Basic ${this.config.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`D-ID API Error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  }

  /**
   * Consultar status do talk
   */
  async getTalkStatus(talkId: string): Promise<TalkResponse> {
    const response = await fetch(`${this.config.baseUrl}/talks/${talkId}`, {
      method: 'GET',
      headers: {
        'authorization': `Basic ${this.config.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get talk status');
    }

    return await response.json();
  }

  /**
   * Aguardar conclusão do talk (polling)
   */
  async waitForTalk(talkId: string, maxAttempts = 30): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getTalkStatus(talkId);
      
      if (status.status === 'done' && status.result_url) {
        return status.result_url;
      }
      
      if (status.status === 'error') {
        throw new Error('Talk generation failed');
      }
      
      // Aguardar 2 segundos antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('Talk generation timeout');
  }

  /**
   * Obter voz padrão por idioma
   */
  private getDefaultVoice(languageCode: string): string {
    const voiceMap: Record<string, string> = {
      'en-US': 'en-US-JennyNeural',
      'es-ES': 'es-ES-ElviraNeural',
      'fr-FR': 'fr-FR-DeniseNeural',
      'de-DE': 'de-DE-KatjaNeural',
      'pt-BR': 'pt-BR-FranciscaNeural',
      'it-IT': 'it-IT-ElsaNeural',
      'ja-JP': 'ja-JP-NanamiNeural',
      'ko-KR': 'ko-KR-SunHiNeural',
      'zh-CN': 'zh-CN-XiaoxiaoNeural',
      'ru-RU': 'ru-RU-SvetlanaNeural',
      'ar-SA': 'ar-SA-ZariyahNeural',
      'hi-IN': 'hi-IN-SwaraNeural',
      'tr-TR': 'tr-TR-EmelNeural',
      'nl-NL': 'nl-NL-ColetteNeural',
      'pl-PL': 'pl-PL-ZofiaNeural',
      'sv-SE': 'sv-SE-SofieNeural',
      'da-DK': 'da-DK-ChristelNeural',
      'no-NO': 'no-NO-IselinNeural',
      'fi-FI': 'fi-FI-NooraNeural',
      'el-GR': 'el-GR-AthinaNeural'
    };
    
    return voiceMap[languageCode] || 'en-US-JennyNeural';
  }

  /**
   * Criar talking avatar com áudio customizado
   */
  async createTalkWithAudio(sourceUrl: string, audioUrl: string): Promise<TalkResponse> {
    const payload = {
      source_url: sourceUrl,
      script: {
        type: 'audio',
        audio_url: audioUrl
      },
      config: {
        fluent: true,
        pad_audio: 0,
        stitch: true
      }
    };

    const response = await fetch(`${this.config.baseUrl}/talks`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': `Basic ${this.config.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`D-ID API Error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  }
}

// Singleton instance
export const didService = new DIDService();
