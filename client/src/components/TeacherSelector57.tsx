import { useState, useEffect } from 'react';
import { TEACHERS_57, Teacher57 } from '@/data/teachers57';
import { speakWithLipSync, preloadVoices, LipSyncFrame } from '@/lib/voiceEngine';

interface TeacherSelector57Props {
  onSelect: (teacher: Teacher57) => void;
  onLipSync?: (frame: LipSyncFrame) => void;
  selectedId?: string;
  compact?: boolean;
}

// Agrupar professores por região
const REGIONS = [
  { name: '🌎 Américas', codes: ['pt', 'pt-PT', 'en', 'en-GB', 'es', 'es-MX', 'fr', 'qu', 'gn', 'profa-pt-br', 'profa-en-us', 'profa-en-gb', 'profa-es', 'profa-fr', 'profa-qu'] },
  { name: '🌍 Europa', codes: ['de', 'it', 'nl', 'pl', 'sv', 'da', 'fi', 'nb', 'tr', 'el', 'cs', 'hu', 'ro', 'uk', 'he', 'ca', 'eu', 'gl', 'cy', 'ga', 'mt', 'is', 'lv', 'lt', 'et', 'sk', 'sl', 'hr', 'bg', 'ru', 'no'] },
  { name: '🌏 Ásia', codes: ['ja', 'ko', 'zh', 'zh-TW', 'ar', 'hi', 'id', 'ms', 'th', 'vi', 'fa', 'ur', 'bn', 'tl'] },
  { name: '🌍 África', codes: ['af', 'sw', 'yo', 'ig', 'ha', 'am', 'zu', 'xh'] },
];

type GenderFilter = 'all' | 'male' | 'female';

export function TeacherSelector57({ onSelect, onLipSync, selectedId, compact = false }: TeacherSelector57Props) {
  const [selected, setSelected] = useState<Teacher57 | null>(null);
  const [activeRegion, setActiveRegion] = useState(0);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all');
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  useEffect(() => {
    preloadVoices().then(() => setVoicesLoaded(true));
  }, []);

  useEffect(() => {
    if (selectedId) {
      const t = TEACHERS_57.find(t => t.id === selectedId);
      if (t) setSelected(t);
    }
  }, [selectedId]);

  const handleSelect = (teacher: Teacher57) => {
    setSelected(teacher);
    onSelect(teacher);
    if (voicesLoaded) {
      speakWithLipSync(
        teacher.greeting,
        teacher.voiceLang,
        (frame) => onLipSync?.(frame)
      );
    }
  };

  const filterTeachers = (teachers: Teacher57[]) => {
    return teachers.filter(t => {
      const matchGender = genderFilter === 'all' || t.gender === genderFilter || (!t.gender && genderFilter === 'male');
      const matchSearch = search === '' ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.language.toLowerCase().includes(search.toLowerCase()) ||
        t.langCode.toLowerCase().includes(search.toLowerCase());
      return matchGender && matchSearch;
    });
  };

  const regionTeachers = TEACHERS_57.filter(t => {
    const region = REGIONS[activeRegion];
    return region.codes.includes(t.langCode) || region.codes.includes(t.id);
  });

  const allFiltered = filterTeachers(
    search !== '' ? TEACHERS_57 : regionTeachers
  );

  const totalCount = filterTeachers(TEACHERS_57).length;

  return (
    <div className="bg-gray-900 rounded-2xl p-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-purple-400">
          🌍 Professores Globais
        </h2>
        <span className="text-xs text-gray-400">{totalCount} disponíveis</span>
      </div>

      {/* Filtro de Gênero */}
      <div className="flex gap-2 mb-3">
        {(['all', 'female', 'male'] as GenderFilter[]).map(g => (
          <button
            key={g}
            onClick={() => setGenderFilter(g)}
            className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
              genderFilter === g
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {g === 'all' ? '👥 Todos' : g === 'female' ? '👩 Professoras' : '👨 Professores'}
          </button>
        ))}
      </div>

      {/* Busca */}
      <input
        type="text"
        placeholder="Buscar por nome ou idioma..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm mb-3 outline-none border border-gray-700 focus:border-purple-500"
      />

      {/* Abas de Região */}
      {search === '' && (
        <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
          {REGIONS.map((r, i) => (
            <button
              key={i}
              onClick={() => setActiveRegion(i)}
              className={`text-xs px-2 py-1 rounded-lg whitespace-nowrap transition-colors ${
                activeRegion === i
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>
      )}

      {/* Grid de Professores */}
      <div className={`grid ${compact ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'} gap-2 max-h-72 overflow-y-auto`}>
        {allFiltered.map(teacher => (
          <button
            key={teacher.id}
            onClick={() => handleSelect(teacher)}
            className={`relative flex flex-col items-center p-2 rounded-xl transition-all text-center ${
              selected?.id === teacher.id
                ? 'ring-2 ring-purple-500 bg-purple-900/40'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            {/* Foto real ou avatar emoji */}
            <div
              className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-2xl mb-1 relative"
              style={{ backgroundColor: teacher.color + '33', border: `2px solid ${teacher.color}` }}
            >
              {teacher.photo ? (
                <img
                  src={teacher.photo}
                  alt={teacher.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerText = teacher.avatar;
                  }}
                />
              ) : (
                <span>{teacher.avatar}</span>
              )}
            </div>
            {/* Badge de gênero */}
            <span className="absolute top-1 right-1 text-xs">
              {teacher.gender === 'female' ? '♀' : '♂'}
            </span>
            <span className="text-xs font-medium text-white leading-tight">{teacher.name}</span>
            <span className="text-xs text-gray-400 leading-tight">{teacher.flag} {teacher.language}</span>
          </button>
        ))}
      </div>

      {allFiltered.length === 0 && (
        <div className="text-center text-gray-500 text-sm py-4">
          Nenhum professor encontrado
        </div>
      )}

      {/* Professor Selecionado */}
      {selected && (
        <div
          className="mt-3 p-3 rounded-xl"
          style={{ backgroundColor: selected.color + '22', border: `1px solid ${selected.color}44` }}
        >
          <div className="flex items-center gap-3">
            {/* Foto pequena no canto */}
            <div
              className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl"
              style={{ border: `2px solid ${selected.color}` }}
            >
              {selected.photo ? (
                <img
                  src={selected.photo}
                  alt={selected.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerText = selected.avatar;
                  }}
                />
              ) : (
                <span>{selected.avatar}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">{selected.name}</p>
              <p className="text-xs text-gray-300">{selected.flag} {selected.language}</p>
              <p className="text-xs text-gray-400 truncate">{selected.origin}</p>
              <p className="text-xs text-purple-300 truncate">{selected.specialty}</p>
            </div>
            <button
              onClick={() => speakWithLipSync(selected.greeting, selected.voiceLang, (f) => onLipSync?.(f))}
              className="text-xl hover:scale-110 transition-transform flex-shrink-0"
              title="Ouvir saudação"
            >
              🔊
            </button>
          </div>
          <p className="text-xs text-gray-300 mt-2 italic">"{selected.greeting}"</p>
        </div>
      )}
    </div>
  );
}

export default TeacherSelector57;
