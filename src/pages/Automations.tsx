import { useState, useEffect, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getAutomations,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  Automation,
} from '@/services/automations'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { AutomationCard } from '@/components/automations/AutomationCard'
import {
  AutomationFormModal,
  AutomationFormData,
} from '@/components/automations/AutomationFormModal'

export default function AutomationsPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const editingItem = useMemo(() => items.find((i) => i.id === editingId), [items, editingId])

  const loadData = async () => {
    if (!user?.empresa_id) return
    try {
      const data = await getAutomations(user.empresa_id)
      setItems(data)
    } catch (err) {
      toast.error('Erro ao carregar automações')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.empresa_id])
  useRealtime('automacoes', () => {
    loadData()
  })

  const onSubmit = async (values: AutomationFormData) => {
    try {
      if (editingId) {
        await updateAutomation(editingId, values)
        toast.success('Automação atualizada com sucesso!')
      } else {
        await createAutomation({ ...values, ativa: true, empresa_id: user?.empresa_id })
        toast.success('Automação criada com sucesso!')
      }
      setModalOpen(false)
    } catch (err) {
      toast.error('Erro ao salvar automação.')
    }
  }

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await updateAutomation(id, { ativa: !current })
      toast.success(`Automação ${!current ? 'ativada' : 'desativada'}`)
    } catch (err) {
      toast.error('Erro ao alterar status')
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await deleteAutomation(deletingId)
      toast.success('Automação deletada')
    } catch (err) {
      toast.error('Erro ao deletar automação')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Automações</h1>
        <Button
          onClick={() => {
            setEditingId(null)
            setModalOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" /> Criar Nova Automação
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white rounded-xl border border-dashed shadow-sm">
          <p>Nenhuma automação criada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((item) => (
            <AutomationCard
              key={item.id}
              item={item}
              onToggle={handleToggle}
              onEdit={(i) => {
                setEditingId(i.id)
                setModalOpen(true)
              }}
              onDelete={setDeletingId}
            />
          ))}
        </div>
      )}

      <AutomationFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        isEditing={!!editingId}
        initialData={editingItem as any}
        onSubmit={onSubmit}
        onError={() => toast.error('Preencha todos os campos')}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja deletar?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A automação será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
