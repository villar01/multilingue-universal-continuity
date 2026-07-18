import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GLOBAL_TEACHERS } from '../../../server/data/global-teachers';
import { LANGUAGES } from '../../../server/data/languages';

interface TeacherLanguageSelectorProps {
  onSelect: (teacherId: number, languageCode: string) => void;
}

export default function TeacherLanguageSelector({ onSelect }: TeacherLanguageSelectorProps) {
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const handleStart = () => {
    if (selectedTeacher && selectedLanguage) {
      onSelect(selectedTeacher, selectedLanguage);
    }
  };

  return (
    <div className="space-y-8">
      {/* Teacher Selection */}
      <div>
        <h2 className="text-2xl font-bold mb-4">🎓 Escolha seu Professor</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GLOBAL_TEACHERS.map((teacher: any) => (
            <Card
              key={teacher.id}
              className={`p-4 cursor-pointer transition ${
                selectedTeacher === teacher.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedTeacher(teacher.id)}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">{teacher.gender === 'male' ? '👨‍🏫' : '👩‍🏫'}</div>
                <p className="font-bold text-sm">{teacher.name}</p>
                <p className="text-xs text-gray-600">{teacher.region}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Language Selection */}
      <div>
        <h2 className="text-2xl font-bold mb-4">🌍 Escolha o Idioma</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {LANGUAGES.map((lang: any) => (
            <Button
              key={lang.code}
              variant={selectedLanguage === lang.code ? 'default' : 'outline'}
              className="text-xs"
              onClick={() => setSelectedLanguage(lang.code)}
            >
              {lang.flag} {lang.code}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary and Start */}
      {selectedTeacher && selectedLanguage && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Sua Aula Personalizada</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Professor</p>
                <p className="font-bold">
                  {GLOBAL_TEACHERS.find((t: any) => t.id === selectedTeacher)?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Idioma</p>
                <p className="font-bold">
                  {LANGUAGES.find((l: any) => l.code === selectedLanguage)?.name}
                </p>
              </div>
            </div>
            <Button
              onClick={handleStart}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              ▶️ Começar Aula
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
