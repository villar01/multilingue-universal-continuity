/**
 * PricingAssistencial — Planos com Descontos para Entidades Assistenciais
 * 
 * Incentivos fiscais federais aplicáveis:
 * - Lei Rouanet (Lei 8.313/91): até 100% de dedução IR para projetos culturais/educacionais
 * - PRONAS/PCD (Lei 12.715/12): 1% IR para entidades de assistência à pessoa com deficiência
 * - PRONON (Lei 12.715/12): 1% IR para entidades de prevenção e combate ao câncer
 * - PRONAC: dedução de até 80% do valor investido em projetos culturais
 * - OSCIP: isenção de COFINS, CSLL, PIS/PASEP para entidades qualificadas
 * - CEBAS (Certificado de Entidade Beneficente de Assistência Social): isenção de cota patronal INSS
 * - Imunidade tributária (CF art. 150, VI, c): IPTU, IPVA, IOF, IR para entidades sem fins lucrativos
 */
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check, Building2, Heart, GraduationCap, Users, Shield,
  FileText, Calculator, ChevronRight, Star, Zap, Globe,
  BookOpen, Award, Info, ExternalLink, Phone, Mail
} from "lucide-react";
import { toast } from "sonner";

// ── Preços base (BRL) ──
// Mensal: R$59 | Anual: R$590 (2 meses grátis) | Vitalício: R$1.062 (1 ano e meio = 18 meses)
const BASE_PRICES = {
  monthly: 59.00,
  annual: 590.00,
  lifetime: 1062.00,
};

// ── Categorias de entidades e seus descontos ──
const ENTITY_CATEGORIES = [
  {
    id: "ong_cebas",
    label: "ONG / OSCIP com CEBAS",
    icon: Heart,
    discount: 0.70,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    badge: "70% OFF",
    badgeColor: "bg-rose-500",
    description: "Entidades com Certificado de Entidade Beneficente de Assistência Social",
    incentivos: [
      "Isenção de cota patronal INSS (Lei 12.101/2009)",
      "Imunidade de COFINS, CSLL e PIS/PASEP",
      "Imunidade tributária CF art. 150, VI, c",
      "Dedução integral no IR da empresa patrocinadora",
    ],
    docs: ["CEBAS válido", "CNPJ ativo", "Estatuto social", "Ata de eleição da diretoria"],
  },
  {
    id: "escola_publica",
    label: "Escola Pública / Municipal",
    icon: GraduationCap,
    discount: 0.80,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "80% OFF",
    badgeColor: "bg-blue-600",
    description: "Escolas públicas municipais, estaduais e federais",
    incentivos: [
      "FNDE — Fundo Nacional de Desenvolvimento da Educação",
      "PDDE — Programa Dinheiro Direto na Escola",
      "PNLD — Programa Nacional do Livro Didático",
      "Imunidade tributária total (CF art. 150, VI, a)",
    ],
    docs: ["CNPJ da escola", "Declaração da Secretaria de Educação", "Ofício de solicitação"],
  },
  {
    id: "pronas_pcd",
    label: "Entidade PCD (PRONAS/PCD)",
    icon: Users,
    discount: 0.65,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    badge: "65% OFF",
    badgeColor: "bg-purple-600",
    description: "Entidades de assistência à pessoa com deficiência habilitadas no PRONAS/PCD",
    incentivos: [
      "PRONAS/PCD — Lei 12.715/2012 art. 3°",
      "Dedução de 1% do IR devido pela empresa patrocinadora",
      "Isenção de COFINS e PIS/PASEP",
      "CEBAS na área de assistência social",
    ],
    docs: ["Habilitação PRONAS/PCD (SAÚDE.GOV)", "CEBAS", "CNPJ", "Relatório de atividades"],
  },
  {
    id: "rouanet",
    label: "Projeto Cultural (Lei Rouanet)",
    icon: BookOpen,
    discount: 0.60,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "60% OFF",
    badgeColor: "bg-amber-500",
    description: "Projetos aprovados no PRONAC via Lei Rouanet (Lei 8.313/1991)",
    incentivos: [
      "Lei Rouanet — até 100% de dedução no IR",
      "PRONAC — Programa Nacional de Apoio à Cultura",
      "Mecenato: dedução de 80% (PJ) ou 60% (PF) do valor",
      "FNC — Fundo Nacional da Cultura",
    ],
    docs: ["Aprovação PRONAC (SALIC)", "CNPJ do proponente", "Plano de trabalho aprovado"],
  },
  {
    id: "santa_casa",
    label: "Santa Casa / Hospital Filantrópico",
    icon: Shield,
    discount: 0.75,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "75% OFF",
    badgeColor: "bg-green-600",
    description: "Hospitais filantrópicos, Santas Casas e entidades de saúde sem fins lucrativos",
    incentivos: [
      "PRONON — Lei 12.715/2012 (combate ao câncer)",
      "Isenção de cota patronal INSS via CEBAS Saúde",
      "Dedução de 1% do IR da empresa patrocinadora",
      "Imunidade de IPTU, IOF e tributos federais",
    ],
    docs: ["CEBAS Saúde", "Habilitação PRONON (se aplicável)", "CNPJ", "Relatório SUS"],
  },
  {
    id: "associacao",
    label: "Associação / Fundação",
    icon: Building2,
    discount: 0.50,
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-200",
    badge: "50% OFF",
    badgeColor: "bg-teal-600",
    description: "Associações e fundações sem fins lucrativos registradas",
    incentivos: [
      "Imunidade tributária CF art. 150, VI, c",
      "Isenção de IRPJ e CSLL (Lei 9.532/1997)",
      "Isenção de IOF em operações financeiras",
      "Possibilidade de qualificação como OSCIP",
    ],
    docs: ["CNPJ", "Estatuto social com cláusula de não distribuição de lucros", "Ata de eleição"],
  },
];

// ── Calculadora de economia ──
function calcularEconomia(plan: "monthly" | "annual" | "lifetime", discount: number) {
  const base = BASE_PRICES[plan];
  const comDesconto = base * (1 - discount);
  const economia = base - comDesconto;
  return { base, comDesconto, economia };
}

// ── Formatar CNPJ ──
function formatCNPJ(value: string) {
  const nums = value.replace(/\D/g, "").slice(0, 14);
  return nums
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export default function PricingAssistencial() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual" | "lifetime">("annual");
  const [cnpj, setCnpj] = useState("");
  const [entityName, setEntityName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("planos");

  const category = ENTITY_CATEGORIES.find((c) => c.id === selectedCategory);
  const economia = category ? calcularEconomia(selectedPlan, category.discount) : null;

  const handleSubmit = () => {
    if (!selectedCategory) { toast.error("Selecione o tipo de entidade"); return; }
    if (cnpj.replace(/\D/g, "").length < 14) { toast.error("CNPJ inválido"); return; }
    if (!entityName.trim()) { toast.error("Informe o nome da entidade"); return; }
    if (!contactEmail.includes("@")) { toast.error("E-mail inválido"); return; }
    setSubmitted(true);
    toast.success("Solicitação enviada! Retornaremos em até 2 dias úteis.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Globe className="w-7 h-7 text-blue-400" />
              <span className="text-xl font-bold text-white">MultiLingue Universal</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/pricing">
              <Button variant="ghost" className="text-white/70 hover:text-white text-sm">
                Planos Individuais
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
                Entrar no App
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Badge className="bg-green-500/20 text-green-300 border-green-500/30 mb-4 text-sm px-4 py-1">
          <Heart className="w-3.5 h-3.5 mr-1.5 inline" />
          Programa Social — Incentivos Fiscais Federais
        </Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
          Planos para<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
            Entidades Assistenciais
          </span>
        </h1>
        <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
          Descontos de até <strong className="text-white">80%</strong> para ONGs, escolas públicas, hospitais filantrópicos e
          entidades sem fins lucrativos — com base nos incentivos fiscais do Governo Federal Brasileiro.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-white/60">
          {["Lei Rouanet", "PRONAS/PCD", "PRONON", "CEBAS", "OSCIP", "FNDE"].map((item) => (
            <span key={item} className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Check className="w-3.5 h-3.5 text-green-400" /> {item}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/10 border border-white/20 mb-8 w-full max-w-lg mx-auto grid grid-cols-3">
            <TabsTrigger value="planos" className="text-white data-[state=active]:bg-blue-600">Planos</TabsTrigger>
            <TabsTrigger value="incentivos" className="text-white data-[state=active]:bg-blue-600">Incentivos Fiscais</TabsTrigger>
            <TabsTrigger value="solicitar" className="text-white data-[state=active]:bg-blue-600">Solicitar</TabsTrigger>
          </TabsList>

          {/* ── ABA: PLANOS ── */}
          <TabsContent value="planos">
            {/* Seletor de plano */}
            <div className="flex justify-center gap-3 mb-10">
              {(["monthly", "annual", "lifetime"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPlan(p)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                    selectedPlan === p
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25"
                      : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {p === "monthly" ? "Mensal" : p === "annual" ? "Anual ★" : "Vitalício (1 ano e meio)"}
                  {p === "annual" && (
                    <span className="ml-1.5 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">-17%</span>
                  )}
                </button>
              ))}
            </div>

            {/* Grid de categorias */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {ENTITY_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const eco = calcularEconomia(selectedPlan, cat.discount);
                const isSelected = selectedCategory === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200 ${
                      isSelected
                        ? "border-blue-400 bg-blue-900/40 shadow-lg shadow-blue-500/20"
                        : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <Badge className={`${cat.badgeColor} text-white text-xs mb-3 font-bold`}>
                      {cat.badge}
                    </Badge>
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${cat.bg}`}>
                        <Icon className={`w-5 h-5 ${cat.color}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm leading-tight">{cat.label}</h3>
                        <p className="text-white/50 text-xs mt-0.5">{cat.description}</p>
                      </div>
                    </div>
                    <div className="border-t border-white/10 pt-3 mt-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-white">
                          R$ {eco.comDesconto.toFixed(2).replace(".", ",")}
                        </span>
                        <span className="text-white/40 text-sm line-through">
                          R$ {eco.base.toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                      <p className="text-green-400 text-xs font-semibold mt-0.5">
                        Economia de R$ {eco.economia.toFixed(2).replace(".", ",")}
                        {selectedPlan === "monthly" ? "/mês" : selectedPlan === "annual" ? "/ano" : ""}
                      </p>
                    </div>
                    <ul className="mt-3 space-y-1">
                      {cat.incentivos.slice(0, 2).map((inc, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-white/60">
                          <Check className="w-3 h-3 text-green-400 mt-0.5 shrink-0" />
                          {inc}
                        </li>
                      ))}
                    </ul>
                    {isSelected && (
                      <Button
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                        onClick={() => setActiveTab("solicitar")}
                      >
                        Solicitar Desconto <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Nota legal */}
            <div className="mt-10 bg-white/5 border border-white/10 rounded-xl p-5 flex gap-3">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm text-white/60 space-y-1">
                <p><strong className="text-white/80">Base legal dos descontos:</strong> Os percentuais de desconto refletem a redução de custos operacionais proporcionada pelos incentivos fiscais federais. Entidades qualificadas podem ter até 100% do investimento deduzido do IR devido (Lei Rouanet), ou isenção de encargos trabalhistas (CEBAS), reduzindo o custo real do serviço.</p>
                <p>Os descontos são aplicados mediante comprovação de qualificação. Documentação analisada em até 2 dias úteis.</p>
              </div>
            </div>
          </TabsContent>

          {/* ── ABA: INCENTIVOS FISCAIS ── */}
          <TabsContent value="incentivos">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Lei Rouanet (Lei 8.313/1991)",
                  icon: BookOpen, color: "text-amber-400", bg: "bg-amber-500/10",
                  desc: "Principal lei de incentivo à cultura no Brasil. Permite que empresas e pessoas físicas deduzam do IR valores investidos em projetos culturais aprovados pelo MinC.",
                  beneficios: [
                    "PJ: dedução de até 80% do valor patrocinado",
                    "PF: dedução de até 60% do valor patrocinado",
                    "Projetos educacionais e de línguas se enquadram",
                    "Aprovação via SALIC (salic.cultura.gov.br)",
                  ],
                  link: "https://www.gov.br/turismo/pt-br/assuntos/cultura/lei-rouanet",
                },
                {
                  title: "PRONAS/PCD (Lei 12.715/2012)",
                  icon: Users, color: "text-purple-400", bg: "bg-purple-500/10",
                  desc: "Programa Nacional de Apoio à Atenção da Saúde da Pessoa com Deficiência. Permite dedução de 1% do IR para empresas que patrocinam entidades habilitadas.",
                  beneficios: [
                    "Dedução de 1% do IR devido pela empresa",
                    "Entidades habilitadas pelo Ministério da Saúde",
                    "Ensino de idiomas para PCD se enquadra",
                    "Habilitação via saude.gov.br/pronas-pcd",
                  ],
                  link: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/p/pronas-pcd",
                },
                {
                  title: "CEBAS — Certificado de Entidade Beneficente",
                  icon: Award, color: "text-green-400", bg: "bg-green-500/10",
                  desc: "Certificado que garante isenção de contribuições sociais (COFINS, CSLL, PIS/PASEP) e da cota patronal do INSS para entidades de assistência social, saúde e educação.",
                  beneficios: [
                    "Isenção de cota patronal INSS (20% sobre folha)",
                    "Isenção de COFINS, CSLL e PIS/PASEP",
                    "Redução de até 35% nos custos operacionais",
                    "Renovação a cada 3 anos pelo MEC/MS/MDS",
                  ],
                  link: "https://www.gov.br/mec/pt-br/assuntos/cebas",
                },
                {
                  title: "OSCIP — Organização da Sociedade Civil de Interesse Público",
                  icon: Heart, color: "text-rose-400", bg: "bg-rose-500/10",
                  desc: "Qualificação que permite às ONGs celebrar Termos de Parceria com o Poder Público e receber recursos públicos com maior transparência e controle.",
                  beneficios: [
                    "Isenção de IRPJ, CSLL, COFINS e PIS/PASEP",
                    "Acesso a recursos públicos via Termo de Parceria",
                    "Possibilidade de receber doações dedutíveis do IR",
                    "Qualificação pelo Ministério da Justiça",
                  ],
                  link: "https://www.gov.br/mj/pt-br/assuntos/sua-organizacao/sociedade-civil/oscip",
                },
                {
                  title: "FNDE — Fundo Nacional de Desenvolvimento da Educação",
                  icon: GraduationCap, color: "text-blue-400", bg: "bg-blue-500/10",
                  desc: "Escolas públicas podem acessar recursos do FNDE para aquisição de tecnologias educacionais, incluindo plataformas de ensino de idiomas.",
                  beneficios: [
                    "PDDE — Programa Dinheiro Direto na Escola",
                    "PNLD — Programa Nacional do Livro Didático",
                    "Recursos para tecnologia educacional",
                    "Acesso via fnde.gov.br",
                  ],
                  link: "https://www.fnde.gov.br",
                },
                {
                  title: "Imunidade Tributária (CF art. 150, VI)",
                  icon: Shield, color: "text-teal-400", bg: "bg-teal-500/10",
                  desc: "A Constituição Federal garante imunidade de impostos para entidades sem fins lucrativos que atendam aos requisitos do art. 14 do CTN.",
                  beneficios: [
                    "Imunidade de IPTU, IPVA, IOF, IR",
                    "Não distribuição de patrimônio ou renda",
                    "Aplicação integral dos recursos no país",
                    "Escrituração contábil regular obrigatória",
                  ],
                  link: "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className={`rounded-2xl border border-white/10 p-6 ${item.bg}`}>
                    <div className="flex items-start gap-3 mb-4">
                      <Icon className={`w-6 h-6 ${item.color} shrink-0 mt-0.5`} />
                      <div>
                        <h3 className="font-bold text-white">{item.title}</h3>
                        <p className="text-white/60 text-sm mt-1">{item.desc}</p>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {item.beneficios.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                          <Check className={`w-4 h-4 ${item.color} shrink-0 mt-0.5`} />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 text-xs ${item.color} hover:underline`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Saiba mais no portal do Governo Federal
                    </a>
                  </div>
                );
              })}
            </div>

            {/* Calculadora de economia */}
            <div className="mt-8 bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-green-400" />
                <h3 className="font-bold text-white text-lg">Calculadora de Economia</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ENTITY_CATEGORIES.map((cat) => {
                  const eco = calcularEconomia("annual", cat.discount);
                  return (
                    <div key={cat.id} className="bg-white/5 rounded-xl p-4">
                      <p className="text-white/60 text-xs mb-1">{cat.label}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-white">
                          R$ {eco.comDesconto.toFixed(2).replace(".", ",")}
                        </span>
                        <span className="text-white/30 text-sm line-through">
                          R$ {eco.base.toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                      <p className="text-green-400 text-xs mt-0.5">
                        Economia: R$ {eco.economia.toFixed(2).replace(".", ",")} /ano
                      </p>
                      <Badge className={`${cat.badgeColor} text-white text-xs mt-2`}>{cat.badge}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* ── ABA: SOLICITAR ── */}
          <TabsContent value="solicitar">
            {submitted ? (
              <div className="max-w-lg mx-auto text-center py-16">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Solicitação Enviada!</h2>
                <p className="text-white/60 mb-6">
                  Nossa equipe analisará a documentação e retornará em até <strong className="text-white">2 dias úteis</strong> com o link de ativação do desconto.
                </p>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left mb-6">
                  <p className="text-white/60 text-sm"><strong className="text-white">Entidade:</strong> {entityName}</p>
                  <p className="text-white/60 text-sm"><strong className="text-white">CNPJ:</strong> {cnpj}</p>
                  <p className="text-white/60 text-sm"><strong className="text-white">Tipo:</strong> {category?.label}</p>
                  <p className="text-white/60 text-sm"><strong className="text-white">Desconto:</strong> {category?.badge}</p>
                  <p className="text-white/60 text-sm"><strong className="text-white">Plano:</strong> {selectedPlan === "monthly" ? "Mensal" : selectedPlan === "annual" ? "Anual" : "Vitalício"}</p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => setSubmitted(false)}
                  >
                    Nova Solicitação
                  </Button>
                  <Link href="/dashboard">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Acessar o App
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Solicitar Desconto Assistencial</h2>
                  <p className="text-white/60 text-sm mb-6">
                    Preencha o formulário abaixo. Nossa equipe verificará os dados e ativará o desconto em até 2 dias úteis.
                  </p>

                  <div className="space-y-5">
                    {/* Tipo de entidade */}
                    <div>
                      <Label className="text-white/80 text-sm mb-2 block">Tipo de Entidade *</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {ENTITY_CATEGORIES.map((cat) => {
                          const Icon = cat.icon;
                          return (
                            <button
                              key={cat.id}
                              onClick={() => setSelectedCategory(cat.id)}
                              className={`flex items-center gap-2 p-3 rounded-xl border text-left text-sm transition-all ${
                                selectedCategory === cat.id
                                  ? "border-blue-400 bg-blue-900/40 text-white"
                                  : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                              }`}
                            >
                              <Icon className={`w-4 h-4 ${cat.color} shrink-0`} />
                              <span className="leading-tight">{cat.label}</span>
                              {selectedCategory === cat.id && (
                                <Badge className={`${cat.badgeColor} text-white text-xs ml-auto shrink-0`}>{cat.badge}</Badge>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Plano */}
                    <div>
                      <Label className="text-white/80 text-sm mb-2 block">Plano Desejado *</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["monthly", "annual", "lifetime"] as const).map((p) => {
                          const eco = category ? calcularEconomia(p, category.discount) : null;
                          return (
                            <button
                              key={p}
                              onClick={() => setSelectedPlan(p)}
                              className={`p-3 rounded-xl border text-sm transition-all ${
                                selectedPlan === p
                                  ? "border-blue-400 bg-blue-900/40 text-white"
                                  : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                              }`}
                            >
                              <div className="font-semibold">
                                {p === "monthly" ? "Mensal" : p === "annual" ? "Anual" : "Vitalício"}
                              </div>
                              {eco && (
                                <div className="text-xs text-green-400 mt-0.5">
                                  R$ {eco.comDesconto.toFixed(2).replace(".", ",")}
                                </div>
                              )}
                              {!eco && (
                                <div className="text-xs text-white/40 mt-0.5">
                                  R$ {BASE_PRICES[p].toFixed(2).replace(".", ",")}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* CNPJ */}
                    <div>
                      <Label className="text-white/80 text-sm mb-1 block">CNPJ da Entidade *</Label>
                      <Input
                        value={cnpj}
                        onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                        placeholder="00.000.000/0000-00"
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                        maxLength={18}
                      />
                    </div>

                    {/* Nome da entidade */}
                    <div>
                      <Label className="text-white/80 text-sm mb-1 block">Nome da Entidade *</Label>
                      <Input
                        value={entityName}
                        onChange={(e) => setEntityName(e.target.value)}
                        placeholder="Ex: Associação Beneficente Esperança"
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                      />
                    </div>

                    {/* E-mail */}
                    <div>
                      <Label className="text-white/80 text-sm mb-1 block">E-mail de Contato *</Label>
                      <Input
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="contato@entidade.org.br"
                        type="email"
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                      />
                    </div>

                    {/* Documentos necessários */}
                    {category && (
                      <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4">
                        <p className="text-blue-300 text-sm font-semibold mb-2 flex items-center gap-1.5">
                          <FileText className="w-4 h-4" /> Documentos necessários para {category.label}:
                        </p>
                        <ul className="space-y-1">
                          {category.docs.map((doc, i) => (
                            <li key={i} className="text-white/60 text-sm flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" /> {doc}
                            </li>
                          ))}
                        </ul>
                        <p className="text-white/40 text-xs mt-2">
                          Envie os documentos digitalizados para: <strong className="text-blue-300">social@multilingue.app</strong>
                        </p>
                      </div>
                    )}

                    {/* Resumo do desconto */}
                    {category && economia && (
                      <div className="bg-green-900/20 border border-green-500/20 rounded-xl p-4">
                        <p className="text-green-300 font-bold text-lg">
                          Você pagará: R$ {economia.comDesconto.toFixed(2).replace(".", ",")}
                          {selectedPlan === "monthly" ? "/mês" : selectedPlan === "annual" ? "/ano" : " único"}
                        </p>
                        <p className="text-white/60 text-sm">
                          Desconto de {Math.round(category.discount * 100)}% aplicado via {category.label}
                          {" "}— Economia de <strong className="text-green-400">R$ {economia.economia.toFixed(2).replace(".", ",")}</strong>
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={handleSubmit}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 text-base"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Enviar Solicitação de Desconto
                    </Button>
                  </div>
                </div>

                {/* Contato */}
                <div className="mt-6 flex flex-col sm:flex-row gap-4 text-center">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-400 shrink-0" />
                    <div className="text-left">
                      <p className="text-white/40 text-xs">E-mail</p>
                      <p className="text-white text-sm font-medium">social@multilingue.app</p>
                    </div>
                  </div>
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                    <Phone className="w-5 h-5 text-green-400 shrink-0" />
                    <div className="text-left">
                      <p className="text-white/40 text-xs">WhatsApp</p>
                      <p className="text-white text-sm font-medium">(11) 99999-0000</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
