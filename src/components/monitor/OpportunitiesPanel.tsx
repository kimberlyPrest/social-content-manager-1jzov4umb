import { useEffect, useState } from 'react'
import { Inbox, XCircle, Archive, MessageCircle, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getOpportunities, updateOpportunity } from '@/services/monitor'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { DMModal } from './DMModal'

export function OpportunitiesPanel() {
  const [opps, setOpps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const data = await getOpportunities()
      setOpps(data.filter((o: any) => o.status === 'nova'))
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useRealtime('oportunidades', (e) => {
    if (e.action === 'create' && e.record.status === 'nova') {
      setOpps((prev) => [e.record, ...prev])
      toast.info(`Nova oportunidade em ${e.record.rede_social}`, { description: e.record.autor })
    } else {
      load()
    }
  })

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateOpportunity(id, { status })
      setOpps((prev) => prev.filter((o) => o.id !== id))
    } catch {
      toast.error('Erro ao atualizar oportunidade')
    }
  }

  return (
    <div className="flex flex-col h-full bg-muted/10">
      <div className="p-4 border-b flex items-center justify-between bg-background">
        <div className="flex items-center gap-2 font-semibold">
          <Star className="h-5 w-5 text-yellow-500" />
          Oportunidades
        </div>
        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
          {opps.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : opps.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground flex flex-col items-center">
            <Inbox className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm">Nenhuma oportunidade nova</p>
          </div>
        ) : (
          opps.map((opp) => (
            <div
              key={opp.id}
              className="border bg-card p-3 rounded-lg shadow-sm text-sm flex flex-col gap-2"
            >
              <div className="flex justify-between">
                <span className="font-semibold text-primary">{opp.autor}</span>
                <span className="text-xs text-muted-foreground bg-muted px-1.5 rounded">
                  {opp.rede_social}
                </span>
              </div>
              <p className="line-clamp-3 text-muted-foreground text-xs leading-relaxed">
                {opp.conteudo}
              </p>
              <div className="flex justify-end gap-1 mt-2">
                <DMModal
                  dest={opp.autor}
                  rede={opp.rede_social}
                  trigger={
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                      title="Responder"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  }
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleUpdateStatus(opp.id, 'ignorada')}
                  title="Ignorar"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                  onClick={() => handleUpdateStatus(opp.id, 'arquivada')}
                  title="Arquivar"
                >
                  <Archive className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
