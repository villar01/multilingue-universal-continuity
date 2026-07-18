import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  target: number;
  completed: boolean;
}

export default function WeeklyChallenges() {
  const [challenges] = React.useState<Challenge[]>([
    {
      id: '1',
      title: 'Conversação de 10 minutos',
      description: 'Converse com o professor por 10 minutos',
      reward: 100,
      progress: 7,
      target: 10,
      completed: false,
    },
    {
      id: '2',
      title: 'Aprenda 20 palavras',
      description: 'Domine 20 novas palavras do vocabulário',
      reward: 150,
      progress: 12,
      target: 20,
      completed: false,
    },
    {
      id: '3',
      title: 'Quiz de Gramática',
      description: 'Complete o quiz de gramática com 80%+',
      reward: 200,
      progress: 0,
      target: 1,
      completed: false,
    },
    {
      id: '4',
      title: 'Leitura Diária',
      description: 'Leia um texto completo em 5 dias',
      reward: 250,
      progress: 3,
      target: 5,
      completed: false,
    },
  ]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">📋 Desafios Semanais</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges?.map((challenge: Challenge) => (
          <Card key={challenge.id} className={`p-4 ${challenge.completed ? 'bg-green-50' : ''}`}>
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold">{challenge.title}</h3>
                <span className="text-sm font-bold text-orange-500">+{challenge.reward} XP</span>
              </div>
              <p className="text-sm text-gray-600">{challenge.description}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span className="font-bold">
                    {challenge.progress}/{challenge.target}
                  </span>
                </div>
                <Progress value={(challenge.progress / challenge.target) * 100} />
              </div>
              {!challenge.completed && (
                <Button size="sm" className="w-full">
                  Continuar
                </Button>
              )}
              {challenge.completed && (
                <div className="text-center text-green-600 font-bold">✅ Concluído!</div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
