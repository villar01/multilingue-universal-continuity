import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Check, Loader2, QrCode } from "lucide-react";
import { toast } from "sonner";

// Preços em BRL — Mensal: R$59,90 | Anual: R$549,90 (≈ R$45,83/mês) | Vitalício: R$998,90 (1 ano e meio)
const PLANS = [
  {
    id: "monthly",
    name: "Premium Mensal",
    priceUSD: 59.90 / 5.7,
    normalPriceUSD: 59.90 / 5.7,
    price: 59.90,
    normalPrice: 59.90,
    description: "Acesso completo por 1 mês",
    features: [
      "Catálogo de 143 idiomas",
      "58 idiomas ativos agora · 85 em preparação",
      "Conteúdo curricular em expansão",
      "Conversão com IA ilimitada",
      "Análise de pronúncia em tempo real",
      "Exercícios personalizados por IA",
      "Seleção de professores virtuais",
      "Certificados de conclusão",
    ],
  },
  {
    id: "annual",
    name: "Premium Anual",
    priceUSD: 549.90 / 5.7,
    normalPriceUSD: 718.80 / 5.7,
    price: 549.90,
    normalPrice: 718.80,
    description: "12 meses — economize R$168,90 vs mensal",
    features: [
      "Catálogo de 143 idiomas",
      "58 idiomas ativos agora · 85 em preparação",
      "Conteúdo curricular em expansão",
      "Conversão com IA ilimitada",
      "Análise de pronúncia em tempo real",
      "Exercícios personalizados por IA",
      "Seleção de professores virtuais",
      "Certificados de conclusão",
      "🎁 Economize R$168,90/ano vs mensal",
      "🏆 Suporte VIP 24/7",
    ],
    badge: "Mais Popular",
  },
  {
    id: "lifetime",
    name: "Acesso de 18 meses",
    priceUSD: 998.90 / 5.7,
    normalPriceUSD: 1437.60 / 5.7,
    price: 998.90,
    normalPrice: 1437.60,
    description: "Acesso por 18 meses",
    features: [
      "Catálogo de 143 idiomas",
      "58 idiomas ativos agora · 85 em preparação",
      "Conteúdo curricular em expansão",
      "Conversão com IA ilimitada",
      "Análise de pronúncia em tempo real",
      "Exercícios personalizados por IA",
      "Seleção de professores virtuais",
      "Certificados ilimitados",
      "✨ Novos recursos gratuitos eternamente",
      "🎁 Equivale a 1 ano e meio · R$59,90×18 = R$1.078,20",
      "🏆 Suporte VIP prioritário",
      "👑 Acesso antecipado a novos recursos",
    ],
    badge: "Melhor Valor",
  },
];

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
  });
  const [qrCodeData, setQrCodeData] = useState<{
    qrCodeText: string;
    qrCodeImage: string;
    orderId: string;
  } | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const createOrderMutation = trpc.paymentPagBank.createPixOrder.useMutation();
  const { data: orderStatus, refetch: refetchStatus } = trpc.payment.checkPixStatus.useQuery(
    { orderId: qrCodeData?.orderId || "" },
    { enabled: false }
  );

  const handleCreateOrder = async () => {
    if (!selectedPlan) {
      toast.error("Selecione um plano");
      return;
    }

    if (!customerData.name || !customerData.email || !customerData.cpf || !customerData.phone) {
      toast.error("Preencha todos os dados");
      return;
    }

    try {
      const plan = PLANS.find((p) => p.id === selectedPlan);
      if (!plan) return;

      const result = await createOrderMutation.mutateAsync({
        plan: selectedPlan as "monthly" | "annual" | "lifetime",
        customerPhone: customerData.phone.replace(/\D/g, ""),
      });

      setQrCodeData({
        qrCodeText: result?.qrCodeText,
        qrCodeImage: result.qrCodeImage || "",
        orderId: result.orderId,
      });

      // Iniciar polling de status
      startPolling(result.orderId);
      toast.success("QR Code gerado! Escaneie para pagar");
    } catch (error) {
      toast.error("Erro ao gerar QR Code");
      console.error(error);
    }
  };

  const startPolling = async (orderId: string) => {
    setIsPolling(true);
    const interval = setInterval(async () => {
      const status = await refetchStatus();
      if (status.data?.status === "paid") {
        clearInterval(interval);
        setIsPolling(false);
        toast.success("🎉 Pagamento confirmado! Bem-vindo!");
        // Redirecionar para dashboard
        window.location.href = "/dashboard";
      }
    }, 3000); // Verificar a cada 3 segundos

    // Parar após 10 minutos
    setTimeout(() => {
      clearInterval(interval);
      setIsPolling(false);
    }, 600000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-bold mb-4 animate-pulse">
            🎉 Lançamento Especial: 50% OFF - Primeiros 500 Clientes
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Escolha Seu Plano
          </h1>
          <p className="text-gray-600 text-lg">
            Catálogo de 143 idiomas, com 58 ativos agora e 85 em preparação, além de professores virtuais
          </p>
          <p className="text-sm text-gray-500 mt-2">
            💳 Pagamento em BRL via PIX, Cartão ou Boleto | Preços em Reais Brasileiros
          </p>
        </div>

        {!qrCodeData ? (
          <>
            {/* Planos */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {PLANS.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? "ring-2 ring-blue-600 shadow-lg"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      {plan.badge}
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">
                          R$ {plan.price.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-gray-500">/mês</span>
                      </div>
                      {plan.normalPrice > plan.price && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm line-through text-gray-400">
                            R$ {plan.normalPrice.toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-sm font-bold text-green-600">
                            {Math.round((1 - plan.price / plan.normalPrice) * 100)}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Formulário */}
            {selectedPlan && (
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle>Dados para Pagamento</CardTitle>
                  <CardDescription>
                    Preencha seus dados para gerar o QR Code PIX
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={customerData.name}
                      onChange={(e) =>
                        setCustomerData({ ...customerData, name: e.target.value })
                      }
                      placeholder="João da Silva"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerData.email}
                      onChange={(e) =>
                        setCustomerData({ ...customerData, email: e.target.value })
                      }
                      placeholder="joao@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={customerData.cpf}
                      onChange={(e) =>
                        setCustomerData({ ...customerData, cpf: e.target.value })
                      }
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={customerData.phone}
                      onChange={(e) =>
                        setCustomerData({ ...customerData, phone: e.target.value })
                      }
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                    />
                  </div>
                  <Button
                    onClick={handleCreateOrder}
                    disabled={createOrderMutation.isPending}
                    className="w-full"
                    size="lg"
                  >
                    {createOrderMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Gerando QR Code...
                      </>
                    ) : (
                      <>
                        <QrCode className="h-4 w-4 mr-2" />
                        Gerar QR Code PIX
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          /* QR Code */
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Pague com PIX</CardTitle>
              <CardDescription className="text-center">
                Escaneie o QR Code ou copie o código
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={qrCodeData.qrCodeImage}
                  alt="QR Code PIX"
                  className="w-64 h-64"
                />
              </div>
              <div>
                <Label>Código PIX (Copia e Cola)</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={qrCodeData?.qrCodeText} readOnly className="text-xs" />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(qrCodeData?.qrCodeText || "");
                      toast.success("Código copiado!");
                    }}
                  >
                    Copiar
                  </Button>
                </div>
              </div>
              {isPolling && (
                <div className="text-center text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                  Aguardando confirmação do pagamento...
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
