import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Sparkles, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type FamilyClip = {
  id: string;
  word: string;
  translation: string;
  sentence: string;
  caption: string;
  url: string;
};

export const FAMILY_CLIPS: FamilyClip[] = [
  { id: "mother", word: "mother", translation: "mãe", sentence: "This is a mother. Say: mother.", caption: "Esta é uma mãe. Diga: mother.", url: "/manus-storage/family-mother_7efb5996.mp4" },
  { id: "father", word: "father", translation: "pai", sentence: "This is a father. Say: father.", caption: "Este é um pai. Diga: father.", url: "/manus-storage/family-father_71f742fd.mp4" },
  { id: "brother", word: "brother", translation: "irmão", sentence: "This is a brother. Say: brother.", caption: "Este é um irmão. Diga: brother.", url: "/manus-storage/family-brother_fc99751b.mp4" },
  { id: "sister", word: "sister", translation: "irmã", sentence: "This is a sister. Say: sister.", caption: "Esta é uma irmã. Diga: sister.", url: "/manus-storage/family-sister_58afe4c0.mp4" },
  { id: "family", word: "family", translation: "família", sentence: "This is a family. Say: family.", caption: "Esta é uma família. Diga: family.", url: "/manus-storage/family-family_15fc45d2.mp4" },
];

export const FAMILY_CLIP_INSTRUCTOR = {
  name: "Professora Ingrid Larsen",
  role: "Professora de inglês · Pronúncia e conversação",
  photo: "/manus-storage/teacher-ingrid-english_b938d99a.png",
};

export default function FamilyVocabularyClips() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [repeat, setRepeat] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const clip = FAMILY_CLIPS[activeIndex];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    video.loop = repeat;
  }, [rate, repeat, activeIndex]);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      await video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const chooseClip = (index: number) => {
    setActiveIndex(index);
    setIsPlaying(false);
  };

  return (
    <section className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 shadow-sm md:p-6" aria-label="Clipes de vocabulário sobre família">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-indigo-700"><Sparkles className="h-4 w-4" /> Clipes originais · Inglês A1</p>
          <h3 className="text-xl font-bold text-slate-900">Vocabulário: A Família</h3>
          <p className="text-sm text-slate-600">Assista, ouça e repita cada palavra no contexto de uma cena familiar segura.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl bg-white px-2 py-1.5 shadow-sm ring-1 ring-indigo-100">
            <img src={FAMILY_CLIP_INSTRUCTOR.photo} alt="" className="h-9 w-9 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-800">{FAMILY_CLIP_INSTRUCTOR.name}</p>
              <p className="truncate text-[11px] text-slate-500">{FAMILY_CLIP_INSTRUCTOR.role}</p>
            </div>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">{activeIndex + 1} de {FAMILY_CLIPS.length}</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-slate-950 shadow-lg">
        <video
          ref={videoRef}
          key={clip.id}
          src={clip.url}
          className="aspect-video w-full object-cover"
          playsInline
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          aria-describedby="family-clip-caption"
        />
        <div className="border-t border-white/10 bg-slate-900 p-3 text-white">
          <p className="font-semibold capitalize">{clip.word} <span className="font-normal text-slate-300">· {clip.translation}</span></p>
          <p className="mt-1 text-sm text-cyan-100">{clip.sentence}</p>
          <p id="family-clip-caption" className="mt-1 text-sm text-slate-300">PT-BR: {clip.caption}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" onClick={togglePlayback} className="bg-indigo-600 hover:bg-indigo-700">
              {isPlaying ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />} {isPlaying ? "Pausar" : "Assistir"}
            </Button>
            <Button type="button" size="sm" variant="outline" className="border-slate-600 bg-transparent text-white hover:bg-slate-800 hover:text-white" onClick={() => { const video = videoRef.current; if (video) { video.currentTime = 0; void video.play(); } }}>
              <RotateCcw className="mr-1 h-4 w-4" /> Repetir
            </Button>
            <label className="flex items-center gap-1 text-xs text-slate-200"><Volume2 className="h-3.5 w-3.5" /> Velocidade
              <select value={rate} onChange={(event) => setRate(Number(event.target.value))} className="rounded border border-slate-600 bg-slate-800 px-1.5 py-1 text-white">
                <option value={0.75}>0,75×</option><option value={1}>1×</option><option value={1.25}>1,25×</option>
              </select>
            </label>
            <label className="ml-auto flex items-center gap-1 text-xs text-slate-200"><input type="checkbox" checked={repeat} onChange={(event) => setRepeat(event.target.checked)} /> Repetição automática</label>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {FAMILY_CLIPS.map((item, index) => (
          <button key={item.id} type="button" onClick={() => chooseClip(index)} className={`rounded-xl border px-3 py-2 text-left transition ${index === activeIndex ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300"}`}>
            <span className="block text-sm font-bold capitalize">{item.word}</span><span className={`block text-xs ${index === activeIndex ? "text-indigo-100" : "text-slate-500"}`}>{item.translation}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
