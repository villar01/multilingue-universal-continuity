import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Check, Volume2, Loader2, Star, BadgeCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getTeacherDisplayName } from "@/lib/teacherNames";
import { speakText as speakNaturalVoice } from "@/hooks/useNaturalVoice";
import { matchTeacherCatalog } from "@/lib/teacherCatalogMatch";
import { stopEdgeTTS } from "@/lib/edgeTTSClient";
import { TEACHERS_57 } from "@/data/teachers57";

interface TeacherSelectorProps {
  languageCode: string;
  onSelect: (teacherId: number) => void;
  selectedTeacherId?: number;
}

// Language display names
const LANG_NAMES: Record<string, string> = {
  pt: "Português", en: "English", es: "Español", fr: "Français",
  de: "Deutsch", it: "Italiano", ja: "日本語", zh: "中文",
  ko: "한국어", ru: "Русский", ar: "العربية", hi: "हिन्दी",
  nl: "Nederlands", sv: "Svenska", tr: "Türkçe", pl: "Polski",
  fa: "فارسی", ur: "اردو", sw: "Kiswahili", tl: "Filipino",
  th: "ไทย", vi: "Tiếng Việt", id: "Bahasa Indonesia", ms: "Bahasa Melayu",
  uk: "Українська", cs: "Čeština", el: "Ελληνικά", he: "עברית",
  fi: "Suomi", da: "Dansk", no: "Norsk", hu: "Magyar",
  ro: "Română", bg: "Български", hr: "Hrvatski", sk: "Slovenčina",
  sl: "Slovenščina", lt: "Lietuvių", lv: "Latviešu", et: "Eesti",
  is: "Íslenska", ca: "Català", gl: "Galego", eu: "Euskara",
  af: "Afrikaans", zu: "isiZulu", xh: "isiXhosa", am: "አማርኛ",
  ha: "Hausa", yo: "Yorùbá", ig: "Igbo", so: "Soomaali",
  qu: "Runa Simi", gn: "Avañe'ẽ", ay: "Aymar",
};

function getLangName(code: string): string {
  const short = code.split('-')[0].toLowerCase();
  return LANG_NAMES[short] || code;
}

function getTagsForTeacher(personality?: string): string[] {
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

  // Extract short language code (e.g., "fr" from "fr-FR" or "fr")
  const lessonLangShort = useMemo(() => {
    const code = (languageCode || 'en').toLowerCase();
    return code.split('-')[0];
  }, [languageCode]);

  // Build merged teacher list: combine DB teachers WITH TEACHERS_57 teachers
  // This ensures all language teachers are shown, even if DB only has a few
  const allTeachers = useMemo(() => {
    const merged: any[] = [];
    const usedLangs = new Set<string>();

    // 1. Add DB teachers first (enriched with TEACHERS_57 data)
    if (dbTeachers && dbTeachers.length > 0) {
      dbTeachers.forEach((t: any) => {
        const t57 = matchTeacherCatalog(TEACHERS_57, t);
        merged.push({
          ...t,
          // O catálogo curado é a fonte visual canônica; evita que URLs legadas
          // indisponíveis do banco substituam retratos profissionais válidos.
          photoUrl: t57?.photo || t.photoUrl || t.photo_url || null,
          voiceLanguageCode: t.voiceLanguageCode || t.voice_language_code || t57?.voiceLang || languageCode,
          gender: t.gender || t57?.gender || 'female',
          name: t.name || t57?.name || 'Professor',
          personality: t.personality || t57?.personality,
          specialty: t.specialty || t57?.specialty || t.teaching_style || 'Conversação e Gramática',
          origin: t57?.origin || '',
          flag: t57?.flag || '',
          langName: getLangName(t.voiceLanguageCode || t.voice_language_code || languageCode),
        });
        const langShort = (t.voiceLanguageCode || t.voice_language_code || '').split('-')[0].toLowerCase();
        usedLangs.add(langShort);
      });
    }

    // 2. Add TEACHERS_57 teachers that match the LESSON language
    //    This fills in missing teachers (e.g., female English teachers if DB only has male)
    TEACHERS_57.forEach((t57, idx) => {
      const langShort = t57.langCode.toLowerCase().split('-')[0];
      // Only add teachers for the LESSON's language (lessonLangShort)
      if (langShort !== lessonLangShort) return;
      // Avoid duplicates: skip if a DB teacher already has the same name
      const isDuplicate = merged.some(m => m.name === t57.name);
      if (isDuplicate) return;

      merged.push({
        id: 10000 + idx, // Use high IDs to avoid collision with DB IDs
        name: t57.name,
        gender: t57.gender || 'female',
        voiceLanguageCode: t57.voiceLang,
        photoUrl: t57.photo || null,
        personality: t57.personality,
        specialty: t57.specialty,
        origin: t57.origin,
        flag: t57.flag,
        langName: t57.language,
      });
    });

    return merged;
  }, [dbTeachers, languageCode]);

  // FILTER teachers by the lesson's language
  const teachersForLanguage = useMemo(() => {
    const matched = allTeachers.filter((t: any) => {
      const teacherLangShort = (t.voiceLanguageCode || '').split('-')[0].toLowerCase();
      return teacherLangShort === lessonLangShort;
    });
    return matched;
  }, [allTeachers, lessonLangShort]);

  // If no teachers match the lesson language, show all (fallback)
  const teachers = teachersForLanguage.length > 0 ? teachersForLanguage : allTeachers;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-52" />
        ))}
      </div>
    );
  }

  if (!teachers || teachers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nenhum professor disponível para este idioma.</p>
      </div>
    );
  }

  const filtered = filter === "all"
    ? teachers
    : teachers.filter((t: any) => t.gender === filter);

  // Sort: native teachers (flag matches) first, then by name
  const sortedTeachers = [...filtered].sort((a: any, b: any) => {
    // Recommended (native) teachers come first
    const aNative = a.voiceLanguageCode?.toLowerCase().startsWith(lessonLangShort) ? 0 : 1;
    const bNative = b.voiceLanguageCode?.toLowerCase().startsWith(lessonLangShort) ? 0 : 1;
    if (aNative !== bNative) return aNative - bNative;
    return 0; // keep original order within same group
  });

  return (
    <div className="space-y-4">
      {/* Header with language info */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-900">
          Escolha seu Professor de {getLangName(languageCode)}
        </h2>
        <p className="text-gray-500 text-sm">
          {sortedTeachers.length} professor{sortedTeachers.length !== 1 ? 'es' : ''} nativo{sortedTeachers.length !== 1 ? 's' : ''} de {getLangName(languageCode)} disponíve{sortedTeachers.length !== 1 ? 'is' : 'l'} — escolha quem irá guiá-lo
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex justify-center gap-2">
        {(["all", "male", "female"] as const).map((f) => {
          const count = f === "all" ? sortedTeachers.length : sortedTeachers.filter((t: any) => t.gender === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f === "all" ? `Todos (${count})` : f === "male" ? `👨 Masculino (${count})` : `👩 Feminino (${count})`}
            </button>
          );
        })}
      </div>

      {/* Teacher grid — full-bleed photo cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {sortedTeachers.map((teacher: any, idx: number) => {
          const isSelected = selectedTeacherId === teacher.id;
          const isPlaying = playingTeacher === teacher.id;
          const displayName = teacher.name || getTeacherDisplayName(teacher.id, languageCode).name;
          const tags = getTagsForTeacher(teacher.personality);
          const teacherLang = teacher.voiceLanguageCode || languageCode;
          const rawPhoto = teacher.photoUrl || teacher.photo_url || null;
          const photoUrl = rawPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=200&background=4f46e5&color=fff&bold=true`;
          const isRecommended = idx === 0 && teachersForLanguage.length > 0; // first native teacher

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
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1 shadow-lg z-10">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}

              {/* Recommended badge */}
              {isRecommended && !isSelected && (
                <div className="absolute top-2 right-2 bg-yellow-400 rounded-full p-1 shadow z-10 flex items-center gap-0.5">
                  <BadgeCheck className="w-3 h-3 text-yellow-900" />
                </div>
              )}

              {/* Language flag + name badge */}
              <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 z-10">
                <span className="text-white text-[10px] font-medium">
                  {teacher.flag || ''} {teacher.langName || getLangName(teacherLang)}
                </span>
              </div>

              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10">
                <p className="text-white font-bold text-sm leading-tight truncate">{displayName}</p>
                {teacher.specialty && (
                  <p className="text-white/70 text-[10px] leading-tight truncate mt-0.5">{teacher.specialty}</p>
                )}
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
            ✅ Começar com {sortedTeachers.find((t: any) => t.id === selectedTeacherId)?.name || "Professor"}
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
