import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Share2 } from 'lucide-react';

export default function ReferralWidget() {
  const [copied, setCopied] = useState(false);
  const referralCode = 'MULTILINGUE2024';
  const referralsCount = 5;
  const totalXP = 250;

  const copyCode = async () => {
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCode = () => {
    const text = `Junte-se a mim no MultiLingue Universal! Use meu código: ${referralCode}`;
    if (navigator.share) {
      navigator.share({ title: 'MultiLingue Universal', text });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">🔗 Programa de Referência</h2>

      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Seu código de referência</p>
            <div className="flex gap-2">
              <Input value={referralCode} readOnly className="font-mono font-bold" />
              <Button onClick={copyCode} size="sm" variant="outline">
                <Copy className="w-4 h-4" />
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
              <Button onClick={shareCode} size="sm" variant="outline">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-600">Amigos Convidados</p>
              <p className="text-3xl font-bold text-purple-600">{referralsCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">XP Ganho</p>
              <p className="text-3xl font-bold text-blue-600">+{totalXP}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm">Milestones de Bônus</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>1 amigo</span>
                <span className="text-green-600">✅ 50 XP</span>
              </div>
              <div className="flex justify-between">
                <span>3 amigos</span>
                <span className="text-green-600">✅ 150 XP</span>
              </div>
              <div className="flex justify-between">
                <span>5 amigos</span>
                <span className="text-green-600">✅ 250 XP</span>
              </div>
              <div className="flex justify-between opacity-50">
                <span>10 amigos</span>
                <span>500 XP</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
