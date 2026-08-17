import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, BookOpen, BrainCircuit, CheckCircle2, PenLine, Volume2 } from "lucide-react";
import { useMemo } from "react";
import { useLocation } from "wouter";

function getSafeReturnTo(location: string) {
  const requested = new URLSearchParams(location.split("?")[1] ?? "").get("returnTo");
  return requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard";
}

const SECTIONS = [
  {
    title: "1. Comece pela ideia completa",
    text: "Aprenda cada palavra dentro de uma frase curta. Leia a frase em voz baixa, identifique a ideia e só então compare as duas línguas.",
    example: "I need water. — Eu preciso de água.",
  },
  {
    title: "2. Forme padrões úteis",
    text: "Use uma estrutura que possa ser reaproveitada. Troque apenas uma parte por vez e mantenha o sentido claro.",
    example: "I need help. / I need time. / I need a ticket.",
  },
  {
    title: "3. Fixe pelo Pareto",
    text: "Priorize palavras frequentes, recupere sem olhar, escreva uma frase e volte ao termo em novos intervalos. O objetivo é lembrar e usar, não apenas reconhecer.",
    example: "need · help · time · ticket · water",
  },
  {
    title: "4. Use e corrija",
    text: "Depois de compreender e memorizar, responda ao professor, descreva a cena e escreva uma frase própria. A correção mostra exatamente o próximo ponto a praticar.",
    example: "I need help at the airport. — Eu preciso de ajuda no aeroporto.",
  },
];

const PORTUGUESE_ENGLISH_STARTER = [
  { english: "Hello. How are you?", portuguese: "Olá. Como você está?", focus: "Saudação e pergunta" },
  { english: "I am learning English.", portuguese: "Eu estou aprendendo inglês.", focus: "Identidade e objetivo" },
  { english: "Please speak slowly.", portuguese: "Por favor, fale devagar.", focus: "Pedido de apoio" },
  { english: "I need help with this word.", portuguese: "Eu preciso de ajuda com esta palavra.", focus: "Dúvida de vocabulário" },
  { english: "Where is the airport?", portuguese: "Onde fica o aeroporto?", focus: "Localização" },
  { english: "I would like water, please.", portuguese: "Eu gostaria de água, por favor.", focus: "Necessidade e cortesia" },
];

export default function ABCBook() {
  const [location, setLocation] = useLocation();
  const { profile } = useLanguage();
  const returnTo = useMemo(() => getSafeReturnTo(location), [location]);
  const paretoReturnTo = `/abc-book?returnTo=${encodeURIComponent(returnTo)}`;
  const paretoHref = `/pareto-1000?returnTo=${encodeURIComponent(paretoReturnTo)}`;

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-10">
      <article className="mx-auto max-w-4xl overflow-hidden rounded-sm bg-white shadow-[0_18px_55px_rgba(15,23,42,0.14)]">
        <header className="border-b border-stone-200 px-6 py-6 sm:px-10 sm:py-8">
          <button type="button" onClick={() => setLocation(returnTo)} className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950">
            <ArrowLeft className="h-4 w-4" /> Voltar à atividade
          </button>
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700"><BookOpen className="h-6 w-6" /></div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Consulta de Socorro</p>
              <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight sm:text-4xl">ABC de Idiomas</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Edição inicial para <strong>Português → Inglês</strong>. O par ativo está definido como <strong>{profile.nativeName}</strong> e <strong>{profile.targetName}</strong>; leia, pratique e retorne exatamente ao ponto em que estava.</p>
            </div>
          </div>
        </header>

        <div className="space-y-9 px-6 py-8 sm:px-10 sm:py-10">
          <section className="border-l-4 border-amber-400 pl-5">
            <h2 className="font-serif text-2xl font-bold">Como estudar nesta consulta</h2>
            <p className="mt-3 max-w-3xl leading-7 text-slate-700">Quando uma frase, uma palavra ou uma resposta parecer difícil, use este livro como um caderno de apoio. Comece pelo sentido, observe o padrão, recupere a palavra sem consultar e aplique-a em uma nova frase. O professor e a cena continuam disponíveis depois que você fechar o livro.</p>
          </section>

          <section>
            <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-sm font-black text-blue-800">PT</span>
              <span className="text-slate-400">→</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-red-100 text-sm font-black text-red-800">EN</span>
              <h2 className="font-serif text-2xl font-bold">Frases de sobrevivência</h2>
            </div>
            <p className="mt-3 leading-7 text-slate-700">Leia primeiro em inglês, confirme o sentido em português e depois cubra a linha em inglês para recuperá-la de memória. Estas frases também servem como ponto de partida para falar com o professor.</p>
            <div className="mt-5 divide-y divide-stone-200 border-y border-stone-200">
              {PORTUGUESE_ENGLISH_STARTER.map((item, index) => (
                <div key={item.english} className="grid gap-1 py-4 sm:grid-cols-[2.3rem_1fr_auto] sm:items-center sm:gap-4">
                  <span className="text-sm font-black text-amber-700">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-serif text-lg font-bold text-slate-950">{item.english}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.portuguese}</p>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{item.focus}</span>
                </div>
              ))}
            </div>
          </section>

          {SECTIONS.map((section, index) => (
            <section key={section.title} className="border-b border-stone-200 pb-8 last:border-b-0">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-black text-white">{index + 1}</span>
                <div>
                  <h2 className="font-serif text-xl font-bold">{section.title}</h2>
                  <p className="mt-2 leading-7 text-slate-700">{section.text}</p>
                  <blockquote className="mt-4 border-l-2 border-slate-300 bg-stone-50 px-4 py-3 text-sm font-semibold italic leading-6 text-slate-700">{section.example}</blockquote>
                </div>
              </div>
            </section>
          ))}

          <section className="rounded-sm border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <BrainCircuit className="mt-0.5 h-6 w-6 shrink-0 text-violet-700" />
              <div>
                <h2 className="font-serif text-xl font-bold">Exercício Pareto para esta dupla</h2>
                <p className="mt-2 leading-7 text-slate-700">Escolha uma palavra, ouça, escreva uma frase útil e responda sem olhar. Ao sair da prática, você volta para este livro; depois, retorna à sua cena ou lição.</p>
                <a href={paretoHref} className="mt-5 inline-flex items-center gap-2 rounded-md bg-violet-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-800 active:scale-[0.97]">
                  <BrainCircuit className="h-4 w-4" /> Abrir prática Pareto
                </a>
              </div>
            </div>
          </section>

          <section className="grid gap-4 border-t border-stone-200 pt-7 sm:grid-cols-3">
            <div className="flex gap-3"><Volume2 className="h-5 w-5 shrink-0 text-sky-700" /><p className="text-sm leading-6 text-slate-700"><strong>Ouvir:</strong> repita a frase em blocos curtos.</p></div>
            <div className="flex gap-3"><PenLine className="h-5 w-5 shrink-0 text-emerald-700" /><p className="text-sm leading-6 text-slate-700"><strong>Escrever:</strong> troque uma palavra e preserve a estrutura.</p></div>
            <div className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-amber-700" /><p className="text-sm leading-6 text-slate-700"><strong>Aplicar:</strong> volte ao professor e use a ideia em contexto.</p></div>
          </section>
        </div>

        <footer className="border-t border-stone-200 bg-stone-50 px-6 py-5 text-center sm:px-10">
          <button type="button" onClick={() => setLocation(returnTo)} className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-100 active:scale-[0.97]">
            <ArrowLeft className="h-4 w-4" /> Retornar à atividade
          </button>
        </footer>
      </article>
    </main>
  );
}
