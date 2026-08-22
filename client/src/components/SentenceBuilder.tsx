import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { speakText as speakNaturalVoice } from '@/hooks/useNaturalVoice';
import { useAuth } from '@/_core/hooks/useAuth';
import type { CEFRLevel } from '@/lib/lesson-levels';

// ── Types ──────────────────────────────────────────────────────────────────
interface SentencePattern {
  pattern: string;           // "Subject + Verb + Object"
  example: string;           // "The cat eats fish."
  exampleTranslation: string;// "O gato come peixe."
  slots: Array<{
    role: string;            // "Subject"
    options: Array<{ word: string; translation: string }>;
    current: number;
  }>;
  chunks: Array<{ chunk: string; meaning: string; note?: string }>;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface GrammarGuide {
  wordOrder: string;
  adjectivePosition: string;
  teachingRule: string;
  portugueseContrast: string | null;
}

interface SentenceBuilderProps {
  targetLanguage: string;
  languageCode: string;
  nativeLanguage: string;
  cefrLevel: CEFRLevel;
  phase: string;
  lessonTitle?: string;
  vocabulary?: Array<{ word: string; translation: string }>;
  teacherName?: string;
  teacherEmoji?: string;
  phaseColor?: string;
  onComplete?: (xp: number) => void;
  onBack?: () => void;
}

function buildVocabularyPatterns(vocabulary: Array<{ word: string; translation: string }>): SentencePattern[] {
  const items = vocabulary.filter((item) => item.word.trim() && item.translation.trim()).slice(0, 6);
  if (items.length === 0) return [];
  const primary = items[0];
  return [{
    pattern: 'Vocabulário da lição',
    example: primary.word,
    exampleTranslation: primary.translation,
    slots: [{ role: 'Vocabulário', options: items.map(({ word, translation }) => ({ word, translation })), current: 0 }],
    chunks: items.map(({ word, translation }) => ({ chunk: word, meaning: translation, note: 'Termo prioritário da lição' })),
  }];
}

// ── Hardcoded patterns by phase (fallback when API is slow) ────────────────
const FALLBACK_PATTERNS: Record<string, SentencePattern[]> = {
  infancia: [
    {
      pattern: 'Subject + Verb',
      example: 'The dog runs.',
      exampleTranslation: 'O cachorro corre.',
      slots: [
        { role: 'Subject', options: [{ word: 'The dog', translation: 'O cachorro' }, { word: 'The cat', translation: 'O gato' }, { word: 'The bird', translation: 'O pássaro' }, { word: 'The baby', translation: 'O bebê' }], current: 0 },
        { role: 'Verb', options: [{ word: 'runs', translation: 'corre' }, { word: 'sleeps', translation: 'dorme' }, { word: 'eats', translation: 'come' }, { word: 'plays', translation: 'brinca' }], current: 0 },
      ],
      chunks: [{ chunk: 'The dog', meaning: 'o cachorro', note: 'sujeito' }, { chunk: 'runs', meaning: 'corre', note: 'verbo' }],
    },
  ],
  crianca: [
    {
      pattern: 'Subject + Verb + Object',
      example: 'She drinks water.',
      exampleTranslation: 'Ela bebe água.',
      slots: [
        { role: 'Subject', options: [{ word: 'She', translation: 'Ela' }, { word: 'He', translation: 'Ele' }, { word: 'The boy', translation: 'O menino' }, { word: 'My friend', translation: 'Meu amigo' }], current: 0 },
        { role: 'Verb', options: [{ word: 'drinks', translation: 'bebe' }, { word: 'eats', translation: 'come' }, { word: 'reads', translation: 'lê' }, { word: 'likes', translation: 'gosta de' }], current: 0 },
        { role: 'Object', options: [{ word: 'water', translation: 'água' }, { word: 'an apple', translation: 'uma maçã' }, { word: 'a book', translation: 'um livro' }, { word: 'music', translation: 'música' }], current: 0 },
      ],
      chunks: [{ chunk: 'She drinks', meaning: 'ela bebe', note: 'sujeito + verbo' }, { chunk: 'water', meaning: 'água', note: 'objeto' }],
    },
  ],
  adolescencia: [
    {
      pattern: 'Subject + Verb + Object + Place/Time',
      example: 'We go to school every day.',
      exampleTranslation: 'Nós vamos para a escola todo dia.',
      slots: [
        { role: 'Subject', options: [{ word: 'We', translation: 'Nós' }, { word: 'They', translation: 'Eles' }, { word: 'My family', translation: 'Minha família' }, { word: 'The students', translation: 'Os alunos' }], current: 0 },
        { role: 'Verb', options: [{ word: 'go', translation: 'vão' }, { word: 'travel', translation: 'viajam' }, { word: 'study', translation: 'estudam' }, { word: 'work', translation: 'trabalham' }], current: 0 },
        { role: 'Place', options: [{ word: 'to school', translation: 'para a escola' }, { word: 'to the park', translation: 'para o parque' }, { word: 'online', translation: 'online' }, { word: 'at home', translation: 'em casa' }], current: 0 },
        { role: 'Time', options: [{ word: 'every day', translation: 'todo dia' }, { word: 'on weekends', translation: 'nos fins de semana' }, { word: 'in the morning', translation: 'de manhã' }, { word: 'at night', translation: 'à noite' }], current: 0 },
      ],
      chunks: [{ chunk: 'go to school', meaning: 'ir para a escola', note: 'phrasal: verbo + preposição + lugar' }, { chunk: 'every day', meaning: 'todo dia', note: 'advérbio de frequência — vem no final' }],
    },
  ],
  adulto: [
    {
      pattern: 'Subject + Modal + Verb + Object',
      example: 'You should give up smoking.',
      exampleTranslation: 'Você deveria parar de fumar.',
      slots: [
        { role: 'Subject', options: [{ word: 'You', translation: 'Você' }, { word: 'He', translation: 'Ele' }, { word: 'We', translation: 'Nós' }, { word: 'People', translation: 'As pessoas' }], current: 0 },
        { role: 'Modal', options: [{ word: 'should', translation: 'deveria' }, { word: 'must', translation: 'deve' }, { word: 'can', translation: 'pode' }, { word: 'might', translation: 'pode (talvez)' }], current: 0 },
        { role: 'Phrasal Verb', options: [{ word: 'give up', translation: 'desistir/parar de' }, { word: 'look after', translation: 'cuidar de' }, { word: 'put off', translation: 'adiar' }, { word: 'carry on', translation: 'continuar' }], current: 0 },
        { role: 'Object', options: [{ word: 'smoking', translation: 'fumar' }, { word: 'the project', translation: 'o projeto' }, { word: 'the meeting', translation: 'a reunião' }, { word: 'your health', translation: 'sua saúde' }], current: 0 },
      ],
      chunks: [{ chunk: 'give up', meaning: 'desistir / parar de', note: '2 palavras em inglês = 1 ideia em português' }, { chunk: 'should give up', meaning: 'deveria parar de', note: 'modal + phrasal verb' }],
    },
  ],
};

export default function SentenceBuilder({
  targetLanguage,
  languageCode,
  nativeLanguage,
  cefrLevel,
  phase,
  lessonTitle,
  vocabulary = [],
  teacherName = 'Professor',
  teacherEmoji = '👨‍🏫',
  phaseColor = '#6c5ce7',
  onComplete,
  onBack,
}: SentenceBuilderProps) {
  const { user } = useAuth();
  const phaseKey = phase.includes('infan') ? 'infancia'
    : phase.includes('crian') ? 'crianca'
    : phase.includes('adoles') ? 'adolescencia'
    : 'adulto';

  const [patterns, setPatterns] = useState<SentencePattern[]>(() => buildVocabularyPatterns(vocabulary));
  const [grammarGuide, setGrammarGuide] = useState<GrammarGuide | null>(null);
  const [patternIdx, setPatternIdx] = useState(0);
  const [slots, setSlots] = useState<SentencePattern['slots']>([]);
  const [tab, setTab] = useState<'observe' | 'build' | 'chunks' | 'chat'>('observe');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [xp, setXp] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const structureMutation = trpc.polyLesson.structureTraining.useMutation();
  const chatMutation = trpc.polyLesson.structureChat.useMutation();

  const currentPattern = patterns[patternIdx];

  // Init slots from current pattern
  useEffect(() => {
    if (currentPattern) {
      setSlots(currentPattern.slots.map(s => ({ ...s, options: [...s.options] })));
      setShowAnswer(false);
      setChatHistory([{
        role: 'assistant',
        content: currentPattern.exampleTranslation,
      }]);
    }
  }, [patternIdx, patterns]);

  // Auto-scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  // Load AI patterns
  useEffect(() => {
    if (!user) return;
    structureMutation.mutate(
      { targetLanguage, targetLanguageCode: languageCode, nativeLanguage, cefrLevel, phase, lessonTitle, vocabulary: vocabulary.slice(0, 8).map(v => v.word) },
      {
        onSuccess: (data) => {
          if (data?.patterns?.length) {
            setPatterns(data.patterns as SentencePattern[]);
            setPatternIdx(0);
          }
          setGrammarGuide((data as { grammar?: GrammarGuide }).grammar || null);
        },
      }
    );
  }, [cefrLevel, lessonTitle, nativeLanguage, phase, structureMutation, targetLanguage, user, vocabulary]);

  const speakText = (text: string) => {
    speakNaturalVoice(text, languageCode, { rate: 0.85 });
  };

  // Build current sentence from slots
  const buildSentence = () => {
    return slots.map(s => s.options[s.current]?.word || '').join(' ');
  };

  const buildTranslation = () => {
    return slots.map(s => s.options[s.current]?.translation || '').join(' ');
  };

  const cycleSlot = (slotIdx: number) => {
    setSlots(prev => prev.map((s, i) => {
      if (i !== slotIdx) return s;
      const next = (s.current + 1) % s.options.length;
      return { ...s, current: next };
    }));
    setXp(x => x + 2);
  };

  const handleSendChat = () => {
    if (!user || !chatInput.trim() || chatMutation.isPending) return;
    const msg = chatInput.trim();
    setChatInput('');
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: msg }];
    setChatHistory(newHistory);
    chatMutation.mutate(
      {
        targetLanguage,
        nativeLanguage,
        cefrLevel,
        sentence: currentPattern.example,
        studentMessage: msg,
        history: newHistory.slice(-6).map(m => ({ role: m.role, content: m.content })),
      },
      {
        onSuccess: (data) => {
          setChatHistory(prev => [...prev, { role: 'assistant', content: (data as { reply: string }).reply }]);
          setXp(x => x + 5);
        },
      }
    );
  };

  if (!currentPattern) return null;

  const builtSentence = buildSentence();
  const builtTranslation = buildTranslation();

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'system-ui, sans-serif', background: '#0f0f1a', borderRadius: 20, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${phaseColor}20, #0f0f1a)`, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
        {onBack && <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 18, cursor: 'pointer' }}>←</button>}
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${phaseColor}30`, border: `2px solid ${phaseColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{teacherEmoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Estrutura Frasal</div>
          <div style={{ fontSize: 11, color: '#888' }}>{currentPattern.pattern}</div>
        </div>
        <div style={{ fontSize: 12, color: phaseColor, fontWeight: 700 }}>⚡ {xp} XP</div>
      </div>

      {/* Pattern progress */}
      {grammarGuide && (
        <div style={{ margin: '10px 16px 0', padding: '9px 11px', borderRadius: 10, background: `${phaseColor}14`, border: `1px solid ${phaseColor}35`, fontSize: 11, color: '#d9d9e8', lineHeight: 1.45 }}>
          <strong style={{ color: '#fff' }}>{grammarGuide.wordOrder}</strong> · {grammarGuide.adjectivePosition}
          <div style={{ marginTop: 3 }}>{grammarGuide.teachingRule}</div>
          {grammarGuide.portugueseContrast && <div style={{ marginTop: 3, color: '#bdbddd' }}>{grammarGuide.portugueseContrast}</div>}
        </div>
      )}
      <div style={{ padding: '8px 16px', display: 'flex', gap: 6, alignItems: 'center' }}>
        {patterns.map((_, i) => (
          <div key={i} onClick={() => setPatternIdx(i)} style={{ flex: 1, height: 4, borderRadius: 2, background: i === patternIdx ? phaseColor : i < patternIdx ? phaseColor + '60' : 'rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.3s' }} />
        ))}
        <span style={{ fontSize: 11, color: '#666', marginLeft: 4 }}>{patternIdx + 1}/{patterns.length}</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {(['observe', 'build', 'chunks', 'chat'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, background: tab === t ? `${phaseColor}20` : 'transparent', border: 'none', borderBottom: tab === t ? `2px solid ${phaseColor}` : '2px solid transparent', color: tab === t ? phaseColor : '#666', padding: '9px 4px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
            {t === 'observe' ? '👁️ Observar' : t === 'build' ? '🔧 Montar' : t === 'chunks' ? '🧩 Chunks' : '💬 Chat'}
          </button>
        ))}
      </div>

      <div style={{ padding: 16 }}>

        {/* ── TAB: OBSERVE ───────────────────────────────────────────────── */}
        {tab === 'observe' && (
          <div>
            {/* Teacher bubble */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${phaseColor}30`, border: `2px solid ${phaseColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{teacherEmoji}</div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '0 16px 16px 16px', padding: '12px 14px', border: `1px solid ${phaseColor}30`, fontSize: 13, color: '#ddd', lineHeight: 1.5 }}>
                Observe como os nativos organizam as palavras. Em {targetLanguage}, a ordem é: <strong style={{ color: phaseColor }}>{currentPattern.pattern}</strong>
              </div>
            </div>

            {/* Pattern structure visual */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '16px', marginBottom: 16, border: `1px solid ${phaseColor}20` }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
                {currentPattern.pattern.split(' + ').map((part, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ background: `${phaseColor}25`, border: `1px solid ${phaseColor}50`, borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, color: phaseColor }}>{part}</div>
                    {i < currentPattern.pattern.split(' + ').length - 1 && <span style={{ color: '#555', fontSize: 14 }}>+</span>}
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{currentPattern.example}</div>
                <div style={{ fontSize: 13, color: '#888', fontStyle: 'italic' }}>{currentPattern.exampleTranslation}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                <button onClick={() => speakText(currentPattern.example)} style={{ background: phaseColor, border: 'none', borderRadius: 50, width: 40, height: 40, fontSize: 16, cursor: 'pointer' }}>🔊</button>
                <button onClick={() => { setShowAnswer(!showAnswer); }} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '8px 16px', color: '#aaa', fontSize: 12, cursor: 'pointer' }}>
                  {showAnswer ? 'Ocultar análise' : 'Analisar frase'}
                </button>
              </div>
            </div>

            {/* Analysis */}
            {showAnswer && (
              <div style={{ background: `${phaseColor}08`, border: `1px solid ${phaseColor}20`, borderRadius: 14, padding: '14px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: phaseColor, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>🔍 Análise da frase:</div>
                {currentPattern.slots.map((slot, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ background: `${phaseColor}20`, borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700, color: phaseColor, minWidth: 70, textAlign: 'center' }}>{slot.role}</div>
                    <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{slot.options[0].word}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>= {slot.options[0].translation}</div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setTab('build')} style={{ width: '100%', background: phaseColor, border: 'none', borderRadius: 12, padding: '14px', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              🔧 Praticar Substituição →
            </button>
          </div>
        )}

        {/* ── TAB: BUILD ─────────────────────────────────────────────────── */}
        {tab === 'build' && (
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 14, textAlign: 'center' }}>
              Toque em cada parte para trocar a palavra. Como os nativos fazem! 🔄
            </div>

            {/* Built sentence display */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '16px', marginBottom: 16, border: `1px solid ${phaseColor}20`, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4, lineHeight: 1.4 }}>{builtSentence}</div>
              <div style={{ fontSize: 13, color: '#888', fontStyle: 'italic', marginBottom: 10 }}>{builtTranslation}</div>
              <button onClick={() => speakText(builtSentence)} style={{ background: phaseColor, border: 'none', borderRadius: 50, width: 40, height: 40, fontSize: 16, cursor: 'pointer' }}>🔊</button>
            </div>

            {/* Slot buttons */}
            <div style={{ marginBottom: 16 }}>
              {slots.map((slot, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{slot.role}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {slot.options.map((opt, j) => (
                      <button
                        key={j}
                        onClick={() => {
                          setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, current: j } : s));
                          setXp(x => x + 2);
                          speakText(opt.word);
                        }}
                        style={{
                          background: slot.current === j ? `${phaseColor}30` : 'rgba(255,255,255,0.05)',
                          border: `2px solid ${slot.current === j ? phaseColor : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: 10,
                          padding: '8px 12px',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 700, color: slot.current === j ? '#fff' : '#aaa' }}>{opt.word}</div>
                        <div style={{ fontSize: 10, color: '#666' }}>{opt.translation}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => {
                  setChatInput('Como uso "' + builtSentence + '" em uma conversa?');
                  setTab('chat');
                }}
                style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '12px', color: '#aaa', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
              >
                💬 Perguntar ao professor
              </button>
              <button
                onClick={() => {
                  if (patternIdx < patterns.length - 1) {
                    setPatternIdx(i => i + 1);
                    setXp(x => x + 15);
                  } else {
                    onComplete?.(xp + 15);
                  }
                }}
                style={{ flex: 1, background: phaseColor, border: 'none', borderRadius: 12, padding: '12px', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                {patternIdx < patterns.length - 1 ? 'Próximo padrão →' : '✅ Concluir'}
              </button>
            </div>
          </div>
        )}

        {/* ── TAB: CHUNKS ────────────────────────────────────────────────── */}
        {tab === 'chunks' && (
          <div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${phaseColor}30`, border: `2px solid ${phaseColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{teacherEmoji}</div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '0 16px 16px 16px', padding: '10px 14px', border: `1px solid ${phaseColor}30`, fontSize: 13, color: '#ddd', lineHeight: 1.5 }}>
                Algumas expressões em {targetLanguage} são "chunks" — grupos de palavras com um único significado. Aprenda-os como blocos! 🧩
              </div>
            </div>

            {(currentPattern.chunks || []).map((chunk, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${phaseColor}20`, borderRadius: 14, padding: '14px', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ background: `${phaseColor}20`, borderRadius: 8, padding: '6px 12px', fontSize: 15, fontWeight: 800, color: '#fff' }}>{chunk.chunk}</div>
                  <button onClick={() => speakText(chunk.chunk)} style={{ background: 'none', border: 'none', color: phaseColor, fontSize: 18, cursor: 'pointer' }}>🔊</button>
                </div>
                <div style={{ fontSize: 14, color: '#aaa', marginBottom: 4 }}>= <strong style={{ color: '#fff' }}>{chunk.meaning}</strong></div>
                {chunk.note && <div style={{ fontSize: 12, color: '#666', fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '4px 8px', marginTop: 4 }}>💡 {chunk.note}</div>}
              </div>
            ))}

            {/* PT vs EN comparison */}
            <div style={{ background: `${phaseColor}08`, border: `1px solid ${phaseColor}20`, borderRadius: 14, padding: '14px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: phaseColor, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>🔄 PT × {targetLanguage}:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px' }}>
                  <div style={{ fontSize: 10, color: '#888', marginBottom: 4, fontWeight: 700 }}>🌐 {nativeLanguage.toUpperCase()}</div>
                  <div style={{ fontSize: 13, color: '#fff' }}>{currentPattern.exampleTranslation}</div>
                </div>
                <div style={{ background: `${phaseColor}10`, borderRadius: 10, padding: '10px', border: `1px solid ${phaseColor}30` }}>
                  <div style={{ fontSize: 10, color: phaseColor, marginBottom: 4, fontWeight: 700 }}>🌍 {targetLanguage.toUpperCase()}</div>
                  <div style={{ fontSize: 13, color: '#fff' }}>{currentPattern.example}</div>
                </div>
              </div>
            </div>

            <button onClick={() => setTab('chat')} style={{ width: '100%', background: phaseColor, border: 'none', borderRadius: 12, padding: '12px', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              💬 Conversar sobre esta estrutura
            </button>
          </div>
        )}

        {/* ── TAB: CHAT ──────────────────────────────────────────────────── */}
        {tab === 'chat' && (
          <div>
            <div style={{ height: 280, overflowY: 'auto', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4 }}>
              {chatHistory.map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                  {msg.role === 'assistant' && (
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${phaseColor}30`, border: `1px solid ${phaseColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{teacherEmoji}</div>
                  )}
                  <div style={{ maxWidth: '75%', background: msg.role === 'user' ? `${phaseColor}25` : 'rgba(255,255,255,0.07)', border: `1px solid ${msg.role === 'user' ? phaseColor + '50' : 'rgba(255,255,255,0.1)'}`, borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '10px 12px', fontSize: 13, color: '#fff', lineHeight: 1.5 }}>
                    {msg.content}
                    {msg.role === 'assistant' && (
                      <button onClick={() => speakText(msg.content)} style={{ display: 'block', marginTop: 4, background: 'none', border: 'none', color: phaseColor, fontSize: 11, cursor: 'pointer', padding: 0 }}>🔊</button>
                    )}
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${phaseColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{teacherEmoji}</div>
                  <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', fontSize: 13, color: '#888' }}>💭 digitando...</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick questions */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {[
                'Como uso isso no dia a dia?',
                'Qual a diferença para o português?',
                'Dá um exemplo diferente?',
              ].map((q, i) => (
                <button key={i} onClick={() => setChatInput(q)} style={{ background: `${phaseColor}15`, border: `1px solid ${phaseColor}30`, borderRadius: 16, padding: '4px 10px', color: phaseColor, fontSize: 11, cursor: 'pointer' }}>
                  {q}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                placeholder={user ? "Pergunte sobre a estrutura..." : "🔒"}
                disabled={!user}
                style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: `1px solid ${phaseColor}40`, borderRadius: 12, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none' }}
              />
              <button
                onClick={handleSendChat}
                disabled={!user || !chatInput.trim() || chatMutation.isPending}
                style={{ background: phaseColor, border: 'none', borderRadius: 12, width: 44, height: 44, fontSize: 18, cursor: 'pointer', opacity: !user || !chatInput.trim() ? 0.5 : 1 }}
              >
                ➤
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
