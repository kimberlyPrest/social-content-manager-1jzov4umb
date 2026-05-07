import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MessageSquare, Trash2, Edit, ImageOff } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { getPosts, deletePost, updatePost } from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'

function PostThumbnail({ post }: { post: any }) {
  const filename = Array.isArray(post.imagens) ? post.imagens[0] : post.imagens
  const src = filename ? pb.files.getURL(post, filename) : post.imagem_url || null

  if (!src) {
    return (
      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
        <ImageOff className="w-4 h-4 text-muted-foreground" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt=""
      className="w-10 h-10 rounded-md object-cover shrink-0"
      onError={(e) => {
        ;(e.currentTarget as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}

export default function Posts() {
  const [posts, setPosts] = useState<any[]>([])
  const [selectedPost, setSelectedPost] = useState<any | null>(null)
  const [editPost, setEditPost] = useState<any | null>(null)
  const [editData, setEditData] = useState<any>({})
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

  const handleEditClick = (post: any) => {
    console.log(
      `[Bug Scanner] Action: Editar, PostID: ${post.id}, Timestamp: ${new Date().toISOString()}`,
    )
    setEditPost(post)
    let dateStr = ''
    if (post.agendado_para) {
      const d = new Date(post.agendado_para)
      if (!isNaN(d.getTime())) {
        const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        dateStr = localDate.toISOString().substring(0, 16)
      }
    }
    setEditData({
      titulo: post.titulo || '',
      conteudo: post.conteudo || '',
      agendado_para: dateStr,
    })
  }

  const handleSaveEdit = async () => {
    try {
      const dataToSave = { ...editData }
      if (dataToSave.agendado_para) {
        const localDate = new Date(dataToSave.agendado_para)
        dataToSave.agendado_para = localDate.toISOString()
      } else {
        dataToSave.agendado_para = null
      }

      await updatePost(editPost.id, dataToSave)
      toast({ title: 'Sucesso', description: 'Post atualizado com sucesso!' })
      setEditPost(null)
      loadPosts()
    } catch (err: any) {
      console.error(
        `[Bug Scanner] Error: Editar, PostID: ${editPost.id}, Timestamp: ${new Date().toISOString()}`,
        err,
      )
      toast({
        title: 'Erro',
        description: 'Erro ao editar post. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (post: any) => {
    console.log(
      `[Bug Scanner] Action: Deletar, PostID: ${post.id}, Timestamp: ${new Date().toISOString()}`,
    )
    if (!window.confirm('Tem certeza?')) return

    try {
      await deletePost(post.id)
      toast({
        title: 'Sucesso',
        description: 'Post deletado com sucesso!',
      })
      setPosts(posts.filter((p) => p.id !== post.id))
    } catch (err: any) {
      console.error(
        `[Bug Scanner] Error: Deletar, PostID: ${post.id}, Timestamp: ${new Date().toISOString()}`,
        err,
      )
      toast({
        title: 'Erro',
        description: 'Erro ao deletar post. Tente novamente.',
        variant: 'destructive',
      })
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
                    <div className="flex items-center gap-3">
                      <PostThumbnail post={post} />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span>{post.titulo}</span>
                          {post.origem === 'importado' && (
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 text-pink-600 border-pink-300"
                            >
                              importado
                            </Badge>
                          )}
                        </div>
                        {post.status_aprovacao && post.status_aprovacao !== 'nenhum' && (
                          <span className="text-xs text-muted-foreground mt-1">
                            Aprovação:{' '}
                            <Badge variant="outline" className="text-[10px] py-0">
                              {post.status_aprovacao.replace('_', ' ')}
                            </Badge>
                          </span>
                        )}
                      </div>
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
                        onClick={() => handleEditClick(post)}
                        title="Editar Post"
                      >
                        <Edit className="h-4 w-4" />
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

      <Dialog open={!!editPost} onOpenChange={(val) => !val && setEditPost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={editData.titulo}
                onChange={(e) => setEditData({ ...editData, titulo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <Textarea
                value={editData.conteudo}
                onChange={(e) => setEditData({ ...editData, conteudo: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Data Agendada</Label>
              <Input
                type="datetime-local"
                value={editData.agendado_para}
                onChange={(e) => setEditData({ ...editData, agendado_para: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPost(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
