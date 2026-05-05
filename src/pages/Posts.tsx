import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MoreHorizontal, MessageSquare, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PostCommentsPanel } from '@/components/posts/PostCommentsPanel'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getPosts, deletePost } from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'

export default function Posts() {
  const [posts, setPosts] = useState<any[]>([])
  const [selectedPost, setSelectedPost] = useState<any | null>(null)
  const { toast } = useToast()

  const loadPosts = async () => {
    try {
      const data = await getPosts(50)
      setPosts(data.items)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  useRealtime('posts', loadPosts)

  const handleDelete = async (post: any) => {
    if (!window.confirm('Tem certeza que deseja deletar este post?')) return

    try {
      await deletePost(post.id)
      toast({
        title: 'Sucesso',
        description: 'Post deletado com sucesso!',
      })
      setPosts(posts.filter((p) => p.id !== post.id))
    } catch (err: any) {
      const msg = err.response?.message || err.message || 'Erro ao deletar post. Tente novamente.'
      toast({
        title: 'Erro',
        description: msg,
        variant: 'destructive',
      })

      if (msg === 'Post não encontrado') {
        loadPosts()
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Posts</h2>
          <p className="text-muted-foreground">Gerencie seu calendário de conteúdo.</p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
          <Link to="/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Post
          </Link>
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Todos os Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Redes</TableHead>
                <TableHead>Criador</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{post.titulo}</span>
                      {post.status_aprovacao && post.status_aprovacao !== 'nenhum' && (
                        <span className="text-xs text-muted-foreground mt-1">
                          Aprovação:{' '}
                          <Badge variant="outline" className="text-[10px] py-0">
                            {post.status_aprovacao.replace('_', ' ')}
                          </Badge>
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        post.status === 'publicado'
                          ? 'default'
                          : post.status === 'agendado'
                            ? 'secondary'
                            : post.status === 'falhou'
                              ? 'destructive'
                              : 'outline'
                      }
                    >
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">
                    {post.redes_sociais?.join(', ') || '-'}
                  </TableCell>
                  <TableCell>{post.expand?.criador_id?.name}</TableCell>
                  <TableCell>{new Date(post.created).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedPost(post)}
                        title="Comentários e Aprovação"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(post)}
                        title="Deletar Post"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {posts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                    Nenhum post encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedPost && (
        <PostCommentsPanel
          post={selectedPost}
          open={!!selectedPost}
          onOpenChange={(val) => !val && setSelectedPost(null)}
        />
      )}
    </div>
  )
}
