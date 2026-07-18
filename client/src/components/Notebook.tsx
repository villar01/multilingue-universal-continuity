import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface NotebookEntry {
  id: string;
  word: string;         // Palavra no idioma alvo
  translation: string;  // Tradução no idioma nativo
  pronunciation: string;
  example: string;
  examplePt: string;
  langCode: string;
  scene?: string;
  addedAt: number;      // UTC timestamp
  reviewed: number;     // Quantas vezes revisou
  starred: boolean;     // Favorito
  note?: string;        // Anotação pessoal do aluno
}

interface NotebookProps {
  isOpen: boolean;
  onClose: () => void;
  onSpeak: (text: string, lang: string) => void;
  nativeLang?: string;
}

// ─── Persistent storage helpers ───────────────────────────────────────────────
const STORAGE_KEY = "ml_notebook_entries";

export function loadNotebook(): NotebookEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveNotebook(entries: NotebookEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function addToNotebook(entry: Omit<NotebookEntry, "id" | "addedAt" | "reviewed" | "starred">): NotebookEntry {
  const entries = loadNotebook();
  const existing = entries.find(e => e.word === entry.word && e.langCode === entry.langCode);
  if (existing) {
    existing.reviewed += 1;
    saveNotebook(entries);
    return existing;
  }
  const newEntry: NotebookEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    addedAt: Date.now(),
    reviewed: 0,
    starred: false,
  };
  entries.unshift(newEntry);
  saveNotebook(entries);
  return newEntry;
}

// ─── Flag helper ──────────────────────────────────────────────────────────────
function langFlag(code: string): string {
  const flags: Record<string, string> = {
    "en": "🇺🇸", "en-US": "🇺🇸", "en-GB": "🇬🇧",
    "pt": "🇧🇷", "pt-BR": "🇧🇷", "pt-PT": "🇵🇹",
    "fr": "🇫🇷", "fr-FR": "🇫🇷",
    "de": "🇩🇪", "de-DE": "🇩🇪",
    "es": "🇪🇸", "es-ES": "🇪🇸", "es-MX": "🇲🇽",
    "it": "🇮🇹", "it-IT": "🇮🇹",
    "ja": "🇯🇵", "ja-JP": "🇯🇵",
    "zh": "🇨🇳", "zh-CN": "🇨🇳",
    "ko": "🇰🇷", "ko-KR": "🇰🇷",
    "ru": "🇷🇺", "ru-RU": "🇷🇺",
    "ar": "🇸🇦", "ar-SA": "🇸🇦",
  };
  return flags[code] || "🌐";
}

// ─── Notebook Component ───────────────────────────────────────────────────────
export default function Notebook({ isOpen, onClose, onSpeak, nativeLang = "pt-BR" }: NotebookProps) {
  const [entries, setEntries] = useState<NotebookEntry[]>([]);
  const [search, setSearch] = useState("");
  const [filterLang, setFilterLang] = useState("all");
  const [filterStarred, setFilterStarred] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [quizMode, setQuizMode] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizRevealed, setQuizRevealed] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, wrong: 0 });
  const noteRef = useRef<HTMLTextAreaElement>(null);

  // Load on open
  useEffect(() => {
    if (isOpen) {
      setEntries(loadNotebook());
    }
  }, [isOpen]);

  const refresh = useCallback(() => setEntries(loadNotebook()), []);

  const toggleStar = (id: string) => {
    const updated = entries.map(e => e.id === id ? { ...e, starred: !e.starred } : e);
    setEntries(updated);
    saveNotebook(updated);
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    saveNotebook(updated);
  };

  const saveNote = (id: string) => {
    const updated = entries.map(e => e.id === id ? { ...e, note: noteText } : e);
    setEntries(updated);
    saveNotebook(updated);
    setEditingNote(null);
    setNoteText("");
  };

  const markReviewed = (id: string) => {
    const updated = entries.map(e => e.id === id ? { ...e, reviewed: e.reviewed + 1 } : e);
    setEntries(updated);
    saveNotebook(updated);
  };

  // Filtered entries
  const langs = [...new Set(entries.map(e => e.langCode))];
  const filtered = entries.filter(e => {
    if (filterStarred && !e.starred) return false;
    if (filterLang !== "all" && e.langCode !== filterLang) return false;
    if (search) {
      const q = search.toLowerCase();
      return e.word.toLowerCase().includes(q) || e.translation.toLowerCase().includes(q);
    }
    return true;
  });

  // Quiz mode
  const quizEntries = entries.filter(e => filterLang === "all" || e.langCode === filterLang);
  const currentQuiz = quizEntries[quizIndex % Math.max(1, quizEntries.length)];

  const handleQuizAnswer = (correct: boolean) => {
    if (correct) {
      setQuizScore(s => ({ ...s, correct: s.correct + 1 }));
      markReviewed(currentQuiz.id);
    } else {
      setQuizScore(s => ({ ...s, wrong: s.wrong + 1 }));
    }
    setQuizRevealed(false);
    setQuizIndex(i => i + 1);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
        style={{
          maxHeight: "90dvh",
          background: "linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%)",
          border: "1px solid rgba(99,102,241,0.3)",
          boxShadow: "0 -20px 60px rgba(99,102,241,0.3)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-3">
            <span style={{ fontSize: "1.6rem" }}>📓</span>
            <div>
              <div className="text-white font-bold text-lg">Caderno de Anotações</div>
              <div className="text-gray-400 text-xs">{entries.length} palavras salvas</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setQuizMode(!quizMode); setQuizIndex(0); setQuizScore({ correct: 0, wrong: 0 }); setQuizRevealed(false); }}
              className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={{
                background: quizMode ? "#6366f1" : "rgba(99,102,241,0.2)",
                color: quizMode ? "white" : "#818cf8",
                border: "1px solid rgba(99,102,241,0.4)",
              }}
            >
              {quizMode ? "📚 Lista" : "🧠 Quiz"}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-full"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Quiz Mode */}
        {quizMode && currentQuiz ? (
          <div className="flex-1 overflow-y-auto p-5 flex flex-col items-center justify-center gap-5">
            {/* Score */}
            <div className="flex gap-4 text-sm font-bold">
              <span className="text-green-400">✓ {quizScore.correct}</span>
              <span className="text-red-400">✗ {quizScore.wrong}</span>
              <span className="text-gray-400">{quizEntries.length} palavras</span>
            </div>
            {/* Card */}
            <div
              className="w-full max-w-sm rounded-2xl p-6 text-center"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(99,102,241,0.3)" }}
            >
              <div className="text-gray-400 text-xs mb-2 uppercase tracking-wider">
                {langFlag(currentQuiz.langCode)} {currentQuiz.langCode}
              </div>
              <div className="text-white text-3xl font-bold mb-2">{currentQuiz.word}</div>
              <div className="text-gray-400 font-mono text-sm mb-4">/{currentQuiz.pronunciation}/</div>
              {!quizRevealed ? (
                <button
                  onClick={() => { setQuizRevealed(true); onSpeak(currentQuiz.word, currentQuiz.langCode); }}
                  className="w-full py-3 rounded-xl text-white font-bold"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                >
                  🔊 Revelar tradução
                </button>
              ) : (
                <div className="space-y-3">
                  <div
                    className="py-3 px-4 rounded-xl text-white font-bold text-xl"
                    style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)" }}
                  >
                    {currentQuiz.translation}
                  </div>
                  <div className="text-gray-300 text-sm italic">{currentQuiz.examplePt}</div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleQuizAnswer(false)}
                      className="flex-1 py-2.5 rounded-xl text-white font-bold"
                      style={{ background: "rgba(239,68,68,0.3)", border: "1px solid rgba(239,68,68,0.5)" }}
                    >
                      ✗ Errei
                    </button>
                    <button
                      onClick={() => handleQuizAnswer(true)}
                      className="flex-1 py-2.5 rounded-xl text-white font-bold"
                      style={{ background: "rgba(34,197,94,0.3)", border: "1px solid rgba(34,197,94,0.5)" }}
                    >
                      ✓ Acertei
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="px-4 pt-3 pb-2 flex-shrink-0 space-y-2">
              <input
                type="text"
                placeholder="Buscar palavra..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-4 py-2 rounded-xl text-white text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setFilterStarred(!filterStarred)}
                  className="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0"
                  style={{
                    background: filterStarred ? "#f59e0b33" : "rgba(255,255,255,0.06)",
                    color: filterStarred ? "#f59e0b" : "#94a3b8",
                    border: filterStarred ? "1px solid #f59e0b66" : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  ⭐ Favoritos
                </button>
                <button
                  onClick={() => setFilterLang("all")}
                  className="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0"
                  style={{
                    background: filterLang === "all" ? "#6366f133" : "rgba(255,255,255,0.06)",
                    color: filterLang === "all" ? "#818cf8" : "#94a3b8",
                    border: filterLang === "all" ? "1px solid #6366f166" : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  🌐 Todos
                </button>
                {langs.map(l => (
                  <button
                    key={l}
                    onClick={() => setFilterLang(l)}
                    className="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0"
                    style={{
                      background: filterLang === l ? "#6366f133" : "rgba(255,255,255,0.06)",
                      color: filterLang === l ? "#818cf8" : "#94a3b8",
                      border: filterLang === l ? "1px solid #6366f166" : "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {langFlag(l)} {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Entries list */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <div style={{ fontSize: "3rem" }}>📓</div>
                  <div className="text-gray-400 mt-3 text-sm">
                    {entries.length === 0
                      ? "Clique nos objetos das cenas para adicionar palavras ao caderno!"
                      : "Nenhuma palavra encontrada com este filtro."}
                  </div>
                </div>
              ) : (
                filtered.map(entry => (
                  <div
                    key={entry.id}
                    className="rounded-xl p-3"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: entry.starred ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      {/* Word info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-bold text-base">{entry.word}</span>
                          <span className="text-gray-400 font-mono text-xs">/{entry.pronunciation}/</span>
                          <span className="text-xs">{langFlag(entry.langCode)}</span>
                        </div>
                        <div className="text-indigo-300 font-semibold text-sm mt-0.5">{entry.translation}</div>
                        <div className="text-gray-400 text-xs mt-1 italic">{entry.example}</div>
                        <div className="text-gray-500 text-xs italic">{entry.examplePt}</div>
                        {entry.note && (
                          <div
                            className="mt-1.5 px-2 py-1 rounded-lg text-xs text-yellow-300 italic"
                            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
                          >
                            📝 {entry.note}
                          </div>
                        )}
                        {editingNote === entry.id && (
                          <div className="mt-2 flex gap-2">
                            <textarea
                              ref={noteRef}
                              value={noteText}
                              onChange={e => setNoteText(e.target.value)}
                              placeholder="Escreva sua anotação..."
                              rows={2}
                              className="flex-1 px-2 py-1 rounded-lg text-white text-xs outline-none resize-none"
                              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                            />
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => saveNote(entry.id)}
                                className="px-2 py-1 rounded-lg text-xs text-white font-bold"
                                style={{ background: "#22c55e33", border: "1px solid #22c55e66" }}
                              >✓</button>
                              <button
                                onClick={() => { setEditingNote(null); setNoteText(""); }}
                                className="px-2 py-1 rounded-lg text-xs text-gray-400"
                                style={{ background: "rgba(255,255,255,0.06)" }}
                              >✕</button>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Actions */}
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                          onClick={() => onSpeak(entry.word, entry.langCode)}
                          className="w-8 h-8 flex items-center justify-center rounded-full text-sm"
                          style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)" }}
                          title="Ouvir"
                        >🔊</button>
                        <button
                          onClick={() => toggleStar(entry.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full text-sm"
                          style={{ background: entry.starred ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)" }}
                          title="Favoritar"
                        >{entry.starred ? "⭐" : "☆"}</button>
                        <button
                          onClick={() => {
                            setEditingNote(entry.id);
                            setNoteText(entry.note || "");
                            setTimeout(() => noteRef.current?.focus(), 50);
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-full text-sm"
                          style={{ background: "rgba(255,255,255,0.06)" }}
                          title="Anotar"
                        >📝</button>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full text-sm text-red-400"
                          style={{ background: "rgba(239,68,68,0.1)" }}
                          title="Remover"
                        >🗑️</button>
                      </div>
                    </div>
                    {/* Footer */}
                    <div className="flex items-center gap-3 mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <span className="text-gray-500 text-xs">
                        {entry.reviewed > 0 ? `✓ Revisado ${entry.reviewed}×` : "Novo"}
                      </span>
                      {entry.scene && (
                        <span className="text-gray-500 text-xs">📍 {entry.scene}</span>
                      )}
                      <span className="text-gray-600 text-xs ml-auto">
                        {new Date(entry.addedAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Footer stats */}
        {!quizMode && (
          <div
            className="px-5 py-3 flex items-center justify-between flex-shrink-0"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="text-gray-500 text-xs">
              {filtered.length} de {entries.length} palavras
            </div>
            <div className="flex gap-3 text-xs text-gray-500">
              <span>⭐ {entries.filter(e => e.starred).length} favoritos</span>
              <span>✓ {entries.filter(e => e.reviewed > 0).length} revisadas</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Floating Notebook Button ─────────────────────────────────────────────────
export function NotebookButton({ onClick, count }: { onClick: () => void; count: number }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-full font-bold transition-all active:scale-95"
      style={{
        background: "rgba(0,0,0,0.7)",
        border: "1px solid rgba(99,102,241,0.5)",
        backdropFilter: "blur(12px)",
        color: "white",
        fontSize: "clamp(11px, 1.3vw, 14px)",
        boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
      }}
      title="Abrir caderno de anotações"
    >
      <span style={{ fontSize: "1.1rem" }}>📓</span>
      <span>Caderno</span>
      {count > 0 && (
        <span
          className="text-xs font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: "#6366f1", color: "white", minWidth: "20px", textAlign: "center" }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
