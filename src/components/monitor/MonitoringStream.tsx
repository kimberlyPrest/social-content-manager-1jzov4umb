import { useEffect, useState } from 'react'
import { getMonitoredPosts, createOpportunity } from '@/services/monitor'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Heart, MessageCircle, Share2, Star, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DMModal } from './DMModal'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function MonitoringStream() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(false)

  const load = async (p: number, append = false) => {
    setError(false)
    try {
      const data = await getMonitoredPosts(p)
      if (append) setPosts((prev) => [...prev, ...data.items])
      else setPosts(data.items)
      setHasMore(data.page < data.totalPages)
    } catch {
      setError(true)
      toast.error('Erro ao carregar stream. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(1)
  }, [])

  useRealtime('posts_monitorados', (e) => {
    if (e.action === 'create') {
      setPosts((prev) => [e.record, ...prev])
    }
  })

  const handleSaveOpp = async (post: any) => {
    try {
      await createOpportunity({
        empresa_id: user.empresa_id,
        usuario_id: user.id,
        post_id: post.id,
        autor: post.autor,
        rede_social: post.rede_social,
        conteudo: post.conteudo,
        status: 'nova',
      })
      toast.success('Salvo como oportunidade!')
    } catch {
      toast.error('Erro ao salvar oportunidade')
    }
  }

  if (error && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground p-8 text-center">
        <p>Erro ao carregar stream. Tente novamente.</p>
        <Button variant="outline" onClick={() => load(1)}>
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-background/95 backdrop-blur shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-2 font-semibold">
          <Radio className="h-5 w-5 text-primary animate-pulse" />
          Stream ao vivo
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && posts.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 w-full" />)
        ) : posts.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-card border rounded-xl">
            Nenhum post encontrado. Adicione um monitoramento para começar.
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="p-4 rounded-xl border bg-card animate-fade-in-down shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm uppercase">
                    {post.autor?.substring(0, 2).replace('@', '')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-none">{post.autor}</p>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                      {post.rede_social}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created), { addSuffix: true, locale: ptBR })}
                </span>
              </div>
              <p className="text-sm mb-4 leading-relaxed whitespace-pre-wrap">{post.conteudo}</p>
              <div className="flex items-center justify-between border-t pt-3">
                <div className="flex gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-xs font-medium">
                    <Heart className="h-3.5 w-3.5" /> {post.curtidas || 0}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium">
                    <MessageCircle className="h-3.5 w-3.5" /> {post.comentarios || 0}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium">
                    <Share2 className="h-3.5 w-3.5" /> {post.compartilhamentos || 0}
                  </span>
                </div>
                <div className="flex gap-2">
                  <DMModal dest={post.autor} rede={post.rede_social} />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8"
                    onClick={() => handleSaveOpp(post)}
                  >
                    <Star className="h-3.5 w-3.5 mr-1.5" /> Salvar
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
        {hasMore && !loading && (
          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => {
              setPage((p) => p + 1)
              load(page + 1, true)
            }}
          >
            Carregar mais antigos
          </Button>
        )}
      </div>
    </div>
  )
}
