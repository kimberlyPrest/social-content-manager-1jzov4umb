import { useEffect, useState } from 'react'
import { Trash2, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { getMonitoringRules, deleteMonitoringRule, updateMonitoringRule } from '@/services/monitor'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'

export function MonitoringSidebar() {
  const [rules, setRules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const data = await getMonitoringRules()
      setRules(data)
    } catch {
      toast.error('Erro ao carregar regras')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('monitoring', load)

  const handleToggle = async (id: string, ativo: boolean) => {
    try {
      await updateMonitoringRule(id, { ativo })
    } catch {
      toast.error('Erro ao atualizar')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar?')) return
    try {
      await deleteMonitoringRule(id)
      toast.success('Deletado com sucesso')
    } catch {
      toast.error('Erro ao deletar')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <Activity className="h-5 w-5" />
          Regras Ativas
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
        ) : rules.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma regra configurada
          </p>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="border rounded-lg p-3 bg-card flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground block truncate">
                    {rule.tipo.replace('_', ' ')}
                  </span>
                  <p className="font-semibold text-sm truncate" title={rule.valor}>
                    {rule.valor}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Switch checked={rule.ativo} onCheckedChange={(c) => handleToggle(rule.id, c)} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive ml-1"
                    onClick={() => handleDelete(rule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-[11px] text-muted-foreground flex flex-wrap gap-1">
                {rule.rede_social?.split(',').map((r: string) => (
                  <span key={r} className="bg-muted px-1.5 py-0.5 rounded">
                    {r.trim()}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
