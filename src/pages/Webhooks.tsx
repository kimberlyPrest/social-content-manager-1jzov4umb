import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
} from '@/services/webhooks'
import { Plus, Trash2, Edit2, Play, Webhook } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { format } from 'date-fns'

const EVENT_OPTIONS = [
  { id: 'post_publicado', label: 'Post Publicado' },
  { id: 'post_agendado', label: 'Post Agendado' },
  { id: 'novo_comentario', label: 'Novo Comentário' },
  { id: 'mencao', label: 'Menção' },
  { id: 'teste_finalizado', label: 'Teste A/B Finalizado' },
]

export default function WebhooksPage() {
  const { user } = useAuth()
  const [webhooks, setWebhooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [form, setForm] = useState({ url: '', secret: '', eventos: [] as string[] })
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    try {
      const data = await getWebhooks()
      setWebhooks(data)
    } catch (e) {
      toast.error('Erro ao carregar webhooks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenNew = () => {
    setEditingId(null)
    setForm({ url: '', secret: '', eventos: [] })
    setModalOpen(true)
  }

  const handleOpenEdit = (w: any) => {
    setEditingId(w.id)
    setForm({ url: w.url, secret: w.secret || '', eventos: w.eventos || [] })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.url.startsWith('https://')) return toast.error('URL obrigatória e deve ser HTTPS')
    if (form.eventos.length === 0) return toast.error('Selecione pelo menos um evento')
    setSaving(true)
    try {
      const data = { empresa_id: user?.empresa_id, ...form, ativo: true }
      if (editingId) await updateWebhook(editingId, data)
      else await createWebhook(data)
      toast.success(`Webhook ${editingId ? 'atualizado' : 'criado'} com sucesso!`)
      setModalOpen(false)
      loadData()
    } catch (e) {
      toast.error('Erro ao salvar webhook')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (id: string, ativo: boolean) => {
    try {
      await updateWebhook(id, { ativo })
      setWebhooks((prev) => prev.map((w) => (w.id === id ? { ...w, ativo } : w)))
      toast.success(`Webhook ${ativo ? 'ativado' : 'desativado'}`)
    } catch (e) {
      toast.error('Erro ao alterar status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este webhook?')) return
    try {
      await deleteWebhook(id)
      setWebhooks((prev) => prev.filter((w) => w.id !== id))
      toast.success('Webhook deletado')
    } catch (e) {
      toast.error('Erro ao deletar webhook')
    }
  }

  const handleTest = async (id: string) => {
    try {
      await testWebhook(id)
      toast.success('Webhook funcionando!')
      loadData()
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Erro ao enviar webhook')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Webhook className="h-6 w-6 text-purple-600" /> Webhooks
        </h1>
        <Button onClick={handleOpenNew}>
          <Plus className="mr-2 h-4 w-4" /> Criar Novo
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Eventos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Último Disparo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : webhooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  Nenhum webhook criado
                </TableCell>
              </TableRow>
            ) : (
              webhooks.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{w.url}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {w.eventos?.map((ev: string) => (
                        <Badge key={ev} variant="secondary" className="text-xs">
                          {EVENT_OPTIONS.find((o) => o.id === ev)?.label || ev}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={w.ativo ? 'bg-green-500 hover:bg-green-600' : 'bg-slate-400'}>
                      {w.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {w.ultimo_disparo
                      ? format(new Date(w.ultimo_disparo), 'dd/MM/yyyy HH:mm')
                      : 'Nunca'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Switch checked={w.ativo} onCheckedChange={(c) => handleToggle(w.id, c)} />
                      <Button variant="ghost" size="icon" onClick={() => handleTest(w.id)}>
                        <Play className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(w)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(w.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar' : 'Novo'} Webhook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>URL do Webhook *</Label>
              <Input
                placeholder="https://..."
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Secret (Opcional)</Label>
              <Input
                placeholder="Sua chave secreta"
                value={form.secret}
                onChange={(e) => setForm({ ...form, secret: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <Label>Eventos *</Label>
              {EVENT_OPTIONS.map((opt) => (
                <div key={opt.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={opt.id}
                    checked={form.eventos.includes(opt.id)}
                    onCheckedChange={(c) =>
                      setForm({
                        ...form,
                        eventos: c
                          ? [...form.eventos, opt.id]
                          : form.eventos.filter((e) => e !== opt.id),
                      })
                    }
                  />
                  <label htmlFor={opt.id} className="text-sm font-medium leading-none">
                    {opt.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button disabled={saving} onClick={handleSave}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
