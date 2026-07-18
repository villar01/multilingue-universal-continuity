import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';

// ── Scene definitions ──────────────────────────────────────────────────────
export const SCENES = [
  { id: 'kitchen',     label: 'Cozinha',       labelEn: 'Kitchen',      emoji: '🍳', color: '#e17055' },
  { id: 'park',        label: 'Parque',         labelEn: 'Park',         emoji: '🌳', color: '#00b894' },
  { id: 'school',      label: 'Escola',         labelEn: 'School',       emoji: '🏫', color: '#0984e3' },
  { id: 'market',      label: 'Mercado',        labelEn: 'Market',       emoji: '🛒', color: '#fdcb6e' },
  { id: 'bedroom',     label: 'Quarto',         labelEn: 'Bedroom',      emoji: '🛏️', color: '#a29bfe' },
  { id: 'beach',       label: 'Praia',          labelEn: 'Beach',        emoji: '🏖️', color: '#00cec9' },
  { id: 'restaurant',  label: 'Restaurante',    labelEn: 'Restaurant',   emoji: '🍽️', color: '#fd79a8' },
  { id: 'living_room', label: 'Sala de Estar',  labelEn: 'Living Room',  emoji: '🛋️', color: '#6c5ce7' },
  { id: 'garden',      label: 'Jardim',         labelEn: 'Garden',       emoji: '🌸', color: '#55efc4' },
  { id: 'airport',     label: 'Aeroporto',      labelEn: 'Airport',      emoji: '✈️', color: '#74b9ff' },
  { id: 'hospital',    label: 'Hospital',       labelEn: 'Hospital',     emoji: '🏥', color: '#ff7675' },
  { id: 'office',      label: 'Escritório',     labelEn: 'Office',       emoji: '💼', color: '#636e72' },
];

interface SceneLessonProps {
  targetLanguage: string;
  languageCode: string;
  phase: string;
  teacherName?: string;
  teacherEmoji?: string;
  phaseColor?: string;
  onComplete?: (xp: number) => void;
  onBack?: () => void;
}

interface SceneData {
  imageUrl: string | null;
  teacherIntro: string;
  sceneDescription: string;
  sceneDescriptionTranslation: string;
  objects: Array<{ word: string; translation: string; emoji: string; phonetic?: string }>;
  questions: Array<{ question: string; questionInTarget: string; suggestedAnswer: string; answerTranslation: string }>;
  conversationStarters: string[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function SceneLesson({
  targetLanguage,
  languageCode,
  phase,
  teacherName = 'Professor',
  teacherEmoji = '👨‍🏫',
  phaseColor = '#6c5ce7',
  onComplete,
  onBack,
}: SceneLessonProps) {
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [sceneData, setSceneData] = useState<SceneData | null>(null);
  const [tab, setTab] = useState<'scene' | 'objects' | 'questions' | 'chat'>('scene');
  const [selectedObj, setSelectedObj] = useState<number | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [xp, setXp] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sceneMutation = trpc.polyLesson.sceneLesson.useMutation();
  const chatMutation = trpc.polyLesson.sceneChat.useMutation();

  const sceneInfo = SCENES.find(s => s.id === selectedScene);
  const color = sceneInfo?.color || phaseColor;

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Speak word using TTS
  const speakWord = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = languageCode;
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const handleSelectScene = (sceneId: string) => {
    setSelectedScene(sceneId);
    setSceneData(null);
    setTab('scene');
    setSelectedObj(null);
    setQIndex(0);
    setChatHistory([]);
    sceneMutation.mutate(
      { targetLanguage, phase, sceneId },
      {
        onSuccess: (data) => {
          setSceneData(data as SceneData);
          // Auto-greet in chat
          const intro = (data as SceneData).teacherIntro || 'Vamos explorar esta cena!';
          setChatHistory([{ role: 'assistant', content: intro }]);
        },
      }
    );
  };

  const handleSendChat = () => {
    if (!chatInput.trim() || chatMutation.isPending) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: userMsg }];
    setChatHistory(newHistory);
    chatMutation.mutate(
      {
        targetLanguage,
        sceneId: selectedScene || 'kitchen',
        sceneDescription: sceneData?.sceneDescription || '',
        studentMessage: userMsg,
        history: newHistory.slice(-8).map(m => ({ role: m.role, content: m.content })),
      },
      {
        onSuccess: (data) => {
          setChatHistory(prev => [...prev, { role: 'assistant', content: (data as { reply: string }).reply }]);
          setXp(x => x + 5);
        },
      }
    );
  };

  // ── Scene selector ─────────────────────────────────────────────────────────
  if (!selectedScene) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'system-ui, sans-serif', background: '#0f0f1a', borderRadius: 20, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${phaseColor}20, #0f0f1a)`, padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
          {onBack && (
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 20, cursor: 'pointer', padding: 4 }}>←</button>
          )}
          <div style={{ fontSize: 24 }}>{teacherEmoji}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Cenas com Professor</div>
            <div style={{ fontSize: 11, color: '#888' }}>Escolha um ambiente para explorar</div>
          </div>
        </div>

        {/* Teacher intro bubble */}
        <div style={{ padding: '16px 16px 8px' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${phaseColor}30`, border: `2px solid ${phaseColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{teacherEmoji}</div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '0 16px 16px 16px', padding: '10px 14px', border: `1px solid ${phaseColor}30`, fontSize: 14, color: '#ddd', lineHeight: 1.5 }}>
              Vamos explorar diferentes lugares! Eu estou dentro de cada cena — clique em um ambiente e vamos conversar sobre tudo que tem lá! 🌍
            </div>
          </div>
        </div>

        {/* Scene grid */}
        <div style={{ padding: '0 16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {SCENES.map(scene => (
            <button
              key={scene.id}
              onClick={() => handleSelectScene(scene.id)}
              style={{
                background: `${scene.color}15`,
                border: `2px solid ${scene.color}40`,
                borderRadius: 14,
                padding: '14px 8px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                color: '#fff',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 28 }}>{scene.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: scene.color }}>{scene.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!sceneData || sceneMutation.isPending) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'system-ui, sans-serif', background: '#0f0f1a', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{sceneInfo?.emoji}</div>
          <div style={{ fontSize: 18, color: '#fff', fontWeight: 700, marginBottom: 8 }}>Preparando a {sceneInfo?.label}...</div>
          <div style={{ fontSize: 13, color: '#888' }}>O professor está entrando na cena 🎬</div>
          <div style={{ marginTop: 24, display: 'flex', gap: 6, justifyContent: 'center' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: color, animation: `pulse${i} 1s ease-in-out ${i * 0.3}s infinite alternate`, opacity: 0.6 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentQ = sceneData.questions[qIndex];

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'system-ui, sans-serif', background: '#0f0f1a', borderRadius: 20, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${color}20, #0f0f1a)`, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => setSelectedScene(null)} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 18, cursor: 'pointer' }}>←</button>
        <span style={{ fontSize: 20 }}>{sceneInfo?.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{sceneInfo?.label}</div>
          <div style={{ fontSize: 11, color: '#888' }}>{teacherName} está aqui com você</div>
        </div>
        <div style={{ fontSize: 13, color: color, fontWeight: 700 }}>⚡ {xp} XP</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {(['scene', 'objects', 'questions', 'chat'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              background: tab === t ? `${color}20` : 'transparent',
              border: 'none',
              borderBottom: tab === t ? `2px solid ${color}` : '2px solid transparent',
              color: tab === t ? color : '#666',
              padding: '9px 4px',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {t === 'scene' ? '🖼️ Cena' : t === 'objects' ? '📦 Objetos' : t === 'questions' ? '❓ Perguntas' : '💬 Chat'}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px' }}>

        {/* ── TAB: SCENE ─────────────────────────────────────────────────── */}
        {tab === 'scene' && (
          <div>
            {/* Teacher bubble */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${color}30`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{teacherEmoji}</div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '0 16px 16px 16px', padding: '10px 14px', border: `1px solid ${color}30`, fontSize: 13, color: '#ddd', lineHeight: 1.5 }}>
                {sceneData.teacherIntro}
              </div>
            </div>

            {/* Scene image or fallback */}
            <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 14, border: `2px solid ${color}30`, position: 'relative', minHeight: 200, background: `linear-gradient(135deg, ${color}10, #1a1a2e)` }}>
              {sceneData.imageUrl ? (
                <img src={sceneData.imageUrl} alt={sceneInfo?.label} style={{ width: '100%', display: 'block' }} />
              ) : (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 80 }}>{sceneInfo?.emoji}</div>
                  <div style={{ fontSize: 16, color: '#fff', fontWeight: 700, marginTop: 8 }}>{sceneInfo?.label}</div>
                </div>
              )}
              {/* Teacher overlay */}
              <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.7)', borderRadius: 12, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 18 }}>{teacherEmoji}</span>
                <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>{teacherName}</span>
              </div>
            </div>

            {/* Scene description */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '12px 14px', marginBottom: 14, border: `1px solid ${color}20` }}>
              <div style={{ fontSize: 15, color: '#fff', fontWeight: 600, marginBottom: 4 }}>{sceneData.sceneDescription}</div>
              <div style={{ fontSize: 12, color: '#888', fontStyle: 'italic' }}>{sceneData.sceneDescriptionTranslation}</div>
            </div>

            {/* Conversation starters */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>💡 Diga ao professor:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(sceneData.conversationStarters || []).slice(0, 4).map((starter, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setTab('chat');
                      setChatInput(starter);
                    }}
                    style={{ background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 20, padding: '6px 12px', color: color, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setTab('objects')} style={{ flex: 1, background: `${color}20`, border: `1px solid ${color}40`, borderRadius: 12, padding: '12px', color: color, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                📦 Ver Objetos
              </button>
              <button onClick={() => setTab('chat')} style={{ flex: 1, background: color, border: 'none', borderRadius: 12, padding: '12px', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                💬 Conversar
              </button>
            </div>
          </div>
        )}

        {/* ── TAB: OBJECTS ───────────────────────────────────────────────── */}
        {tab === 'objects' && (
          <div>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>
              Clique em um objeto para ouvir e aprender! ({sceneData.objects?.length || 0} objetos)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {(sceneData.objects || []).map((obj, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedObj(selectedObj === i ? null : i);
                    speakWord(obj.word);
                    setXp(x => x + 2);
                  }}
                  style={{
                    background: selectedObj === i ? `${color}25` : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${selectedObj === i ? color : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 14,
                    padding: '14px 10px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{obj.emoji || '📝'}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{obj.word}</div>
                  {obj.phonetic && <div style={{ fontSize: 11, color: '#FFD700', fontStyle: 'italic' }}>'{obj.phonetic}'</div>}
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{obj.translation}</div>
                </button>
              ))}
            </div>
            {selectedObj !== null && sceneData.objects[selectedObj] && (
              <div style={{ background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 14, padding: '14px', marginBottom: 14 }}>
                <div style={{ fontSize: 28, textAlign: 'center', marginBottom: 8 }}>{sceneData.objects[selectedObj].emoji}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: 4 }}>{sceneData.objects[selectedObj].word}</div>
                <div style={{ fontSize: 14, color: '#aaa', textAlign: 'center', marginBottom: 12 }}>= {sceneData.objects[selectedObj].translation}</div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <button onClick={() => speakWord(sceneData.objects[selectedObj].word)} style={{ background: color, border: 'none', borderRadius: 50, width: 44, height: 44, fontSize: 18, cursor: 'pointer' }}>🔊</button>
                  <button
                    onClick={() => {
                      setTab('chat');
                      setChatInput('What is ' + sceneData.objects[selectedObj].word + '?');
                    }}
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 50, width: 44, height: 44, fontSize: 18, cursor: 'pointer' }}
                  >
                    💬
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: QUESTIONS ─────────────────────────────────────────────── */}
        {tab === 'questions' && (
          <div>
            {qIndex >= sceneData.questions.length ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Parabéns!</div>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>Você respondeu todas as perguntas sobre a {sceneInfo?.label}!</div>
                <button
                  onClick={() => { onComplete?.(xp); }}
                  style={{ background: color, border: 'none', borderRadius: 12, padding: '14px 28px', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
                >
                  ✅ Concluir Cena
                </button>
              </div>
            ) : (
              <div>
                {/* Teacher asks */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${color}30`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{teacherEmoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '0 16px 16px 16px', padding: '12px 14px', border: `1px solid ${color}30`, marginBottom: 6 }}>
                      <div style={{ fontSize: 14, color: '#fff', fontWeight: 600, marginBottom: 4 }}>{currentQ.questionInTarget}</div>
                      <div style={{ fontSize: 12, color: '#888', fontStyle: 'italic' }}>{currentQ.question}</div>
                    </div>
                    <button onClick={() => speakWord(currentQ.questionInTarget)} style={{ background: 'none', border: 'none', color: color, fontSize: 11, cursor: 'pointer' }}>🔊 Ouvir pergunta</button>
                  </div>
                </div>

                {/* Suggested answer */}
                <div style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 14, padding: '14px', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: color, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>💡 Resposta sugerida:</div>
                  <div style={{ fontSize: 15, color: '#fff', fontWeight: 600, marginBottom: 4 }}>{currentQ.suggestedAnswer}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{currentQ.answerTranslation}</div>
                  <button onClick={() => speakWord(currentQ.suggestedAnswer)} style={{ marginTop: 8, background: color, border: 'none', borderRadius: 8, padding: '6px 12px', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>🔊 Ouvir resposta</button>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => {
                      setTab('chat');
                      setChatInput(currentQ.suggestedAnswer);
                    }}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '12px', color: '#aaa', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                  >
                    💬 Responder no chat
                  </button>
                  <button
                    onClick={() => { setQIndex(i => i + 1); setXp(x => x + 10); }}
                    style={{ flex: 1, background: color, border: 'none', borderRadius: 12, padding: '12px', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                  >
                    {qIndex < sceneData.questions.length - 1 ? 'Próxima →' : '✅ Concluir'}
                  </button>
                </div>
                <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: '#666' }}>
                  Pergunta {qIndex + 1} de {sceneData.questions.length}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: CHAT ──────────────────────────────────────────────────── */}
        {tab === 'chat' && (
          <div>
            {/* Chat messages */}
            <div style={{ height: 280, overflowY: 'auto', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4 }}>
              {chatHistory.map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                  {msg.role === 'assistant' && (
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${color}30`, border: `1px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{teacherEmoji}</div>
                  )}
                  <div style={{
                    maxWidth: '75%',
                    background: msg.role === 'user' ? `${color}25` : 'rgba(255,255,255,0.07)',
                    border: `1px solid ${msg.role === 'user' ? color + '50' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '10px 12px',
                    fontSize: 13,
                    color: '#fff',
                    lineHeight: 1.5,
                  }}>
                    {msg.content}
                    {msg.role === 'assistant' && (
                      <button onClick={() => speakWord(msg.content)} style={{ display: 'block', marginTop: 4, background: 'none', border: 'none', color: color, fontSize: 11, cursor: 'pointer', padding: 0 }}>🔊</button>
                    )}
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{teacherEmoji}</div>
                  <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', fontSize: 13, color: '#888' }}>💭 digitando...</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick replies */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {(sceneData.conversationStarters || []).slice(0, 3).map((s, i) => (
                <button key={i} onClick={() => setChatInput(s)} style={{ background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 16, padding: '4px 10px', color: color, fontSize: 11, cursor: 'pointer' }}>
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                placeholder={`Responda em ${targetLanguage}...`}
                style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: `1px solid ${color}40`, borderRadius: 12, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none' }}
              />
              <button
                onClick={handleSendChat}
                disabled={!chatInput.trim() || chatMutation.isPending}
                style={{ background: color, border: 'none', borderRadius: 12, width: 44, height: 44, fontSize: 18, cursor: 'pointer', opacity: !chatInput.trim() ? 0.5 : 1 }}
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
