import { useState, useMemo } from 'react';
import { Book, Search, X, Volume2 } from 'lucide-react';
import { speakText as speakNaturalVoice } from '@/hooks/useNaturalVoice';
import { getLevelByLesson, getLevelConfig, type CEFRLevel } from '@/lib/lesson-levels';

interface DictEntry {
  word: string;
  translation: string;
  phonetic?: string;
  example?: string;
  synonyms?: string[];
  slang?: string;
}

interface LessonDictionaryProps {
  vocabulary: DictEntry[];
  lessonNumber?: number;
  nativeLanguage?: string;
  targetLanguage?: string;
}

/**
 * LessonDictionary — Dicionário consultável em qualquer aula
 * Combina o glossário da lição com o sistema de níveis CEFR (A1→C2)
 * Permite busca instantânea, pronúncia em ambos os idiomas, e exibe o nível atual
 */
export default function LessonDictionary({
  vocabulary,
  lessonNumber = 1,
  nativeLanguage = 'pt-BR',
  targetLanguage = 'en-US',
}: LessonDictionaryProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(false);
  const [search, setSearch] = useState('');

  const level: CEFRLevel = getLevelByLesson(lessonNumber);
  const levelConfig = getLevelConfig(level);

  const filtered = useMemo(() => {
    if (!search.trim()) return vocabulary;
    const q = search.toLowerCase().trim();
    return vocabulary.filter(
      (v) =>
        v.word.toLowerCase().includes(q) ||
        v.translation.toLowerCase().includes(q) ||
        (v.synonyms || []).some((s) => s.toLowerCase().includes(q))
    );
  }, [vocabulary, search]);

  const speakWord = (text: string, lang: string) => {
    speakNaturalVoice(text, lang);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-transform active:scale-95 hover:bg-violet-700"
      >
        <Book className="h-4 w-4" />
        Dicionário da Lição
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <Book className="h-5 w-5 text-violet-600" />
                <h2 className="text-lg font-bold text-gray-900">Dicionário da Lição</h2>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: levelConfig.color }}
                >
                  {level} · {levelConfig.label}
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search bar */}
            <div className="border-b border-gray-200 px-6 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar palavra ou tradução..."
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Book className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-sm">Nenhuma palavra encontrada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((entry, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-gray-200 p-4 transition-colors hover:border-violet-300 hover:bg-violet-50/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-gray-900">{entry.word}</h3>
                            {entry.phonetic && (
                              <span className="text-sm text-gray-500">/{entry.phonetic}/</span>
                            )}
                            <button
                              onClick={() => speakWord(entry.word, targetLanguage)}
                              className="rounded p-1 text-violet-600 hover:bg-violet-100"
                              title="Ouvir no idioma-alvo"
                            >
                              <Volume2 className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="mt-1 text-sm text-gray-700">{entry.translation}</p>
                          <button
                            onClick={() => speakWord(entry.translation, nativeLanguage)}
                            className="mt-1 inline-flex items-center gap-1 text-xs text-violet-600 hover:underline"
                          >
                            <Volume2 className="h-3 w-3" />
                            Ouvir em português
                          </button>
                          {entry.example && (
                            <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-sm italic text-gray-600">
                              "{entry.example}"
                            </p>
                          )}
                          {entry.synonyms && entry.synonyms.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {entry.synonyms.map((syn, i) => (
                                <span
                                  key={i}
                                  className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700"
                                >
                                  {syn}
                                </span>
                              ))}
                            </div>
                          )}
                          {entry.slang && (
                            <p className="mt-2 text-xs text-amber-600">
                              <span className="font-semibold">Gíria:</span> {entry.slang}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with level info */}
            <div className="border-t border-gray-200 px-6 py-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {filtered.length} {filtered.length === 1 ? 'palavra' : 'palavras'}
                </span>
                <span>
                  Nível {level}: {levelConfig.description}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
