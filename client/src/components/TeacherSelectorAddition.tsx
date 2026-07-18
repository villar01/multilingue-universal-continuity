/**
 * ═══════════════════════════════════════════════════════════════════
 * client/src/components/TeacherSelectorAddition.tsx
 * ADIÇÃO ao AvatarSelection.tsx existente
 * ───────────────────────────────────────────────────────────────────
 * NÃO substitui AvatarSelection.tsx — adicionar estes componentes
 * ao final do arquivo existente ou importar nele.
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState } from "react";
import { Globe, Star, Play, Mic, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─── DADOS DOS 2 NOVOS PROFESSORES ────────────────────────────────────────────

export const NEW_TEACHERS_DATA = [
  {
    id: 11,
    name: "Kofi Mensah",
    origin: "Gana",
    flag: "🇬🇭",
    title: "Mwalimu / Professor Pan-Africano",
    photo: "/teachers/kofi-mensah.webp",      // gerado via Qwen/Bing/Firefly
    photoFallback: "👨🏿‍🏫",                     // emoji fallback até ter foto
    languages: ["🇰🇪 Swahili","🇳🇬 Hausa","🇳🇬 Yoruba","🇳🇬 Igbo","🇿🇦 Zulu","🇪🇹 Amárico","🇿🇦 Afrikaans"],
    specialties: ["Idiomas africanos", "Imersão cultural", "Ritmo e música"],
    personality: "Caloroso • Sábio • Vibrante",
    teachingStyle: "Conta histórias e usa provérbios africanos para ensinar",
    samplePhrase: {
      text: "Habari! Karibu sana!",
      translation: "Olá! Muito bem-vindo!",
      language: "Swahili 🇰🇪",
    },
    voiceStyle: "Grave e calorosa, com cadência rítmica",
    xpBonus: "+15 XP",
    rating: 4.9,
    reviews: 842,
    gradientFrom: "#2D6A4F",
    gradientTo: "#D4A017",
    accentColor: "#F9C74F",
    region: "África",
    isNew: true,
    isFree: true,
  },
  {
    id: 12,
    name: "Luna Quetzal",
    origin: "México",
    flag: "🇲🇽",
    title: "Maestra / Professora Pan-Americana Indígena",
    photo: "/teachers/luna-quetzal.webp",     // gerado via Qwen/Bing/Firefly
    photoFallback: "👩🏽‍🏫",
    languages: ["🇵🇪 Quechua","🇵🇾 Guarani","🇲🇽 Espanhol MX","🇦🇷 Espanhol AR","🇧🇷 Português BR"],
    specialties: ["Idiomas indígenas", "Línguas latinas", "Canções tradicionais"],
    personality: "Apaixonada • Criativa • Cultural",
    teachingStyle: "Usa músicas, danças e metáforas da natureza para ensinar",
    samplePhrase: {
      text: "¡Bienvenidos, amigos! Ima shutiki?",
      translation: "Bem-vindos, amigos! Como você se chama? (Quechua)",
      language: "Espanhol + Quechua 🇵🇪",
    },
    voiceStyle: "Clara e melodiosa, entusiástica, ritmo musical",
    xpBonus: "+15 XP",
    rating: 4.8,
    reviews: 671,
    gradientFrom: "#7B2D8B",
    gradientTo: "#E94560",
    accentColor: "#FF6B6B",
    region: "Américas Indígenas",
    isNew: true,
    isFree: true,
  },
];

// ─── CARD DO NOVO PROFESSOR ───────────────────────────────────────────────────

function NewTeacherCard({
  teacher,
  selectedId,
  nativeLanguage,
  onSelect,
}: {
  teacher: typeof NEW_TEACHERS_DATA[0];
  selectedId: number | null;
  nativeLanguage: string;
  onSelect: (id: number) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isSelected = selectedId === teacher.id;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300
        ${isSelected
          ? "ring-2 ring-offset-2 ring-offset-background scale-[1.02] shadow-xl"
          : "hover:shadow-lg hover:scale-[1.01]"
        }`}
      style={{ borderColor: teacher.accentColor }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(teacher.id)}
    >
      {/* Background gradiente do professor */}
      <div
        className="absolute inset-0 opacity-90"
        style={{ background: `linear-gradient(135deg, ${teacher.gradientFrom}, ${teacher.gradientTo})` }}
      />

      {/* Badge NOVO */}
      {teacher.isNew && (
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
            ✨ NOVO
          </span>
        </div>
      )}

      {/* Badge FREE */}
      {teacher.isFree && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            FREE
          </span>
        </div>
      )}

      {/* Conteúdo */}
      <div className="relative z-10 p-4">
        {/* Avatar do professor */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 bg-white/10 flex items-center justify-center text-4xl">
            {/* Em produção: <img src={teacher.photo} /> */}
            <span>{teacher.photoFallback}</span>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-white font-bold text-lg leading-tight">{teacher.name}</p>
              <span>{teacher.flag}</span>
            </div>
            <p className="text-white/70 text-xs">{teacher.origin}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-300 text-xs font-medium">{teacher.rating}</span>
              <span className="text-white/50 text-xs">({teacher.reviews})</span>
            </div>
          </div>
        </div>

        {/* Título */}
        <p className="text-white/80 text-xs mb-2 italic">{teacher.title}</p>

        {/* Personalidade */}
        <p className="text-white font-medium text-sm mb-2">{teacher.personality}</p>

        {/* Idiomas */}
        <div className="flex flex-wrap gap-1 mb-3">
          {teacher.languages.slice(0, 4).map(lang => (
            <span key={lang} className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
              {lang}
            </span>
          ))}
          {teacher.languages.length > 4 && (
            <span className="bg-white/10 text-white/60 text-xs px-1.5 py-0.5 rounded-full">
              +{teacher.languages.length - 4}
            </span>
          )}
        </div>

        {/* Frase de exemplo */}
        <div className="bg-black/20 rounded-xl p-3 mb-3">
          <p className="text-white font-medium text-sm">"{teacher.samplePhrase.text}"</p>
          <p className="text-white/60 text-xs mt-0.5">{teacher.samplePhrase.translation}</p>
          <p className="text-white/40 text-xs">{teacher.samplePhrase.language}</p>
        </div>

        {/* Estilo de ensino */}
        <div className="flex items-start gap-1.5 mb-3">
          <BookOpen className="w-3.5 h-3.5 text-white/60 mt-0.5 flex-shrink-0" />
          <p className="text-white/70 text-xs">{teacher.teachingStyle}</p>
        </div>

        {/* Bônus XP */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-yellow-300 text-xs font-bold">{teacher.xpBonus} por aula</span>
          <span className="text-white/40 text-xs">com este professor</span>
        </div>

        {/* Botão selecionar */}
        <button
          className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all
            ${isSelected
              ? "bg-white text-black"
              : "bg-white/20 text-white hover:bg-white/30 border border-white/30"
            }`}
          onClick={(e) => { e.stopPropagation(); onSelect(teacher.id); }}
        >
          {isSelected ? "✓ Selecionado" : `Escolher ${teacher.name.split(" ")[0]}`}
        </button>
      </div>
    </div>
  );
}

// ─── SEÇÃO "NOVOS PROFESSORES" — adicionar ao AvatarSelection.tsx ─────────────

export function NewTeachersSection({
  selectedTeacherId,
  nativeLanguage,
  onTeacherSelect,
}: {
  selectedTeacherId: number | null;
  nativeLanguage: string;
  onTeacherSelect: (id: number) => void;
}) {
  return (
    <div className="mt-8">
      {/* Header da seção */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 font-bold text-sm uppercase tracking-wider">Novos Professores</span>
          <Globe className="w-4 h-4 text-yellow-400" />
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
      </div>

      <p className="text-muted-foreground text-sm text-center mb-4">
        Representando África e as Américas Indígenas — para um aprendizado verdadeiramente global
      </p>

      {/* Grid dos 2 novos professores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {NEW_TEACHERS_DATA.map(teacher => (
          <NewTeacherCard
            key={teacher.id}
            teacher={teacher}
            selectedId={selectedTeacherId}
            nativeLanguage={nativeLanguage}
            onSelect={onTeacherSelect}
          />
        ))}
      </div>

      {/* Nota cultural */}
      <p className="text-muted-foreground text-xs text-center mt-3">
        🌍 Representando mais de 30 idiomas africanos e americanos indígenas nativos
      </p>
    </div>
  );
}

// ─── INSTRUÇÃO DE INTEGRAÇÃO ──────────────────────────────────────────────────
/**
 * Em client/src/pages/AvatarSelection.tsx, adicionar:
 *
 * import { NewTeachersSection } from "@/components/TeacherSelectorAddition";
 *
 * // Após o grid de professores existente (os 10 originais):
 * <NewTeachersSection
 *   selectedTeacherId={selectedTeacher}
 *   nativeLanguage={user.nativeLanguage}
 *   onTeacherSelect={(id) => setSelectedTeacher(id)}
 * />
 */
