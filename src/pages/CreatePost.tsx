import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { createPost } from '@/services/api'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const NETWORKS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'tiktok', label: 'TikTok' },
]

const formSchema = z.object({
  titulo: z.string().min(3, 'Título muito curto'),
  conteudo: z.string().min(10, 'Conteúdo deve ter ao menos 10 caracteres'),
  redes_sociais: z.array(z.string()).min(1, 'Selecione ao menos uma rede social'),
})

export default function CreatePost() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: '',
      conteudo: '',
      redes_sociais: [],
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return

    try {
      await createPost({
        ...values,
        empresa_id: user.empresa_id,
        criador_id: user.id,
        status: 'rascunho',
      })
      toast.success('Post salvo como rascunho com sucesso!')
      navigate('/posts')
    } catch (error) {
      toast.error('Erro ao salvar post. Tente novamente.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/posts')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Criar Post</h2>
          <p className="text-muted-foreground">Crie ou agende um novo conteúdo.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título Interno</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Lançamento de Inverno" {...field} />
                    </FormControl>
                    <FormDescription>
                      Usado apenas para identificação na plataforma.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conteudo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo (Legenda)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Escreva a legenda do post..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="redes_sociais"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Redes Sociais</FormLabel>
                      <FormDescription>Selecione onde este post será publicado.</FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {NETWORKS.map((network) => (
                        <FormField
                          key={network.id}
                          control={form.control}
                          name="redes_sociais"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={network.id}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(network.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, network.id])
                                        : field.onChange(
                                            field.value?.filter((value) => value !== network.id),
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {network.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => navigate('/posts')}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Salvar Rascunho
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
