import React, { useState, useRef } from "react";
import { useNaturalVoice } from "@/hooks/useNaturalVoice";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { CEFRLevel } from "@/lib/lesson-levels";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Volume2,
  Printer,
  BookMarked,
  GraduationCap,
  MessageSquare,
  AlertTriangle,
  Star,
  Globe,
  List,
  ChevronRight,
} from "lucide-react";

interface LessonBookProps {
  lessonId: number;
  lessonTitle: string;
  languageCode: string;
  nativeLanguage?: string;
  level?: CEFRLevel;
  topic?: string;
  teacherName?: string;
}

type SectionKey =
  | "objectives"
  | "introduction"
  | "grammar"
  | "vocabulary"
  | "dialogues"
  | "cultural"
  | "mistakes"
  | "exercises"
  | "summary";

const SECTION_LABELS: Record<SectionKey, { icon: string; label: string; color: string }> = {
  objectives:   { icon: "🎯", label: "Objetivos da Aula",         color: "blue"   },
  introduction: { icon: "📖", label: "Introdução",                color: "indigo" },
  grammar:      { icon: "📐", label: "Regras Gramaticais",        color: "purple" },
  vocabulary:   { icon: "📚", label: "Vocabulário",               color: "green"  },
  dialogues:    { icon: "💬", label: "Diálogos",                  color: "teal"   },
  cultural:     { icon: "🌍", label: "Notas Culturais",           color: "orange" },
  mistakes:     { icon: "⚠️", label: "Erros Comuns",              color: "red"    },
  exercises:    { icon: "✏️", label: "Exercícios do Livro",       color: "yellow" },
  summary:      { icon: "📝", label: "Resumo e Próximos Passos",  color: "gray"   },
};

function PhoneticBadge({ text }: { text: string }) {
  if (!text) return null;
  return (
    <span className="inline-block px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 font-mono text-xs ml-1 select-all">
      {text}
    </span>
  );
}

function TrilingualRow({
  native,
  target,
  phonetic,
  onSpeak,
}: {
  native: string;
  target: string;
  phonetic?: string;
  onSpeak?: (text: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-1 py-2 border-b border-gray-100 last:border-0 group">
      {/* Native language */}
      <div className="text-gray-700 text-sm leading-relaxed">
        <span className="text-xs font-semibold text-gray-400 block mb-0.5">🇧🇷 Português</span>
        {native}
      </div>
      {/* Target language */}
      <div className="text-blue-800 font-medium text-sm leading-relaxed">
        <span className="text-xs font-semibold text-blue-400 block mb-0.5">🌐 Idioma-alvo</span>
        <span className="flex items-center gap-1">
          {target}
          {onSpeak && (
            <button
              onClick={() => onSpeak(target)}
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-0.5 rounded hover:bg-blue-100"
              title="Ouvir pronúncia"
            >
              <Volume2 className="h-3 w-3 text-blue-500" />
            </button>
          )}
        </span>
      </div>
      {/* Phonetic */}
      <div className="text-amber-700 text-sm leading-relaxed">
        <span className="text-xs font-semibold text-amber-500 block mb-0.5">🔊 Pronúncia (como soa)</span>
        <span className="font-mono text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-100 inline-block">
          {phonetic || "—"}
        </span>
      </div>
    </div>
  );
}

function SectionBlock({
  sectionKey,
  children,
  defaultOpen = false,
}: {
  sectionKey: SectionKey;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const meta = SECTION_LABELS[sectionKey];
  const colorMap: Record<string, string> = {
    blue:   "border-blue-300 bg-blue-50",
    indigo: "border-indigo-300 bg-indigo-50",
    purple: "border-purple-300 bg-purple-50",
    green:  "border-green-300 bg-green-50",
    teal:   "border-teal-300 bg-teal-50",
    orange: "border-orange-300 bg-orange-50",
    red:    "border-red-300 bg-red-50",
    yellow: "border-yellow-300 bg-yellow-50",
    gray:   "border-gray-300 bg-gray-50",
  };
  const headerColorMap: Record<string, string> = {
    blue:   "bg-blue-100 text-blue-800",
    indigo: "bg-indigo-100 text-indigo-800",
    purple: "bg-purple-100 text-purple-800",
    green:  "bg-green-100 text-green-800",
    teal:   "bg-teal-100 text-teal-800",
    orange: "bg-orange-100 text-orange-800",
    red:    "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800",
    gray:   "bg-gray-100 text-gray-800",
  };

  return (
    <div className={`rounded-xl border-2 ${colorMap[meta.color]} mb-4 overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-5 py-3 ${headerColorMap[meta.color]} font-bold text-base hover:opacity-90 transition-opacity`}
      >
        <span className="flex items-center gap-2">
          <span className="text-xl">{meta.icon}</span>
          {meta.label}
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && <div className="px-5 py-4">{children}</div>}
    </div>
  );
}

export default function LessonBook({
  lessonId,
  lessonTitle,
  languageCode,
  nativeLanguage = "pt",
  level = "A1",
  topic,
  teacherName = "Professor",
}: LessonBookProps) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({});
  const [checkedAnswers, setCheckedAnswers] = useState<Record<string, boolean | null>>({});
  const printRef = useRef<HTMLDivElement>(null);

  const bookQuery = trpc.ai.generateLessonBook.useQuery(
    { lessonId, lessonTitle, languageCode, nativeLanguage, level, topic },
    { staleTime: 1000 * 60 * 30, enabled: isAuthenticated && !authLoading } // cache 30 min — same lesson = same book
  );

  const { speak, speakNative } = useNaturalVoice();

  // handleSpeak: speaks target language text (the language being studied)
  const handleSpeak = (text: string) => speak(text, languageCode);
  // handleSpeakNative: speaks the native translation (pt-BR)
  const handleSpeakNative = (text: string) => speakNative(text);

  const handlePrint = () => {
    window.print();
    toast.success("Abrindo janela de impressão...");
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <BookOpen className="h-12 w-12 text-gray-300" />
        <p className="font-medium text-gray-600">Entre para abrir o livro desta lição.</p>
        <p className="text-sm text-gray-500">A geração do material personalizado ocorre somente na sua sessão de estudo.</p>
      </div>
    );
  }

  if (bookQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-200 border-t-blue-600" />
          <BookOpen className="absolute inset-0 m-auto h-6 w-6 text-blue-600" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700">Gerando Livro da Disciplina...</p>
          <p className="text-sm text-gray-500 mt-1">
            A IA está criando gramática, vocabulário com fonética, diálogos e exercícios completos
          </p>
        </div>
        <div className="flex gap-2 mt-2">
          {["Gramática", "Vocabulário", "Fonética", "Diálogos", "Exercícios"].map((s, i) => (
            <span
              key={s}
              className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (bookQuery.isError || !bookQuery.data?.success || !bookQuery.data?.book) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <BookOpen className="h-12 w-12 text-gray-300" />
        <p className="text-gray-500 font-medium">Não foi possível gerar o livro desta lição.</p>
        <Button variant="outline" size="sm" onClick={() => bookQuery.refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  const book = bookQuery.data.book;

  return (
    <div className="lesson-book" ref={printRef}>
      {/* Book Cover */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 rounded-2xl p-6 mb-6 text-white shadow-xl print:shadow-none">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <BookMarked className="h-5 w-5 text-blue-200" />
              <span className="text-blue-200 text-sm font-medium uppercase tracking-wider">
                Livro da Disciplina
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1 leading-tight">
              {book.title || lessonTitle}
            </h1>
            {book.subtitle && (
              <p className="text-blue-200 text-sm mt-1">{book.subtitle}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className="bg-white/20 text-white border-white/30 text-xs">
                <GraduationCap className="h-3 w-3 mr-1" />
                {book.level || level}
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 text-xs">
                <Globe className="h-3 w-3 mr-1" />
                {languageCode.toUpperCase()}
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 text-xs">
                <BookOpen className="h-3 w-3 mr-1" />
                Lição #{lessonId}
              </Badge>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-center gap-1 ml-4">
            <div className="w-16 h-20 bg-white/10 rounded-lg border border-white/20 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white/60" />
            </div>
          </div>
        </div>

        {/* Table of Contents mini */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-xs text-blue-200 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
            <List className="h-3 w-3" /> Índice
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
            {(Object.keys(SECTION_LABELS) as SectionKey[]).map((key) => (
              <span key={key} className="text-xs text-white/80 flex items-center gap-1">
                <ChevronRight className="h-3 w-3 text-blue-300" />
                {SECTION_LABELS[key].label}
              </span>
            ))}
          </div>
        </div>

        {/* Print button */}
        <div className="mt-4 flex justify-end print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-xs"
          >
            <Printer className="h-3 w-3 mr-1" />
            Imprimir / Salvar PDF
          </Button>
        </div>
      </div>

      {/* ── OBJECTIVES ── */}
      {book.objectives?.length > 0 && (
        <SectionBlock sectionKey="objectives" defaultOpen={true}>
          <ul className="space-y-2">
            {book.objectives.map((obj: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                {obj}
              </li>
            ))}
          </ul>
        </SectionBlock>
      )}

      {/* ── INTRODUCTION ── */}
      {book.introduction && (
        <SectionBlock sectionKey="introduction" defaultOpen={true}>
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
            {book.introduction}
          </div>
        </SectionBlock>
      )}

      {/* ── GRAMMAR RULES ── */}
      {book.grammarRules?.length > 0 && (
        <SectionBlock sectionKey="grammar" defaultOpen={true}>
          <div className="space-y-6">
            {book.grammarRules.map((rule: any, i: number) => (
              <div key={i} className="border border-purple-200 rounded-xl overflow-hidden">
                <div className="bg-purple-100 px-4 py-2 flex items-center gap-2">
                  <span className="font-bold text-purple-800 text-sm">{i + 1}. {rule.rule}</span>
                </div>
                <div className="px-4 py-3 space-y-3">
                  <p className="text-sm text-gray-700">{rule.explanation}</p>
                  {rule.structure && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 font-mono text-sm text-purple-800">
                      📐 Estrutura: <strong>{rule.structure}</strong>
                    </div>
                  )}
                  {rule.examples?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Exemplos:</p>
                      <div className="space-y-1">
                        {rule.examples.map((ex: any, j: number) => (
                          <TrilingualRow
                            key={j}
                            native={ex.native || ""}
                            target={ex.target || ""}
                            phonetic={ex.phonetic || ""}
                            onSpeak={handleSpeak}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionBlock>
      )}

      {/* ── VOCABULARY ── */}
      {book.vocabulary?.length > 0 && (
        <SectionBlock sectionKey="vocabulary" defaultOpen={true}>
          {/* Header row */}
          <div className="hidden md:grid grid-cols-5 gap-2 px-2 py-1 mb-2 bg-green-100 rounded-lg text-xs font-bold text-green-800 uppercase tracking-wider">
            <span>Palavra</span>
            <span>[IPA Fonética]</span>
            <span>Classe</span>
            <span>Definição (PT)</span>
            <span>Dica de Memória</span>
          </div>
          <div className="space-y-3">
            {book.vocabulary.map((v: any, i: number) => (
              <div key={i} className="border border-green-200 rounded-xl overflow-hidden">
                {/* Word header */}
                <div className="bg-green-50 px-4 py-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleSpeak(v.word)}
                    className="flex items-center gap-1 hover:text-green-700 transition-colors group"
                  >
                    <span className="font-bold text-green-900 text-base">{v.word}</span>
                    <Volume2 className="h-3.5 w-3.5 text-green-400 group-hover:text-green-600" />
                  </button>
                  <PhoneticBadge text={v.phonetic} />
                  {v.partOfSpeech && (
                    <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                      {v.partOfSpeech}
                    </Badge>
                  )}
                </div>
                <div className="px-4 py-3 space-y-2">
                  {/* Definition */}
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-500">Definição:</span> {v.definition}
                  </p>

                  {/* Synonyms / Antonyms */}
                  <div className="flex flex-wrap gap-3 text-xs">
                    {v.synonyms?.length > 0 && (
                      <span className="text-blue-700">
                        <strong>Sinônimos:</strong> {v.synonyms.join(", ")}
                      </span>
                    )}
                    {v.antonyms?.length > 0 && (
                      <span className="text-red-600">
                        <strong>Antônimos:</strong> {v.antonyms.join(", ")}
                      </span>
                    )}
                  </div>

                  {/* Example sentences — trilingual */}
                  {v.exampleSentences?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Exemplos em contexto:</p>
                      {v.exampleSentences.map((ex: any, j: number) => (
                        <TrilingualRow
                          key={j}
                          native={ex.native || ""}
                          target={ex.target || ""}
                          phonetic={ex.phonetic || ""}
                          onSpeak={handleSpeak}
                        />
                      ))}
                    </div>
                  )}

                  {/* Memory tip */}
                  {v.memoryTip && (
                    <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-800">
                      <Star className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-yellow-500" />
                      <span><strong>Dica de memória:</strong> {v.memoryTip}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionBlock>
      )}

      {/* ── DIALOGUES ── */}
      {book.dialogues?.length > 0 && (
        <SectionBlock sectionKey="dialogues" defaultOpen={true}>
          <div className="space-y-6">
            {book.dialogues.map((dialogue: any, i: number) => (
              <div key={i} className="border border-teal-200 rounded-xl overflow-hidden">
                <div className="bg-teal-100 px-4 py-2">
                  <p className="font-bold text-teal-800 text-sm flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    {dialogue.title}
                  </p>
                  {dialogue.context && (
                    <p className="text-xs text-teal-600 mt-0.5 italic">{dialogue.context}</p>
                  )}
                </div>
                <div className="px-4 py-3 space-y-1">
                  {dialogue.lines?.map((line: any, j: number) => (
                    <div key={j} className={`flex flex-col gap-0.5 py-2 border-b border-teal-50 last:border-0 ${j % 2 === 0 ? '' : 'pl-6'}`}>
                      <span className="text-xs font-bold text-teal-600">{line.speaker}:</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                        <span className="text-sm text-gray-600">{line.native}</span>
                        <button
                          onClick={() => handleSpeak(line.target)}
                          className="text-sm font-medium text-teal-800 hover:text-teal-600 text-left flex items-center gap-1 group"
                        >
                          {line.target}
                          <Volume2 className="h-3 w-3 opacity-0 group-hover:opacity-100 text-teal-400" />
                        </button>
                        <span className="font-mono text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 self-start">
                          {line.phonetic || ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionBlock>
      )}

      {/* ── CULTURAL NOTES ── */}
      {book.culturalNotes?.length > 0 && (
        <SectionBlock sectionKey="cultural">
          <ul className="space-y-2">
            {book.culturalNotes.map((note: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <Globe className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                {note}
              </li>
            ))}
          </ul>
        </SectionBlock>
      )}

      {/* ── COMMON MISTAKES ── */}
      {book.commonMistakes?.length > 0 && (
        <SectionBlock sectionKey="mistakes">
          <div className="space-y-3">
            {book.commonMistakes.map((m: any, i: number) => (
              <div key={i} className="border border-red-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-red-100">
                  <div className="px-3 py-2 bg-red-50">
                    <p className="text-xs font-bold text-red-500 uppercase mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Errado
                    </p>
                    <p className="text-sm text-red-700 line-through">{m.mistake}</p>
                  </div>
                  <div className="px-3 py-2 bg-green-50">
                    <p className="text-xs font-bold text-green-600 uppercase mb-1">✅ Correto</p>
                    <p className="text-sm text-green-800 font-medium">{m.correct}</p>
                  </div>
                </div>
                {m.explanation && (
                  <div className="px-3 py-2 bg-gray-50 text-xs text-gray-600 border-t border-red-100">
                    💡 {m.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionBlock>
      )}

      {/* ── EXERCISES ── */}
      {book.exercises?.length > 0 && (
        <SectionBlock sectionKey="exercises">
          <div className="space-y-6">
            {book.exercises.map((ex: any, exIdx: number) => (
              <div key={exIdx} className="border border-yellow-200 rounded-xl overflow-hidden">
                <div className="bg-yellow-100 px-4 py-2">
                  <p className="font-bold text-yellow-800 text-sm">
                    Exercício {exIdx + 1} — {ex.instruction}
                  </p>
                  <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-700 mt-1">
                    {ex.type}
                  </Badge>
                </div>
                <div className="px-4 py-3 space-y-2">
                  {ex.items?.map((item: any, itemIdx: number) => {
                    const key = `${exIdx}-${itemIdx}`;
                    const checked = checkedAnswers[key];
                    return (
                      <div key={itemIdx} className="flex flex-col gap-1">
                        <p className="text-sm text-gray-700 font-medium">{itemIdx + 1}. {item.question}</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Sua resposta..."
                            value={exerciseAnswers[key] || ""}
                            onChange={(e) =>
                              setExerciseAnswers((prev) => ({ ...prev, [key]: e.target.value }))
                            }
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                            onClick={() => {
                              const userAns = (exerciseAnswers[key] || "").trim().toLowerCase();
                              const correctAns = (item.answer || "").trim().toLowerCase();
                              const isCorrect =
                                userAns === correctAns ||
                                correctAns.includes(userAns) ||
                                userAns.includes(correctAns.split(" ")[0]);
                              setCheckedAnswers((prev) => ({ ...prev, [key]: isCorrect }));
                              if (isCorrect) {
                                toast.success("✅ Correto! Muito bem!");
                              } else {
                                toast.error(`❌ Resposta correta: ${item.answer}`);
                              }
                            }}
                          >
                            Verificar
                          </Button>
                        </div>
                        {checked !== undefined && checked !== null && (
                          <p className={`text-xs font-medium ${checked ? "text-green-600" : "text-red-600"}`}>
                            {checked ? "✅ Correto!" : `❌ Resposta: ${item.answer}`}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </SectionBlock>
      )}

      {/* ── SUMMARY ── */}
      {(book.summary || book.nextSteps) && (
        <SectionBlock sectionKey="summary" defaultOpen={true}>
          {book.summary && (
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line mb-4">
              {book.summary}
            </div>
          )}
          {book.nextSteps && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mt-2">
              <p className="text-xs font-bold text-blue-600 uppercase mb-1">📌 Próximos Passos</p>
              <p className="text-sm text-blue-800">{book.nextSteps}</p>
            </div>
          )}
        </SectionBlock>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          .lesson-book { font-size: 12px; }
          button { display: none !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
