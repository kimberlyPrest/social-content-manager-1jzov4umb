import { useState, useEffect } from 'react'
import {
  getIntegracoes,
  createIntegracao,
  updateIntegracao,
  IntegracaoRede,
} from '@/services/integracao_redes'
import { useAuth } from '@/hooks/use-auth'
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

  useEffect(() => {
    getIntegracoes()
      .then(setIntegracoes)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const handleConnect = async () => {
    if (!selectedRede || !user?.empresa_id) return
    try {
      const existing = integracoes.find((i) => i.rede_social === selectedRede.id)
      const payload = {
        status: 'conectado' as const,
        access_token: `mock_token_${selectedRede.id}`,
      }

      const res = existing
        ? await updateIntegracao(existing.id, { ...payload, data_expiracao: '' })
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
    }
  }

  const handleDisconnect = async () => {
    const existing = integracoes.find((i) => i.rede_social === selectedRede?.id)
    if (!existing) return
    try {
      const res = await updateIntegracao(existing.id, { status: 'desconectado' })
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
        <Alert variant="destructive" className="border-none">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Erro ao carregar integrações. Tente novamente.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading
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
                        Conectado em {format(new Date(int.created), 'dd/MM/yyyy')}
                      </p>
                    ) : isExp && int?.data_expiracao ? (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Conectado em{' '}
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

      <Dialog open={connectModalOpen} onOpenChange={setConnectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conectar {selectedRede?.name}</DialogTitle>
            <DialogDescription>
              Autorize o Social Content Manager a publicar e monitorar conteúdos no seu{' '}
              {selectedRede?.name}. Você será redirecionado para a página de autorização.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConnectModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              style={{ backgroundColor: selectedRede?.color, color: '#fff' }}
              onClick={handleConnect}
            >
              Autorizar {selectedRede?.name}
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
