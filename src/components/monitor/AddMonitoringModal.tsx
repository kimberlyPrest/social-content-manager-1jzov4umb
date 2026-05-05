import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { createMonitoringRule, syncMonitoring } from '@/services/monitor'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

export function AddMonitoringModal() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [tipo, setTipo] = useState('')
  const [valor, setValor] = useState('')
  const [redes, setRedes] = useState<string[]>([])

  const toggleRede = (rede: string) => {
    setRedes((prev) => (prev.includes(rede) ? prev.filter((r) => r !== rede) : [...prev, rede]))
  }

  const handleSubmit = async () => {
    if (!tipo || !valor || redes.length === 0) {
      toast.error('Preencha todos os campos')
      return
    }
    try {
      await createMonitoringRule({
        empresa_id: user.empresa_id,
        tipo,
        valor,
        rede_social: redes.join(', '),
        ativo: true,
      })
      toast.success('Monitoramento adicionado com sucesso!')
      setOpen(false)
      setTipo('')
      setValor('')
      setRedes([])

      syncMonitoring().catch(() => {})
    } catch {
      toast.error('Erro ao adicionar')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" /> Adicionar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Monitoramento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hashtag">Hashtag</SelectItem>
                <SelectItem value="palavra_chave">Palavra-chave</SelectItem>
                <SelectItem value="mencao">Menção</SelectItem>
                <SelectItem value="concorrente">Concorrente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Valor</Label>
            <Input
              placeholder="Ex: #supremoaroma"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Redes Sociais</Label>
            <div className="flex flex-wrap gap-4">
              {['Facebook', 'Instagram', 'LinkedIn', 'TikTok'].map((rede) => (
                <div key={rede} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rede-${rede}`}
                    checked={redes.includes(rede)}
                    onCheckedChange={() => toggleRede(rede)}
                  />
                  <label htmlFor={`rede-${rede}`} className="text-sm cursor-pointer">
                    {rede}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <Button className="w-full" onClick={handleSubmit}>
            Salvar Regra
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
