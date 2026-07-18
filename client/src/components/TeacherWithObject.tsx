/**
 * TeacherWithObject — Professor interativo apontando para objetos/imagens da lição
 * Mostra o professor ao lado do objeto com animação de "apontando" e vocabulário expandido
 */
import { useState, useEffect, useRef } from "react";
import { Volume2, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VocabItem {
  word: string;
  phonetic?: string;
  translation: string;
  synonyms?: string[];
  slang?: string[];
  examples?: Array<{ en: string; pt: string }>;
  emoji?: string;
  imageUrl?: string;
}

interface TeacherWithObjectProps {
  teacherPhotoUrl?: string;
  teacherName?: string;
  vocabulary: VocabItem[];
  currentWord?: string;
  isTeaching?: boolean;
  onSpeak?: (text: string) => void;
  languageCode?: string;
}

// Mapa de emojis por palavra-chave para vocabulário visual
const EMOJI_MAP: Record<string, string> = {
  // Animais
  dog: "🐕", cat: "🐈", bird: "🐦", fish: "🐟", horse: "🐴", cow: "🐄",
  elephant: "🐘", lion: "🦁", tiger: "🐯", bear: "🐻", rabbit: "🐰",
  // Comida
  apple: "🍎", banana: "🍌", pizza: "🍕", bread: "🍞", coffee: "☕",
  water: "💧", milk: "🥛", rice: "🍚", egg: "🥚", meat: "🥩",
  // Casa
  house: "🏠", door: "🚪", window: "🪟", bed: "🛏️", chair: "🪑",
  table: "🪑", kitchen: "🍳", bathroom: "🛁", garden: "🌿",
  // Transporte
  car: "🚗", bus: "🚌", train: "🚂", plane: "✈️", bike: "🚲",
  // Natureza
  sun: "☀️", moon: "🌙", star: "⭐", rain: "🌧️", snow: "❄️",
  tree: "🌳", flower: "🌸", mountain: "⛰️", sea: "🌊", river: "🏞️",
  // Pessoas
  man: "👨", woman: "👩", child: "👧", family: "👨‍👩‍👧", friend: "🤝",
  doctor: "👨‍⚕️", teacher: "👨‍🏫", student: "👨‍🎓",
  // Objetos
  book: "📚", pen: "✏️", phone: "📱", computer: "💻", clock: "🕐",
  money: "💰", key: "🔑", bag: "👜", hat: "🎩", glasses: "👓",
  // Sentimentos
  happy: "😊", sad: "😢", angry: "😠", love: "❤️", fear: "😨",
  // Cores
  red: "🔴", blue: "🔵", green: "🟢", yellow: "🟡", black: "⚫", white: "⚪",
  // Ações
  run: "🏃", walk: "🚶", eat: "🍽️", sleep: "😴", work: "💼", play: "🎮",
  read: "📖", write: "✍️", sing: "🎤", dance: "💃", cook: "👨‍🍳",
};

function getEmojiForWord(word: string): string {
  const lower = word.toLowerCase();
  // Busca direta
  if (EMOJI_MAP[lower]) return EMOJI_MAP[lower];
  // Busca parcial
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return emoji;
  }
  return "📝";
}

// Gera URL de imagem Unsplash para o vocabulário
function getUnsplashUrl(word: string): string {
  const query = encodeURIComponent(word.toLowerCase());
  return `https://source.unsplash.com/200x200/?${query},object`;
}

export default function TeacherWithObject({
  teacherPhotoUrl,
  teacherName = "Professor",
  vocabulary,
  currentWord,
  isTeaching = false,
  onSpeak,
  languageCode = "en",
}: TeacherWithObjectProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPointing, setIsPointing] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [imgError, setImgError] = useState(false);
  const pointingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const vocabList = vocabulary.filter(v => v.word && v.translation);
  const current = vocabList[currentIndex];

  // Quando muda de palavra, animar o "apontar"
  useEffect(() => {
    if (!current) return;
    setIsPointing(true);
    setShowTranslation(false);
    setImgError(false);
    if (pointingTimer.current) clearTimeout(pointingTimer.current);
    pointingTimer.current = setTimeout(() => {
      setIsPointing(false);
      setShowTranslation(true);
    }, 800);
    return () => {
      if (pointingTimer.current) clearTimeout(pointingTimer.current);
    };
  }, [currentIndex]);

  // Sincronizar com currentWord externo
  useEffect(() => {
    if (!currentWord) return;
    const idx = vocabList.findIndex(v =>
      v.word.toLowerCase() === currentWord.toLowerCase()
    );
    if (idx >= 0) setCurrentIndex(idx);
  }, [currentWord]);

  if (!vocabList.length) return null;

  const emoji = current?.emoji || getEmojiForWord(current?.word || "");
  const imageUrl = current?.imageUrl || getUnsplashUrl(current?.word || "");

  const handlePrev = () => setCurrentIndex(i => Math.max(0, i - 1));
  const handleNext = () => setCurrentIndex(i => Math.min(vocabList.length - 1, i + 1));

  const handleSpeak = () => {
    if (onSpeak && current) onSpeak(current.word);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 shadow-md border border-blue-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-semibold text-indigo-700">
            Vocabulário Visual — {currentIndex + 1}/{vocabList.length}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-1 rounded-full hover:bg-indigo-100 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-indigo-600" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === vocabList.length - 1}
            className="p-1 rounded-full hover:bg-indigo-100 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-indigo-600" />
          </button>
        </div>
      </div>

      {/* Main content: Teacher + Object */}
      <div className="flex items-center gap-4">
        {/* Teacher avatar */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-20 h-20 rounded-full overflow-hidden border-3 border-indigo-300 shadow-md transition-transform duration-300 ${
              isPointing ? "scale-110" : "scale-100"
            }`}
          >
            {teacherPhotoUrl ? (
              <img
                src={teacherPhotoUrl}
                alt={teacherName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {teacherName[0]}
              </div>
            )}
          </div>
          {/* Pointing arrow */}
          <div
            className={`absolute -right-3 top-1/2 -translate-y-1/2 text-2xl transition-all duration-300 ${
              isPointing ? "translate-x-1 opacity-100" : "translate-x-0 opacity-70"
            }`}
          >
            👉
          </div>
        </div>

        {/* Object/Image area */}
        <div className="flex-1 text-center">
          {/* Visual object */}
          <div
            className={`mx-auto mb-2 transition-all duration-500 ${
              isPointing ? "scale-110 rotate-3" : "scale-100 rotate-0"
            }`}
          >
            {!imgError ? (
              <div className="relative w-24 h-24 mx-auto rounded-xl overflow-hidden shadow-md border-2 border-white">
                <img
                  src={imageUrl}
                  alt={current?.word}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
                {/* Emoji overlay */}
                <div className="absolute bottom-0 right-0 bg-white rounded-tl-lg px-1 text-lg leading-none">
                  {emoji}
                </div>
              </div>
            ) : (
              <div className="w-24 h-24 mx-auto rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-white shadow-md flex items-center justify-center text-5xl">
                {emoji}
              </div>
            )}
          </div>

          {/* Word */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-bold text-gray-900">{current?.word}</span>
              <button
                onClick={handleSpeak}
                className="p-1 rounded-full bg-indigo-100 hover:bg-indigo-200 transition-colors"
              >
                <Volume2 className="h-3 w-3 text-indigo-600" />
              </button>
            </div>
            {current?.phonetic && (
              <p className="text-xs text-gray-500 font-mono">{current.phonetic}</p>
            )}
            {showTranslation && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-sm font-semibold text-indigo-700 bg-indigo-50 rounded-lg px-3 py-1 inline-block">
                  {current?.translation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Example sentence */}
      {showTranslation && current?.examples && current.examples.length > 0 && (
        <div className="mt-3 bg-white rounded-xl p-3 border border-indigo-100 animate-in fade-in duration-500">
          <p className="text-sm font-medium text-gray-800">
            💬 <em>{current.examples[0].en}</em>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            🇧🇷 {current.examples[0].pt}
          </p>
        </div>
      )}

      {/* Synonyms / Slang */}
      {showTranslation && (
        <div className="mt-2 flex flex-wrap gap-1">
          {current?.synonyms?.slice(0, 3).map((syn, i) => (
            <span key={i} className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">
              {syn}
            </span>
          ))}
          {current?.slang?.slice(0, 2).map((s, i) => (
            <span key={i} className="text-xs bg-orange-100 text-orange-700 rounded-full px-2 py-0.5">
              🗣️ {s}
            </span>
          ))}
        </div>
      )}

      {/* Progress dots */}
      <div className="flex justify-center gap-1 mt-3">
        {vocabList.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentIndex ? "bg-indigo-500 w-4" : "bg-indigo-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
