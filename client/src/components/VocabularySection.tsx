import { Volume2, BookOpen, Repeat, Brain, Languages } from 'lucide-react';
import { useState } from 'react';
import { speakText as speakNaturalVoice } from '@/hooks/useNaturalVoice';

interface VocabularyWord {
  word: string;
  translation: string;
  phonetic: string;
  example: string;
  synonyms: string[];
  slang?: string;
}

interface VocabularySectionProps {
  vocabulary: VocabularyWord[];
  nativeLanguage?: string; // ISO code (default: 'pt-BR')
  targetLanguage?: string; // ISO code (default: 'en')
}

/**
 * Seção de Vocabulário com Glossário Bilíngue
 * Simula aprendizado natural de idiomas como crianças aprendem
 * - Repetições espaçadas
 * - Comparações entre idiomas
 * - Contexto visual e auditivo
 * - Sinônimos e variações
 */
export default function VocabularySection({
  vocabulary,
  nativeLanguage = 'pt-BR',
  targetLanguage = 'en',
}: VocabularySectionProps) {
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [repeatMode, setRepeatMode] = useState(false);

  const playAudio = (text: string, lang: string) => {
    // Edge TTS Neural para pronúncia natural
    speakNaturalVoice(text, lang, { rate: 0.8 });
  };

  const getLanguageComparison = (word: VocabularyWord) => {
    // Análise de similaridade entre idiomas (cognatos, estrutura)
    const ptWord = word.translation.toLowerCase();
    const enWord = word.word.toLowerCase();
    
    // Detectar cognatos (palavras similares)
    const isCognate = ptWord.substring(0, 3) === enWord.substring(0, 3);
    
    return {
      isCognate,
      similarity: isCognate ? 'alta' : 'baixa',
      tip: isCognate 
        ? `✨ Cognato! "${word.word}" e "${word.translation}" têm origem similar`
        : `💡 Palavras diferentes: "${word.word}" (inglês) ≠ "${word.translation}" (português)`,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Vocabulário da Lição
          </h3>
          <span className="text-sm text-gray-500">
            ({vocabulary.length} palavras)
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showComparison
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Comparar idiomas"
          >
            <Languages className="h-4 w-4" />
            Comparar
          </button>

          <button
            onClick={() => setRepeatMode(!repeatMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              repeatMode
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Modo repetição"
          >
            <Repeat className="h-4 w-4" />
            Repetir
          </button>
        </div>
      </div>

      {/* Dica pedagógica */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Brain className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">
              💡 Como crianças aprendem idiomas
            </p>
            <p className="text-sm text-gray-600">
              Ouça cada palavra várias vezes, veja exemplos em contexto e compare com sua língua nativa. 
              A repetição espaçada ajuda seu cérebro a memorizar naturalmente!
            </p>
          </div>
        </div>
      </div>

      {/* Grid de palavras */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vocabulary.map((word, index) => {
          const comparison = getLanguageComparison(word);
          const isSelected = selectedWord?.word === word.word;

          return (
            <div
              key={index}
              onClick={() => setSelectedWord(isSelected ? null : word)}
              className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
              }`}
            >
              {/* Palavra principal */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xl font-bold text-gray-900">
                      {word.word}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playAudio(word.word, targetLanguage);
                      }}
                      className="p-1.5 hover:bg-blue-100 rounded-full transition-colors"
                      title="Ouvir pronúncia"
                    >
                      <Volume2 className="h-4 w-4 text-blue-600" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 font-mono">
                    {word.phonetic}
                  </p>
                </div>

                {repeatMode && (
                  <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    <Repeat className="h-3 w-3" />
                    {index + 1}/{vocabulary.length}
                  </div>
                )}
              </div>

              {/* Tradução */}
              <div className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Português</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {word.translation}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playAudio(word.translation, nativeLanguage);
                    }}
                    className="p-1.5 hover:bg-purple-100 rounded-full transition-colors"
                    title="Ouvir tradução"
                  >
                    <Volume2 className="h-4 w-4 text-purple-600" />
                  </button>
                </div>
              </div>

              {/* Exemplo de uso */}
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Exemplo:</p>
                <p className="text-sm text-gray-700 italic">
                  "{word.example}"
                </p>
              </div>

              {/* Sinônimos */}
              {word.synonyms && word.synonyms.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Sinônimos:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {word.synonyms.map((syn, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                      >
                        {syn}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Comparação entre idiomas */}
              {showComparison && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className={`flex items-start gap-2 text-xs ${
                    comparison.isCognate ? 'text-green-700' : 'text-blue-700'
                  }`}>
                    <Languages className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>{comparison.tip}</p>
                  </div>
                </div>
              )}

              {/* Indicador de seleção */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* Painel de repetição */}
      {repeatMode && selectedWord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                <Repeat className="h-4 w-4" />
                Modo Repetição Ativa
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">
                    {selectedWord.word}
                  </h2>
                  <p className="text-lg text-gray-500 font-mono">
                    {selectedWord.phonetic}
                  </p>
                </div>

                <button
                  onClick={() => playAudio(selectedWord.word, targetLanguage)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Volume2 className="h-5 w-5" />
                  Ouvir Pronúncia
                </button>

                <div className="p-6 bg-purple-50 rounded-xl">
                  <p className="text-2xl font-semibold text-gray-900 mb-2">
                    {selectedWord.translation}
                  </p>
                  <button
                    onClick={() => playAudio(selectedWord.translation, nativeLanguage)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Volume2 className="h-4 w-4" />
                    Ouvir Tradução
                  </button>
                </div>

                <div className="text-left p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Exemplo em contexto:</p>
                  <p className="text-base text-gray-900 italic">
                    "{selectedWord.example}"
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedWord(null)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas de aprendizado */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Brain className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Progresso de Memorização
              </p>
              <p className="text-xs text-gray-600">
                Revise cada palavra 3-5 vezes para memorização efetiva
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">
              {vocabulary.length}
            </p>
            <p className="text-xs text-gray-500">palavras novas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
