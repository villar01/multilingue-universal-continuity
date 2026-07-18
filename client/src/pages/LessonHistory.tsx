import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Star, TrendingUp, Calendar, Mic, Globe, ChevronRight } from 'lucide-react';

interface LessonRecord {
  id: string;
  title: string;
  language: string;
  languageFlag: string;
  teacher: string;
  teacherEmoji: string;
  date: string;
  duration: number; // minutes
  score: number; // 0-100
  xpEarned: number;
  exercisesCompleted: number;
  wordsLearned: number;
  pronunciationScore: number;
  type: 'vocabulário' | 'gramática' | 'conversação' | 'pronúncia' | 'leitura';
}

const LESSON_HISTORY: LessonRecord[] = [
  {
    id: '1',
    title: 'A Família - Vocabulário Completo',
    language: 'Inglês',
    languageFlag: '🇺🇸',
    teacher: 'Michael Johnson',
    teacherEmoji: '👨🏼',
    date: '2024-04-11',
    duration: 25,
    score: 95,
    xpEarned: 120,
    exercisesCompleted: 8,
    wordsLearned: 15,
    pronunciationScore: 92,
    type: 'vocabulário',
  },
  {
    id: '2',
    title: 'Verbos Irregulares no Passado',
    language: 'Inglês',
    languageFlag: '🇺🇸',
    teacher: 'Ana Silva',
    teacherEmoji: '👩🏽',
    date: '2024-04-10',
    duration: 30,
    score: 88,
    xpEarned: 100,
    exercisesCompleted: 10,
    wordsLearned: 20,
    pronunciationScore: 85,
    type: 'gramática',
  },
  {
    id: '3',
    title: 'Conversação no Restaurante',
    language: 'Espanhol',
    languageFlag: '🇪🇸',
    teacher: 'María García',
    teacherEmoji: '👩🏻',
    date: '2024-04-09',
    duration: 20,
    score: 78,
    xpEarned: 90,
    exercisesCompleted: 6,
    wordsLearned: 10,
    pronunciationScore: 75,
    type: 'conversação',
  },
  {
    id: '4',
    title: 'Pronúncia dos Sons Nasais',
    language: 'Francês',
    languageFlag: '🇫🇷',
    teacher: 'Jean Dubois',
    teacherEmoji: '👨🏻',
    date: '2024-04-08',
    duration: 15,
    score: 82,
    xpEarned: 80,
    exercisesCompleted: 5,
    wordsLearned: 8,
    pronunciationScore: 88,
    type: 'pronúncia',
  },
  {
    id: '5',
    title: 'Leitura: Conto Infantil',
    language: 'Alemão',
    languageFlag: '🇩🇪',
    teacher: 'Soren Andersen',
    teacherEmoji: '👨🏼',
    date: '2024-04-07',
    duration: 35,
    score: 91,
    xpEarned: 110,
    exercisesCompleted: 9,
    wordsLearned: 25,
    pronunciationScore: 90,
    type: 'leitura',
  },
];

const TYPE_COLORS: Record<string, string> = {
  vocabulário: 'bg-blue-100 text-blue-700',
  gramática: 'bg-purple-100 text-purple-700',
  conversação: 'bg-green-100 text-green-700',
  pronúncia: 'bg-orange-100 text-orange-700',
  leitura: 'bg-pink-100 text-pink-700',
};

const SCORE_COLOR = (score: number) => {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-blue-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export default function LessonHistory() {
  const [filter, setFilter] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<'data' | 'score' | 'xp'>('data');

  const totalXP = LESSON_HISTORY.reduce((sum, l) => sum + l.xpEarned, 0);
  const avgScore = Math.round(LESSON_HISTORY.reduce((sum, l) => sum + l.score, 0) / LESSON_HISTORY.length);
  const totalWords = LESSON_HISTORY.reduce((sum, l) => sum + l.wordsLearned, 0);
  const totalMinutes = LESSON_HISTORY.reduce((sum, l) => sum + l.duration, 0);

  const languages = ['todos', ...Array.from(new Set(LESSON_HISTORY.map(l => l.language)))];

  const filtered = filter === 'todos'
    ? LESSON_HISTORY
    : LESSON_HISTORY.filter(l => l.language === filter);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'data') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'xp') return b.xpEarned - a.xpEarned;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">📚 Histórico de Lições</h1>
          <p className="text-gray-600">Acompanhe seu progresso e estatísticas detalhadas</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-blue-600">{totalXP}</div>
            <div className="text-xs text-gray-600">XP Total</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
            <Star className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-green-600">{avgScore}%</div>
            <div className="text-xs text-gray-600">Média</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <BookOpen className="w-6 h-6 text-purple-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-purple-600">{totalWords}</div>
            <div className="text-xs text-gray-600">Palavras</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
            <Clock className="w-6 h-6 text-orange-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-orange-600">{totalMinutes}m</div>
            <div className="text-xs text-gray-600">Estudado</div>
          </Card>
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {languages.map(lang => (
              <Button
                key={lang}
                variant={filter === lang ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(lang)}
              >
                {lang}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <span className="text-sm text-gray-500 self-center">Ordenar:</span>
            {(['data', 'score', 'xp'] as const).map(s => (
              <Button
                key={s}
                variant={sortBy === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy(s)}
                className="capitalize"
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        {/* Lesson List */}
        <div className="space-y-4">
          {sorted.map((lesson) => (
            <Card key={lesson.id} className="p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-3xl">{lesson.languageFlag}</div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold">{lesson.title}</h3>
                      <Badge className={`text-xs ${TYPE_COLORS[lesson.type]}`}>
                        {lesson.type}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        {lesson.teacherEmoji} {lesson.teacher}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {lesson.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {lesson.duration}min
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" /> {lesson.language}
                      </span>
                    </div>

                    {/* Progress bars */}
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Pontuação</span>
                          <span className={`font-bold ${SCORE_COLOR(lesson.score)}`}>{lesson.score}%</span>
                        </div>
                        <Progress value={lesson.score} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span><Mic className="w-3 h-3 inline" /> Pronúncia</span>
                          <span className={`font-bold ${SCORE_COLOR(lesson.pronunciationScore)}`}>{lesson.pronunciationScore}%</span>
                        </div>
                        <Progress value={lesson.pronunciationScore} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xl font-bold text-orange-500">+{lesson.xpEarned} XP</div>
                  <div className="text-xs text-gray-500">{lesson.wordsLearned} palavras</div>
                  <div className="text-xs text-gray-500">{lesson.exercisesCompleted} exercícios</div>
                  <Button variant="ghost" size="sm" className="mt-2">
                    Rever <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
