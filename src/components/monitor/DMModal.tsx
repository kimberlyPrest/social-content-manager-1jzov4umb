import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { createDirectMessage } from '@/services/monitor'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

interface DMModalProps {
  dest: string
  rede: string
  trigger?: React.ReactNode
}

export function DMModal({ dest, rede, trigger }: DMModalProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!msg.trim()) return
    setLoading(true)
    try {
      await createDirectMessage({
        empresa_id: user.empresa_id,
        usuario_id: user.id,
        destinatario: dest,
        rede_social: rede.toLowerCase(),
        mensagem: msg,
        status: 'enviado',
      })
      toast.success('Mensagem enviada com sucesso!')
      setOpen(false)
      setMsg('')
    } catch {
      toast.error('Erro ao enviar mensagem. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" size="sm" className="h-8">
            <Send className="h-3 w-3 mr-1.5" /> DM
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar DM para {dest}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Textarea
            placeholder="Sua mensagem..."
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            rows={4}
          />
          <Button className="w-full" onClick={handleSend} disabled={loading}>
            <Send className="h-4 w-4 mr-2" /> Enviar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
