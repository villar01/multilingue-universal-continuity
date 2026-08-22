import { useMemo, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const certificatePattern = /^MLU-[A-F0-9]{32}$/;

export default function CertificateValidation() {
  const [code, setCode] = useState("");
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const normalized = useMemo(() => code.trim().toUpperCase(), [code]);
  const validation = trpc.certificates.validate.useQuery(
    { code: submittedCode || "MLU-00000000000000000000000000000000" },
    { enabled: submittedCode !== null },
  );

  const submit = () => {
    if (certificatePattern.test(normalized)) setSubmittedCode(normalized);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4 py-12 text-white">
      <section className="mx-auto max-w-xl">
        <Link href="/" className="mb-6 inline-block text-sm text-indigo-200 hover:text-white">← Voltar ao início</Link>
        <Card className="border-indigo-400/30 bg-slate-900/80 text-white shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Validar certificado</CardTitle>
            <CardDescription className="text-slate-300">
              Consulte somente a autenticidade do documento. Nenhum progresso, e-mail ou dado de aluno é exibido.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block text-sm font-medium" htmlFor="certificate-code">Código de verificação</label>
            <div className="flex gap-2">
              <input
                id="certificate-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && submit()}
                placeholder="MLU-…"
                className="min-w-0 flex-1 rounded-md border border-slate-600 bg-slate-950 px-3 py-2 font-mono text-sm uppercase outline-none focus:border-indigo-300"
                aria-describedby="certificate-hint"
              />
              <Button type="button" onClick={submit} disabled={!certificatePattern.test(normalized)}>Validar</Button>
            </div>
            <p id="certificate-hint" className="text-xs text-slate-400">O código aparece na parte inferior do certificado emitido pela plataforma.</p>
            {submittedCode && validation.isLoading && <p className="text-sm text-slate-300">Verificando documento…</p>}
            {submittedCode && validation.data?.valid && (
              <div className="rounded-lg border border-emerald-400/50 bg-emerald-950/40 p-4">
                <p className="font-semibold text-emerald-300">Certificado válido</p>
                <p className="mt-1 text-sm text-slate-200">Idioma: {validation.data.languageName}</p>
                {validation.data.issuedAt && <p className="text-sm text-slate-300">Emissão: {new Date(validation.data.issuedAt).toLocaleDateString()}</p>}
              </div>
            )}
            {submittedCode && validation.data && !validation.data.valid && (
              <div className="rounded-lg border border-amber-400/40 bg-amber-950/30 p-4 text-sm text-amber-100">
                {validation.data.status === "revoked" ? "Este documento não está ativo." : "Código não localizado."}
              </div>
            )}
            {submittedCode && validation.error && <p className="text-sm text-rose-300">Não foi possível validar agora. Tente novamente.</p>}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
