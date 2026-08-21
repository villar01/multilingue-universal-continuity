import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Shield, AlertTriangle, CheckCircle, Globe, Users, Lock, Heart } from "lucide-react";

const TERMS_VERSION = "1.0";

export default function TermsOfUse() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();

  // Steps: age → terms → (if minor) parental → done
  const [step, setStep] = useState<"age" | "terms" | "parental" | "done">("age");
  const [isMinor, setIsMinor] = useState(false);
  const [isUnder12, setIsUnder12] = useState(false);
  const [userAge, setUserAge] = useState("");

  // Aceites de termos
  const [checks, setChecks] = useState({
    moralConduct: false,
    noDiscrimination: false,
    noAbuse: false,
    legalCompliance: false,
    ageVerification: false,
    allTerms: false,
  });

  // Dados do responsável (menor)
  const [guardian, setGuardian] = useState<{
    name: string;
    document: string;
    email: string;
    relationship: "pai" | "mae" | "responsavel" | "tutor";
    confirmedTerms: boolean;
    confirmedMoral: boolean;
    confirmedParental: boolean;
    confirmedLegal: boolean;
  }>({
    name: "",
    document: "",
    email: "",
    relationship: "pai" as const,
    confirmedTerms: false,
    confirmedMoral: false,
    confirmedParental: false,
    confirmedLegal: false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const acceptTerms = trpc.compliance.acceptTerms.useMutation();
  const submitParental = trpc.compliance.submitParentalConsent.useMutation();

  const allChecked = Object.values(checks).every(Boolean);
  const allGuardianChecked = guardian.confirmedTerms && guardian.confirmedMoral && guardian.confirmedParental && guardian.confirmedLegal;
  const guardianDataFilled = guardian.name.trim().length >= 3 && guardian.relationship;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = getLoginUrl();
    }
  }, [user, loading]);

  const [showMinorWarning, setShowMinorWarning] = useState(false);

  const handleAgeSubmit = () => {
    const age = parseInt(userAge);
    if (!age || age < 5 || age > 120) {
      setError("Por favor, informe uma idade válida.");
      return;
    }
    setError("");
    setIsMinor(age < 18);
    setIsUnder12(age < 12);
    if (age < 18) {
      // Show blocking warning before proceeding
      setShowMinorWarning(true);
    } else {
      setStep("terms");
    }
  };

  const handleMinorWarningConfirm = () => {
    setShowMinorWarning(false);
    setStep("terms");
  };

  const handleTermsAccept = async () => {
    if (!allChecked) return;
    setSaving(true);
    setError("");
    try {
      await acceptTerms.mutateAsync({
        termsVersion: TERMS_VERSION,
        confirmedMoralConduct: checks.moralConduct,
        confirmedNoDiscrimination: checks.noDiscrimination,
        confirmedNoAbuse: checks.noAbuse,
        confirmedLegalCompliance: checks.legalCompliance,
        confirmedAgeVerification: checks.ageVerification,
      });
      if (isMinor) {
        setStep("parental");
      } else {
        setStep("done");
        setTimeout(() => setLocation("/onboarding"), 1500);
      }
    } catch {
      setError("Erro ao salvar aceite. Verifique sua conexão e tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleParentalSubmit = async () => {
    if (!allGuardianChecked || !guardianDataFilled) return;
    setSaving(true);
    setError("");
    try {
      await submitParental.mutateAsync({
        guardianName: guardian.name,
        guardianDocument: guardian.document,
        guardianEmail: guardian.email,
        relationship: guardian.relationship,
        confirmedTerms: guardian.confirmedTerms,
        confirmedMoralConduct: guardian.confirmedMoral,
        confirmedParentalControl: guardian.confirmedParental,
        confirmedLegalCompliance: guardian.confirmedLegal,
        userAge: parseInt(userAge),
      });
      setStep("done");
      setTimeout(() => setLocation("/onboarding"), 1500);
    } catch {
      setError("Erro ao salvar autorização. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key: keyof typeof checks) => setChecks(p => ({ ...p, [key]: !p[key] }));
  const toggleGuardian = (key: "confirmedTerms" | "confirmedMoral" | "confirmedParental" | "confirmedLegal") =>
    setGuardian(p => ({ ...p, [key]: !p[key] }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center">
        <div className="text-white/50 text-sm">Verificando autenticação...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex flex-col items-center justify-start px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-9 w-9 text-purple-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">MultiLingue Universal</h1>
          <p className="text-white/50 text-xs">Plataforma Educacional Segura e Ética</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {["age", "terms", "privacy", ...(isMinor ? ["parental"] : []), "done"].map((s, i) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all ${
              step === s ? "w-12 bg-purple-400" :
              ["age", "terms", "privacy", "parental", "done"].indexOf(step) > i ? "w-8 bg-purple-600" : "w-8 bg-white/20"
            }`}
          />
        ))}
      </div>

      <div className="w-full max-w-2xl">

        {/* STEP 1: IDADE */}
        {step === "age" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Verificação de Idade</h2>
            </div>
            <p className="text-white/70 mb-6 text-sm leading-relaxed">
              Para garantir a segurança de todos os usuários, precisamos verificar sua idade. <strong className="text-yellow-300">Se você tiver menos de 18 anos, o cadastro só será aceito com identificação do pai, mãe ou responsável legal.</strong>
            </p>
            <div className="mb-6">
              <label className="text-white/80 text-sm font-medium block mb-2">Qual é a sua idade?</label>
              <input
                type="number"
                min="5"
                max="120"
                value={userAge}
                onChange={e => setUserAge(e.target.value)}
                placeholder="Ex: 25"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 text-lg"
              />
            </div>
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <button
              onClick={handleAgeSubmit}
              disabled={!userAge}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-all"
            >
              Continuar
            </button>
          </div>
        )}

        {/* BLOCKING MODAL: MENOR DE 18 ANOS */}
        {showMinorWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gradient-to-br from-red-900 to-red-800 border-2 border-red-400 rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🚨</div>
                <h2 className="text-2xl font-extrabold text-white mb-2">ATENÇÃO!</h2>
                <p className="text-red-200 text-sm">Menor de 18 anos detectado</p>
              </div>
              <div className="bg-red-950/60 border border-red-400/40 rounded-2xl p-5 mb-6">
                <p className="text-white font-bold text-base leading-relaxed mb-3">
                  O cadastro de menores de 18 anos <span className="text-yellow-300 underline">só é aceito após a autorização de pai, mãe ou responsável legal</span>.
                </p>
                <ul className="text-red-200 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold mt-0.5">⚠️</span>
                    <span>O responsável confirma nome, vínculo e os termos aplicáveis à conta do menor.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold mt-0.5">⚠️</span>
                    <span>O cadastro <strong>não será concluído</strong> sem a autorização formal do responsável.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold mt-0.5">⚠️</span>
                    <span>As informações devem ser verdadeiras e podem ser revisadas pelo responsável a qualquer momento.</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleMinorWarningConfirm}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold py-4 rounded-2xl transition-all text-base"
                >
                  👨‍👩‍👧 Estou com meu responsável — Continuar
                </button>
                <button
                  onClick={() => setShowMinorWarning(false)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-2xl transition-all text-sm"
                >
                  Voltar e corrigir a idade
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BLOCKING MODAL: MENOR DE 18 ANOS */}
        {showMinorWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gradient-to-br from-red-900 to-red-800 border-2 border-red-400 rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🚨</div>
                <h2 className="text-2xl font-extrabold text-white mb-2">ATENÇÃO!</h2>
                <p className="text-red-200 text-sm">Menor de 18 anos detectado</p>
              </div>
              <div className="bg-red-950/60 border border-red-400/40 rounded-2xl p-5 mb-6">
                <p className="text-white font-bold text-base leading-relaxed mb-4">
                  O cadastro de menores de 18 anos <span className="text-yellow-300 underline">só é aceito após a autorização de pai, mãe ou responsável legal</span>.
                </p>
                <ul className="text-red-200 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">⚠️</span>
                    <span>O responsável confirma nome, vínculo e os termos aplicáveis à conta do menor.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">⚠️</span>
                    <span>O cadastro <strong>não será concluído</strong> sem a autorização formal do responsável.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">⚠️</span>
                    <span>As informações devem ser verdadeiras e podem ser revisadas pelo responsável a qualquer momento.</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleMinorWarningConfirm}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold py-4 rounded-2xl transition-all text-base"
                >
                  👨‍👩‍👧 Estou com meu responsável — Continuar
                </button>
                <button
                  onClick={() => setShowMinorWarning(false)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-2xl transition-all text-sm"
                >
                  Voltar e corrigir a idade
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: TERMOS */}
        {step === "terms" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-2">
              <Lock className="h-6 w-6 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Termos de Uso e Conduta</h2>
            </div>
            <p className="text-white/50 text-xs mb-6">Versão {TERMS_VERSION} — Leia com atenção antes de aceitar</p>

            <div className="space-y-4 mb-8 max-h-80 overflow-y-auto pr-2">
              <ClauseSection icon={<Heart className="h-5 w-5 text-red-400" />} title="1. Conduta Moral e Ética" color="border-red-500/30">
                <p>Esta plataforma é um ambiente educacional. Todo usuário compromete-se a manter conduta moral e ética em todas as interações. Não serão tolerados comportamentos que violem a dignidade humana, os bons costumes ou as leis vigentes nos países de origem dos usuários.</p>
              </ClauseSection>
              <ClauseSection icon={<Shield className="h-5 w-5 text-orange-400" />} title="2. Tolerância ZERO — Proteção de Menores" color="border-orange-500/30">
                <p>É <strong className="text-orange-300">absolutamente proibido</strong> qualquer conteúdo ou comportamento que envolva pedofilia, pornografia infantil, abuso ou exploração de menores de idade. Violações serão reportadas imediatamente às autoridades competentes (Ministério Público, Polícia Federal, Interpol) e o usuário será banido permanentemente.</p>
                <p className="mt-2 text-orange-300 text-xs font-medium">Base legal: ECA Art. 241 (Lei 8.069/90 — Brasil) · Convenção ONU sobre Direitos da Criança · Diretiva 2011/93/EU (Europa)</p>
              </ClauseSection>
              <ClauseSection icon={<Globe className="h-5 w-5 text-green-400" />} title="3. Proibição de Discriminação" color="border-green-500/30">
                <p>São proibidas quaisquer formas de discriminação: racial, religiosa, de gênero, por orientação sexual, por deficiência, por nacionalidade ou por qualquer outra característica. O descumprimento resulta em banimento imediato e permanente da plataforma.</p>
                <p className="mt-2 text-green-300 text-xs">Base legal: Lei 7.716/89 (Brasil) · Civil Rights Act (EUA) · Diretiva 2000/43/CE (Europa)</p>
              </ClauseSection>
              <ClauseSection icon={<AlertTriangle className="h-5 w-5 text-yellow-400" />} title="4. Proibição de Conteúdo Abusivo" color="border-yellow-500/30">
                <p>São proibidos: discurso de ódio, apologia à violência, terrorismo, conteúdo sexual explícito, assédio e qualquer forma de abuso. A plataforma utiliza IA de monitoramento contínuo para detectar e bloquear automaticamente esses conteúdos.</p>
              </ClauseSection>
              <ClauseSection icon={<Lock className="h-5 w-5 text-blue-400" />} title="5. Conformidade Legal por País" color="border-blue-500/30">
                <p>O usuário compromete-se a respeitar as leis do seu país de residência. A plataforma opera primariamente sob jurisdição brasileira, em conformidade com a LGPD (Lei 13.709/18), o Marco Civil da Internet (Lei 12.965/14) e o ECA (Lei 8.069/90). Referências internacionais como GDPR (Europa) são complementares.</p>
              </ClauseSection>
              <ClauseSection icon={<Users className="h-5 w-5 text-purple-400" />} title="6. Proteção de Dados e Privacidade" color="border-purple-500/30">
                <p>Os dados do usuário são protegidos conforme a LGPD (Lei 13.709/18 — Brasil) e GDPR (Regulamento 2016/679 — Europa). Dados de menores de idade têm proteção adicional e requerem consentimento parental expresso.</p>
              </ClauseSection>
              <ClauseSection icon={<Shield className="h-5 w-5 text-cyan-400" />} title="7. Propriedade Intelectual" color="border-cyan-500/30">
                <p>Todo o conteúdo da plataforma (aulas, áudios, imagens, professores virtuais) é protegido por direitos autorais. É proibida a reprodução, distribuição ou uso comercial sem autorização expressa.</p>
              </ClauseSection>
              <ClauseSection icon={<AlertTriangle className="h-5 w-5 text-red-300" />} title="8. Segurança da Plataforma" color="border-red-400/30">
                <p>É proibido tentar burlar sistemas de pagamento, realizar scraping de conteúdo ou executar ataques cibernéticos. Violações serão processadas conforme a <strong className="text-red-300">Lei 12.737/12 (Lei Carolina Dieckmann)</strong>, o <strong className="text-red-300">Marco Civil da Internet (Lei 12.965/14 — Art. 7)</strong> e o <strong className="text-red-300">Código Penal Brasileiro (Decreto-Lei 2.848/40)</strong>.</p>
              </ClauseSection>
              <ClauseSection icon={<Heart className="h-5 w-5 text-emerald-400" />} title="9. Programa Social — Incentivos Fiscais Federais Brasileiros" color="border-emerald-500/30">
                <p>A MultiLingue Universal participa do ecossistema de incentivos fiscais federais do Governo Brasileiro, oferecendo descontos de até <strong className="text-emerald-300">80%</strong> para entidades qualificadas (Lei Rouanet, PRONAS/PCD, PRONON, CEBAS, OSCIP, FNDE).</p>
              </ClauseSection>
              <ClauseSection icon={<Lock className="h-5 w-5 text-violet-400" />} title="10. Marco Civil da Internet e LGPD Reforçada" color="border-violet-500/30">
                <p>A plataforma opera em estrita conformidade com o <strong className="text-violet-300">Marco Civil da Internet (Lei 12.965/14)</strong> e a <strong className="text-violet-300">LGPD (Lei 13.709/18)</strong>. O usuário tem direito a acesso, correção, exclusão e portabilidade de seus dados a qualquer momento.</p>
                <p className="mt-2 text-xs text-violet-300">Legislação complementar: GDPR (Europa) · PIPEDA (Canadá) · PDPA (Tailândia) · POPIA (África do Sul)</p>
              </ClauseSection>
            </div>

            <div className="space-y-3 mb-6">
              <h3 className="text-white font-semibold text-sm mb-3">Confirme cada item abaixo para prosseguir:</h3>
              <CheckItem checked={checks.moralConduct} onChange={() => toggle("moralConduct")} label="Li e concordo em manter conduta moral e ética em todas as interações na plataforma." />
              <CheckItem checked={checks.noDiscrimination} onChange={() => toggle("noDiscrimination")} label="Comprometo-me a não praticar nenhuma forma de discriminação (racial, religiosa, de gênero, orientação sexual, deficiência ou qualquer outra)." />
              <CheckItem checked={checks.noAbuse} onChange={() => toggle("noAbuse")} label="Entendo e aceito a política de TOLERÂNCIA ZERO para conteúdo de pedofilia, abuso infantil, discurso de ódio e conteúdo violento. Sei que violações serão reportadas às autoridades." />
              <CheckItem checked={checks.legalCompliance} onChange={() => toggle("legalCompliance")} label="Comprometo-me a respeitar as leis do meu país e as normas internacionais aplicáveis durante o uso desta plataforma." />
              <CheckItem checked={checks.ageVerification} onChange={() => toggle("ageVerification")}
                label={isMinor
                  ? "Declaro que tenho menos de 18 anos e que meu pai, mãe ou responsável legal autorizará meu acesso na próxima etapa."
                  : "Declaro que tenho 18 anos ou mais e que as informações fornecidas são verdadeiras."
                }
              />
              <CheckItem checked={checks.allTerms} onChange={() => toggle("allTerms")} label="Li integralmente os Termos de Uso e Política de Conduta (versão 1.0) e aceito todas as cláusulas acima." bold />
            </div>

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <button
              onClick={handleTermsAccept}
              disabled={!allChecked}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-all"
            >
              {saving ? "Salvando aceite..." : isMinor ? "Continuar para Autorização Parental →" : "Confirmar Termos e Continuar →"}
            </button>
          </div>
        )}

        {/* STEP 3: AUTORIZAÇÃO PARENTAL */}
        {step === "parental" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Autorização do Responsável Legal</h2>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <p className="text-blue-300 text-sm">
                <strong>Atenção:</strong> Como o usuário tem menos de 18 anos, é <strong>obrigatória a autorização de um pai, mãe ou responsável legal</strong> para concluir o cadastro nesta plataforma. São solicitados apenas os dados necessários para registrar esse aceite.
              </p>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-4 mb-6 text-sm text-emerald-100 space-y-2">
              <p className="font-bold text-emerald-300">Proteção acompanhada de supervisão responsável</p>
              <p>O perfil do menor utiliza filtros de conteúdo, controles parentais, registros supervisionáveis de interações, alertas e limites de uso configuráveis.</p>
              <p>Essas ferramentas apoiam a proteção, mas não substituem o dever contínuo de custódia, acompanhamento e orientação do pai, mãe ou responsável legal.</p>
            </div>

            <section aria-labelledby="parental-data-summary" className="bg-slate-900/50 border border-white/15 rounded-xl p-4 mb-6 text-sm text-white/80 space-y-2">
              <h3 id="parental-data-summary" className="font-semibold text-white">Antes de autorizar: dados e controles</h3>
              <p><strong className="text-white">Obrigatórios:</strong> nome do responsável, vínculo com o menor e as declarações de autorização.</p>
              <p><strong className="text-white">Opcionais:</strong> documento e e-mail. O e-mail, se informado, serve apenas como contato para revisão do consentimento.</p>
              <p><strong className="text-white">Não solicitados:</strong> selfie, foto de documento, número da máquina ou rastreamento do dispositivo.</p>
              <p>Após o registro, os controles parentais permitem acompanhar configurações e pedir revisão ou revogação do consentimento. A revogação bloqueia o acesso do menor até nova autorização válida.</p>
            </section>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-white/80 text-sm font-medium block mb-1">Nome completo do responsável *</label>
                <input type="text" value={guardian.name} onChange={e => setGuardian(p => ({ ...p, name: e.target.value }))} placeholder="Nome completo" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/80 text-sm font-medium block mb-1">CPF / Documento (opcional)</label>
                  <input type="text" value={guardian.document} onChange={e => setGuardian(p => ({ ...p, document: e.target.value }))} placeholder="Opcional" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-white/80 text-sm font-medium block mb-1">Vínculo *</label>
                  <select value={guardian.relationship} onChange={e => setGuardian(p => ({ ...p, relationship: e.target.value as "pai" | "mae" | "responsavel" | "tutor" }))} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400">
                    <option value="pai">Pai</option>
                    <option value="mae">Mãe</option>
                    <option value="responsavel">Responsável Legal</option>
                    <option value="tutor">Tutor</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-white/80 text-sm font-medium block mb-1">E-mail do responsável (opcional)</label>
                <input type="email" value={guardian.email} onChange={e => setGuardian(p => ({ ...p, email: e.target.value }))} placeholder="Opcional — contato para revisão do consentimento" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-400" />
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <h3 className="text-white font-semibold text-sm mb-3">O responsável declara:</h3>
              <CheckItem checked={guardian.confirmedTerms} onChange={() => toggleGuardian("confirmedTerms")} label="Li e aceito os Termos de Uso e Política de Conduta da plataforma em nome do menor." />
              <CheckItem checked={guardian.confirmedMoral} onChange={() => toggleGuardian("confirmedMoral")} label="Estou ciente das regras de conduta moral e ética e me responsabilizo pelo uso adequado pelo menor." />
              <CheckItem checked={guardian.confirmedParental} onChange={() => toggleGuardian("confirmedParental")} label="Autorizo o acesso do menor à plataforma e me comprometo a supervisionar seu uso, podendo revogar esta autorização a qualquer momento." />
              <CheckItem checked={guardian.confirmedLegal} onChange={() => toggleGuardian("confirmedLegal")} label="Declaro que as informações fornecidas são verdadeiras e reconheço meu dever contínuo de custódia e acompanhamento do menor; as ferramentas do aplicativo não substituem essa responsabilidade." bold />
            </div>

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <button onClick={handleParentalSubmit} disabled={!allGuardianChecked || !guardianDataFilled || saving} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-all">
              {saving ? "Salvando autorização..." : "Confirmar Autorização Parental →"}
            </button>
          </div>
        )}

        {/* STEP 5: CONCLUÍDO */}
        {step === "done" && (
          <div className="bg-white/5 border border-green-500/30 rounded-2xl p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Tudo certo!</h2>
            <p className="text-white/70 mb-2">
              {isMinor ? "Autorização parental registrada com sucesso." : "Termos aceitos e identidade verificada com sucesso."}
            </p>
            <p className="text-white/50 text-sm">Redirecionando para a plataforma...</p>
          </div>
        )}

        {/* Selos de segurança */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: "🛡️", label: "Tolerância Zero" },
            { icon: "👨‍👩‍👧", label: "Proteção Parental" },
            { icon: "⚖️", label: "57 Países" },
          ].map(seal => (
            <div key={seal.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">{seal.icon}</div>
              <div className="text-white/60 text-xs">{seal.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClauseSection({ icon, title, color, children }: {
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`border ${color} bg-white/3 rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="text-white font-semibold text-sm">{title}</h4>
      </div>
      <div className="text-white/65 text-xs leading-relaxed">{children}</div>
    </div>
  );
}

function CheckItem({ checked, onChange, label, bold }: {
  checked: boolean;
  onChange: () => void;
  label: string;
  bold?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        onClick={onChange}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
          checked ? "bg-purple-500 border-purple-500" : "border-white/30 group-hover:border-purple-400"
        }`}
      >
        {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
      </div>
      <span className={`text-sm leading-relaxed ${bold ? "text-white font-medium" : "text-white/75"}`}>{label}</span>
    </label>
  );
}
