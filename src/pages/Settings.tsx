import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import {
  getMensagensProntas,
  createMensagemPronta,
  updateMensagemPronta,
  deleteMensagemPronta,
  MensagemPronta,
} from '@/services/mensagens-prontas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function SettingsPage() {
  const { user } = useAuth()
  const [mensagens, setMensagens] = useState<MensagemPronta[]>([])
  const [loading, setLoading] = useState(true)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [texto, setTexto] = useState('')
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    try {
      const data = await getMensagensProntas()
      setMensagens(data)
    } catch (err) {
      toast.error('Erro ao carregar mensagens pré-prontas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenDialog = (msg?: MensagemPronta) => {
    if (msg) {
      setEditingId(msg.id)
      setTexto(msg.texto)
    } else {
      setEditingId(null)
      setTexto('')
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!texto.trim()) return
    setSaving(true)
    try {
      if (editingId) {
        await updateMensagemPronta(editingId, { texto: texto.trim() })
        toast.success('Mensagem atualizada com sucesso!')
      } else {
        await createMensagemPronta({ empresa_id: user?.empresa_id, texto: texto.trim() })
        toast.success('Mensagem salva com sucesso!')
      }
      setIsDialogOpen(false)
      loadData()
    } catch (err) {
      toast.error('Erro ao salvar mensagem')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta mensagem?')) return
    try {
      await deleteMensagemPronta(id)
      toast.success('Mensagem excluída com sucesso!')
      loadData()
    } catch (err) {
      toast.error('Erro ao excluir mensagem')
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configurações</h1>

      <Tabs defaultValue="mensagens">
        <TabsList>
          <TabsTrigger value="mensagens">Mensagens Pré-prontas</TabsTrigger>
        </TabsList>
        <TabsContent value="mensagens" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Respostas Rápidas</CardTitle>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar nova
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : mensagens.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma mensagem encontrada.
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mensagem</TableHead>
                        <TableHead className="w-[100px] text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mensagens.map((msg) => (
                        <TableRow key={msg.id}>
                          <TableCell className="font-medium text-slate-700">{msg.texto}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog(msg)}
                              >
                                <Pencil className="h-4 w-4 text-slate-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(msg.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Mensagem' : 'Nova Mensagem'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Digite a mensagem pré-pronta"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!texto.trim() || saving}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
