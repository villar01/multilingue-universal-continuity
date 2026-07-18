import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  UserPlus, Search, Filter, Phone, Mail, MessageSquare,
  Edit2, Trash2, ChevronLeft, BarChart3, Users, Handshake
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: "Novo", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  contacted: { label: "Contatado", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  qualified: { label: "Qualificado", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
  unqualified: { label: "Desqualificado", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
  customer: { label: "Cliente", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  churned: { label: "Perdido", color: "bg-red-500/20 text-red-300 border-red-500/30" },
};

const SOURCE_LABELS: Record<string, string> = {
  website: "Website", referral: "Indicação", social_media: "Redes Sociais",
  google_ads: "Google Ads", facebook_ads: "Facebook Ads", instagram: "Instagram",
  whatsapp: "WhatsApp", email_campaign: "Email", organic: "Orgânico",
  partner: "Parceiro", event: "Evento", other: "Outros"
};

export default function CRMLeads() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "",
    source: "website", status: "new", notes: "",
    targetLanguage: "en", nativeLanguage: "pt"
  });

  const { data, isLoading, refetch } = trpc.crm.contacts.list.useQuery({
    search: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    page, limit: 20
  });

  const createMutation = trpc.crm.contacts.create.useMutation({
    onSuccess: () => {
      toast({ title: "Lead criado com sucesso!" } as any);
      setIsCreateOpen(false);
      setForm({ name: "", email: "", phone: "", company: "", source: "website", status: "new", notes: "", targetLanguage: "en", nativeLanguage: "pt" });
      refetch();
    },
    onError: (e) => toast({ title: "Erro ao criar lead", description: e.message, variant: "destructive" } as any),
  });

  const updateStatusMutation = trpc.crm.contacts.update.useMutation({
    onSuccess: () => { toast({ title: "Status atualizado!" } as any); refetch(); },
  });

  const deleteMutation = trpc.crm.contacts.delete.useMutation({
    onSuccess: () => { toast({ title: "Lead removido." } as any); refetch(); },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/sales-dashboard">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <ChevronLeft className="w-4 h-4 mr-1" /> Painel
              </Button>
            </Link>
            <div className="w-px h-6 bg-white/20" />
            <Users className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-bold">Gestão de Leads</h1>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              {data?.total ?? 0} leads
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/crm/deals">
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                <Handshake className="w-4 h-4 mr-1" /> Deals
              </Button>
            </Link>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="w-4 h-4 mr-1" /> Novo Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-white/20 text-white max-w-lg">
                <DialogHeader>
                  <DialogTitle>Criar Novo Lead</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="col-span-2">
                    <Label>Nome *</Label>
                    <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white mt-1" placeholder="Nome completo" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white mt-1" type="email" />
                  </div>
                  <div>
                    <Label>Telefone/WhatsApp</Label>
                    <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white mt-1" placeholder="+55 11 99999-9999" />
                  </div>
                  <div>
                    <Label>Empresa</Label>
                    <Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white mt-1" />
                  </div>
                  <div>
                    <Label>Idioma de Interesse</Label>
                    <Input value={(form as any).language_interest ?? ""} onChange={e => setForm(f => ({ ...f, targetLanguage: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white mt-1" placeholder="Inglês, Espanhol..." />
                  </div>
                  <div>
                    <Label>Origem</Label>
                    <Select value={form.source} onValueChange={v => setForm(f => ({ ...f, source: v }))}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Nível de Interesse</Label>
                    <Select value="medium" onValueChange={_v => {}}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixo</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="high">Alto</SelectItem>
                        <SelectItem value="very_high">Muito Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Observações</Label>
                    <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white mt-1" rows={3} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="border-white/20 text-white">Cancelar</Button>
                  <Button onClick={() => createMutation.mutate(form)} disabled={!form.name || createMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700">
                    {createMutation.isPending ? "Criando..." : "Criar Lead"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
              placeholder="Buscar por nome, email, empresa..." />
          </div>
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-44 bg-white/10 border-white/20 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-48 text-slate-400">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
                Carregando leads...
              </div>
            ) : !data?.contacts?.length ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <Users className="w-12 h-12 mb-3 opacity-30" />
                <p>Nenhum lead encontrado</p>
                <p className="text-sm mt-1">Crie um novo lead ou acesse o Painel de Vendas para carregar dados demo</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Lead</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Contato</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Origem</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Interesse</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.contacts.map((lead: any) => (
                      <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-white">{lead.name}</p>
                            {lead.company && <p className="text-xs text-slate-400">{lead.company}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {lead.email && (
                              <a href={`mailto:${lead.email}`} className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {lead.email}
                              </a>
                            )}
                            {lead.phone && (
                              <a href={`tel:${lead.phone}`} className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {lead.phone}
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-300">{SOURCE_LABELS[lead.source] ?? lead.source}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <Badge variant="outline" className="text-xs border-white/20 text-slate-300">
                              {lead.interest_level === "very_high" ? "🔥 Muito Alto" :
                               lead.interest_level === "high" ? "⬆️ Alto" :
                               lead.interest_level === "medium" ? "➡️ Médio" : "⬇️ Baixo"}
                            </Badge>
                            {lead.language_interest && (
                              <p className="text-xs text-slate-400 mt-1">{lead.language_interest}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            value={lead.status}
                            onValueChange={v => updateStatusMutation.mutate({ id: lead.id, status: v })}
                          >
                            <SelectTrigger className={`w-36 h-7 text-xs border ${STATUS_CONFIG[lead.status]?.color ?? ""} bg-transparent`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                <SelectItem key={k} value={k}>{v.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {lead.phone && (
                              <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-emerald-400 hover:text-emerald-300">
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                              </a>
                            )}
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                              onClick={() => { if (confirm("Remover lead?")) deleteMutation.mutate({ id: lead.id }); }}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {data && data.total > 20 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Mostrando {((page - 1) * 20) + 1}–{Math.min(page * 20, data.total)} de {data.total}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="border-white/20 text-white">Anterior</Button>
              <Button variant="outline" size="sm" disabled={page * 20 >= data.total} onClick={() => setPage(p => p + 1)}
                className="border-white/20 text-white">Próxima</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
