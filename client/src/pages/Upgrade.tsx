import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, TrendingUp, Microscope, Briefcase } from "lucide-react";

export default function Upgrade() {
  const { data: products } = trpc.vipAccess.listProducts.useQuery();
  const { data: stats } = trpc.vipAccess.getUpgradeStats.useQuery();
  const createCheckout = trpc.vipAccess.createCheckoutSession.useMutation();

  const handleUpgrade = async (productKey: string) => {
    const result = await createCheckout.mutateAsync({
      productKey: productKey as any,
    });
    
    if (result.url) {
      window.open(result.url, "_blank");
    }
  };

  const premiumMonthly = products?.find(p => p.key === "premium_monthly");
  const premiumAnnual = products?.find(p => p.key === "premium_annual");
  const vipMonthly = products?.find(p => p.key === "vip_monthly");
  const vipAnnual = products?.find(p => p.key === "vip_annual");

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 py-12 px-4">
      <div className="container max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Desbloqueie Todo o Potencial</h1>
          <p className="text-xl text-muted-foreground">
            Escolha o plano perfeito para sua jornada de aprendizado
          </p>
          
          {stats && stats.currentTier !== "free" && (
            <div className="mt-4 inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full">
              Plano atual: <strong>{stats.currentTier.toUpperCase()}</strong>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Premium Plan */}
          <Card className="border-2 border-orange-200 hover:border-orange-400 transition-all">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-orange-500" />
                <CardTitle className="text-2xl">Premium</CardTitle>
              </div>
              <CardDescription>
                Acesso total a lições gerais em 69 idiomas
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="mb-6">
                <div className="text-3xl font-bold mb-2">
                  R$ 59,00<span className="text-lg font-normal text-muted-foreground">/mês</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  ou R$ 31,93/mês no plano anual (economize 20%)
                </div>
              </div>

              <ul className="space-y-3">
                {premiumMonthly?.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="flex-col gap-3">
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600"
                size="lg"
                onClick={() => handleUpgrade("premium_monthly")}
                disabled={createCheckout.isPending || stats?.currentTier === "vip"}
              >
                {stats?.currentTier === "vip" ? "Plano Inferior" : "Assinar Mensal"}
              </Button>
              
              <Button
                variant="outline"
                className="w-full border-orange-300 hover:bg-orange-50"
                onClick={() => handleUpgrade("premium_annual")}
                disabled={createCheckout.isPending || stats?.currentTier === "vip"}
              >
                Assinar Anual (Economize 20%)
              </Button>
            </CardFooter>
          </Card>

          {/* VIP Plan */}
          <Card className="border-2 border-purple-300 hover:border-purple-500 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-br from-purple-500 to-pink-500 text-white px-4 py-1 text-sm font-bold">
              MAIS POPULAR
            </div>
            
            <CardHeader className="pt-8">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-purple-500" />
                <CardTitle className="text-2xl">VIP</CardTitle>
              </div>
              <CardDescription>
                Premium + Especializações Profissionais
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="mb-6">
                <div className="text-3xl font-bold mb-2">
                  R$ 99,90<span className="text-lg font-normal text-muted-foreground">/mês</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  ou R$ 79,92/mês no plano anual (economize 20%)
                </div>
              </div>

              <ul className="space-y-3">
                {vipMonthly?.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="flex-col gap-3">
              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                size="lg"
                onClick={() => handleUpgrade("vip_monthly")}
                disabled={createCheckout.isPending || stats?.currentTier === "vip"}
              >
                {stats?.currentTier === "vip" ? "Plano Atual" : "Assinar Mensal VIP"}
              </Button>
              
              <Button
                variant="outline"
                className="w-full border-purple-300 hover:bg-purple-50"
                onClick={() => handleUpgrade("vip_annual")}
                disabled={createCheckout.isPending || stats?.currentTier === "vip"}
              >
                Assinar Anual VIP (Economize 20%)
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Especializações VIP */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Especializações Profissionais (Exclusivo VIP)
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 text-center">
              <Briefcase className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Negócios</h3>
              <p className="text-sm text-muted-foreground">
                Reuniões, apresentações, e-mails corporativos, networking internacional
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center">
              <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Trading & Finanças</h3>
              <p className="text-sm text-muted-foreground">
                Terminologia financeira, análise técnica, relatórios, mercado global
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center">
              <Microscope className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Científico</h3>
              <p className="text-sm text-muted-foreground">
                Artigos acadêmicos, terminologia técnica, pesquisa, publicações
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            💳 Pagamento seguro via Stripe • 🔒 Cancele a qualquer momento • 
            ✨ Teste com cartão 4242 4242 4242 4242
          </p>
        </div>
      </div>
    </div>
  );
}
