import { useEffect, useState } from 'react'
import { Bell, Trash2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  getAllNotifications,
  markAllNotificationsRead,
  deleteNotification,
  markNotificationRead,
} from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [filter, setFilter] = useState('all')

  const loadNotifications = async () => {
    try {
      const data = await getAllNotifications()
      setNotifications(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  useRealtime('notifications', loadNotifications)

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      toast.success('Todas as notificações marcadas como lidas')
      loadNotifications()
    } catch (err) {
      toast.error('Erro ao atualizar')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id)
      toast.success('Notificação removida')
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (err) {
      toast.error('Erro ao remover')
    }
  }

  const handleMarkRead = async (n: any) => {
    if (n.lida) return
    try {
      await markNotificationRead(n.id)
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, lida: true } : item)),
      )
    } catch {
      /* intentionally ignored */
    }
  }

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.lida
    return n.tipo === filter
  })

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Central de Notificações</h2>
          <p className="text-muted-foreground">Fique atualizado sobre o que acontece na equipe.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleMarkAllRead}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Marcar todas como lidas
          </Button>
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="unread">Não lidas</TabsTrigger>
          <TabsTrigger value="comentario">Comentários</TabsTrigger>
          <TabsTrigger value="post_aprovado">Aprovações</TabsTrigger>
          <TabsTrigger value="teste_finalizado">Testes A/B</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">Nenhuma notificação</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Você está em dia com todas as atualizações!
            </p>
          </div>
        ) : (
          filtered.map((n) => (
            <Card
              key={n.id}
              className={`transition-colors ${n.lida ? 'bg-card' : 'bg-primary/5 border-primary/20'}`}
            >
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div
                  className="flex items-start gap-4 flex-1 cursor-pointer"
                  onClick={() => handleMarkRead(n)}
                >
                  <div
                    className={`p-2 rounded-full ${n.lida ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}
                  >
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col space-y-1 flex-1">
                    <p className={`text-sm ${!n.lida ? 'font-semibold' : 'text-muted-foreground'}`}>
                      {n.mensagem}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {new Date(n.created).toLocaleString('pt-BR', {
                          dateStyle: 'long',
                          timeStyle: 'short',
                        })}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{n.tipo.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!n.lida && (
                    <Badge variant="default" className="text-[10px]">
                      Nova
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-red-500"
                    onClick={() => handleDelete(n.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
