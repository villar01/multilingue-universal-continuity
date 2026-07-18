/**
 * AdminUpdates.tsx
 * Painel admin: publicar atualizações do app com agendamento.
 * Atualizações chegam aos alunos sem parar o sistema.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  lesson:   { label: "Nova Lição",      color: "bg-blue-500" },
  teacher:  { label: "Novo Professor",  color: "bg-purple-500" },
  feature:  { label: "Nova Função",     color: "bg-green-500" },
  security: { label: "Segurança",       color: "bg-red-500" },
  bugfix:   { label: "Correção",        color: "bg-yellow-500" },
  content:  { label: "Conteúdo",        color: "bg-orange-500" },
};

export default function AdminUpdates() {
  const utils = trpc.useUtils();

  const { data: updates = [], isLoading } = trpc.updates.adminList.useQuery();
  const createMut = trpc.updates.adminCreate.useMutation({
    onSuccess: () => {
      toast.success("✅ Atualização criada com sucesso!");
      utils.updates.adminList.invalidate();
      setForm(defaultForm);
    },
    onError: (e) => toast.error(e.message),
  });
  const publishMut = trpc.updates.adminPublish.useMutation({
    onSuccess: () => {
      toast.success("🚀 Publicada! Alunos serão notificados.");
      utils.updates.adminList.invalidate();
    },
  });
  const deleteMut = trpc.updates.adminDelete.useMutation({
    onSuccess: () => {
      toast.success("Removida.");
      utils.updates.adminList.invalidate();
    },
  });

  const defaultForm = {
    version: "",
    title: "",
    description: "",
    updateType: "feature" as const,
    isCritical: false,
    publishNow: true,
    scheduledAt: "",
  };
  const [form, setForm] = useState(defaultForm);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.version || !form.title || !form.description) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    createMut.mutate({
      version: form.version,
      title: form.title,
      description: form.description,
      updateType: form.updateType,
      affectedLanguages: ["all"],
      isCritical: form.isCritical,
      publishNow: form.publishNow,
      scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).getTime() : undefined,
    });
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">🚀 Publicar Atualização</h1>
        <p className="text-gray-400 text-sm mt-1">
          Atualizações chegam aos alunos em tempo real — sem parar o sistema.
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl p-6 space-y-4 border border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Versão *</label>
            <Input
              placeholder="ex: 1.3.0"
              value={form.version}
              onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Tipo *</label>
            <select
              value={form.updateType}
              onChange={e => setForm(f => ({ ...f, updateType: e.target.value as typeof form.updateType }))}
              className="w-full h-10 px-3 rounded-md bg-gray-800 border border-gray-600 text-white text-sm"
            >
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Título *</label>
          <Input
            placeholder="ex: 50 novas lições de inglês americano adicionadas"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="bg-gray-800 border-gray-600 text-white"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Descrição *</label>
          <Textarea
            placeholder="Descreva o que foi adicionado ou melhorado..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
          />
        </div>

        <div className="flex gap-6 items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isCritical}
              onChange={e => setForm(f => ({ ...f, isCritical: e.target.checked }))}
              className="w-4 h-4"
            />
            <span className="text-sm text-red-400 font-medium">⚠️ Atualização crítica</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.publishNow}
              onChange={e => setForm(f => ({ ...f, publishNow: e.target.checked }))}
              className="w-4 h-4"
            />
            <span className="text-sm text-green-400 font-medium">Publicar imediatamente</span>
          </label>
        </div>

        {!form.publishNow && (
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Agendar para</label>
            <Input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={createMut.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
        >
          {createMut.isPending ? "Publicando..." : "🚀 Publicar Atualização"}
        </Button>
      </form>

      {/* Lista de atualizações */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Histórico de Atualizações</h2>
        {isLoading ? (
          <p className="text-gray-400 text-sm">Carregando...</p>
        ) : updates.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhuma atualização ainda.</p>
        ) : (
          <div className="space-y-3">
            {updates.map((u) => {
              const typeInfo = TYPE_LABELS[u.updateType] ?? { label: u.updateType, color: "bg-gray-500" };
              return (
                <div key={u.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-white font-medium text-sm">{u.title}</span>
                      <span className={`text-xs text-white px-2 py-0.5 rounded-full ${typeInfo.color}`}>{typeInfo.label}</span>
                      {u.isCritical && <span className="text-xs text-red-400 font-bold">⚠️ CRÍTICA</span>}
                      {u.isPublished ? (
                        <span className="text-xs text-green-400">✅ Publicada</span>
                      ) : (
                        <span className="text-xs text-yellow-400">⏳ Rascunho</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs line-clamp-2">{u.description}</p>
                    <p className="text-gray-600 text-xs mt-1">
                      v{u.version} · {u.publishedAt ? new Date(u.publishedAt).toLocaleString("pt-BR") : "Não publicada"}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!u.isPublished && (
                      <Button
                        size="sm"
                        onClick={() => publishMut.mutate({ id: u.id })}
                        disabled={publishMut.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs"
                      >
                        Publicar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMut.mutate({ id: u.id })}
                      disabled={deleteMut.isPending}
                      className="text-xs"
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
