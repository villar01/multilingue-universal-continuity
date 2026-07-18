import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, Sparkles, Zap } from "lucide-react";

export default function PricingComparison() {
  const plans = [
    {
      name: "Free",
      price: "R$ 0",
      period: "para sempre",
      icon: Sparkles,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      features: [
        { name: "Visualização de todas as lições", included: true },
        { name: "Professor virtual 3D", included: true },
        { name: "Vídeos interativos com legendas", included: true },
        { name: "Glossário bilíngue", included: true },
        { name: "Chatbot IA conversacional", included: true },
        { name: "Copiar textos das lições", included: false },
        { name: "Downloads de materiais", included: false },
        { name: "Lições de especialização VIP", included: false },
        { name: "Certificados de conclusão", included: false },
        { name: "Suporte prioritário", included: false },
      ],
      cta: "Começar Grátis",
      link: "/dashboard",
    },
    {
      name: "Premium",
      price: "R$ 59,00",
      period: "/mês",
      badge: "Mais Popular",
      icon: Zap,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-500",
      features: [
        { name: "Tudo do plano Free", included: true },
        { name: "Copiar textos das lições", included: true },
        { name: "5 downloads de materiais/mês", included: true },
        { name: "Exercícios extras", included: true },
        { name: "Histórico de progresso detalhado", included: true },
        { name: "Lições de especialização VIP", included: false },
        { name: "Certificados de conclusão", included: false },
        { name: "Downloads ilimitados", included: false },
        { name: "Suporte prioritário", included: false },
        { name: "Acesso antecipado a novos idiomas", included: false },
      ],
      cta: "Assinar Premium",
      link: "/checkout?plan=premium",
    },
    {
      name: "VIP",
      price: "R$ 1.062,00",
      period: "vitalício (1 ano e meio)",
      badge: "Melhor Valor",
      icon: Crown,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-500",
      features: [
        { name: "Tudo do plano Premium", included: true },
        { name: "Lições de especialização VIP", included: true },
        { name: "Certificados de conclusão personalizados", included: true },
        { name: "Downloads ilimitados de materiais", included: true },
        { name: "Suporte prioritário 24/7", included: true },
        { name: "Acesso antecipado a novos idiomas", included: true },
        { name: "Materiais extras (PDFs, áudios)", included: true },
        { name: "Aulas ao vivo mensais (grupo)", included: true },
        { name: "Badge VIP no perfil", included: true },
        { name: "Acesso vitalício garantido", included: true },
      ],
      cta: "Assinar VIP",
      link: "/checkout?plan=vip",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <a className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🌍 MultiLingue Universal
              </a>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Voltar ao Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Escolha Seu Plano
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Desbloqueie todo o potencial do aprendizado de idiomas com IA avançada.
          Comece grátis ou escolha um plano premium para recursos exclusivos.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`relative ${plan.borderColor} border-2 hover:shadow-2xl transition-all duration-300 ${
                  plan.badge ? "transform scale-105" : ""
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 text-sm">
                      ⭐ {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className={`${plan.bgColor} text-center pt-8`}>
                  <div className="flex justify-center mb-4">
                    <div className={`${plan.color} bg-white rounded-full p-4 shadow-lg`}>
                      <Icon className="h-8 w-8" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`text-sm ${
                            feature.included ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.link}>
                    <Button
                      className={`w-full ${
                        plan.badge
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          : ""
                      }`}
                      variant={plan.badge ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Perguntas Frequentes</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Qual a diferença entre Free e Premium?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  O plano Free permite visualizar todas as lições e usar o chatbot IA, mas não
                  permite copiar textos ou baixar materiais. O Premium libera cópia de textos e 5
                  downloads por mês, além de exercícios extras.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">O que são lições de especialização VIP?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  São lições avançadas focadas em vocabulário técnico e situações profissionais
                  (Business Meeting, Stock Market, Scientific Research), disponíveis apenas para
                  assinantes VIP.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Como funciona o plano vitalício (1 ano e meio)?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  O plano VIP oferece acesso completo por 3 anos e meio (42 meses) com pagamento
                  único de R$ 1.062,00. Após esse período, você pode renovar com desconto especial.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Posso cancelar minha assinatura?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sim, você pode cancelar a qualquer momento. O plano Premium é mensal sem
                  fidelidade. O plano VIP é pagamento único vitalício (não reembolsável após 7
                  dias).
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Pronto para Começar?</h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a milhares de alunos aprendendo idiomas com IA avançada
          </p>
          <Link href="/dashboard">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Começar Agora - Grátis
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
