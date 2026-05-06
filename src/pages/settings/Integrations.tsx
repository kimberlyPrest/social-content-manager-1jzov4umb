import { useState, useEffect, useCallback } from 'react'
import {
  getIntegracoes,
  createIntegracao,
  updateIntegracao,
  IntegracaoRede,
} from '@/services/integracao_redes'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Facebook, Instagram, Linkedin, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { format } from 'date-fns'

const TiktokIcon = (props: any) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
)

const REDES = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
  { id: 'tiktok', name: 'TikTok', icon: TiktokIcon, color: '#000000' },
]

function StatusBadge({ status }: { status: string }) {
  if (status === 'conectado') {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none gap-1">
        <CheckCircle2 className="w-3 h-3" /> Conectado
      </Badge>
    )
  }
  if (status === 'expirado') {
    return (
      <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-none gap-1">
        <AlertCircle className="w-3 h-3" /> Expirado
      </Badge>
    )
  }
  return (
    <Badge className="bg-slate-500/10 text-slate-600 hover:bg-slate-500/20 border-none gap-1">
      <XCircle className="w-3 h-3" /> Desconectado
    </Badge>
  )
}

export default function Integrations() {
  const [integracoes, setIntegracoes] = useState<IntegracaoRede[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { user } = useAuth()

  const [connectModalOpen, setConnectModalOpen] = useState(false)
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false)
  const [selectedRede, setSelectedRede] = useState<any>(null)
  const [isAuthorizing, setIsAuthorizing] = useState(false)

  const loadData = useCallback(() => {
    setLoading(true)
    setError(false)
    getIntegracoes()
      .then(async (data) => {
        const now = new Date()
        const updatedData = await Promise.all(
          data.map(async (int) => {
            if (int.status === 'conectado' && int.data_expiracao) {
              const expDate = new Date(int.data_expiracao)
              if (expDate < now) {
                const res = await updateIntegracao(int.id, { status: 'expirado' })
                return res
              }
            }
            return int
          }),
        )
        setIntegracoes(updatedData)
      })
      .catch(() => {
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('integracao_redes', () => {
    getIntegracoes()
      .then((data) => setIntegracoes(data))
      .catch(() => {})
  })

  const handleConnect = async () => {
    if (!selectedRede || !user?.empresa_id) return
    setIsAuthorizing(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      const existing = integracoes.find((i) => i.rede_social === selectedRede.id)

      const expDate = new Date()
      expDate.setDate(expDate.getDate() + 60)

      const payload = {
        status: 'conectado' as const,
        access_token: `mock_token_${selectedRede.id}`,
        data_expiracao: expDate.toISOString(),
      }

      const res = existing
        ? await updateIntegracao(existing.id, payload)
        : await createIntegracao({
            empresa_id: user.empresa_id,
            rede_social: selectedRede.id,
            ...payload,
          })

      setIntegracoes((prev) =>
        existing ? prev.map((i) => (i.id === res.id ? res : i)) : [...prev, res],
      )
      toast.success(`${selectedRede.name} conectado com sucesso!`)
      setConnectModalOpen(false)
    } catch (err) {
      toast.error(`Erro ao conectar ${selectedRede.name}.`)
    } finally {
      setIsAuthorizing(false)
    }
  }

  const handleDisconnect = async () => {
    const existing = integracoes.find((i) => i.rede_social === selectedRede?.id)
    if (!existing) return
    try {
      const res = await updateIntegracao(existing.id, { status: 'desconectado', access_token: '' })
      setIntegracoes((prev) => prev.map((i) => (i.id === res.id ? res : i)))
      toast.success(`${selectedRede.name} desconectado.`)
      setDisconnectModalOpen(false)
    } catch (err) {
      toast.error(`Erro ao desconectar ${selectedRede.name}.`)
    }
  }

  const openConnect = (r: any) => {
    setSelectedRede(r)
    setConnectModalOpen(true)
  }
  const openDisconnect = (r: any) => {
    setSelectedRede(r)
    setDisconnectModalOpen(true)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrações</h1>
        <p className="text-muted-foreground">
          Conecte suas redes sociais para publicar e monitorar.
        </p>
      </div>

      {!loading && !error && !integracoes.some((i) => i.status === 'conectado') && (
        <Alert className="bg-muted/50 border-none">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Nenhuma rede conectada.</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="border-none flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Erro ao carregar integrações. Tente novamente.</AlertDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="bg-transparent hover:bg-destructive-foreground/10 text-destructive"
          >
            Tentar novamente
          </Button>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading && integracoes.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[180px] rounded-xl" />
            ))
          : REDES.map((rede) => {
              const int = integracoes.find((i) => i.rede_social === rede.id)
              const status = int?.status || 'desconectado'
              const isConn = status === 'conectado'
              const isExp = status === 'expirado'

              return (
                <Card
                  key={rede.id}
                  className="flex flex-col shadow-subtle hover:shadow-elevation transition-all duration-300"
                >
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2.5 rounded-xl text-white"
                        style={{ backgroundColor: rede.color }}
                      >
                        <rede.icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-lg font-semibold">{rede.name}</CardTitle>
                    </div>
                    <StatusBadge status={status} />
                  </CardHeader>
                  <CardContent className="py-4 flex-1">
                    {isConn && int?.created ? (
                      <p className="text-sm font-medium text-muted-foreground">
                        Conectado desde {format(new Date(int.created), 'dd/MM/yyyy')}
                      </p>
                    ) : isExp && int?.data_expiracao ? (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Conectado desde{' '}
                          {int.created ? format(new Date(int.created), 'dd/MM/yyyy') : ''}
                        </p>
                        <p className="text-sm font-medium text-destructive">
                          Expirou em {format(new Date(int.data_expiracao), 'dd/MM/yyyy')}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-muted-foreground">Não conectado</p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-4 border-t mt-auto justify-end">
                    {isConn ? (
                      <Button variant="outline" onClick={() => openDisconnect(rede)}>
                        Desconectar
                      </Button>
                    ) : (
                      <Button
                        style={{ backgroundColor: rede.color, color: '#fff' }}
                        onClick={() => openConnect(rede)}
                      >
                        {isExp ? 'Reconectar' : 'Conectar'}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
      </div>

      <Dialog
        open={connectModalOpen}
        onOpenChange={(open) => !isAuthorizing && setConnectModalOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conectar {selectedRede?.name}</DialogTitle>
            <DialogDescription>
              Autorize o Social Content Manager a publicar e monitorar conteúdos no seu{' '}
              {selectedRede?.name}. Você será redirecionado para a página de autorização.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConnectModalOpen(false)}
              disabled={isAuthorizing}
            >
              Cancelar
            </Button>
            <Button
              style={{ backgroundColor: selectedRede?.color, color: '#fff' }}
              onClick={handleConnect}
              disabled={isAuthorizing}
            >
              {isAuthorizing ? 'Autorizando...' : `Autorizar ${selectedRede?.name}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={disconnectModalOpen} onOpenChange={setDisconnectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desconectar {selectedRede?.name}</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja desconectar o {selectedRede?.name}? Você não poderá mais
              publicar ou monitorar conteúdos nesta rede.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisconnectModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDisconnect}>
              Desconectar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
