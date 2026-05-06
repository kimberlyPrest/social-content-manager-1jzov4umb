import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { getPost, getPostMetrics } from '@/services/api'
import { Facebook, Instagram, Linkedin, Video, Image as ImageIcon } from 'lucide-react'

const NETWORK_ICONS: Record<string, any> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  tiktok: Video,
}

interface PostPreviewDialogProps {
  postId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PostPreviewDialog({ postId, open, onOpenChange }: PostPreviewDialogProps) {
  const [loading, setLoading] = useState(false)
  const [post, setPost] = useState<any>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open && postId) {
      loadPost(postId)
    } else {
      setPost(null)
      setMetrics(null)
      setError(null)
    }
  }, [open, postId])

  const loadPost = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const postData = await getPost(id)
      setPost(postData)

      if (postData.status === 'publicado') {
        const metricsData = await getPostMetrics(id)
        const aggregated = metricsData.reduce(
          (acc, m) => {
            acc.curtidas += m.curtidas || 0
            acc.comentarios += m.comentarios || 0
            acc.compartilhamentos += m.compartilhamentos || 0
            acc.alcance += m.alcance || 0
            return acc
          },
          { curtidas: 0, comentarios: 0, compartilhamentos: 0, alcance: 0 },
        )
        setMetrics(aggregated)
      }
    } catch (err: any) {
      console.error(err)
      if (err?.status === 404) {
        setError('Post não encontrado')
      } else {
        setError('Erro ao carregar post')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    if (postId) {
      onOpenChange(false)
      navigate(`/posts/${postId}/edit`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Preview do Post</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{error}</p>
            </div>
          ) : post ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{post.titulo}</h3>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className="capitalize">
                    {post.status}
                  </Badge>
                  {post.redes_sociais?.map((net: string) => {
                    const Icon = NETWORK_ICONS[net] || Facebook
                    return (
                      <Badge
                        key={net}
                        variant="secondary"
                        className="flex items-center gap-1 capitalize"
                      >
                        <Icon className="h-3 w-3" />
                        {net}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              <div className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md max-h-48 overflow-y-auto">
                {post.conteudo || (
                  <span className="text-muted-foreground italic">Sem conteúdo textual</span>
                )}
              </div>

              {(post.imagens || post.videos) && (
                <div className="flex gap-4 items-center text-sm text-muted-foreground bg-muted/20 p-2 rounded-md">
                  {post.imagens && (
                    <span className="flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" /> Contém imagem(ns)
                    </span>
                  )}
                  {post.videos && (
                    <span className="flex items-center gap-1">
                      <Video className="h-4 w-4" /> Contém vídeo(s)
                    </span>
                  )}
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-1">
                {post.status === 'publicado' && post.publicado_em && (
                  <p>Publicado em: {new Date(post.publicado_em).toLocaleString('pt-BR')}</p>
                )}
                {(post.status === 'agendado' || post.status === 'rascunho') &&
                  post.agendado_para && (
                    <p>Agendado para: {new Date(post.agendado_para).toLocaleString('pt-BR')}</p>
                  )}
              </div>

              {metrics && post.status === 'publicado' && (
                <div className="grid grid-cols-4 gap-2 pt-4 border-t mt-4">
                  <div className="text-center bg-muted/30 p-2 rounded-md">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Curtidas
                    </p>
                    <p className="font-semibold text-sm">{metrics.curtidas}</p>
                  </div>
                  <div className="text-center bg-muted/30 p-2 rounded-md">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Coments
                    </p>
                    <p className="font-semibold text-sm">{metrics.comentarios}</p>
                  </div>
                  <div className="text-center bg-muted/30 p-2 rounded-md">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Shares
                    </p>
                    <p className="font-semibold text-sm">{metrics.compartilhamentos}</p>
                  </div>
                  <div className="text-center bg-muted/30 p-2 rounded-md">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Alcance
                    </p>
                    <p className="font-semibold text-sm">{metrics.alcance}</p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {post && !error && <Button onClick={handleEdit}>Editar</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
