import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Check, Volume2, Loader2, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getTeacherDisplayName } from "@/lib/teacherNames";
import { speakText as speakNaturalVoice } from "@/hooks/useNaturalVoice";
import { stopEdgeTTS } from "@/lib/edgeTTSClient";
import { TEACHERS_57 } from "@/data/teachers57";

interface TeacherSelectorProps {
  languageCode: string;
  onSelect: (teacherId: number) => void;
  selectedTeacherId?: number;
}

// Personality tags shown on card (not language)
const TEACHER_TAGS: Record<number, string[]> = {
  1: ["Clássico", "Motivador"],
  30001: ["Elegante", "Precisa"],
  90002: ["Calorosa", "Paciente"],
  90003: ["Dinâmico", "Cultural"],
  90004: ["Criativo", "Enérgico"],
  150003: ["Experiente", "Direto"],
  150004: ["Moderna", "Amigável"],
  180001: ["Carismático", "Inspirador"],
  210001: ["Detalhista", "Gentil"],
  210002: ["Sério", "Eficiente"],
};

function getTagsForTeacher(id: number, personality?: string): string[] {
  if (TEACHER_TAGS[id]) return TEACHER_TAGS[id];
  if (personality) {
    const words = personality.split(/[,\s]+/).filter((w: string) => w.length > 3).slice(0, 2);
    if (words.length > 0) return words;
  }
  return ["Dedicado", "Fluente"];
}

export default function TeacherSelector({
  languageCode,
  onSelect,
  selectedTeacherId,
}: TeacherSelectorProps) {
  const [playingTeacher, setPlayingTeacher] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "male" | "female">("all");

  const { data: dbTeachers, isLoading } = trpc.teachers.list.useQuery();

  // Merge database teachers with TEACHERS_57 fallback
  // If database has teachers, use them; otherwise fall back to TEACHERS_57
  const teachers = useMemo(() => {
    if (dbTeachers && dbTeachers.length > 0) {
      // Enrich database teachers with photos from TEACHERS_57
      return dbTeachers.map((t: any) => {
        const t57 = TEACHERS_57.find(t57 => {
          const tCode = (t.voiceLanguageCode || t.voice_language_code || '').split('-')[0];
          return t57.langCode === tCode || t57.voiceLang === (t.voiceLanguageCode || t.voice_language_code);
        });
        return {
          ...t,
          photoUrl: t.photoUrl || t.photo_url || t57?.photo || null,
          voiceLanguageCode: t.voiceLanguageCode || t.voice_language_code || t57?.voiceLang || languageCode,
          gender: t.gender || t57?.gender || 'female',
          name: t.name || t57?.name || 'Professor',
          personality: t.personality || t57?.personality,
        };
      });
    }
    // Fallback: use TEACHERS_57 directly (convert to DB-like format)
    return TEACHERS_57.map((t, idx) => ({
      id: idx + 1,
      name: t.name,
      gender: t.gender || 'female',
      voiceLanguageCode: t.voiceLang,
      photoUrl: t.photo || null,
      personality: t.personality,
      title: t.name,
    }));
  }, [dbTeachers]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-52" />
        ))}
      </div>
    );
  }

  if (!teachers || teachers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nenhum professor disponível.</p>
      </div>
    );
  }

  // Shuffle once on mount for visual variety — not alphabetical order
  // useMemo with stable dep so it doesn't re-shuffle on every render
  const teacherList = useMemo(() => {
    const list = Array.isArray(teachers) ? [...teachers] : [teachers];
    return list.sort(() => 0.5 - Math.random());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teachers?.length]);
  const filtered = filter === "all"
    ? teacherList
    : teacherList.filter((t: any) => t.gender === filter);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-900">Escolha seu Professor</h2>
        <p className="text-gray-500 text-sm">
          {teacherList.length} professores disponíveis — escolha quem irá guiá-lo
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex justify-center gap-2">
        {(["all", "male", "female"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === f
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f === "all" ? `Todos (${teacherList.length})` : f === "male" ? "👨 Masculino" : "👩 Feminino"}
          </button>
        ))}
      </div>

      {/* Teacher grid — full-bleed photo cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filtered.map((teacher: any) => {
          const isSelected = selectedTeacherId === teacher.id;
          const isPlaying = playingTeacher === teacher.id;
          // Use DB name directly — getTeacherDisplayName falls back to "Professor" for unknown IDs
          // OLD: const { name: displayName } = getTeacherDisplayName(teacher.id, languageCode);
          const displayName = teacher.name || getTeacherDisplayName(teacher.id, languageCode).name;
          const tags = getTagsForTeacher(teacher.id, teacher.personality);
          const teacherLang = teacher.voiceLanguageCode || teacher.voice_language_code || languageCode;
          // Support both camelCase (Drizzle) and snake_case (raw SQL) field names
          const rawPhoto = teacher.photoUrl || teacher.photo_url || null;
          const photoUrl = rawPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=200&background=4f46e5&color=fff&bold=true`;

          return (
            <div
              key={teacher.id}
              onClick={() => onSelect(teacher.id)}
              className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-200 ${
                isSelected
                  ? "ring-4 ring-blue-500 shadow-2xl scale-[1.03]"
                  : "shadow-md hover:shadow-xl hover:scale-[1.02]"
              }`}
              style={{ aspectRatio: "3/4" }}
            >
              {/* Full-bleed photo */}
              <img
                src={photoUrl}
                alt={displayName}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=200&background=4f46e5&color=fff&bold=true`;
                }}
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1 shadow-lg z-10">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}

              {/* Star for featured teachers */}
              {teacher.id <= 210002 && (
                <div className="absolute top-2 left-2 bg-yellow-400 rounded-full p-1 shadow z-10">
                  <Star className="w-3 h-3 text-yellow-900 fill-yellow-900" />
                </div>
              )}

              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10">
                <p className="text-white font-bold text-sm leading-tight truncate">{displayName}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {tags.slice(0, 2).map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Voice button */}
                <button
                  className={`mt-2 w-full flex items-center justify-center gap-1 text-xs py-1 rounded-lg transition-all ${
                    isPlaying
                      ? "bg-blue-500 text-white"
                      : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isPlaying) return;
                    setPlayingTeacher(teacher.id);
                    playVoiceSample(
                      teacher.voiceId ?? null,
                      teacherLang,
                      teacher.gender,
                      displayName,
                      () => setPlayingTeacher(null)
                    );
                  }}
                  disabled={isPlaying}
                >
                  {isPlaying ? (
                    <><Loader2 className="w-3 h-3 animate-spin" />Falando...</>
                  ) : (
                    <><Volume2 className="w-3 h-3" />Ouvir Voz</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm button */}
      {selectedTeacherId && (
        <div className="text-center pt-2">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold px-10 py-4 text-lg shadow-xl rounded-2xl"
            onClick={() => onSelect(selectedTeacherId)}
          >
            ✅ Começar com {teacherList.find((t: any) => t.id === selectedTeacherId)?.name || "Professor"}
          </Button>
        </div>
      )}
    </div>
  );
}

function playVoiceSample(
  voiceId: string | null,
  langCode: string,
  gender?: string,
  teacherName?: string,
  onEnd?: () => void
) {
  const sampleTexts: Record<string, string> = {
    "pt-BR": `Olá! Sou ${teacherName || 'seu professor'} e vou ajudá-lo a aprender. Vamos começar!`,
    "pt": `Olá! Sou ${teacherName || 'seu professor'} e vou ajudá-lo a aprender. Vamos começar!`,
    "en-US": `Hello! I'm ${teacherName || 'your teacher'} and I'll help you learn. Let's get started!`,
    "en": `Hello! I'm ${teacherName || 'your teacher'} and I'll help you learn. Let's get started!`,
    "en-GB": `Hello! I'm ${teacherName || 'your teacher'} and I'll help you learn. Let's get started!`,
    "es-ES": `¡Hola! Soy ${teacherName || 'tu profesor'} y te ayudaré a aprender. ¡Empecemos!`,
    "es": `¡Hola! Soy ${teacherName || 'tu profesor'} y te ayudaré a aprender. ¡Empecemos!`,
    "fr-FR": `Bonjour! Je suis ${teacherName || 'votre professeur'} et je vais vous aider à apprendre. Commençons!`,
    "fr": `Bonjour! Je suis ${teacherName || 'votre professeur'} et je vais vous aider à apprendre. Commençons!`,
    "de-DE": `Hallo! Ich bin ${teacherName || 'Ihr Lehrer'} und helfe Ihnen beim Lernen. Fangen wir an!`,
    "de": `Hallo! Ich bin ${teacherName || 'Ihr Lehrer'} und helfe Ihnen beim Lernen. Fangen wir an!`,
    "it-IT": `Ciao! Sono ${teacherName || 'il tuo insegnante'} e ti aiuterò a imparare. Iniziamo!`,
    "it": `Ciao! Sono ${teacherName || 'il tuo insegnante'} e ti aiuterò a imparare. Iniziamo!`,
    "ja-JP": `こんにちは！私は${teacherName || 'あなたの先生'}です。一緒に学びましょう！`,
    "ja": `こんにちは！私は${teacherName || 'あなたの先生'}です。一緒に学びましょう！`,
    "zh-CN": `你好！我是${teacherName || '你的老师'}，让我们一起学习吧！`,
    "zh": `你好！我是${teacherName || '你的老师'}，让我们一起学习吧！`,
    "ko-KR": `안녕하세요! 저는 ${teacherName || '선생님'}이에요. 함께 배워봐요!`,
    "ko": `안녕하세요! 저는 ${teacherName || '선생님'}이에요. 함께 배워봐요!`,
    "ru-RU": `Здравствуйте! Я ${teacherName || 'ваш учитель'} и помогу вам учиться. Начнём!`,
    "ru": `Здравствуйте! Я ${teacherName || 'ваш учитель'} и помогу вам учиться. Начнём!`,
    "ar-XA": `مرحباً! أنا ${teacherName || 'معلمك'} وسأساعدك على التعلم. لنبدأ!`,
    "ar": `مرحباً! أنا ${teacherName || 'معلمك'} وسأساعدك على التعلم. لنبدأ!`,
  };

  const text = sampleTexts[langCode] || sampleTexts[langCode.split('-')[0]] || sampleTexts["en-US"];
  
  const langMap: Record<string, string> = {
    "en": "en-US", "pt": "pt-BR", "es": "es-ES",
    "fr": "fr-FR", "de": "de-DE", "it": "it-IT",
    "ja": "ja-JP", "zh": "zh-CN", "ko": "ko-KR",
    "ru": "ru-RU", "ar": "ar-SA",
  };

  const voiceLang = langCode.includes('-') ? langCode : (langMap[langCode] || 'en-US');
  stopEdgeTTS();
  speakNaturalVoice(text, voiceLang, {
    rate: 0.88,
    gender: (gender as 'male' | 'female') || undefined,
    onEnd: () => onEnd?.(),
  });
}
