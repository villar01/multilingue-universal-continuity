import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";
import { Check, Sparkles, Globe, Brain, Video } from "lucide-react";

export default function PreLaunch() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  
  const joinWaitlist = trpc.waitlist.join.useMutation({
    onSuccess: () => {
      toast.success("🎉 Você está na lista! Enviaremos o acesso em breve.");
      setEmail("");
      setName("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Digite seu email");
      return;
    }
    joinWaitlist.mutate({ email, name });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full font-bold mb-6 animate-pulse">
            🚀 PRÉ-LANÇAMENTO - 60% OFF para os primeiros 100!
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            Aprenda Qualquer Idioma
            <br />
            Com IA GPT-4
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            A primeira plataforma do mundo com <strong>conversação ilimitada por IA</strong>, 
            análise de pronúncia em tempo real e <strong>vídeos interativos</strong> em 54 idiomas.
          </p>

          {/* Form */}
          <Card className="max-w-md mx-auto p-8 bg-white/10 backdrop-blur-lg border-white/20">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
              />
              <Input
                type="email"
                placeholder="Seu melhor email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
              />
              <Button
                type="submit"
                disabled={joinWaitlist.isPending}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg py-6 hover:from-yellow-500 hover:to-orange-600"
              >
                {joinWaitlist.isPending ? "Entrando..." : "🎁 Garantir 60% OFF"}
              </Button>
              <p className="text-sm text-gray-300">
                ⚡ Apenas <strong>100 vagas</strong> com desconto exclusivo
              </p>
            </form>
          </Card>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
            <Globe className="w-12 h-12 mb-4 text-blue-400" />
            <h3 className="text-xl font-bold mb-2">54 Idiomas</h3>
            <p className="text-gray-300">69 idiomas — mais do que qualquer outro app do mundo</p>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
            <Brain className="w-12 h-12 mb-4 text-purple-400" />
            <h3 className="text-xl font-bold mb-2">IA GPT-4</h3>
            <p className="text-gray-300">Conversação ilimitada e personalizada</p>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
            <Video className="w-12 h-12 mb-4 text-pink-400" />
            <h3 className="text-xl font-bold mb-2">Vídeos Interativos</h3>
            <p className="text-gray-300">Aprenda com cenas reais e repita como nativos</p>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
            <Sparkles className="w-12 h-12 mb-4 text-yellow-400" />
            <h3 className="text-xl font-bold mb-2">Análise de Pronúncia</h3>
            <p className="text-gray-300">Feedback em tempo real com IA avançada</p>
          </Card>
        </div>

        {/* Pricing Preview */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">Preço de Lançamento</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
              <div className="text-sm text-gray-400 mb-2">Mensal</div>
              <div className="text-4xl font-bold mb-2">$3,96</div>
              <div className="text-sm line-through text-gray-400 mb-4">$9,90</div>
              <div className="text-green-400 font-bold">60% OFF</div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-lg border-yellow-400/50 ring-2 ring-yellow-400">
              <div className="text-sm text-yellow-400 mb-2">Anual - POPULAR</div>
              <div className="text-4xl font-bold mb-2">$35,60</div>
              <div className="text-sm line-through text-gray-400 mb-4">$89,00</div>
              <div className="text-green-400 font-bold">60% OFF</div>
            </Card>

            <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
              <div className="text-sm text-gray-400 mb-2">Bianual</div>
              <div className="text-4xl font-bold mb-2">$59,60</div>
              <div className="text-sm line-through text-gray-400 mb-4">$149,00</div>
              <div className="text-green-400 font-bold">60% OFF</div>
            </Card>
          </div>
          <p className="text-sm text-gray-400 mt-6">
            * Preços em USD. Após lançamento: preços normais com 50% OFF
          </p>
        </div>

        {/* Social Proof */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white" />
              ))}
            </div>
            <span className="text-gray-300">+ 47 pessoas já garantiram</span>
          </div>
          <p className="text-gray-400 text-sm">
            Seja um dos primeiros a ter acesso à tecnologia mais avançada de aprendizado de idiomas
          </p>
        </div>
      </div>
    </div>
  );
}
