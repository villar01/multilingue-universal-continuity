/**
 * PedagogicalLesson.tsx
 * Componente de lição com progressão pedagógica baseada na vida real
 * Infância (A1) → Criança (A2) → Adolescência (B1) → Adulto (B2) → Fluente (C1-C2)
 */

import { useState, useCallback } from "react";
import { speakEdgeTTS, stopEdgeTTS } from "@/lib/edgeTTSClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { resolvePracticeCEFRLevel, type CEFRLevel } from "@/lib/lesson-levels";

export type LifePhase = 'infancia' | 'crianca' | 'adolescencia' | 'adulto' | 'fluente';

interface VocabItem {
  word: string;
  translation: string;
  phonetic?: string;
  emoji?: string;
  example?: string;
  exampleTranslation?: string;
  imageKeyword?: string;
}

interface DialogueLine {
  speaker: 'teacher' | 'student';
  text: string;
  translation?: string;
}

interface Exercise {
  type: string;
  question: string;
  answer: string;
  options?: string[];
  hint?: string;
  emoji?: string;
}

interface LessonData {
  title: string;
  phase?: LifePhase;
  cefr?: string;
  phaseLabel?: string;
  description?: string;
  vocabulary?: VocabItem[];
  dialogue?: DialogueLine[];
  grammar?: string;
  exercises?: Exercise[];
  realLifeContext?: string;
  culturalNote?: string;
  readingText?: string;
  readingTextTranslation?: string;
  grammarNote?: string;
}

interface Props {
  lesson: LessonData;
  languageCode: string;
  onComplete?: (score: number) => void;
  onExerciseAnswered?: (attempt: { exerciseType: string; cefrLevel: CEFRLevel; correct: boolean }) => void;
}

const PHASE_COLORS: Record<LifePhase, string> = {
  infancia: '#FF9F43',
  crianca: '#48DBFB',
  adolescencia: '#A29BFE',
  adulto: '#55EFC4',
  fluente: '#FD79A8',
};

const PHASE_LABELS: Record<LifePhase, string> = {
  infancia: '🍼 Infância',
  crianca: '🎒 Criança',
  adolescencia: '🎮 Adolescência',
  adulto: '💼 Adulto',
  fluente: '🎓 Fluente',
};

export default function PedagogicalLesson({ lesson, languageCode, onComplete, onExerciseAnswered }: Props) {
  const phase = (lesson.phase || 'infancia') as LifePhase;
  const cefrLevel = resolvePracticeCEFRLevel(lesson.cefr);
  const phaseColor = PHASE_COLORS[phase] || '#6C5CE7';
  const vocab = lesson.vocabulary || [];
  const exercises = lesson.exercises || [];

  const [stage, setStage] = useState<'vocab' | 'reading' | 'dialogue' | 'memorize' | 'exercises' | 'complete'>('vocab');
  const [vocabIndex, setVocabIndex] = useState(0);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [wordOrderAnswer, setWordOrderAnswer] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [memorizedWords, setMemorizedWords] = useState<Set<number>>(new Set());
  const [memorizeRound, setMemorizeRound] = useState(0);
  const [memorizeMatched, setMemorizeMatched] = useState<Set<string>>(new Set());
  const [memorizeSelected, setMemorizeSelected] = useState<{word: string; translation: string} | null>(null);
  const [awaitingCorrectiveRetry, setAwaitingCorrectiveRetry] = useState(false);

  const currentVocab = vocab[vocabIndex];
  const currentExercise = exercises[exerciseIndex];

  const speakWord = useCallback((text: string) => {
    speakEdgeTTS(text, languageCode);
  }, [languageCode]);

  const handleVocabNext = () => {
    setShowTranslation(false);
    if (vocabIndex < vocab.length - 1) {
      setVocabIndex(v => v + 1);
    } else {
      // After vocab, go to reading text (if available), then dialogue, then memorize
      setStage(lesson.readingText ? 'reading' : (lesson.dialogue && lesson.dialogue.length > 0 ? 'dialogue' : 'memorize'));
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    const correct = answer.toLowerCase().trim() === currentExercise.answer.toLowerCase().trim();
    setIsCorrect(correct);
    if (correct) setScore(s => s + 10);
    setAwaitingCorrectiveRetry(!correct);
    onExerciseAnswered?.({ exerciseType: currentExercise.type, cefrLevel, correct });
  };

  const handleExerciseNext = () => {
    if (!isCorrect && awaitingCorrectiveRetry) {
      setSelectedAnswer(null);
      setIsCorrect(null);
      setAwaitingCorrectiveRetry(false);
      return;
    }
    setSelectedAnswer(null);
    setIsCorrect(null);
    setAwaitingCorrectiveRetry(false);
    setWordOrderAnswer([]);
    if (exerciseIndex < exercises.length - 1) {
      setExerciseIndex(e => e + 1);
      // Init word order if needed
      const next = exercises[exerciseIndex + 1];
      if (next?.type === 'word_order') {
        setShuffledWords([...next.answer.split(' ')].sort(() => Math.random() - 0.5));
      }
    } else {
      setStage('complete');
      onComplete?.(score + (isCorrect ? 10 : 0));
    }
  };

  const progress = stage === 'vocab'
    ? (vocabIndex / Math.max(vocab.length, 1)) * 20
    : stage === 'reading'
    ? 20
    : stage === 'dialogue'
    ? 35
    : stage === 'memorize'
    ? 50
    : stage === 'exercises'
    ? 50 + (exerciseIndex / Math.max(exercises.length, 1)) * 50
    : 100;

  // ── VOCAB STAGE ──────────────────────────────────────────────────────────────
  if (stage === 'vocab' && currentVocab) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 12px', fontFamily: 'system-ui, sans-serif' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Badge style={{ background: phaseColor, color: '#fff', fontSize: 12 }}>
            {PHASE_LABELS[phase]} · {lesson.cefr || 'A1'}
          </Badge>
          <span style={{ fontSize: 12, color: '#888' }}>{vocabIndex + 1}/{vocab.length} palavras</span>
        </div>
        <Progress value={progress} style={{ marginBottom: 16, height: 6 }} />

        {/* Word Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: 20,
            padding: '32px 24px',
            textAlign: 'center',
            boxShadow: `0 8px 32px ${phaseColor}40`,
            border: `2px solid ${phaseColor}40`,
            marginBottom: 16,
          }}
        >
          {/* Emoji */}
          <div style={{ fontSize: 64, marginBottom: 8 }}>
            {currentVocab.emoji || '📚'}
          </div>

          {/* Word */}
          <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
            {currentVocab.word}
          </div>

          {/* Phonetic — pronunc. figurada no idioma nativo */}
          {currentVocab.phonetic && (
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>como pronunciar</span>
              <div style={{ fontSize: 20, color: '#FFD700', fontWeight: 700, fontStyle: 'italic', marginTop: 2 }}>
                "{currentVocab.phonetic}"
              </div>
            </div>
          )}

          {/* Speak button */}
          <button
            onClick={() => speakWord(currentVocab.word)}
            style={{
              background: phaseColor,
              border: 'none',
              borderRadius: 50,
              width: 52,
              height: 52,
              fontSize: 22,
              cursor: 'pointer',
              marginBottom: 16,
              transition: 'transform 0.1s',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            🔊
          </button>

          {/* Translation toggle */}
          {!showTranslation ? (
            <button
              onClick={() => setShowTranslation(true)}
              style={{
                display: 'block',
                margin: '0 auto',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8,
                padding: '8px 20px',
                color: '#ccc',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Ver tradução
            </button>
          ) : (
            <div>
              <div style={{ fontSize: 24, color: phaseColor, fontWeight: 700, marginBottom: 8 }}>
                {currentVocab.translation}
              </div>
              {currentVocab.example && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
                  <div style={{ fontSize: 14, color: '#ddd', marginBottom: 4 }}>
                    "{currentVocab.example}"
                  </div>
                  {currentVocab.exampleTranslation && (
                    <div style={{ fontSize: 12, color: '#aaa', fontStyle: 'italic', marginBottom: 4 }}>
                      {currentVocab.exampleTranslation}
                    </div>
                  )}
                  {(currentVocab as any).examplePhonetic && (
                    <div style={{ fontSize: 12, color: '#FFD700', fontStyle: 'italic', marginBottom: 4 }}>
                      🗣️ como soa: "{(currentVocab as any).examplePhonetic}"
                    </div>
                  )}
                  <button
                    onClick={() => speakWord(currentVocab.example!)}
                    style={{ marginTop: 6, background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 12 }}
                  >
                    🔊 Ouvir frase
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Real life context */}
        {lesson.realLifeContext && vocabIndex === 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 12,
            fontSize: 13,
            color: '#bbb',
            borderLeft: `3px solid ${phaseColor}`,
          }}>
            💡 {lesson.realLifeContext}
          </div>
        )}

        <Button
          onClick={handleVocabNext}
          style={{ width: '100%', background: phaseColor, color: '#fff', fontWeight: 700, fontSize: 16, height: 48 }}
        >
          {vocabIndex < vocab.length - 1 ? 'Próxima Palavra →' : 'Ir para Exercícios →'}
        </Button>
      </div>
    );
  }

  // ── READING STAGE (text using vocabulary in context) ──────────────────────────
  if (stage === 'reading' && lesson.readingText) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Badge style={{ background: phaseColor, color: '#fff', fontSize: 12 }}>
            {PHASE_LABELS[phase]} · 📖 Leitura
          </Badge>
        </div>
        <Progress value={progress} style={{ marginBottom: 16, height: 6 }} />

        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: 20,
          padding: '24px 20px',
          marginBottom: 16,
          border: `2px solid ${phaseColor}40`,
        }}>
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            📝 Texto da Lição
          </div>
          <div style={{ fontSize: 17, color: '#fff', lineHeight: 1.8, marginBottom: 16 }}>
            {lesson.readingText}
          </div>
          <button
            onClick={() => speakWord(lesson.readingText!)}
            style={{
              background: phaseColor, border: 'none', borderRadius: 50,
              width: 48, height: 48, fontSize: 20, cursor: 'pointer', marginBottom: 16,
            }}
          >
            🔊
          </button>
          {lesson.readingTextTranslation && (
            <div style={{
              padding: '14px 16px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 12,
              fontSize: 14,
              color: '#aaa',
              lineHeight: 1.7,
              fontStyle: 'italic',
              borderLeft: `3px solid ${phaseColor}`,
            }}>
              {lesson.readingTextTranslation}
            </div>
          )}
          {lesson.grammarNote && (
            <div style={{
              marginTop: 12, padding: '12px 14px',
              background: 'rgba(255,215,0,0.08)',
              borderRadius: 10,
              fontSize: 13,
              color: '#FFD700',
              lineHeight: 1.6,
            }}>
              ⚡ <strong>Gramática:</strong> {lesson.grammarNote}
            </div>
          )}
        </div>

        <Button
          onClick={() => setStage(lesson.dialogue && lesson.dialogue.length > 0 ? 'dialogue' : 'memorize')}
          style={{ width: '100%', background: phaseColor, color: '#fff', fontWeight: 700, fontSize: 16, height: 48 }}
        >
          Continuar para Diálogo →
        </Button>
      </div>
    );
  }

  // ── DIALOGUE STAGE ────────────────────────────────────────────────────────────
  if (stage === 'dialogue' && lesson.dialogue && lesson.dialogue.length > 0) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Badge style={{ background: phaseColor, color: '#fff', fontSize: 12 }}>
            {PHASE_LABELS[phase]} · Diálogo
          </Badge>
        </div>
        <Progress value={33} style={{ marginBottom: 16, height: 6 }} />

        <div style={{ marginBottom: 16 }}>
          {lesson.dialogue.map((line, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: line.speaker === 'teacher' ? 'row' : 'row-reverse',
                gap: 10,
                marginBottom: 12,
                alignItems: 'flex-start',
              }}
            >
              <div style={{ fontSize: 28, flexShrink: 0 }}>
                {line.speaker === 'teacher' ? '👩‍🏫' : '🧑‍🎓'}
              </div>
              <div
                style={{
                  background: line.speaker === 'teacher'
                    ? `linear-gradient(135deg, ${phaseColor}30, ${phaseColor}10)`
                    : 'rgba(255,255,255,0.08)',
                  border: `1px solid ${line.speaker === 'teacher' ? phaseColor + '40' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 14,
                  padding: '10px 14px',
                  maxWidth: '75%',
                }}
              >
                <div style={{ fontSize: 15, color: '#fff', marginBottom: 4 }}>{line.text}</div>
                {line.translation && (
                  <div style={{ fontSize: 12, color: '#888', fontStyle: 'italic' }}>{line.translation}</div>
                )}
                <button
                  onClick={() => speakWord(line.text)}
                  style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 12, marginTop: 4 }}
                >
                  🔊
                </button>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={() => setStage('memorize')}
          style={{ width: '100%', background: phaseColor, color: '#fff', fontWeight: 700, fontSize: 16, height: 48 }}
        >
          Memorizar Vocabulário →
        </Button>
      </div>
    );
  }

  // ── MEMORIZE STAGE (flashcard matching game) ──────────────────────────────────
  if (stage === 'memorize') {
    const vocabPairs = vocab.map((v, i) => ({ word: v.word, translation: v.translation, index: i }));
    const allMatched = memorizedWords.size === vocab.length;

    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Badge style={{ background: phaseColor, color: '#fff', fontSize: 12 }}>
            {PHASE_LABELS[phase]} · 🧠 Memorização
          </Badge>
          <span style={{ fontSize: 12, color: '#888' }}>{memorizedWords.size}/{vocab.length} memorizadas</span>
        </div>
        <Progress value={progress} style={{ marginBottom: 16, height: 6 }} />

        {allMatched ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 20, color: '#fff', fontWeight: 800, marginBottom: 8 }}>Todas as palavras memorizadas!</div>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>Agora você está pronto para os exercícios!</div>
            <Button
              onClick={() => setStage('exercises')}
              style={{ width: '100%', background: phaseColor, color: '#fff', fontWeight: 700, fontSize: 16, height: 48 }}
            >
              Fazer Exercícios →
            </Button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 13, color: '#aaa', marginBottom: 16, textAlign: 'center' }}>
              🎯 Toque em uma palavra e depois na sua tradução para memorizar
            </div>
            {/* Word cards grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {vocabPairs.map((pair) => {
                const isMemorized = memorizedWords.has(pair.index);
                const isSelected = memorizeSelected?.word === pair.word;
                return (
                  <button
                    key={`w-${pair.index}`}
                    onClick={() => !isMemorized && setMemorizeSelected({ word: pair.word, translation: pair.translation })}
                    disabled={isMemorized}
                    style={{
                      padding: '14px 10px',
                      borderRadius: 12,
                      border: `2px solid ${isMemorized ? '#00b894' : isSelected ? phaseColor : 'rgba(255,255,255,0.15)'}`,
                      background: isMemorized ? '#00b89420' : isSelected ? `${phaseColor}20` : 'rgba(255,255,255,0.05)',
                      color: isMemorized ? '#00b894' : '#fff',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: isMemorized ? 'default' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: isMemorized ? 0.6 : 1,
                    }}
                  >
                    {isMemorized ? '✅ ' : ''}{pair.word}
                  </button>
                );
              })}
            </div>
            {/* Translation options */}
            {memorizeSelected && (
              <div>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 8, textAlign: 'center' }}>
                  Selecione a tradução de <strong style={{ color: '#fff' }}>{memorizeSelected.word}</strong>:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {vocabPairs.sort(() => Math.random() - 0.5).map((pair) => {
                    const isMatched = memorizeMatched.has(`${pair.word}-${pair.translation}`);
                    return (
                      <button
                        key={`t-${pair.index}`}
                        onClick={() => {
                          if (pair.word === memorizeSelected.word && pair.translation === memorizeSelected.translation) {
                            // Correct match!
                            setMemorizedWords(prev => new Set([...prev, pair.index]));
                            setMemorizeMatched(prev => new Set([...prev, `${pair.word}-${pair.translation}`]));
                            speakWord(pair.word);
                            setMemorizeSelected(null);
                          } else {
                            // Wrong match - shake and reset
                            setMemorizeSelected(null);
                          }
                        }}
                        disabled={isMatched}
                        style={{
                          padding: '12px 10px',
                          borderRadius: 12,
                          border: `2px solid ${isMatched ? '#00b894' : 'rgba(255,255,255,0.15)'}`,
                          background: isMatched ? '#00b89420' : 'rgba(255,255,255,0.05)',
                          color: isMatched ? '#00b894' : '#ddd',
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: isMatched ? 'default' : 'pointer',
                          transition: 'all 0.2s',
                          opacity: isMatched ? 0.6 : 1,
                        }}
                      >
                        {pair.translation}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Skip button */}
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <button
                onClick={() => setStage('exercises')}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 8,
                  padding: '8px 20px',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                Pular memorização →
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── EXERCISES STAGE ───────────────────────────────────────────────────────────
  if (stage === 'exercises' && currentExercise) {
    const isWordOrder = currentExercise.type === 'word_order';
    const isMatchPairs = currentExercise.type === 'match_pairs';

    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Badge style={{ background: phaseColor, color: '#fff', fontSize: 12 }}>
            {PHASE_LABELS[phase]} · Exercício {exerciseIndex + 1}/{exercises.length}
          </Badge>
          <span style={{ fontSize: 12, color: '#888' }}>⭐ {score} pts</span>
        </div>
        <Progress value={progress} style={{ marginBottom: 16, height: 6 }} />

        {/* Exercise Card */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: 20,
          padding: '24px 20px',
          marginBottom: 16,
          border: `2px solid ${phaseColor}30`,
        }}>
          {/* Emoji */}
          {currentExercise.emoji && (
            <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 12 }}>
              {currentExercise.emoji}
            </div>
          )}

          {/* Question */}
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: 20 }}>
            {currentExercise.question}
          </div>

          {/* Hint */}
          {currentExercise.hint && (
            <div style={{ fontSize: 12, color: '#888', textAlign: 'center', marginBottom: 16, fontStyle: 'italic' }}>
              💡 {currentExercise.hint}
            </div>
          )}

          {/* Multiple choice / fill blank options */}
          {currentExercise.options && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {currentExercise.options.map((opt, i) => {
                const isSelected = selectedAnswer === opt;
                const isRight = isSelected && isCorrect;
                const isWrong = isSelected && !isCorrect;
                const isCorrectUnselected = selectedAnswer !== null && opt === currentExercise.answer && !isSelected;

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswerSelect(opt)}
                    disabled={selectedAnswer !== null}
                    style={{
                      padding: '14px 10px',
                      borderRadius: 12,
                      border: `2px solid ${
                        isRight ? '#00b894' :
                        isWrong ? '#d63031' :
                        isCorrectUnselected ? '#00b894' :
                        'rgba(255,255,255,0.15)'
                      }`,
                      background: isRight ? '#00b89420' : isWrong ? '#d6303120' : isCorrectUnselected ? '#00b89420' : 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: selectedAnswer === null ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                      transform: isSelected ? 'scale(0.98)' : 'scale(1)',
                    }}
                  >
                    {isRight ? '✅ ' : isWrong ? '❌ ' : isCorrectUnselected ? '✅ ' : ''}{opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* Feedback */}
          {selectedAnswer !== null && (
            <div style={{
              marginTop: 16,
              padding: '12px 16px',
              borderRadius: 10,
              background: isCorrect ? '#00b89420' : '#d6303120',
              border: `1px solid ${isCorrect ? '#00b894' : '#d63031'}`,
              textAlign: 'center',
              fontSize: 15,
              color: isCorrect ? '#00b894' : '#ff7675',
              fontWeight: 600,
            }}>
            {isCorrect
                ? '🎉 Correto! Muito bem!'
                : `❌ Resposta correta: "${currentExercise.answer}". Agora tente novamente para reforçar.`}
            </div>
          )}
        </div>

        {selectedAnswer !== null && (
          <Button
            onClick={handleExerciseNext}
            style={{ width: '100%', background: phaseColor, color: '#fff', fontWeight: 700, fontSize: 16, height: 48 }}
          >
            {!isCorrect && awaitingCorrectiveRetry
              ? 'Tentar novamente com a dica →'
              : exerciseIndex < exercises.length - 1 ? 'Próximo Exercício →' : 'Concluir Lição 🎓'}
          </Button>
        )}
      </div>
    );
  }

  // ── COMPLETE STAGE ────────────────────────────────────────────────────────────
  if (stage === 'complete') {
    const maxScore = exercises.length * 10;
    const pct = Math.round((score / Math.max(maxScore, 1)) * 100);

    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>
          {pct >= 80 ? '🏆' : pct >= 60 ? '🎉' : '💪'}
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
          {pct >= 80 ? 'Excelente!' : pct >= 60 ? 'Muito Bem!' : 'Continue Praticando!'}
        </h2>
        <div style={{ fontSize: 18, color: '#aaa', marginBottom: 24 }}>
          Você acertou {Math.round(score / 10)} de {exercises.length} exercícios
        </div>
        <div style={{
          background: `linear-gradient(135deg, ${phaseColor}30, ${phaseColor}10)`,
          borderRadius: 16,
          padding: '20px',
          marginBottom: 24,
          border: `2px solid ${phaseColor}40`,
        }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: phaseColor }}>{pct}%</div>
          <div style={{ fontSize: 14, color: '#aaa' }}>pontuação · +{score} XP</div>
        </div>

        {lesson.culturalNote && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 12,
            padding: '14px 16px',
            marginBottom: 20,
            textAlign: 'left',
            fontSize: 13,
            color: '#bbb',
            borderLeft: `3px solid ${phaseColor}`,
          }}>
            🌍 <strong>Curiosidade cultural:</strong> {lesson.culturalNote}
          </div>
        )}

        <Button
          onClick={() => onComplete?.(score)}
          style={{ width: '100%', background: phaseColor, color: '#fff', fontWeight: 700, fontSize: 16, height: 48 }}
        >
          Próxima Lição →
        </Button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
      Carregando lição...
    </div>
  );
}
