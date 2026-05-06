import { useState, useEffect } from 'react'
import { getIntegracoes } from '@/services/integracao_redes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function Integrations() {
  const [integracoes, setIntegracoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getIntegracoes()
        setIntegracoes(data)
      } catch (err) {
        toast.error('Erro ao carregar configurações')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const getStatusColor = (status: string) => {
    if (status === 'conectado') return 'bg-green-500'
    if (status === 'expirado') return 'bg-yellow-500'
    return 'bg-slate-300'
  }

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )

  const redes = ['facebook', 'instagram', 'linkedin', 'tiktok']

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {redes.map((rede) => {
          const int = integracoes.find((i) => i.rede_social === rede)
          const status = int ? int.status : 'desconectado'
          return (
            <div key={rede} className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                <span className="capitalize font-medium">{rede}</span>
                {status !== 'desconectado' && <Badge variant="outline">{status}</Badge>}
              </div>
              <Button variant="outline" onClick={() => toast.success('Ação de conectar simulada!')}>
                {status === 'conectado' ? 'Reconectar' : 'Conectar'}
              </Button>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
