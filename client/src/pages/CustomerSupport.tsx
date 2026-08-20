import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Send, ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const categories = [
  ["help", "Ajuda"], ["bug", "Problema"], ["feedback", "Opinião"], ["idea", "Ideia"], ["security", "Segurança"], ["sales", "Tenho interesse"],
] as const;

type Category = (typeof categories)[number][0];

export default function CustomerSupport() {
  const { user, loading } = useAuth();
  const isOwner = user?.role === "admin";
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newSubject, setNewSubject] = useState("");
  const [newContent, setNewContent] = useState("");
  const [category, setCategory] = useState<Category>("help");
  const [reply, setReply] = useState("");
  const [creating, setCreating] = useState(false);

  const mine = trpc.customerSupport.listMine.useQuery(undefined, { enabled: !!user && !isOwner });
  const ownerThreads = trpc.customerSupport.adminList.useQuery(undefined, { enabled: !!user && isOwner });
  const mineDetail = trpc.customerSupport.getMine.useQuery({ threadId: selectedId ?? 0 }, { enabled: !!selectedId && !isOwner });
  const ownerDetail = trpc.customerSupport.adminGet.useQuery({ threadId: selectedId ?? 0 }, { enabled: !!selectedId && isOwner });
  const threads = isOwner ? ownerThreads.data ?? [] : mine.data ?? [];
  const detail = isOwner ? ownerDetail.data : mineDetail.data;
  const utils = trpc.useUtils();

  const create = trpc.customerSupport.create.useMutation({
    onSuccess: ({ threadId }) => {
      setNewSubject(""); setNewContent(""); setCreating(false); setSelectedId(threadId);
      utils.customerSupport.listMine.invalidate();
      toast.success("Mensagem privada enviada.");
    },
    onError: (error) => toast.error(error.message),
  });
  const sendMine = trpc.customerSupport.sendMine.useMutation({
    onSuccess: () => { setReply(""); utils.customerSupport.getMine.invalidate(); utils.customerSupport.listMine.invalidate(); },
    onError: (error) => toast.error(error.message),
  });
  const adminReply = trpc.customerSupport.adminReply.useMutation({
    onSuccess: () => { setReply(""); utils.customerSupport.adminGet.invalidate(); utils.customerSupport.adminList.invalidate(); toast.success("Resposta privada registrada."); },
    onError: (error) => toast.error(error.message),
  });

  const emptyCopy = useMemo(() => isOwner ? "Ainda não há solicitações de clientes." : "Envie uma solicitação, opinião ou ideia de forma privada.", [isOwner]);

  if (loading) return <div className="min-h-screen grid place-items-center text-slate-600">Carregando suporte…</div>;
  if (!user) return <div className="min-h-screen grid place-items-center p-6 text-center"><Card className="max-w-md"><CardHeader><CardTitle>Suporte privado</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Entre na sua conta para enviar uma solicitação privada.</p><Link href="/"><Button className="mt-4">Voltar ao início</Button></Link></CardContent></Card></div>;

  return <main className="min-h-screen bg-slate-50 p-4 md:p-8">
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div><p className="text-sm font-semibold text-violet-700">MULTILINGUE UNIVERSAL</p><h1 className="text-2xl font-bold text-slate-900">{isOwner ? "Revisão privada de suporte" : "Suporte e opiniões"}</h1><p className="text-sm text-slate-600">Conversa protegida, limitada contra abuso e sem publicação externa.</p></div>
        <Link href={isOwner ? "/admin/control-center" : "/dashboard"}><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button></Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <Card className="h-fit"><CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle className="text-base">{isOwner ? "Solicitações" : "Minhas conversas"}</CardTitle>{!isOwner && <Button size="sm" onClick={() => setCreating(true)}><Plus className="mr-1 h-4 w-4" /> Nova</Button>}</CardHeader><CardContent className="space-y-2">{threads.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">{emptyCopy}</p> : threads.map((thread) => <button key={thread.id} onClick={() => setSelectedId(thread.id)} className={`w-full rounded-lg border p-3 text-left transition ${selectedId === thread.id ? "border-violet-500 bg-violet-50" : "border-slate-200 hover:border-violet-300"}`}><div className="flex justify-between gap-2"><p className="truncate font-medium text-slate-900">{thread.subject}</p><Badge variant="outline">{thread.status}</Badge></div><p className="mt-1 text-xs text-slate-500">{thread.category} · {new Date(thread.updatedAt).toLocaleDateString("pt-BR")}</p></button>)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-violet-600" /> {creating ? "Nova solicitação" : detail ? detail.thread.subject : "Conversa privada"}</CardTitle></CardHeader><CardContent>{creating ? <div className="space-y-3"><Input value={newSubject} onChange={(event) => setNewSubject(event.target.value)} placeholder="Assunto da solicitação" maxLength={180} /><div className="flex flex-wrap gap-2">{categories.map(([value, label]) => <Button key={value} size="sm" variant={category === value ? "default" : "outline"} onClick={() => setCategory(value)}>{label}</Button>)}</div><Textarea value={newContent} onChange={(event) => setNewContent(event.target.value)} placeholder="Descreva com clareza. Nenhum dado é publicado externamente." maxLength={1500} rows={8} /><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setCreating(false)}>Cancelar</Button><Button disabled={create.isPending || newSubject.trim().length < 3 || newContent.trim().length < 1} onClick={() => create.mutate({ subject: newSubject, category, content: newContent })}><Send className="mr-2 h-4 w-4" /> Enviar</Button></div></div> : detail ? <div className="space-y-4"> <div className="max-h-[430px] space-y-3 overflow-y-auto rounded-lg bg-slate-50 p-4">{detail.messages.map((message) => <div key={message.id} className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${message.authorRole === "admin" ? "ml-auto bg-violet-600 text-white" : "bg-white text-slate-800 shadow-sm"}`}><p>{message.content}</p><p className={`mt-1 text-xs ${message.authorRole === "admin" ? "text-violet-100" : "text-slate-400"}`}>{message.authorRole === "admin" ? "Proprietário" : "Cliente"} · {new Date(message.createdAt).toLocaleString("pt-BR")}</p></div>)}</div><Textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder={isOwner ? "Responder como proprietário…" : "Escrever nova mensagem…"} maxLength={1500} rows={4} /><div className="flex justify-between gap-2"><p className="text-xs text-slate-500 flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Registro privado e limitado contra abuso</p>{isOwner ? <div className="flex gap-2"><Button variant="outline" disabled={!reply.trim() || adminReply.isPending} onClick={() => adminReply.mutate({ threadId: detail.thread.id, content: reply, close: false })}>Responder</Button><Button disabled={!reply.trim() || adminReply.isPending} onClick={() => adminReply.mutate({ threadId: detail.thread.id, content: reply, close: true })}><CheckCircle2 className="mr-2 h-4 w-4" /> Responder e encerrar</Button></div> : <Button disabled={!reply.trim() || sendMine.isPending || detail.thread.status === "closed"} onClick={() => sendMine.mutate({ threadId: detail.thread.id, content: reply })}><Send className="mr-2 h-4 w-4" /> Enviar</Button>}</div></div> : <div className="grid min-h-[360px] place-items-center text-center text-slate-500"><div><MessageSquare className="mx-auto mb-3 h-10 w-10 text-violet-300" /><p>{emptyCopy}</p>{!isOwner && <Button className="mt-4" onClick={() => setCreating(true)}>Enviar mensagem privada</Button>}</div></div>}</CardContent></Card>
      </div>
    </div>
  </main>;
}
