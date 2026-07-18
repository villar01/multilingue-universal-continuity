import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import VirtualTeacher from "@/components/VirtualTeacher";
import { trpc } from "@/lib/trpc";
import { toast } from "@/hooks/use-toast";

const AVATARS = [
  {
    id: "teacher1" as const,
    name: "Prof. Ana",
    description: "Professora experiente e amigável",
    personality: "Paciente e encorajadora",
    emoji: "👩‍🏫"
  },
  {
    id: "teacher2" as const,
    name: "Prof. Carlos",
    description: "Professor dinâmico e motivador",
    personality: "Energético e divertido",
    emoji: "👨‍🏫"
  },
  {
    id: "teacher3" as const,
    name: "Prof. Yuki",
    description: "Professora atenciosa e detalhista",
    personality: "Calma e precisa",
    emoji: "👩‍💼"
  },
  {
    id: "teacher4" as const,
    name: "Prof. Ahmed",
    description: "Professor carismático e inspirador",
    personality: "Confiante e motivador",
    emoji: "👨‍💼"
  }
];

export default function AvatarSelection() {
  const { data: me } = trpc.auth.me.useQuery();
  const [selectedAvatar, setSelectedAvatar] = useState(
    (me as any)?.selectedAvatar || "teacher1"
  );
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  const saveAvatarMutation = trpc.auth.saveAvatar.useMutation({
    onSuccess: () => {
      toast.success("Avatar salvo! Seu professor virtual foi atualizado.");
    },
    onError: () => {
      toast.error("Erro ao salvar. Tente novamente.");
    }
  });

  const handleSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
  };

  const handleConfirm = () => {
    saveAvatarMutation.mutate({ avatarId: selectedAvatar });
    setTimeout(() => window.history.back(), 800);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Escolha Seu Professor Virtual
          </h1>
          <p className="text-lg text-gray-600">
            Selecione o avatar que mais combina com seu estilo de aprendizado
          </p>
        </div>

        {/* Preview do avatar selecionado */}
        {previewAvatar && (
          <div className="mb-8 flex justify-center">
            <VirtualTeacher
              avatarType={previewAvatar as any}
              text="Olá! Eu sou seu novo professor virtual. Vamos aprender juntos?"
              expression="happy"
            />
          </div>
        )}

        {/* Grid de avatares */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {AVATARS.map((avatar) => (
            <Card
              key={avatar.id}
              className={`p-6 cursor-pointer transition-all hover:shadow-xl ${
                selectedAvatar === avatar.id
                  ? "ring-4 ring-blue-500 bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => handleSelect(avatar.id)}
              onMouseEnter={() => setPreviewAvatar(avatar.id)}
              onMouseLeave={() => setPreviewAvatar(null)}
            >
              <div className="flex flex-col items-center gap-4">
                {/* Mini preview */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <span className="text-4xl">{avatar.emoji}</span>
                  </div>
                  
                  {selectedAvatar === avatar.id && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-2">
                      <Check className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Informações */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {avatar.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {avatar.description}
                  </p>
                  <div className="inline-block bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full">
                    {avatar.personality}
                  </div>
                </div>

                {/* Botão de seleção */}
                <Button
                  variant={selectedAvatar === avatar.id ? "default" : "outline"}
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(avatar.id);
                  }}
                >
                  {selectedAvatar === avatar.id ? "Selecionado ✓" : "Selecionar"}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Botão de confirmar */}
        <div className="mt-8 text-center">
          <Button
            size="lg"
            className="px-8"
            disabled={saveAvatarMutation.isPending}
            onClick={handleConfirm}
          >
            {saveAvatarMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
            ) : (
              "Confirmar Escolha"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
