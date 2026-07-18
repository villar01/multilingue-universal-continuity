import { invokeLLM } from "./_core/llm";

/**
 * Gerador de vídeos educacionais interativos com IA
 * Superior ao Teacher Poli - 100% original
 */

export interface VideoScene {
  id: string;
  duration: number; // segundos
  dialogue: {
    speaker: string;
    text: string;
    translation: string;
    startTime: number;
    endTime: number;
    words: {
      word: string;
      translation: string;
      phonetic: string;
      startTime: number;
      endTime: number;
    }[];
  }[];
  setting: string;
  characters: {
    name: string;
    role: string;
    personality: string;
  }[];
}

export interface InteractiveVideo {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  languageCode: string;
  duration: number;
  thumbnail: string;
  scenes: VideoScene[];
  vocabulary: {
    word: string;
    translation: string;
    phonetic: string;
    example: string;
    audioUrl?: string;
  }[];
  exercises: {
    type: 'multiple_choice' | 'fill_blank' | 'pronunciation' | 'conversation';
    question: string;
    options?: string[];
    correct: number | string;
    sceneId: string;
  }[];
}

/**
 * Gera um vídeo educacional completo com IA
 */
export async function generateEducationalVideo(params: {
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  languageCode: string;
  duration?: number; // minutos
}): Promise<InteractiveVideo> {
  const { topic, level, languageCode, duration = 3 } = params;

  const prompt = `Create a complete educational video script for language learning.

Topic: ${topic}
Level: ${level}
Language: ${languageCode}
Duration: ${duration} minutes

Generate a JSON response with this EXACT structure:
{
  "title": "Video title",
  "description": "Brief description",
  "scenes": [
    {
      "id": "scene1",
      "duration": 60,
      "setting": "Location description",
      "characters": [
        {"name": "Character name", "role": "waiter/customer/etc", "personality": "friendly/formal/etc"}
      ],
      "dialogue": [
        {
          "speaker": "Character name",
          "text": "Full sentence in target language",
          "translation": "Translation to Portuguese",
          "startTime": 0,
          "endTime": 3,
          "words": [
            {
              "word": "individual word",
              "translation": "tradução",
              "phonetic": "/IPA/",
              "startTime": 0,
              "endTime": 0.5
            }
          ]
        }
      ]
    }
  ],
  "vocabulary": [
    {
      "word": "key word",
      "translation": "tradução",
      "phonetic": "/IPA/",
      "example": "Example sentence"
    }
  ],
  "exercises": [
    {
      "type": "multiple_choice",
      "question": "Question based on video",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correct": 0,
      "sceneId": "scene1"
    }
  ]
}

Requirements:
- Create 2-3 scenes for a ${duration}-minute video
- Natural, realistic dialogue
- Include 10-15 key vocabulary words
- Add 5-8 exercises based on the video content
- Use proper IPA phonetic notation
- Make it engaging and educational`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an expert language learning content creator. Generate educational video scripts with precise timing, natural dialogue, and interactive elements."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "educational_video",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            scenes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  duration: { type: "number" },
                  setting: { type: "string" },
                  characters: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        role: { type: "string" },
                        personality: { type: "string" }
                      },
                      required: ["name", "role", "personality"],
                      additionalProperties: false
                    }
                  },
                  dialogue: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        speaker: { type: "string" },
                        text: { type: "string" },
                        translation: { type: "string" },
                        startTime: { type: "number" },
                        endTime: { type: "number" },
                        words: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              word: { type: "string" },
                              translation: { type: "string" },
                              phonetic: { type: "string" },
                              startTime: { type: "number" },
                              endTime: { type: "number" }
                            },
                            required: ["word", "translation", "phonetic", "startTime", "endTime"],
                            additionalProperties: false
                          }
                        }
                      },
                      required: ["speaker", "text", "translation", "startTime", "endTime", "words"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["id", "duration", "setting", "characters", "dialogue"],
                additionalProperties: false
              }
            },
            vocabulary: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  word: { type: "string" },
                  translation: { type: "string" },
                  phonetic: { type: "string" },
                  example: { type: "string" }
                },
                required: ["word", "translation", "phonetic", "example"],
                additionalProperties: false
              }
            },
            exercises: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  question: { type: "string" },
                  options: {
                    type: "array",
                    items: { type: "string" }
                  },
                  correct: { type: "number" },
                  sceneId: { type: "string" }
                },
                required: ["type", "question", "correct", "sceneId"],
                additionalProperties: false
              }
            }
          },
          required: ["title", "description", "scenes", "vocabulary", "exercises"],
          additionalProperties: false
        }
      }
    }
  });

  const content = response.choices[0].message.content || "{}";
  const videoData = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));

  // Calcular duração total
  const totalDuration = videoData.scenes.reduce((sum: number, scene: VideoScene) => sum + scene.duration, 0);

  return {
    id: `video_${Date.now()}`,
    level,
    languageCode,
    duration: totalDuration,
    thumbnail: `/videos/${topic.toLowerCase().replace(/\s+/g, '_')}.jpg`,
    ...videoData
  };
}

/**
 * Gera áudio Text-to-Speech para uma frase
 */
export async function generateSpeechAudio(text: string, languageCode: string): Promise<string> {
  // TODO: Integrar com Text-to-Speech API da Manus
  // Por enquanto, retorna URL placeholder
  return `/audio/tts_${Date.now()}.mp3`;
}
