import { useState, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { getIntegracoes } from '@/services/integracao_redes'
import { cn } from '@/lib/utils'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ImageUploader } from './ImageUploader'
import { PostFormValues } from '@/lib/validations/post'

const NETWORKS = [
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'tiktok', label: 'TikTok' },
]

interface PostFormProps {
  form: UseFormReturn<PostFormValues>
  images: File[]
  setImages: (images: File[]) => void
  existingImages?: string[]
  onRemoveExisting?: (img: string) => void
}

export function PostForm({
  form,
  images,
  setImages,
  existingImages,
  onRemoveExisting,
}: PostFormProps) {
  const conteudo = form.watch('conteudo') || ''
  const titulo = form.watch('titulo') || ''
  const agendamentoTipo = form.watch('agendamento_tipo')

  const [connectedNetworks, setConnectedNetworks] = useState<string[]>([])

  useEffect(() => {
    getIntegracoes()
      .then((res) => {
        const connected = res
          .filter((i) => i.status === 'conectado' && !!i.access_token)
          .map((i) => i.rede_social)
        setConnectedNetworks(connected)
      })
      .catch(console.error)
  }, [])

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título do post (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Título interno..." {...field} />
              </FormControl>
              <FormDescription className="text-right text-xs">{titulo.length}/100</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="conteudo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conteúdo</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Escreva o conteúdo do post aqui..."
                  className="min-h-[200px] resize-y"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-right text-xs">
                {conteudo.length}/5000
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel>Imagens</FormLabel>
          <ImageUploader
            images={images}
            onChange={setImages}
            existingImages={existingImages}
            onRemoveExisting={onRemoveExisting}
          />
        </div>

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
                {NETWORKS.map((network) => {
                  const isConnected = connectedNetworks.includes(network.id)
                  return (
                    <FormField
                      key={network.id}
                      control={form.control}
                      name="redes_sociais"
                      render={({ field }) => (
                        <FormItem
                          className={cn(
                            'flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm transition-colors',
                            isConnected ? 'bg-card hover:bg-accent/50' : 'bg-muted/50 opacity-60',
                          )}
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(network.id)}
                              disabled={!isConnected}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), network.id])
                                  : field.onChange(
                                      field.value?.filter((value) => value !== network.id),
                                    )
                              }}
                            />
                          </FormControl>
                          <div className="flex flex-col flex-1">
                            <FormLabel
                              className={cn(
                                'font-normal text-sm w-full',
                                isConnected ? 'cursor-pointer' : 'cursor-not-allowed',
                              )}
                            >
                              {network.label}
                            </FormLabel>
                            {!isConnected && (
                              <span className="text-[10px] text-destructive leading-none mt-1">
                                Desconectada
                              </span>
                            )}
                          </div>
                        </FormItem>
                      )}
                    />
                  )
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="agendamento_tipo"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <FormLabel>Agendamento</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="agora" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Publicar agora</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="depois" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Agendar para depois
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {agendamentoTipo === 'depois' && (
          <FormField
            control={form.control}
            name="agendado_para"
            render={({ field }) => (
              <FormItem className="animate-fade-in">
                <FormLabel>Data e Hora</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} className="w-full sm:w-auto" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </form>
    </Form>
  )
}
