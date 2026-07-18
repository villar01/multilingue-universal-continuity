/**
 * REALISTIC 3D AVATARS INTEGRATION
 * Integração com HeyGen e Synthesia para professores virtuais fotorrealistas
 */

// ============================================================
// HEYGEN API (AVATARES REALISTAS)
// ============================================================

interface HeyGenVideoOptions {
  avatarId: string; // ID do avatar (ex: "josh_lite3_20230714")
  text: string; // Texto para o avatar falar
  voiceId?: string; // ID da voz (opcional, usa voz padrão do avatar)
  language?: string; // ISO 639-1 code
  title?: string; // Título do vídeo
}

interface HeyGenVideoResult {
  videoId: string;
  videoUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  duration?: number;
}

export async function generateRealisticTeacherVideo(
  options: HeyGenVideoOptions
): Promise<HeyGenVideoResult> {
  const apiKey = process.env.HEYGEN_API_KEY;

  if (!apiKey) {
    console.warn('[HeyGen] API key not configured. Using fallback.');
    return {
      videoId: 'fallback',
      videoUrl: '',
      status: 'failed',
    };
  }

  const { avatarId, text, voiceId, language = 'en', title } = options;

  try {
    // 1. Criar vídeo
    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({
        video_inputs: [
          {
            character: {
              type: 'avatar',
              avatar_id: avatarId,
              avatar_style: 'normal',
            },
            voice: voiceId
              ? {
                  type: 'voice_id',
                  voice_id: voiceId,
                }
              : {
                  type: 'text',
                  input_text: text,
                  language: language,
                },
            background: {
              type: 'color',
              value: '#FFFFFF',
            },
          },
        ],
        dimension: {
          width: 1280,
          height: 720,
        },
        aspect_ratio: '16:9',
        title: title || 'Lesson Video',
        test: false, // false para produção, true para teste
      }),
    });

    if (!response.ok) {
      throw new Error(`HeyGen API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      videoId: data.data.video_id,
      videoUrl: '', // URL será gerada após processamento
      status: 'processing',
    };
  } catch (error) {
    console.error('[HeyGen] Error generating video:', error);
    throw error;
  }
}

// ============================================================
// HEYGEN - VERIFICAR STATUS DO VÍDEO
// ============================================================

export async function getHeyGenVideoStatus(
  videoId: string
): Promise<HeyGenVideoResult> {
  const apiKey = process.env.HEYGEN_API_KEY;

  if (!apiKey) {
    throw new Error('[HeyGen] API key not configured');
  }

  try {
    const response = await fetch(
      `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
      {
        method: 'GET',
        headers: {
          'X-Api-Key': apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HeyGen API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      videoId: data.data.video_id,
      videoUrl: data.data.video_url || '',
      status: data.data.status,
      duration: data.data.duration,
    };
  } catch (error) {
    console.error('[HeyGen] Error getting video status:', error);
    throw error;
  }
}

// ============================================================
// SYNTHESIA API (ALTERNATIVA)
// ============================================================

interface SynthesiaVideoOptions {
  avatarId: string;
  script: string;
  voiceId?: string;
  title?: string;
}

export async function generateSynthesiaVideo(
  options: SynthesiaVideoOptions
): Promise<HeyGenVideoResult> {
  const apiKey = process.env.SYNTHESIA_API_KEY;

  if (!apiKey) {
    console.warn('[Synthesia] API key not configured. Using fallback.');
    return {
      videoId: 'fallback',
      videoUrl: '',
      status: 'failed',
    };
  }

  const { avatarId, script, voiceId, title } = options;

  try {
    const response = await fetch('https://api.synthesia.io/v2/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
      body: JSON.stringify({
        title: title || 'Lesson Video',
        input: [
          {
            avatarSettings: {
              horizontalAlign: 'center',
              scale: 1,
              style: 'rectangular',
              seamless: false,
            },
            backgroundSettings: {
              videoSettings: {
                shortBackgroundContentMatchMode: 'freeze',
                longBackgroundContentMatchMode: 'trim',
              },
            },
            avatar: avatarId,
            scriptText: script,
            voice: voiceId || 'en-US-Neural2-A',
          },
        ],
        test: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Synthesia API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      videoId: data.id,
      videoUrl: '',
      status: 'processing',
    };
  } catch (error) {
    console.error('[Synthesia] Error generating video:', error);
    throw error;
  }
}

// ============================================================
// AVATARES DISPONÍVEIS
// ============================================================

export const HEYGEN_AVATARS = {
  // Avatares profissionais (adequados para adultos)
  professional: [
    { id: 'josh_lite3_20230714', name: 'Josh', gender: 'male', ethnicity: 'caucasian' },
    { id: 'anna_costume1_cameraA', name: 'Anna', gender: 'female', ethnicity: 'caucasian' },
    { id: 'tyler_front_20230808', name: 'Tyler', gender: 'male', ethnicity: 'african' },
  ],
  // Avatares amigáveis (adequados para adolescentes)
  friendly: [
    { id: 'emma_public_3_20240108', name: 'Emma', gender: 'female', ethnicity: 'caucasian' },
    { id: 'wayne_20240711', name: 'Wayne', gender: 'male', ethnicity: 'asian' },
  ],
  // Avatares animados (adequados para crianças)
  animated: [
    { id: 'animated_josh', name: 'Animated Josh', gender: 'male', style: 'cartoon' },
    { id: 'animated_anna', name: 'Animated Anna', gender: 'female', style: 'cartoon' },
  ],
};

export const SYNTHESIA_AVATARS = {
  professional: [
    { id: 'anna_costume1_cameraA', name: 'Anna', gender: 'female' },
    { id: 'james_costume1_cameraA', name: 'James', gender: 'male' },
  ],
  friendly: [
    { id: 'lily_costume1_cameraA', name: 'Lily', gender: 'female' },
    { id: 'mike_costume1_cameraA', name: 'Mike', gender: 'male' },
  ],
};

// ============================================================
// HELPER - ESCOLHER AVATAR BASEADO NO NÍVEL
// ============================================================

interface SelectAvatarOptions {
  ageLevel: 'infantil' | 'adolescente' | 'adulto';
  gender: 'male' | 'female';
  language: string;
}

export function selectAvatarForLevel(options: SelectAvatarOptions): string {
  const { ageLevel, gender } = options;

  if (ageLevel === 'infantil') {
    // Usar avatares animados para crianças
    const animated = HEYGEN_AVATARS.animated.find((a) => a.gender === gender);
    return animated?.id || HEYGEN_AVATARS.animated[0].id;
  }

  if (ageLevel === 'adolescente') {
    // Usar avatares amigáveis para adolescentes
    const friendly = HEYGEN_AVATARS.friendly.find((a) => a.gender === gender);
    return friendly?.id || HEYGEN_AVATARS.friendly[0].id;
  }

  // Usar avatares profissionais para adultos
  const professional = HEYGEN_AVATARS.professional.find((a) => a.gender === gender);
  return professional?.id || HEYGEN_AVATARS.professional[0].id;
}
