import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Bell } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  icon: string;
  read: boolean;
  timestamp: Date;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: '🏆 Conquista Desbloqueada',
      message: 'Você completou o desafio "Conversação de 10 minutos"',
      icon: '🏆',
      read: false,
      timestamp: new Date(),
    },
    {
      id: '2',
      title: '⭐ Novo Milestone',
      message: 'Você atingiu 1000 XP! Parabéns!',
      icon: '⭐',
      read: false,
      timestamp: new Date(),
    },
    {
      id: '3',
      title: '🎁 Bônus Disponível',
      message: 'Seu amigo se juntou! Ganhe 50 XP de bônus',
      icon: '🎁',
      read: true,
      timestamp: new Date(),
    },
  ]);

  const [showAll, setShowAll] = useState(false);
  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  const dismissNotification = (id: string) => {
    setNotifications((prev: Notification[]) => prev.filter((n: Notification) => n.id !== id));
  };

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6" />
          Notificações
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </h2>
      </div>

      <div className="space-y-2">
        {displayedNotifications.map((notification: Notification) => (
          <Card
            key={notification.id}
            className={`p-4 flex items-start justify-between ${
              !notification.read ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <div className="flex gap-3 flex-1">
              <span className="text-2xl">{notification.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm">{notification.title}</p>
                <p className="text-sm text-gray-600">{notification.message}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissNotification(notification.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </Card>
        ))}
      </div>

      {notifications.length > 3 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Mostrar menos' : 'Ver todas as notificações'}
        </Button>
      )}
    </div>
  );
}
