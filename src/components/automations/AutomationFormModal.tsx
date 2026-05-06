import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'

export const automationSchema = z.object({
  titulo: z.string().min(1, 'Preencha este campo'),
  descricao: z.string().optional(),
  gatilho: z.enum(
    ['post_publicado', 'novo_comentario', 'teste_finalizado', 'mencao', 'post_agendado'],
    { required_error: 'Preencha este campo' },
  ),
  ferramenta: z.enum(['zapier', 'make'], { required_error: 'Preencha este campo' }),
  webhook_url: z.string().url('URL inválida').min(1, 'Preencha este campo'),
})

export type AutomationFormData = z.infer<typeof automationSchema>

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  isEditing: boolean
  initialData?: AutomationFormData
  onSubmit: (data: AutomationFormData) => void
  onError: () => void
}

export function AutomationFormModal({
  open,
  onOpenChange,
  isEditing,
  initialData,
  onSubmit,
  onError,
}: Props) {
  const form = useForm<AutomationFormData>({
    resolver: zodResolver(automationSchema),
    defaultValues: initialData || {
      titulo: '',
      descricao: '',
      gatilho: undefined as any,
      ferramenta: undefined as any,
      webhook_url: '',
    },
  })

  useEffect(() => {
    if (open && initialData) {
      form.reset(initialData)
    } else if (!open) {
      form.reset({
        titulo: '',
        descricao: '',
        gatilho: undefined as any,
        ferramenta: undefined as any,
        webhook_url: '',
      })
    }
  }, [open, initialData, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Automação' : 'Criar Nova Automação'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Novo post -> Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      placeholder="Breve descrição da automação..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gatilho"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gatilho</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="post_publicado">Post publicado</SelectItem>
                        <SelectItem value="post_agendado">Post agendado</SelectItem>
                        <SelectItem value="novo_comentario">Novo comentário</SelectItem>
                        <SelectItem value="teste_finalizado">Teste A/B finalizado</SelectItem>
                        <SelectItem value="mencao">Menção em monitoramento</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ferramenta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ferramenta</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="zapier">Zapier</SelectItem>
                        <SelectItem value="make">Make</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="webhook_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Webhook</FormLabel>
                  <FormControl>
                    <Input placeholder="https://hooks.zapier.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
