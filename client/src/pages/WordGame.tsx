/**
 * WordGame — 6 Modos · 69 Idiomas · SRS SM-2 · IA Generativa
 * Superior ao Drops + Memrise combinados
 */
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import LanguageSelector from "@/components/LanguageSelector";
import { LANGUAGES_57, type Language } from "@/lib/languages";

type GameMode = "flashcard" | "match" | "typing" | "hangman" | "quiz" | "wordsearch";

const CATEGORIES = [
  { id: "animais", label: "Animais", emoji: "🐾" },
  { id: "comida", label: "Comida", emoji: "🍕" },
  { id: "viagem", label: "Viagem", emoji: "✈️" },
  { id: "trabalho", label: "Trabalho", emoji: "💼" },
  { id: "corpo humano", label: "Corpo", emoji: "🫀" },
  { id: "natureza", label: "Natureza", emoji: "🌿" },
  { id: "tecnologia", label: "Tecnologia", emoji: "💻" },
  { id: "emocoes", label: "Emoções", emoji: "😊" },
  { id: "casa", label: "Casa", emoji: "🏠" },
  { id: "esportes", label: "Esportes", emoji: "⚽" },
  { id: "numeros", label: "Números", emoji: "🔢" },
  { id: "cores", label: "Cores", emoji: "🎨" },
];

const MODES: { id: GameMode; label: string; icon: string; desc: string }[] = [
  { id: "flashcard", label: "Flash Card", icon: "🃏", desc: "Vire o card — SRS SM-2" },
  { id: "match", label: "Combinação", icon: "🔗", desc: "Conecte palavra com tradução" },
  { id: "typing", label: "Digitação", icon: "⌨️", desc: "Digite a palavra correta" },
  { id: "hangman", label: "Forca", icon: "🪢", desc: "Adivinhe letra por letra" },
  { id: "quiz", label: "Quiz", icon: "❓", desc: "4 opções — escolha a correta" },
  { id: "wordsearch", label: "Caça-Palavras", icon: "🔍", desc: "Encontre na grade de letras" },
];

interface Word { word: string; translation: string; emoji?: string; phonetic?: string; }

export default function WordGame() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [phase, setPhase] = useState<"setup" | "game" | "result">("setup");
  const [lang, setLang] = useState<Language>(LANGUAGES_57[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [mode, setMode] = useState<GameMode>("flashcard");
  const [words, setWords] = useState<Word[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [loading, setLoading] = useState(false);

  const generateWords = trpc.tinyLesson.generateByScenario.useMutation();
  const srsUpsert = trpc.srs.upsert.useMutation();
  const upsertRank = trpc.ranking.upsertScore.useMutation();
  const completeDaily = trpc.dailyChallenge.complete.useMutation();

  const speak = useCallback((text: string, code: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = code; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }, []);

  const loadWords = async () => {
    setLoading(true);
    try {
      const res = await generateWords.mutateAsync({
        scenario: category.id,
        targetLanguage: lang.code,
        nativeLanguage: "pt-BR",
      });
      const parsed: Word[] = (res.vocabulary || []).slice(0, 12).map((v: any) => ({
        word: v.word || v.target || "",
        translation: v.translation || v.native || "",
        emoji: v.emoji || "",
        phonetic: v.phonetic || "",
      })).filter((w: Word) => w.word && w.translation);
      if (parsed.length < 4) { toast.error("Poucas palavras. Tente outra categoria."); setLoading(false); return; }
      setWords(parsed); setIdx(0); setScore(0); setXp(0); setStreak(0); setBestStreak(0);
      setPhase("game");
    } catch { toast.error("Erro ao gerar palavras."); }
    finally { setLoading(false); }
  };

  const handleCorrect = (quality = 4) => {
    const pts = quality >= 4 ? 20 : quality >= 3 ? 10 : 5;
    setScore(s => s + pts); setXp(x => x + pts);
    const ns = streak + 1; setStreak(ns); setBestStreak(b => Math.max(b, ns));
    if (user) srsUpsert.mutate({ word: words[idx].word, translation: words[idx].translation, targetLanguage: lang.code, category: category.id, quality });
    advance();
  };

  const handleWrong = () => {
    setStreak(0);
    if (user) srsUpsert.mutate({ word: words[idx].word, translation: words[idx].translation, targetLanguage: lang.code, category: category.id, quality: 1 });
    advance();
  };

  const advance = () => {
    if (idx + 1 >= words.length) finishGame();
    else setIdx(i => i + 1);
  };

  const finishGame = async () => {
    setPhase("result");
    if (user) {
      await upsertRank.mutateAsync({ xpDelta: xp, wordsLearned: words.length });
      completeDaily.mutate({ type: "wordgame" });
    }
  };

  // ── Setup ──────────────────────────────────────────────────────────────────
  if (phase === "setup") return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 p-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate("/ar-mode")} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 text-sm">← Voltar ao Hub</button>
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🧠</div>
          <h1 className="text-3xl font-bold text-white mb-2">Jogos de Palavras</h1>
          <p className="text-slate-400 text-sm">6 modos · SRS científico · 69 idiomas · 12 categorias</p>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-5 mb-4 border border-slate-700">
          <h3 className="text-white font-bold mb-3">🌍 Idioma (57 disponíveis)</h3>
          <LanguageSelector value={lang} onChange={setLang} />
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-5 mb-4 border border-slate-700">
          <h3 className="text-white font-bold mb-3">📚 Categoria</h3>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setCategory(c)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${category.id === c.id ? "border-purple-500 bg-purple-900/50 text-white" : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-400"}`}>
                <div className="text-2xl mb-1">{c.emoji}</div>
                <div className="text-xs font-medium">{c.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-5 mb-6 border border-slate-700">
          <h3 className="text-white font-bold mb-3">🎮 Modo de Jogo</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${mode === m.id ? "border-indigo-500 bg-indigo-900/50 text-white" : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-400"}`}>
                <div className="text-2xl mb-1">{m.icon}</div>
                <div className="font-bold text-sm">{m.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <Button onClick={loadWords} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 text-lg rounded-xl">
          {loading ? "⏳ Gerando vocabulário com IA..." : "🚀 Iniciar Jogo"}
        </Button>
      </div>
    </div>
  );

  // ── Resultado ──────────────────────────────────────────────────────────────
  if (phase === "result") return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-purple-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/80 backdrop-blur rounded-2xl p-8 text-center border border-slate-700">
        <div className="text-6xl mb-4">{xp >= 150 ? "🏆" : xp >= 80 ? "🥈" : "📚"}</div>
        <h2 className="text-2xl font-bold text-white mb-2">Jogo Concluído!</h2>
        <div className="grid grid-cols-3 gap-4 my-6">
          <div className="bg-slate-700 rounded-xl p-3"><div className="text-2xl font-bold text-yellow-400">{xp}</div><div className="text-xs text-slate-400">XP</div></div>
          <div className="bg-slate-700 rounded-xl p-3"><div className="text-2xl font-bold text-green-400">{words.length}</div><div className="text-xs text-slate-400">Palavras</div></div>
          <div className="bg-slate-700 rounded-xl p-3"><div className="text-2xl font-bold text-orange-400">{bestStreak}</div><div className="text-xs text-slate-400">Streak</div></div>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => { setPhase("setup"); setWords([]); }} className="flex-1 bg-purple-600 hover:bg-purple-500">Novo Jogo</Button>
          <Button onClick={() => navigate("/ar-mode")} variant="outline" className="flex-1 border-slate-600 text-slate-300">Hub</Button>
        </div>
      </div>
    </div>
  );

  // ── Game Header ────────────────────────────────────────────────────────────
  const currentWord = words[idx];
  const progress = (idx / words.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 flex flex-col">
      <div className="bg-black/40 backdrop-blur px-4 py-3 flex items-center gap-3">
        <button onClick={() => setPhase("setup")} className="text-white/70 hover:text-white text-sm">←</button>
        <div className="text-xl">{MODES.find(m => m.id === mode)?.icon}</div>
        <div className="flex-1">
          <div className="text-white font-bold text-sm">{MODES.find(m => m.id === mode)?.label}</div>
          <div className="text-white/60 text-xs">{lang.flag} {lang.label} · {category.emoji} {category.label}</div>
        </div>
        <Badge className="bg-yellow-600 text-xs">⚡{xp}</Badge>
        <Badge className="bg-orange-600 text-xs">🔥{streak}</Badge>
        <Badge className="bg-blue-700 text-xs">{idx+1}/{words.length}</Badge>
      </div>
      <Progress value={progress} className="h-1 rounded-none" />

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {mode === "flashcard" && <FlashCard word={currentWord} lang={lang} onCorrect={handleCorrect} onWrong={handleWrong} speak={speak} />}
        {mode === "match" && <MatchGame words={words.slice(0, 8)} lang={lang} onComplete={() => { setXp(x => x + 100); finishGame(); }} speak={speak} />}
        {mode === "typing" && <TypingGame word={currentWord} lang={lang} onCorrect={handleCorrect} onWrong={handleWrong} speak={speak} />}
        {mode === "hangman" && <HangmanGame word={currentWord} lang={lang} onCorrect={handleCorrect} onWrong={handleWrong} speak={speak} />}
        {mode === "quiz" && <QuizGame word={currentWord} allWords={words} lang={lang} onCorrect={handleCorrect} onWrong={handleWrong} speak={speak} />}
        {mode === "wordsearch" && <WordSearchGame words={words.slice(0, 8)} lang={lang} onComplete={() => { setXp(x => x + 120); finishGame(); }} />}
      </div>
    </div>
  );
}

// ── Flash Card ────────────────────────────────────────────────────────────────
function FlashCard({ word, lang, onCorrect, onWrong, speak }: { word: Word; lang: Language; onCorrect: (q: number) => void; onWrong: () => void; speak: (t: string, c: string) => void }) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => { setFlipped(false); }, [word]);
  return (
    <div className="w-full max-w-sm">
      <div onClick={() => { setFlipped(!flipped); if (!flipped) speak(word.word, lang.code); }}
        className="w-full h-56 bg-slate-800 border-2 border-slate-600 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-all shadow-2xl mb-6 select-none">
        {!flipped ? (
          <div className="text-center p-6">
            {word.emoji && <div className="text-5xl mb-3">{word.emoji}</div>}
            <div className="text-3xl font-bold text-white mb-2">{word.word}</div>
            {word.phonetic && <div className="text-slate-400 text-sm">[{word.phonetic}]</div>}
            <div className="text-slate-500 text-xs mt-2">Toque para ver a tradução</div>
          </div>
        ) : (
          <div className="text-center p-6">
            <div className="text-2xl font-bold text-green-400 mb-2">{word.translation}</div>
            <div className="text-slate-400 text-sm">Como foi?</div>
          </div>
        )}
      </div>
      {flipped ? (
        <div className="grid grid-cols-3 gap-3">
          <button onClick={onWrong} className="py-3 bg-red-700 hover:bg-red-600 rounded-xl text-white font-bold text-sm">😓 Difícil</button>
          <button onClick={() => onCorrect(3)} className="py-3 bg-yellow-700 hover:bg-yellow-600 rounded-xl text-white font-bold text-sm">🤔 Médio</button>
          <button onClick={() => onCorrect(5)} className="py-3 bg-green-700 hover:bg-green-600 rounded-xl text-white font-bold text-sm">😊 Fácil</button>
        </div>
      ) : (
        <button onClick={() => speak(word.word, lang.code)} className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white text-sm">🔊 Ouvir pronúncia</button>
      )}
    </div>
  );
}

// ── Typing Game ───────────────────────────────────────────────────────────────
function TypingGame({ word, lang, onCorrect, onWrong, speak }: { word: Word; lang: Language; onCorrect: (q: number) => void; onWrong: () => void; speak: (t: string, c: string) => void }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  useEffect(() => { setInput(""); setResult(null); }, [word]);
  const check = () => {
    const ok = input.trim().toLowerCase() === word.word.toLowerCase();
    setResult(ok ? "correct" : "wrong");
    setTimeout(() => { ok ? onCorrect(4) : onWrong(); }, 1000);
  };
  return (
    <div className="w-full max-w-sm text-center">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl p-8 mb-6">
        {word.emoji && <div className="text-5xl mb-3">{word.emoji}</div>}
        <div className="text-2xl font-bold text-white mb-1">{word.translation}</div>
        <div className="text-slate-400 text-sm">Como se diz em {lang.label}?</div>
      </div>
      <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && check()}
        placeholder={`Digite em ${lang.name}...`}
        className={`w-full px-4 py-3 rounded-xl border-2 bg-slate-800 text-white text-center text-lg mb-4 focus:outline-none transition-all ${result === "correct" ? "border-green-500 bg-green-900/30" : result === "wrong" ? "border-red-500 bg-red-900/30" : "border-slate-600 focus:border-indigo-500"}`}
        disabled={result !== null} />
      {result === "wrong" && <div className="text-green-400 text-sm mb-3">✓ Correto: <strong>{word.word}</strong></div>}
      <div className="flex gap-3">
        <button onClick={() => speak(word.word, lang.code)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white text-sm">🔊 Ouvir</button>
        <button onClick={check} disabled={!input.trim() || result !== null} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl text-white font-bold">Verificar</button>
      </div>
    </div>
  );
}

// ── Quiz Game ─────────────────────────────────────────────────────────────────
function QuizGame({ word, allWords, lang, onCorrect, onWrong, speak }: { word: Word; allWords: Word[]; lang: Language; onCorrect: (q: number) => void; onWrong: () => void; speak: (t: string, c: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const options = (() => {
    const wrong = allWords.filter(w => w.word !== word.word).sort(() => Math.random() - 0.5).slice(0, 3);
    return [...wrong, word].sort(() => Math.random() - 0.5);
  })();
  useEffect(() => { setSelected(null); }, [word]);
  const pick = (w: Word) => {
    if (selected) return;
    setSelected(w.word);
    const ok = w.word === word.word;
    setTimeout(() => { ok ? onCorrect(4) : onWrong(); }, 900);
  };
  return (
    <div className="w-full max-w-sm text-center">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl p-8 mb-6">
        {word.emoji && <div className="text-5xl mb-3">{word.emoji}</div>}
        <div className="text-2xl font-bold text-white mb-1">{word.translation}</div>
        <div className="text-slate-400 text-sm">Qual a tradução em {lang.label}?</div>
        <button onClick={() => speak(word.word, lang.code)} className="mt-3 px-4 py-1.5 bg-slate-700 rounded-lg text-white text-xs">🔊 Ouvir resposta</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt, i) => {
          const isCorrect = opt.word === word.word;
          const isSelected = selected === opt.word;
          return (
            <button key={i} onClick={() => pick(opt)}
              className={`py-4 px-3 rounded-xl border-2 font-medium text-sm transition-all ${!selected ? "border-slate-600 bg-slate-700 text-white hover:border-indigo-500" : isSelected && isCorrect ? "border-green-500 bg-green-900/50 text-green-300" : isSelected && !isCorrect ? "border-red-500 bg-red-900/50 text-red-300" : isCorrect ? "border-green-500 bg-green-900/30 text-green-300" : "border-slate-700 bg-slate-800 text-slate-500"}`}>
              {opt.word}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Hangman ───────────────────────────────────────────────────────────────────
function HangmanGame({ word, lang, onCorrect, onWrong, speak }: { word: Word; lang: Language; onCorrect: (q: number) => void; onWrong: () => void; speak: (t: string, c: string) => void }) {
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState(0);
  const MAX = 6;
  const target = word.word.toLowerCase().replace(/[^a-záàâãéèêíìîóòôõúùûç]/gi, "");
  const unique = target.split("").filter((v, i, a) => a.indexOf(v) === i);
  useEffect(() => { setGuessed(new Set()); setErrors(0); }, [word]);
  const guess = (l: string) => {
    if (guessed.has(l)) return;
    const ng = new Set(guessed); ng.add(l);
    setGuessed(ng);
    if (!target.includes(l)) {
      const ne = errors + 1; setErrors(ne);
      if (ne >= MAX) setTimeout(onWrong, 600);
    } else {
      if (unique.every(lt => ng.has(lt))) { speak(word.word, lang.code); setTimeout(() => onCorrect(4), 600); }
    }
  };
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  const faces = ["😊","😐","😟","😰","😱","🤯","😵"];
  return (
    <div className="w-full max-w-sm text-center">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 mb-4">
        <div className="text-4xl mb-2">{faces[errors]}</div>
        <div className="text-slate-400 text-sm mb-2">{word.translation}</div>
        <div className="text-2xl font-mono font-bold text-white tracking-widest mb-3">
          {word.word.split("").map((l, i) => {
            const ll = l.toLowerCase();
            return <span key={i} className="mx-0.5">{l === " " ? " " : guessed.has(ll) ? l : "_"}</span>;
          })}
        </div>
        <Progress value={(errors / MAX) * 100} className="h-2" />
        <div className="text-xs text-slate-400 mt-1">{MAX - errors} tentativas restantes</div>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {alphabet.map(l => (
          <button key={l} onClick={() => guess(l)} disabled={guessed.has(l)}
            className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${guessed.has(l) ? target.includes(l) ? "bg-green-700 text-white" : "bg-red-900/60 text-red-400" : "bg-slate-700 hover:bg-slate-600 text-white"}`}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Match Game ────────────────────────────────────────────────────────────────
function MatchGame({ words, lang, onComplete, speak }: { words: Word[]; lang: Language; onComplete: () => void; speak: (t: string, c: string) => void }) {
  const [selected, setSelected] = useState<{ type: "word" | "trans"; idx: number } | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [shuffled] = useState(() => [...words].sort(() => Math.random() - 0.5));
  const pick = (type: "word" | "trans", idx: number) => {
    if (matched.has(idx)) return;
    if (!selected) { setSelected({ type, idx }); return; }
    if (selected.type === type) { setSelected({ type, idx }); return; }
    const wi = type === "word" ? idx : selected.idx;
    const ti = type === "trans" ? idx : selected.idx;
    if (words[wi].word === shuffled[ti].word) {
      const nm = new Set(matched); nm.add(wi); nm.add(ti);
      setMatched(nm); speak(words[wi].word, lang.code);
      if (nm.size >= words.length * 2) setTimeout(onComplete, 600);
    }
    setSelected(null);
  };
  return (
    <div className="w-full max-w-md">
      <p className="text-slate-400 text-sm text-center mb-4">Conecte a palavra com sua tradução</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {words.map((w, i) => (
            <button key={i} onClick={() => pick("word", i)}
              className={`w-full py-3 px-4 rounded-xl text-sm font-medium border-2 transition-all ${matched.has(i) ? "border-green-600 bg-green-900/40 text-green-300" : selected?.type === "word" && selected.idx === i ? "border-indigo-500 bg-indigo-900/50 text-white" : "border-slate-600 bg-slate-700 text-white hover:border-slate-400"}`}>
              {w.emoji && <span className="mr-1">{w.emoji}</span>}{w.word}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {shuffled.map((w, i) => (
            <button key={i} onClick={() => pick("trans", i)}
              className={`w-full py-3 px-4 rounded-xl text-sm font-medium border-2 transition-all ${matched.has(i) ? "border-green-600 bg-green-900/40 text-green-300" : selected?.type === "trans" && selected.idx === i ? "border-indigo-500 bg-indigo-900/50 text-white" : "border-slate-600 bg-slate-700 text-white hover:border-slate-400"}`}>
              {w.translation}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Word Search ───────────────────────────────────────────────────────────────
function WordSearchGame({ words, lang, onComplete }: { words: Word[]; lang: Language; onComplete: () => void }) {
  const SIZE = 10;
  const [found, setFound] = useState<Set<string>>(new Set());
  const [sel, setSel] = useState<[number,number][]>([]);

  const [grid, wordPos] = (() => {
    const g: string[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(""));
    const pos: Record<string, [number,number][]> = {};
    const dirs = [[0,1],[1,0],[1,1]];
    for (const w of words) {
      const wrd = w.word.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8);
      if (!wrd || wrd.length < 2) continue;
      let placed = false;
      for (let a = 0; a < 60 && !placed; a++) {
        const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
        const r = Math.floor(Math.random() * SIZE);
        const c = Math.floor(Math.random() * SIZE);
        const cells: [number,number][] = [];
        let ok = true;
        for (let i = 0; i < wrd.length; i++) {
          const nr = r + dr * i; const nc = c + dc * i;
          if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) { ok = false; break; }
          if (g[nr][nc] && g[nr][nc] !== wrd[i]) { ok = false; break; }
          cells.push([nr, nc]);
        }
        if (ok) { cells.forEach(([nr,nc],i) => { g[nr][nc] = wrd[i]; }); pos[wrd] = cells; placed = true; }
      }
    }
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
      if (!g[r][c]) g[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
    return [g, pos];
  })();

  const toggle = (r: number, c: number) => {
    const exists = sel.findIndex(([sr,sc]) => sr === r && sc === c);
    const ns = exists >= 0 ? sel.filter(([sr,sc]) => !(sr === r && sc === c)) : [...sel, [r,c] as [number,number]];
    setSel(ns);
    for (const [wrd, cells] of Object.entries(wordPos)) {
      if (cells.length === ns.length && cells.every(([wr,wc]) => ns.some(([sr,sc]) => sr === wr && sc === wc))) {
        const nf = new Set(found); nf.add(wrd); setFound(nf); setSel([]);
        if (nf.size >= Object.keys(wordPos).length) setTimeout(onComplete, 500);
        return;
      }
    }
  };

  const isFound = (r: number, c: number) => Object.entries(wordPos).some(([wrd,cells]) => found.has(wrd) && cells.some(([wr,wc]) => wr === r && wc === c));
  const isSel = (r: number, c: number) => sel.some(([sr,sc]) => sr === r && sc === c);

  return (
    <div className="w-full max-w-md">
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {words.map((w, i) => {
          const wrd = w.word.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8);
          return <Badge key={i} className={found.has(wrd) ? "bg-green-700 line-through opacity-60" : "bg-slate-700"}>{w.word}</Badge>;
        })}
      </div>
      <div className="grid gap-0.5 mx-auto" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)`, maxWidth: "320px" }}>
        {grid.map((row, r) => row.map((cell, c) => (
          <button key={`${r}-${c}`} onClick={() => toggle(r, c)}
            className={`w-8 h-8 text-xs font-bold rounded transition-all ${isFound(r,c) ? "bg-green-700 text-white" : isSel(r,c) ? "bg-indigo-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>
            {cell}
          </button>
        )))}
      </div>
      <p className="text-slate-400 text-xs text-center mt-3">{found.size}/{Object.keys(wordPos).length} palavras encontradas</p>
    </div>
  );
}
