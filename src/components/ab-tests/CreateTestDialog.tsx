import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { getPublishedPosts, createABTest } from '@/services/api'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'

export function CreateTestDialog({ open, onOpenChange, onSuccess }: any) {
  const { user } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [postA, setPostA] = useState('')
  const [postB, setPostB] = useState('')
  const [metric, setMetric] = useState('likes')
  const [duration, setDuration] = useState('7')

  useEffect(() => {
    if (open) {
      getPublishedPosts()
        .then(setPosts)
        .catch(() => {})
      setPostA('')
      setPostB('')
      setMetric('likes')
      setDuration('7')
    }
  }, [open])

  const handleSubmit = async () => {
    if (!postA || !postB) return toast.error('Selecione os dois posts.')
    if (postA === postB) return toast.error('Selecione dois posts diferentes.')

    setLoading(true)
    try {
      const finalDate = new Date()
      finalDate.setDate(finalDate.getDate() + parseInt(duration, 10))

      await createABTest({
        empresa_id: user?.empresa_id,
        post_id_a: postA,
        post_id_b: postB,
        status: 'ativo',
        metrica_principal: metric,
        dias_duracao: parseInt(duration, 10),
        finalizado_em: finalDate.toISOString(),
      })
      toast.success('Teste A/B criado com sucesso!')
      onSuccess()
    } catch (err) {
      toast.error('Erro ao criar teste.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Teste A/B</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Post A</Label>
            <Select value={postA} onValueChange={setPostA}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o primeiro post" />
              </SelectTrigger>
              <SelectContent>
                {posts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Post B</Label>
            <Select value={postB} onValueChange={setPostB}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o segundo post" />
              </SelectTrigger>
              <SelectContent>
                {posts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 mt-2">
            <Label>Métrica Principal</Label>
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="likes">Curtidas (Likes)</SelectItem>
                <SelectItem value="comentarios">Comentários</SelectItem>
                <SelectItem value="alcance">Alcance</SelectItem>
                <SelectItem value="engajamento">Taxa de Engajamento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 mt-2">
            <Label>Duração do Teste</Label>
            <RadioGroup value={duration} onValueChange={setDuration} className="flex gap-4 mt-1">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="7" id="d7" />
                <Label htmlFor="d7">7 dias</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="14" id="d14" />
                <Label htmlFor="d14">14 dias</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="30" id="d30" />
                <Label htmlFor="d30">30 dias</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            Criar Teste
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
