import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { getUnreadNotifications, markNotificationRead } from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'
import { RecordModel } from 'pocketbase'

export function Notifications() {
  const [notifications, setNotifications] = useState<RecordModel[]>([])
  const [open, setOpen] = useState(false)

  const loadNotifications = async () => {
    try {
      const data = await getUnreadNotifications()
      setNotifications(data)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  useRealtime('notifications', () => {
    loadNotifications()
  })

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h4 className="font-medium text-sm">Notificações</h4>
          <span className="text-xs text-muted-foreground">{notifications.length} não lidas</span>
        </div>
        <div className="max-h-80 overflow-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Você não tem novas notificações
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="flex flex-col gap-1 p-4 border-b hover:bg-muted/50 cursor-pointer"
                onClick={() => handleMarkRead(n.id)}
              >
                <span className="text-sm">{n.mensagem}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(n.created).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
