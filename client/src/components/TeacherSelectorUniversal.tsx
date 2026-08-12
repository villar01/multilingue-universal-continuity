/**
 * TeacherSelectorUniversal
 * 67 idiomas × 2 gêneros = 134 professores com fotos reais
 */
import React, { useState, useMemo } from "react";
import { TEACHERS_57, type Teacher57 } from "@/data/teachers57";
import { getLanguageBase, isTeacherVoiceCompatibleWithTarget } from "@shared/languageContext";

interface TeacherSelectorUniversalProps {
  selectedTeacherId?: string;
  onSelect: (teacher: Teacher57) => void;
  onClose?: () => void;
  compact?: boolean;
  title?: string;
  languageCode?: string;
}

const REGIONS = [
  { key: "all", label: "🌍 Todos" },
  { key: "americas", label: "🌎 Américas" },
  { key: "europe", label: "🌍 Europa" },
  { key: "asia", label: "🌏 Ásia" },
  { key: "africa", label: "🌍 África" },
];

const REGION_MAP: Record<string, string[]> = {
  americas: ["pt", "en", "en-GB", "es", "es-MX", "fr", "qu", "gn"],
  europe: ["pt-PT", "de", "it", "nl", "pl", "sv", "da", "fi", "nb", "no", "el", "cs", "hu", "ro", "uk", "he", "ca", "eu", "gl", "cy", "ga", "mt", "is", "lv", "lt", "et", "sk", "sl", "hr", "bg", "ru"],
  asia: ["ja", "ko", "zh", "zh-TW", "ar", "hi", "tr", "id", "ms", "th", "vi", "fa", "ur", "bn", "tl"],
  africa: ["af", "sw", "yo", "ig", "ha", "am", "zu", "xh"],
};

type GenderFilter = "all" | "male" | "female";

export const TeacherSelectorUniversal: React.FC<TeacherSelectorUniversalProps> = ({
  selectedTeacherId,
  onSelect,
  onClose,
  compact = false,
  title = "Escolha seu Professor",
  languageCode,
}) => {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("all");
  const [gender, setGender] = useState<GenderFilter>("all");

  const filtered = useMemo(() => {
    const hasTargetLanguage = Boolean(getLanguageBase(languageCode));
    let list = hasTargetLanguage
      ? TEACHERS_57.filter((teacher) => isTeacherVoiceCompatibleWithTarget(teacher.voiceLang, languageCode))
      : [];

    if (region !== "all") {
      const codes = REGION_MAP[region] || [];
      list = list.filter(t => codes.includes(t.langCode));
    }

    if (gender !== "all") {
      list = list.filter(t => t.gender === gender || (!t.gender && gender === "male"));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.language.toLowerCase().includes(q) ||
        t.specialty.toLowerCase().includes(q) ||
        t.origin.toLowerCase().includes(q)
      );
    }

    return list;
  }, [search, region, gender, languageCode]);

  return (
    <div className={`flex flex-col ${compact ? "h-full" : "min-h-screen"} bg-gray-950 text-white`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}>
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-xs text-white/50">
            {languageCode ? `${filtered.length} professores compatíveis disponíveis` : "Selecione primeiro o idioma de estudo"}
          </p>
        </div>
        {onClose && (
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm transition-colors">
            ✕
          </button>
        )}
      </div>

      {/* Gender filter */}
      <div className="flex gap-2 px-4 pt-3">
        {(["all", "female", "male"] as GenderFilter[]).map(g => (
          <button
            key={g}
            onClick={() => setGender(g)}
            className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
              gender === g
                ? "bg-purple-600 text-white"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            {g === "all" ? "👥 Todos" : g === "female" ? "👩 Professoras" : "👨 Professores"}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-white/10">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Buscar por nome, idioma, especialidade..."
          className="w-full bg-white/10 text-white placeholder-white/40 rounded-xl px-4 py-2.5 text-sm border border-white/20 focus:border-purple-400 focus:outline-none"
        />
      </div>

      {/* Region filter */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto border-b border-white/10">
        {REGIONS.map(r => (
          <button
            key={r.key}
            onClick={() => setRegion(r.key)}
            className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-full transition-all ${
              region === r.key
                ? "bg-purple-600 text-white font-bold"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Teachers grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-white/40">
            <div className="text-4xl mb-3">🔍</div>
            <p>Nenhum professor encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(teacher => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                isSelected={teacher.id === selectedTeacherId}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="px-4 py-3 border-t border-white/10 text-center text-xs text-white/40">
        💡 Você pode trocar de professor entre os perfis compatíveis com o idioma de estudo
      </div>
    </div>
  );
};

interface TeacherCardProps {
  teacher: Teacher57;
  isSelected: boolean;
  onSelect: (teacher: Teacher57) => void;
}

const TeacherCard: React.FC<TeacherCardProps> = ({ teacher, isSelected, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(teacher)}
      className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all text-left ${
        isSelected
          ? "border-2 scale-105 shadow-lg"
          : "border-white/10 hover:border-white/30 hover:bg-white/5"
      }`}
      style={{
        borderColor: isSelected ? teacher.color : undefined,
        background: isSelected ? teacher.color + "22" : undefined,
        boxShadow: isSelected ? `0 0 20px ${teacher.color}44` : undefined,
      }}
    >
      {/* Selected badge */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ background: teacher.color }}>
          ✓
        </div>
      )}

      {/* Gender badge */}
      {!isSelected && (
        <div className="absolute top-2 right-2 text-xs text-white/40">
          {teacher.gender === "female" ? "♀" : "♂"}
        </div>
      )}

      {/* Foto real no card */}
      <div
        className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-3xl flex-shrink-0"
        style={{ background: teacher.color + "33", border: `2px solid ${teacher.color}66` }}
      >
        {teacher.photo ? (
          <img
            src={teacher.photo}
            alt={teacher.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent) parent.innerText = teacher.avatar;
            }}
          />
        ) : (
          <span>{teacher.avatar}</span>
        )}
      </div>

      {/* Flag + language */}
      <div className="flex items-center gap-1">
        <span className="text-base">{teacher.flag}</span>
        <span className="text-xs text-white/60 truncate max-w-[80px]">{teacher.language}</span>
      </div>

      {/* Name */}
      <div className="font-bold text-xs text-center leading-tight" style={{ color: teacher.color }}>
        {teacher.name}
      </div>

      {/* Specialty */}
      <div className="text-xs text-white/50 text-center leading-tight line-clamp-2">
        {teacher.specialty}
      </div>

      {/* Origin */}
      <div className="text-xs text-white/30 text-center">
        📍 {teacher.origin.split(",")[1]?.trim() || teacher.origin}
      </div>
    </button>
  );
};

export default TeacherSelectorUniversal;
