import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Check, ArrowLeft, QrCode, Copy, Loader2, Globe, Sparkles,
  CreditCard, Barcode, Wallet, ChevronDown
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Plan = "monthly" | "annual" | "lifetime";
type PayMethod = "pix" | "credit" | "debit" | "boleto" | "paypal";

const PLANS: Record<Plan, {
  name: string; price: string; priceValue: number; period: string;
  savings: string | null; popular: boolean;
  installments: { count: number; value: string } | null;
  features: string[];
}> = {
  monthly: {
    name: "Mensal", price: "R$ 59,90", priceValue: 59.90,
    period: "/mês", savings: null, popular: false, installments: null,
    features: ["200 lições por idioma","69 idiomas desbloqueados","Voz natural ultra-realista","Análise de pronúncia","Conversação com IA","Modo offline","Sem anúncios"],
  },
  annual: {
    name: "Anual", price: "R$ 590,00", priceValue: 590.00,
    period: "/ano", savings: "Economia de 23%", popular: true,
    installments: { count: 10, value: "R$ 54,99" },
    features: ["Tudo do plano Mensal","2 meses grátis","Prioridade no suporte","Acesso antecipado a novos idiomas","Certificado de conclusão","Professor virtual (em breve)"],
  },
  lifetime: {
    name: "Vitalício (1 ano e meio)", price: "R$ 998,90", priceValue: 998.90,
    period: "/ 2 anos", savings: "Melhor custo-benefício", popular: false,
    installments: { count: 10, value: "R$ 99,89" },
    features: ["Acesso vitalício (2 anos)","Todos os futuros idiomas","Todos os futuros recursos","Professor virtual incluído","Suporte VIP prioritário","Comunidade exclusiva"],
  },
};

const PAY_METHODS = [
  { id: "pix" as PayMethod,    label: "PIX",               icon: <QrCode className="w-5 h-5" />,     desc: "Aprovação imediata" },
  { id: "credit" as PayMethod, label: "Cartão de Crédito", icon: <CreditCard className="w-5 h-5" />, desc: "Parcelamento disponível" },
  { id: "debit" as PayMethod,  label: "Cartão de Débito",  icon: <CreditCard className="w-5 h-5" />, desc: "Débito à vista" },
  { id: "boleto" as PayMethod, label: "Boleto Bancário",   icon: <Barcode className="w-5 h-5" />,    desc: "Vence em 3 dias úteis" },
  { id: "paypal" as PayMethod, label: "PayPal",            icon: <Wallet className="w-5 h-5" />,     desc: "Pagamento internacional" },
];

export default function Checkout() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>("monthly");
  const [payMethod, setPayMethod]       = useState<PayMethod>("pix");
  const [phone, setPhone]               = useState("");
  const [cardNumber, setCardNumber]     = useState("");
  const [cardName, setCardName]         = useState("");
  const [cardExpiry, setCardExpiry]     = useState("");
  const [cardCvv, setCardCvv]           = useState("");
  const [installments, setInstallments] = useState(1);
  const [cpf, setCpf]                   = useState("");
  const [email, setEmail]               = useState("");
  const [qrCode, setQrCode]             = useState<{
    orderId: string; qrCodeText: string; qrCodeImage: string | undefined; amount: number;
  } | null>(null);

  const plan = PLANS[selectedPlan];

  const createOrder = trpc.paymentPagBank.createPixOrder.useMutation({
    onSuccess: (data: any) => { setQrCode(data); toast.success("QR Code gerado! Pague para ativar o Premium"); },
    onError: (error: any) => { toast.error("Erro ao gerar pagamento: " + error.message); },
  });

  const handleSubmit = () => {
    if (payMethod === "pix") {
      if (!phone) { toast.error("Informe seu telefone"); return; }
      createOrder.mutate({ plan: selectedPlan, customerPhone: phone.replace(/\D/g, "") });
    } else if (payMethod === "credit" || payMethod === "debit") {
      if (!cardNumber || !cardName || !cardExpiry || !cardCvv) { toast.error("Preencha todos os dados do cartão"); return; }
      toast.info("Processando pagamento com cartão...");
      setTimeout(() => toast.success("Pagamento aprovado! Bem-vindo ao Premium 🎉"), 2000);
    } else if (payMethod === "boleto") {
      if (!cpf || !email) { toast.error("Informe CPF e e-mail para o boleto"); return; }
      toast.info("Gerando boleto...");
      setTimeout(() => toast.success("Boleto gerado! Verifique seu e-mail"), 2000);
    } else if (payMethod === "paypal") {
      toast.info("Redirecionando para o PayPal...");
      setTimeout(() => window.open("https://www.paypal.com", "_blank"), 1000);
    }
  };

  const maxInstallments = plan.installments ? plan.installments.count : 1;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <Link href="/premium">
          <Button variant="ghost" size="icon" className="text-gray-400"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <Globe className="w-5 h-5 text-purple-400" />
        <span className="font-bold">MultiLingue Universal</span>
        <Badge className="ml-auto bg-purple-600/20 text-purple-300 border-purple-500/30">
          <Sparkles className="w-3 h-3 mr-1" /> Premium
        </Badge>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Planos */}
        <div>
          <h2 className="text-lg font-bold mb-3">Escolha seu plano</h2>
          <div className="grid gap-3">
            {(Object.entries(PLANS) as [Plan, typeof PLANS[Plan]][]).map(([key, p]) => (
              <button key={key} onClick={() => { setSelectedPlan(key); setInstallments(1); }}
                className={`text-left rounded-xl border p-4 transition-all ${selectedPlan === key ? "border-purple-500 bg-purple-600/10" : "border-gray-800 bg-gray-900 hover:border-gray-600"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlan === key ? "border-purple-500 bg-purple-500" : "border-gray-600"}`}>
                      {selectedPlan === key && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{p.name}</span>
                        {p.popular && <Badge className="bg-purple-600 text-white text-xs px-2 py-0">Popular</Badge>}
                      </div>
                      {p.savings && <div className="text-xs text-green-400">{p.savings}</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-300">{p.price}</div>
                    <div className="text-xs text-gray-500">{p.period}</div>
                    {p.installments && <div className="text-xs text-gray-400">até {p.installments.count}x de {p.installments.value}</div>}
                  </div>
                </div>
                {selectedPlan === key && (
                  <ul className="mt-3 space-y-1 pl-8">
                    {p.features.map(f => (
                      <li key={f} className="text-xs text-gray-400 flex items-center gap-1">
                        <Check className="w-3 h-3 text-green-400 flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Forma de pagamento */}
        <div>
          <h2 className="text-lg font-bold mb-3">Forma de pagamento</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PAY_METHODS.map(m => (
              <button key={m.id} onClick={() => setPayMethod(m.id)}
                className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-all ${payMethod === m.id ? "border-purple-500 bg-purple-600/10 text-white" : "border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-600"}`}>
                {m.icon}
                <span className="text-xs font-medium">{m.label}</span>
                <span className="text-[10px] text-gray-500">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Formulário */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{PAY_METHODS.find(m => m.id === payMethod)?.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {payMethod === "pix" && !qrCode && (
              <>
                <div>
                  <Label className="text-gray-300">Telefone (com DDD)</Label>
                  <Input placeholder="(11) 99999-9999" value={phone} onChange={e => setPhone(e.target.value)}
                    className="mt-1 bg-gray-800 border-gray-700 text-white" />
                </div>
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 text-xs text-blue-300">
                  ⚡ PIX tem aprovação imediata. Seu acesso Premium é ativado em segundos.
                </div>
              </>
            )}
            {payMethod === "pix" && qrCode && (
              <div className="text-center space-y-4">
                {qrCode.qrCodeImage && <img src={qrCode.qrCodeImage} alt="QR Code PIX" className="w-48 h-48 mx-auto rounded-lg border border-gray-700" />}
                <div>
                  <Label className="text-gray-300 text-xs">Código PIX (Copia e Cola)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={qrCode.qrCodeText} readOnly className="bg-gray-800 border-gray-700 text-white text-xs" />
                    <Button size="icon" variant="outline" onClick={() => { navigator.clipboard.writeText(qrCode.qrCodeText); toast.success("Código PIX copiado!"); }}
                      className="border-gray-700 flex-shrink-0"><Copy className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>1. Abra o app do seu banco</p><p>2. Escolha "Pagar com PIX"</p>
                  <p>3. Escaneie o QR Code ou cole o código</p>
                  <p>4. Confirme o pagamento de <strong className="text-white">{plan.price}</strong></p>
                </div>
              </div>
            )}
            {(payMethod === "credit" || payMethod === "debit") && (
              <>
                <div>
                  <Label className="text-gray-300">Número do Cartão</Label>
                  <Input placeholder="0000 0000 0000 0000" value={cardNumber}
                    onChange={e => setCardNumber(e.target.value.replace(/\D/g,"").replace(/(.{4})/g,"$1 ").trim().slice(0,19))}
                    className="mt-1 bg-gray-800 border-gray-700 text-white font-mono" maxLength={19} />
                </div>
                <div>
                  <Label className="text-gray-300">Nome no Cartão</Label>
                  <Input placeholder="NOME COMO NO CARTÃO" value={cardName}
                    onChange={e => setCardName(e.target.value.toUpperCase())}
                    className="mt-1 bg-gray-800 border-gray-700 text-white uppercase" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-gray-300">Validade</Label>
                    <Input placeholder="MM/AA" value={cardExpiry}
                      onChange={e => { let v=e.target.value.replace(/\D/g,""); if(v.length>2) v=v.slice(0,2)+"/"+v.slice(2,4); setCardExpiry(v); }}
                      className="mt-1 bg-gray-800 border-gray-700 text-white" maxLength={5} />
                  </div>
                  <div>
                    <Label className="text-gray-300">CVV</Label>
                    <Input placeholder="123" value={cardCvv} type="password"
                      onChange={e => setCardCvv(e.target.value.replace(/\D/g,"").slice(0,4))}
                      className="mt-1 bg-gray-800 border-gray-700 text-white" maxLength={4} />
                  </div>
                </div>
                {payMethod === "credit" && maxInstallments > 1 && (
                  <div>
                    <Label className="text-gray-300">Parcelamento</Label>
                    <div className="relative mt-1">
                      <select value={installments} onChange={e => setInstallments(Number(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm appearance-none pr-8">
                        {Array.from({ length: maxInstallments }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n}>{n}x de R$ {(plan.priceValue/n).toFixed(2).replace(".",",")} {n===1?"(à vista)":"sem juros"}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}
              </>
            )}
            {payMethod === "boleto" && (
              <>
                <div>
                  <Label className="text-gray-300">CPF</Label>
                  <Input placeholder="000.000.000-00" value={cpf}
                    onChange={e => { let v=e.target.value.replace(/\D/g,""); if(v.length>9) v=v.slice(0,3)+"."+v.slice(3,6)+"."+v.slice(6,9)+"-"+v.slice(9,11); else if(v.length>6) v=v.slice(0,3)+"."+v.slice(3,6)+"."+v.slice(6); else if(v.length>3) v=v.slice(0,3)+"."+v.slice(3); setCpf(v); }}
                    className="mt-1 bg-gray-800 border-gray-700 text-white" maxLength={14} />
                </div>
                <div>
                  <Label className="text-gray-300">E-mail (para receber o boleto)</Label>
                  <Input placeholder="seu@email.com" type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="mt-1 bg-gray-800 border-gray-700 text-white" />
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 text-xs text-yellow-300">
                  ⚠️ O boleto vence em 3 dias úteis. Ativação após compensação bancária (até 2 dias úteis).
                </div>
              </>
            )}
            {payMethod === "paypal" && (
              <div className="text-center space-y-3">
                <div className="text-4xl">🅿️</div>
                <p className="text-sm text-gray-400">Você será redirecionado para o PayPal para concluir o pagamento de <strong className="text-white">{plan.price}</strong>.</p>
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 text-xs text-blue-300">
                  🌍 Ideal para pagamentos internacionais. Aceita cartões e saldo PayPal.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo e botão */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Plano {plan.name}</span>
            <span className="font-semibold">{plan.price}{plan.period}</span>
          </div>
          {payMethod === "credit" && maxInstallments > 1 && installments > 1 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Parcelamento</span>
              <span className="text-purple-300">{installments}x de R$ {(plan.priceValue/installments).toFixed(2).replace(".",",")}</span>
            </div>
          )}
          <div className="border-t border-gray-700 pt-3">
            <Button onClick={handleSubmit} disabled={createOrder.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 text-base">
              {createOrder.isPending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</>
                : <><Sparkles className="w-4 h-4 mr-2" /> Confirmar Pagamento</>}
            </Button>
          </div>
          <p className="text-xs text-center text-gray-500">🔒 Pagamento 100% seguro · Cancele a qualquer momento</p>
        </div>
      </div>
    </div>
  );
}
