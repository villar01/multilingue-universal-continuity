/**
 * ═══════════════════════════════════════════════════════════════════
 * client/src/pages/SubscriptionPlans.tsx
 * Página de Planos de Assinatura — MultiLingue Universal
 * Preços: R$59,90/mês | R$549,90/ano | R$998,90 vitalício (2 anos)
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Star, Infinity, Shield } from "lucide-react";

interface Plan {
  id: "monthly" | "annual" | "lifetime";
  name: string;
  price: number;
  normalPrice?: number;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  badge?: string;
  cta: string;
  savings?: string;
}

const PLANS: Plan[] = [
  {
    id: "monthly",
    name: "Mensal",
    price: 59.90,
    period: "/mês",
    description: "Acesso completo por 1 mês",
    features: [
      "Catálogo de 143 idiomas",
      "58 idiomas ativos agora · 85 em preparação",
      "Conteúdo curricular em expansão",
      "Cenas Imersivas em AR",
      "Professor em AR (AR Teacher)",
      "Conversação Livre com IA",
      "Certificados internacionais",
      "Suporte prioritário",
    ],
    highlighted: false,
    cta: "Assinar Mensal",
  },
  {
    id: "annual",
    name: "Anual",
    price: 549.90,
    normalPrice: 718.80,
    period: "/ano",
    description: "Economize R$ 168,90 em relação ao mensal",
    features: [
      "Tudo do plano Mensal",
      "Economia de R$ 168,90/ano",
      "Catálogo de 143 idiomas",
      "58 idiomas ativos agora · 85 em preparação",
      "Conteúdo curricular em expansão",
      "Cenas Imersivas em AR",
      "Professor em AR (AR Teacher)",
      "Conversação Livre com IA",
      "Certificados internacionais",
      "Suporte prioritário 24/7",
    ],
    highlighted: true,
    badge: "MAIS POPULAR",
    cta: "Assinar Anual",
    savings: "Economize R$ 168,90",
  },
  {
    id: "lifetime",
    name: "Acesso de 2 anos",
    price: 998.90,
    normalPrice: 1437.60,
    period: " único",
    description: "2 anos — pague uma vez, parcelado em 10x",
    features: [
      "Tudo do plano Anual",
      "Acesso por 2 anos sem mensalidades",
      "Parcelado em 10x R$ 99,89",
      "Catálogo de 143 idiomas",
      "58 idiomas ativos agora · 85 em preparação",
      "Conteúdo curricular em expansão",
      "Todas as funcionalidades futuras",
      "Suporte VIP vitalício",
    ],
    highlighted: false,
    badge: "MELHOR VALOR",
    cta: "Comprar acesso de 2 anos",
    savings: "Economize R$ 438,70",
  },
];

export default function SubscriptionPlans() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    try {
      const response = await fetch("/api/trpc/stripe.createCheckout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await response.json();
      if (data?.result?.data?.checkoutUrl) {
        window.location.href = data.result.data.checkoutUrl;
      }
    } catch (error) {
      console.error("Erro ao criar sessão de checkout:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 py-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <Link href="/pricing">
          <button className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Voltar</span>
          </button>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-1.5 mb-4">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-purple-300 text-sm font-medium">Plataforma #1 em Idiomas com IA</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Escolha Seu Plano
          </h1>
          <p className="text-white/60 text-lg">
            Aprenda em 58 idiomas ativos agora, dentro de um catálogo de 143 idiomas com IA avançada, AR e voz neural
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative transition-transform ${plan.highlighted ? "md:-translate-y-2" : ""}`}
            >
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1 rounded-full text-xs font-bold ${
                  plan.highlighted ? "bg-purple-500 text-white" : "bg-yellow-500 text-slate-900"
                }`}>
                  {plan.badge}
                </div>
              )}
              <Card className={`h-full ${
                plan.highlighted
                  ? "border-2 border-purple-500 bg-gradient-to-br from-purple-900/50 to-indigo-900/50"
                  : "border border-white/10 bg-white/5"
              }`}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                  <p className="text-white/50 text-sm">{plan.description}</p>
                </CardHeader>

                <CardContent>
                  {/* Preço */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-white/60 text-lg">R$</span>
                      <span className="text-4xl font-bold text-white">
                        {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-white/50 text-sm">{plan.period}</span>
                    </div>
                    {plan.normalPrice && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-white/30 text-sm line-through">
                          R$ {plan.normalPrice.toLocaleString('pt-BR')}
                        </span>
                        {plan.savings && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            {plan.savings}
                          </Badge>
                        )}
                      </div>
                    )}
                    {plan.id === "lifetime" && (
                      <div className="flex items-center gap-1 mt-2 text-yellow-400 text-xs">
                        <Infinity className="h-3 w-3" />
                        <span>Acesso por 2 anos completos</span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading === plan.id}
                    className={`w-full mb-6 font-semibold ${
                      plan.highlighted
                        ? "bg-purple-600 hover:bg-purple-500 text-white"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    }`}
                  >
                    {loading === plan.id ? "Processando..." : plan.cta}
                  </Button>

                  {/* Features */}
                  <div className="space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-white/70 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Garantia */}
        <div className="flex items-center justify-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-8">
          <Shield className="h-5 w-5 text-green-400 flex-shrink-0" />
          <div>
            <p className="text-green-300 font-semibold text-sm">Garantia de 30 dias de devolução do dinheiro</p>
            <p className="text-green-400/70 text-xs">Não gostou? Devolvemos 100% do seu dinheiro, sem perguntas.</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Perguntas Frequentes</h2>
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold text-white mb-1 text-sm">O plano Vitalício dura quanto tempo?</h3>
              <p className="text-white/60 text-sm">O plano Vitalício dá acesso por 2 anos completos. Você paga uma única vez (R$ 998,90 ou 10x R$ 99,89) e tem acesso a todos os recursos, incluindo atualizações futuras durante o período.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1 text-sm">Posso cancelar a assinatura mensal ou anual?</h3>
              <p className="text-white/60 text-sm">Sim, você pode cancelar a qualquer momento. Seu acesso continua até o final do período pago.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1 text-sm">Existe desconto para ONGs e escolas públicas?</h3>
              <p className="text-white/60 text-sm">Sim! Oferecemos até 80% de desconto para entidades assistenciais via Lei Rouanet, PRONAS/PCD, PRONON, CEBAS, OSCIP e FNDE. <Link href="/pricing-assistencial"><span className="text-purple-400 underline cursor-pointer">Saiba mais →</span></Link></p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1 text-sm">Quantos idiomas posso aprender?</h3>
              <p className="text-white/60 text-sm">Todos os planos incluem acesso a 69 idiomas com 200 lições cada, cenas imersivas em AR e professor virtual nativo.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
