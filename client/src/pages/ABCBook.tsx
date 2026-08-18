import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { createTrialLessonKey } from "@/lib/learningAccess";
import { ArrowLeft, BookOpen, BrainCircuit, CheckCircle2, MessageCircle, PenLine, Volume2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

function getSafeReturnTo(location: string) {
  const requested = new URLSearchParams(location.split("?")[1] ?? "").get("returnTo");
  return requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard";
}

export default function ABCBook() {
  const [location, setLocation] = useLocation();
  const { profile } = useLanguage();
  const returnTo = useMemo(() => getSafeReturnTo(location), [location]);
  const paretoReturnTo = `/abc-book?returnTo=${encodeURIComponent(returnTo)}`;
  const paretoHref = `/pareto-1000?returnTo=${encodeURIComponent(paretoReturnTo)}`;
  const [orderingAnswers, setOrderingAnswers] = useState<Record<number, string>>({});
  const [checkedOrdering, setCheckedOrdering] = useState<Record<number, boolean>>({});
  const bookQuery = trpc.curriculum.abcBook.useQuery({
    lessonKey: createTrialLessonKey(location),
    nativeLanguage: profile.nativeCode,
    targetLanguage: profile.targetCode,
  });

  if (bookQuery.isLoading) {
    return <main className="grid min-h-screen place-items-center bg-stone-100 px-6 text-center text-sm font-semibold text-slate-600">Preparando a consulta protegida do Livro ABC…</main>;
  }

  if (!bookQuery.data) {
    return (
      <main className="grid min-h-screen place-items-center bg-stone-100 px-6 text-center">
        <section className="max-w-md rounded-sm bg-white p-8 shadow-[0_18px_55px_rgba(15,23,42,0.14)]">
          <h1 className="font-serif text-2xl font-bold text-slate-950">Livro ABC indisponível</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">A consulta será liberada dentro de uma atividade autorizada.</p>
          <button type="button" onClick={() => setLocation(returnTo)} className="mt-6 inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-100 active:scale-[0.97]">
            <ArrowLeft className="h-4 w-4" /> Voltar à atividade
          </button>
        </section>
      </main>
    );
  }

  const book = bookQuery.data;

  if (!book.available) {
    return (
      <main className="grid min-h-screen place-items-center bg-stone-100 px-6 text-center text-slate-900">
        <section className="max-w-xl rounded-sm bg-white p-8 shadow-[0_18px_55px_rgba(15,23,42,0.14)] sm:p-10">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-700"><BookOpen className="h-6 w-6" /></div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-amber-700">Livro ABC por dupla</p>
          <h1 className="mt-2 font-serif text-3xl font-bold">Edição em preparação</h1>
          <p className="mt-4 leading-7 text-slate-600">{book.unavailableMessage}</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <a href={`/base-de-estudos?returnTo=${encodeURIComponent(returnTo)}`} className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-[0.97]">Abrir Base de Estudos</a>
            <button type="button" onClick={() => setLocation(returnTo)} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-100 active:scale-[0.97]">
              <ArrowLeft className="h-4 w-4" /> Voltar à atividade
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-10">
      <article className="abc-book-manuscript mx-auto max-w-4xl">
        <header className="abc-book-leaf px-6 py-6 sm:px-10 sm:py-8">
          <button type="button" onClick={() => setLocation(returnTo)} className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950">
            <ArrowLeft className="h-4 w-4" /> Voltar à atividade
          </button>
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700"><BookOpen className="h-6 w-6" /></div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Consulta de Socorro</p>
              <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight sm:text-4xl">ABC de Idiomas</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Edição inicial para <strong>{book.edition}</strong>. O par ativo está definido como <strong>{profile.nativeName}</strong> e <strong>{profile.targetName}</strong>; leia, pratique e retorne exatamente ao ponto em que estava.</p>
            </div>
          </div>
        </header>

        <div className="abc-book-pages">
          <section className="grid gap-6 border-l-4 border-amber-400 pl-5 sm:grid-cols-[1fr_11rem] sm:items-center">
            <div>
              <h2 className="font-serif text-2xl font-bold">Como estudar nesta consulta</h2>
              <p className="mt-3 max-w-3xl leading-7 text-slate-700">{book.introduction}</p>
            </div>
            <figure className="mx-auto max-w-[11rem] rounded-sm border border-amber-100 bg-amber-50 p-2 shadow-sm">
              <img src="/manus-storage/abc-cartilha-greeting-monochrome_8e5662a6.png" alt="Desenho autoral monocromático de duas crianças iniciando uma conversa em outro idioma" className="aspect-[3/4] w-full rounded-sm object-cover" loading="lazy" />
              <figcaption className="px-1 pt-2 text-center text-[11px] font-semibold leading-4 text-slate-600">Comece com uma ideia. Pratique um passo por vez.</figcaption>
            </figure>
          </section>

          <section className="border-y border-stone-200 py-7">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">Alfabeto e sons</p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-slate-950">Primeiro, conheça as letras</h2>
            <p className="mt-3 max-w-3xl leading-7 text-slate-700">{book.alphabetIntroduction}</p>
            <ol className="mt-5 grid grid-cols-4 border-y border-l border-stone-200 sm:grid-cols-7">
              {book.alphabetLetters.map((item) => (
                <li key={item.letter} className="border-b border-r border-stone-200 px-2 py-3 text-center last:border-b-0">
                  <p className="font-serif text-2xl font-bold text-slate-950">{item.letter}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-700">{item.name}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{item.guide}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="border-b border-stone-200 pb-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">Da letra à palavra</p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-slate-950">Observe o som dentro da palavra</h2>
            <div className="mt-5 space-y-7">
              {book.soundLessons.map((lesson) => (
                <article key={lesson.title} className="border-t border-stone-200 pt-5 first:border-t-0 first:pt-0">
                  <h3 className="font-serif text-xl font-bold text-slate-950">{lesson.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{lesson.explanation}</p>
                  <div className="mt-4 grid divide-y divide-stone-200 border-y border-stone-200 text-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    {lesson.examples.map((example) => (
                      <div key={example.target} className="px-3 py-3"><p className="font-semibold text-slate-950">{example.target}</p><p className="mt-1 text-slate-600">{example.pronunciation}</p><p className="mt-1 text-slate-600">{example.native}</p></div>
                    ))}
                  </div>
                  <p className="mt-3 border-l-2 border-violet-300 pl-4 text-sm font-semibold leading-6 text-slate-700"><strong className="text-slate-950">Escrita:</strong> {lesson.writingPrompt}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="border-y border-stone-200 py-7">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">Memória passo a passo</p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-slate-950">Aprenda uma ideia, recupere e use</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">Siga a ordem sem pressa. Cada passo prepara o próximo; não é preciso abrir outra ferramenta para continuar.</p>
            <ol className="mt-5 divide-y divide-stone-200 border-y border-stone-200">
              {book.memorySteps.map((step, index) => (
                <li key={step.title} className="grid gap-2 py-4 sm:grid-cols-[2.75rem_1fr] sm:gap-4">
                  <span className="font-serif text-2xl font-bold text-amber-700">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-950">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{step.instruction}</p>
                    <p className="mt-2 border-l-2 border-stone-300 pl-3 text-sm font-semibold leading-6 text-slate-600">{step.example}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="border-b border-stone-200 pb-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">Estrutura da ideia</p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-slate-950">{book.sentenceStructure.title}</h2>
            <p className="mt-3 max-w-3xl leading-7 text-slate-700">{book.sentenceStructure.introduction}</p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-700">
              <p><strong className="text-slate-950">Padrão de base:</strong> {book.sentenceStructure.sharedPattern}</p>
              <p><strong className="text-slate-950">Português:</strong> {book.sentenceStructure.portuguesePattern}</p>
              <p><strong className="text-slate-950">Inglês:</strong> {book.sentenceStructure.englishPattern}</p>
              <p><strong className="text-slate-950">Pergunta:</strong> {book.sentenceStructure.questionPattern}</p>
              <p><strong className="text-slate-950">Negação:</strong> {book.sentenceStructure.negativePattern}</p>
              <p className="border-l-2 border-violet-300 pl-4"><strong className="text-slate-950">No papel:</strong> {book.sentenceStructure.handwritingInstruction}</p>
              <p className="border-l-2 border-violet-300 pl-4"><strong className="text-slate-950">Ao digitar:</strong> {book.sentenceStructure.typingInstruction}</p>
            </div>
          </section>

          <section className="border-b border-stone-200 pb-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">Palavras por contexto</p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-slate-950">Aprenda palavras que vivem na mesma ideia</h2>
            <p className="mt-3 max-w-3xl leading-7 text-slate-700">Não memorize listas misturadas. Leia um contexto, compare as palavras próximas e só depois escreva e recupere no Pareto.</p>
            <div className="mt-6 space-y-8">
              {book.contextGroups.map((group) => (
                <article key={group.title} className="border-t border-stone-200 pt-6 first:border-t-0 first:pt-0">
                  <h3 className="font-serif text-xl font-bold text-slate-950">{group.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{group.purpose}</p>
                  <ol className="mt-4 divide-y divide-stone-200 border-y border-stone-200">
                    {group.words.map((word, index) => (
                      <li key={word.target} className="grid gap-1 py-3 sm:grid-cols-[2rem_12rem_1fr] sm:gap-3">
                        <span className="font-serif font-bold text-amber-700">{index + 1}</span>
                        <p className="font-semibold text-slate-950">{word.target} <span className="font-normal text-slate-600">— {word.native}</span></p>
                        <p className="text-sm leading-6 text-slate-700">{word.relation}</p>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-4 border-l-2 border-stone-300 pl-4 text-sm leading-6 text-slate-700"><strong className="text-slate-950">Compare:</strong> {group.contrast}</p>
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-800">{group.modelSentence}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-700"><strong className="text-slate-950">Escrita:</strong> {group.writingPrompt}</p>
                  <p className="mt-3 border-l-2 border-violet-300 pl-4 text-sm font-semibold leading-6 text-slate-700">{group.paretoPrompt}</p>
                </article>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-sm font-black text-blue-800">PT</span>
              <span className="text-slate-400">→</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-red-100 text-sm font-black text-red-800">EN</span>
              <h2 className="font-serif text-2xl font-bold">Frases de sobrevivência</h2>
            </div>
            <p className="mt-3 leading-7 text-slate-700">{book.survivalIntro}</p>
            <div className="mt-5 divide-y divide-stone-200 border-y border-stone-200">
              {book.phrases.map((item, index) => (
                <div key={item.english} className="grid gap-1 py-4 sm:grid-cols-[2.3rem_1fr_auto] sm:items-center sm:gap-4">
                  <span className="text-sm font-black text-amber-700">{String(index + 1).padStart(2, "0")}</span>
                  <div><p className="font-serif text-lg font-bold text-slate-950">{item.english}</p><p className="mt-1 text-sm text-slate-600">{item.portuguese}</p></div>
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{item.focus}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="border-y border-stone-200 bg-stone-50 px-5 py-6 sm:px-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">Ficha de termo</p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-slate-950">{book.termCard.term}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-600">{book.termCard.meaning}</p>
            <dl className="mt-5 grid gap-4 text-sm leading-6 sm:grid-cols-2">
              <div><dt className="font-bold text-slate-900">Função</dt><dd className="mt-1 text-slate-700">{book.termCard.grammar}</dd></div>
              <div><dt className="font-bold text-slate-900">Pronúncia</dt><dd className="mt-1 text-slate-700">{book.termCard.pronunciation}</dd></div>
              <div><dt className="font-bold text-slate-900">Padrão útil</dt><dd className="mt-1 text-slate-700">{book.termCard.pattern}</dd></div>
              <div><dt className="font-bold text-slate-900">Exemplo</dt><dd className="mt-1 text-slate-700">{book.termCard.example}</dd></div>
            </dl>
            <p className="mt-5 border-l-2 border-violet-400 pl-4 text-sm font-semibold leading-6 text-slate-700">{book.termCard.paretoPrompt}</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-slate-950">Termos para ampliar o padrão</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">Leia uma ficha de cada vez. Depois, transforme o exemplo em uma frase própria antes de seguir para o Pareto.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {book.additionalTermCards.map((card) => (
                <article key={card.term} className="border border-stone-200 bg-white p-5 shadow-sm">
                  <h3 className="font-serif text-xl font-bold text-slate-950">{card.term}</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{card.meaning}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Pronúncia:</strong> {card.pronunciation}</p>
                  <p className="mt-4 text-sm leading-6 text-slate-700"><strong>Função:</strong> {card.grammar}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Padrão:</strong> {card.pattern}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Exemplo:</strong> {card.example}</p>
                  <p className="mt-4 border-l-2 border-violet-300 pl-3 text-sm font-semibold leading-6 text-slate-700">{card.paretoPrompt}</p>
                </article>
              ))}
            </div>
          </section>

          <section>
            <div className="border-b border-stone-200 pb-3">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">Primeiro volume A1</p>
              <h2 className="mt-2 font-serif text-2xl font-bold text-slate-950">Capítulos contínuos para estudar</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">Leia um capítulo por vez: entenda o objetivo, acompanhe o texto, compare a tradução, observe a gramática e escreva antes de seguir para Pareto, Professor ou cena.</p>
            </div>
            <nav id="sumario-a1" aria-label="Sumário dos capítulos A1" className="mt-5 scroll-mt-6 rounded-sm border border-stone-200 bg-stone-50 p-4 sm:p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-600">Sumário do volume</p>
              <ol className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {book.chapters.map((chapter, index) => (
                  <li key={chapter.title}>
                    <a href={`#capitulo-a1-${index + 1}`} className="text-sm font-semibold text-slate-700 underline-offset-4 transition hover:text-amber-800 hover:underline">
                      {index + 1}. {chapter.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="mt-5 space-y-6">
              {book.chapters.map((chapter, index) => {
                const chapterId = `capitulo-a1-${index + 1}`;
                const chapterReturnTo = `${paretoReturnTo}#${chapterId}`;
                const chapterParetoHref = `/pareto-1000?bookContext=${encodeURIComponent(chapter.paretoContext)}&returnTo=${encodeURIComponent(chapterReturnTo)}`;
                const chapterTeacherHref = `/free-talk?returnTo=${encodeURIComponent(chapterReturnTo)}`;

                return (
                <article id={chapterId} key={chapter.title} className="abc-book-chapter-leaf scroll-mt-6 p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-black text-white">{index + 1}</span>
                    <div className="min-w-0">
                      <h3 className="font-serif text-xl font-bold text-slate-950">{chapter.title}</h3>
                      <p className="mt-2 text-sm font-semibold leading-6 text-amber-800">Objetivo: {chapter.objective}</p>
                    </div>
                  </div>
                  <p className="mt-4 font-serif text-lg font-semibold leading-8 text-slate-950">{chapter.reading}</p>
                  <p className="mt-3 border-l-2 border-stone-300 pl-4 text-sm leading-6 text-slate-600">{chapter.translation}</p>
                  <div className="mt-4 bg-stone-50 p-4 text-sm leading-6 text-slate-700">
                    <p className="font-bold text-slate-900">{chapter.grammarTitle}</p>
                    <p className="mt-1">{chapter.grammarExplanation}</p>
                  </div>
                  <p className="mt-4 border-l-2 border-violet-400 pl-4 text-sm font-semibold leading-6 text-slate-700"><strong>Escrita:</strong> {chapter.writingPrompt}</p>
                  <section className="mt-5 border-y border-stone-200 bg-stone-50 px-4 py-5 sm:px-5">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-800">Prática depois do texto</p>
                    <h4 className="mt-2 font-serif text-lg font-bold text-slate-950">Forme a frase</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{chapter.orderingExercise.prompt}</p>
                    <p className="mt-3 font-semibold leading-7 text-slate-950">{chapter.orderingExercise.scrambled.join(" · ")}</p>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <input
                        value={orderingAnswers[index] ?? ""}
                        onChange={(event) => setOrderingAnswers((current) => ({ ...current, [index]: event.target.value }))}
                        placeholder="Digite a frase em inglês"
                        className="min-w-0 flex-1 border border-stone-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none ring-amber-500 focus:ring-2"
                      />
                      <button type="button" onClick={() => setCheckedOrdering((current) => ({ ...current, [index]: true }))} className="bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-[0.97]">Conferir ordem</button>
                    </div>
                    {checkedOrdering[index] && (
                      <div className="mt-4 border-l-2 border-amber-500 pl-4 text-sm leading-6 text-slate-700">
                        <p><strong className="text-slate-950">Resposta-modelo:</strong> {chapter.orderingExercise.answer}</p>
                        <p className="mt-2">{chapter.orderingExercise.explanation}</p>
                        <p className="mt-2 font-semibold text-slate-800">Agora continue: {chapter.orderingExercise.followUpPrompt}</p>
                      </div>
                    )}
                  </section>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <a href={chapterParetoHref} className="inline-flex items-center gap-2 rounded-md bg-violet-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-800 active:scale-[0.97]"><BrainCircuit className="h-4 w-4" /> Próximo passo: Praticar no Pareto</a>
                    <details className="relative">
                      <summary className="cursor-pointer list-none rounded-md border border-stone-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-stone-50">Opções desta unidade</summary>
                      <div className="absolute left-0 z-10 mt-2 grid w-56 gap-1 rounded-md border border-stone-200 bg-white p-2 shadow-lg">
                        <a href={`/base-de-estudos?unit=${encodeURIComponent(chapter.title)}&returnTo=${encodeURIComponent(paretoReturnTo)}`} className="rounded px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-stone-50">Consultar na Base</a>
                        <a href={chapterTeacherHref} className="flex items-center gap-2 rounded px-3 py-2 text-sm font-semibold text-sky-900 hover:bg-sky-50"><MessageCircle className="h-4 w-4" /> Falar com o Professor</a>
                        <a href="#sumario-a1" className="rounded px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50">Voltar ao sumário</a>
                      </div>
                    </details>
                  </div>
                </article>
                );
              })}
            </div>
          </section>

          {book.sections.map((section, index) => (
            <section key={section.title} className="border-b border-stone-200 pb-8 last:border-b-0">
              <div className="flex items-start gap-3"><span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-black text-white">{index + 1}</span><div><h2 className="font-serif text-xl font-bold">{section.title}</h2><p className="mt-2 leading-7 text-slate-700">{section.text}</p><blockquote className="mt-4 border-l-2 border-slate-300 bg-stone-50 px-4 py-3 text-sm font-semibold italic leading-6 text-slate-700">{section.example}</blockquote></div></div>
            </section>
          ))}

          <section className="rounded-sm border border-slate-200 bg-slate-50 p-5 sm:p-6"><div className="flex items-start gap-3"><BrainCircuit className="mt-0.5 h-6 w-6 shrink-0 text-violet-700" /><div><h2 className="font-serif text-xl font-bold">Exercício Pareto para esta dupla</h2><p className="mt-2 leading-7 text-slate-700">Escolha uma palavra, ouça, escreva uma frase útil e responda sem olhar. Ao sair da prática, você volta para este livro; depois, retorna à sua cena ou lição.</p><a href={paretoHref} className="mt-5 inline-flex items-center gap-2 rounded-md bg-violet-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-800 active:scale-[0.97]"><BrainCircuit className="h-4 w-4" /> Abrir prática Pareto</a></div></div></section>

          <section className="grid gap-4 border-t border-stone-200 pt-7 sm:grid-cols-3"><div className="flex gap-3"><Volume2 className="h-5 w-5 shrink-0 text-sky-700" /><p className="text-sm leading-6 text-slate-700"><strong>Ouvir:</strong> repita a frase em blocos curtos.</p></div><div className="flex gap-3"><PenLine className="h-5 w-5 shrink-0 text-emerald-700" /><p className="text-sm leading-6 text-slate-700"><strong>Escrever:</strong> troque uma palavra e preserve a estrutura.</p></div><div className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-amber-700" /><p className="text-sm leading-6 text-slate-700"><strong>Aplicar:</strong> volte ao professor e use a ideia em contexto.</p></div></section>
        </div>

        <footer className="abc-book-leaf bg-stone-50 px-6 py-5 text-center sm:px-10"><button type="button" onClick={() => setLocation(returnTo)} className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-100 active:scale-[0.97]"><ArrowLeft className="h-4 w-4" /> Retornar à atividade</button></footer>
      </article>
    </main>
  );
}
