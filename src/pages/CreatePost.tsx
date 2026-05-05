import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, ImagePlus, X, UploadCloud } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { createPostWithFiles } from '@/services/api'
import { SocialPreviews } from '@/components/SocialPreviews'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent } from '@/components/ui/card'
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

const formSchema = z
  .object({
    titulo: z.string().max(100, 'Máximo 100 caracteres').optional(),
    conteudo: z.string().min(1, 'Conteúdo é obrigatório').max(5000, 'Máximo 5000 caracteres'),
    redes_sociais: z.array(z.string()).min(1, 'Selecione pelo menos uma rede social'),
    agendar: z.enum(['now', 'later']),
    agendado_para: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.agendar === 'later' && !data.agendado_para) return false
      if (data.agendar === 'later' && new Date(data.agendado_para) <= new Date()) return false
      return true
    },
    {
      message: 'Data e hora devem ser no futuro',
      path: ['agendado_para'],
    },
  )

export default function CreatePost() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [files, setFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [submitAction, setSubmitAction] = useState<'draft' | 'publish'>('draft')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: '',
      conteudo: '',
      redes_sociais: [],
      agendar: 'now',
      agendado_para: '',
    },
  })

  const watchConteudo = form.watch('conteudo') || ''
  const watchRedes = form.watch('redes_sociais') || []
  const watchAgendar = form.watch('agendar')

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'criador') {
      toast.error('Você não tem permissão para criar posts.')
      navigate('/dashboard')
    }
  }, [user, navigate])

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file))
    setPreviewUrls(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [files])

  const handleFiles = (selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter(
      (f) => f.size <= 5 * 1024 * 1024 && f.type.startsWith('image/'),
    )
    if (validFiles.length < selectedFiles.length)
      toast.warning('Algumas imagens foram ignoradas (max 5MB ou formato inválido).')
    setFiles((prev) => [...prev, ...validFiles].slice(0, 5))
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return

    try {
      const isOverLimit = watchRedes.some((n) => {
        const limit = n === 'facebook' ? 63206 : n === 'linkedin' ? 3000 : 2200
        return watchConteudo.length > limit
      })

      if (isOverLimit && submitAction !== 'draft') {
        toast.error('Conteúdo excede o limite de uma ou mais redes selecionadas.')
        return
      }

      let status = 'rascunho'
      if (submitAction === 'publish') {
        status = values.agendar === 'later' ? 'agendado' : 'publicado'
      }

      const payload = {
        titulo: values.titulo,
        conteudo: values.conteudo,
        redes_sociais: values.redes_sociais,
        status,
        criador_id: user.id,
        empresa_id: user.empresa_id,
        agendado_para:
          values.agendar === 'later' ? new Date(values.agendado_para!).toISOString() : null,
      }

      await createPostWithFiles(payload, files)

      if (status === 'rascunho') toast.success('Post salvo como rascunho!')
      else if (status === 'agendado')
        toast.success(`Post agendado para ${new Date(values.agendado_para!).toLocaleString()}!`)
      else toast.success('Post publicado com sucesso!')

      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar post. Tente novamente.')
    }
  }

  const isSubmitDisabled =
    form.formState.isSubmitting || watchConteudo.length === 0 || watchRedes.length === 0

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/posts')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-purple-950 dark:text-purple-100">
              Criar Post
            </h2>
            <p className="text-muted-foreground">Crie, visualize e agende seu conteúdo.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Editor */}
        <div className="lg:col-span-7 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card className="border-none shadow-elevation">
                <CardContent className="pt-6 space-y-6">
                  <FormField
                    control={form.control}
                    name="redes_sociais"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          1. Onde você quer publicar?
                        </FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                          {NETWORKS.map((network) => (
                            <FormField
                              key={network.id}
                              control={form.control}
                              name="redes_sociais"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2 space-y-0 rounded-md border p-3 bg-muted/20">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(network.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange([...field.value, network.id])
                                        } else {
                                          field.onChange(
                                            field.value?.filter((v) => v !== network.id),
                                          )
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-medium cursor-pointer flex-1">
                                    {network.label}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="titulo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">2. Título (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Lançamento de Inverno" {...field} />
                        </FormControl>
                        <FormDescription className="flex justify-between">
                          <span>Identificação interna na plataforma.</span>
                          <span>{(field.value || '').length}/100</span>
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
                        <FormLabel className="font-semibold">3. Conteúdo da Publicação</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Escreva a legenda do post aqui..."
                            className="min-h-[200px] resize-y"
                            {...field}
                          />
                        </FormControl>
                        <div className="flex justify-end text-xs text-muted-foreground">
                          {watchConteudo.length}/5000
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3">
                    <FormLabel className="font-semibold">
                      4. Mídia (Max 5MB/imagem, até 5 imagens)
                    </FormLabel>
                    <div
                      className={cn(
                        'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
                        isDragging
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/20'
                          : 'border-border',
                      )}
                      onDragOver={(e) => {
                        e.preventDefault()
                        setIsDragging(true)
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault()
                        setIsDragging(false)
                        handleFiles(Array.from(e.dataTransfer.files))
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files) handleFiles(Array.from(e.target.files))
                        }}
                      />
                      <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                      <p className="text-sm font-medium">Arraste e solte suas imagens aqui</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ou clique para procurar no seu computador
                      </p>
                    </div>

                    {previewUrls.length > 0 && (
                      <div className="flex flex-wrap gap-4 mt-4">
                        {previewUrls.map((url, i) => (
                          <div
                            key={url}
                            className="relative group w-24 h-24 rounded-lg overflow-hidden border shadow-sm"
                          >
                            <img src={url} alt="preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setFiles(files.filter((_, index) => index !== i))}
                              className="absolute top-1 right-1 bg-black/60 hover:bg-black p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {files.length < 5 && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors"
                          >
                            <ImagePlus className="w-6 h-6" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <FormField
                      control={form.control}
                      name="agendar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-base">
                            5. Quando publicar?
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-2 mt-2"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="now" />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  Publicar agora
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="later" />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  Agendar para depois
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {watchAgendar === 'later' && (
                      <FormField
                        control={form.control}
                        name="agendado_para"
                        render={({ field }) => (
                          <FormItem className="animate-in fade-in slide-in-from-top-2">
                            <FormLabel>Data e Hora</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} className="max-w-xs" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t">
                    <Button
                      type="submit"
                      variant="outline"
                      className="w-full sm:w-auto"
                      disabled={isSubmitDisabled}
                      onClick={() => setSubmitAction('draft')}
                    >
                      {form.formState.isSubmitting && submitAction === 'draft' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Salvar como rascunho
                    </Button>
                    <Button
                      type="submit"
                      className="w-full sm:w-auto bg-purple-700 hover:bg-purple-800 text-white"
                      disabled={isSubmitDisabled}
                      onClick={() => setSubmitAction('publish')}
                    >
                      {form.formState.isSubmitting && submitAction === 'publish' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {watchAgendar === 'later' ? 'Agendar' : 'Publicar agora'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-5 sticky top-6 h-[calc(100vh-6rem)]">
          <Card className="border-none shadow-elevation h-full flex flex-col bg-muted/10">
            <CardContent className="p-6 flex-1 flex flex-col">
              <h3 className="font-semibold text-lg mb-4 text-purple-950 dark:text-purple-100">
                Preview
              </h3>
              <SocialPreviews
                networks={watchRedes}
                content={watchConteudo}
                title={form.watch('titulo')}
                images={previewUrls}
                companyName={user?.expand?.empresa_id?.nome || 'Supremo Aroma'}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
