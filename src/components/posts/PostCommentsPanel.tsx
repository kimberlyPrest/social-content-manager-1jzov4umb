import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getComments, createComment, deleteComment, updatePostApproval } from '@/services/api'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { Trash2, Send, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { getMensagensProntas, MensagemPronta } from '@/services/mensagens-prontas'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

interface PostCommentsPanelProps {
  post: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PostCommentsPanel({ post, open, onOpenChange }: PostCommentsPanelProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensagensProntas, setMensagensProntas] = useState<MensagemPronta[]>([])

  const loadComments = async () => {
    if (!post?.id) return
    try {
      const data = await getComments(post.id)
      setComments(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (open) {
      loadComments()
      loadMensagensProntas()
    }
  }, [open, post?.id])

  const loadMensagensProntas = async () => {
    try {
      const msgs = await getMensagensProntas()
      setMensagensProntas(msgs)
    } catch (err) {
      console.error('Erro ao carregar mensagens prontas', err)
    }
  }

  useRealtime('comentarios', loadComments, open)
  useRealtime(
    'posts',
    (e) => {
      if (e.action === 'update' && e.record.id === post?.id) {
        // TODO: Handle post update if needed
      }
    },
    open,
  )

  const handleSendComment = async () => {
    if (!newComment.trim() || !user) return
    setLoading(true)
    try {
      await createComment({
        post_id: post.id,
        usuario_id: user.id,
        conteudo: newComment.trim(),
      })
      setNewComment('')
      toast.success('Comentário adicionado!')
    } catch (err) {
      toast.error('Erro ao adicionar comentário')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComment = async (id: string) => {
    try {
      await deleteComment(id)
      toast.success('Comentário removido')
    } catch (err) {
      toast.error('Erro ao remover')
    }
  }

  const handleApprovalAction = async (status: string) => {
    try {
      await updatePostApproval(post.id, status)
      toast.success(`Status atualizado para: ${status.replace('_', ' ')}`)
      onOpenChange(false)
    } catch (err) {
      toast.error('Erro ao atualizar status')
    }
  }

  const isCreator = user?.role === 'criador'
  const isAdmin = user?.role === 'admin'
  const isPostAuthor = post?.criador_id === user?.id

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <div className="p-6 pb-4 border-b">
          <SheetHeader>
            <SheetTitle className="text-xl">{post?.titulo}</SheetTitle>
            <SheetDescription>
              Status de Publicação: <Badge variant="secondary">{post?.status}</Badge>
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 p-4 bg-muted/50 rounded-xl border space-y-3">
            <h4 className="text-sm font-semibold">Workflow de Aprovação</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm">Status Atual:</span>
              <Badge
                variant={
                  post?.status_aprovacao === 'aprovado'
                    ? 'default'
                    : post?.status_aprovacao === 'rejeitado'
                      ? 'destructive'
                      : 'outline'
                }
              >
                {post?.status_aprovacao ? post.status_aprovacao.replace('_', ' ') : 'Nenhum'}
              </Badge>
            </div>

            <div className="flex gap-2 pt-2">
              {isCreator &&
                isPostAuthor &&
                (!post?.status_aprovacao ||
                  post?.status_aprovacao === 'nenhum' ||
                  post?.status_aprovacao === 'rejeitado') && (
                  <Button size="sm" onClick={() => handleApprovalAction('aguardando_aprovacao')}>
                    Solicitar Aprovação
                  </Button>
                )}

              {isAdmin && post?.status_aprovacao === 'aguardando_aprovacao' && (
                <>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprovalAction('aprovado')}
                  >
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleApprovalAction('rejeitado')}
                  >
                    Rejeitar
                  </Button>
                </>
              )}
            </div>
            {isAdmin && post?.status_aprovacao === 'aguardando_aprovacao' && (
              <p className="text-xs text-muted-foreground mt-2">
                Se for rejeitar, por favor deixe um comentário explicando o motivo.
              </p>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {comments.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                <p className="text-sm">Nenhum comentário ainda.</p>
                <p className="text-xs mt-1">Inicie a conversa!</p>
              </div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-3 group">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={c.expand?.usuario_id?.avatar} />
                    <AvatarFallback>{c.expand?.usuario_id?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{c.expand?.usuario_id?.name}</span>
                        <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 capitalize">
                          {c.expand?.usuario_id?.role}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(c.created).toLocaleString('pt-BR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    <p className="text-sm bg-muted/40 p-3 rounded-lg rounded-tl-none border">
                      {c.conteudo}
                    </p>
                  </div>
                  {(user?.id === c.usuario_id || isAdmin) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteComment(c.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Textarea
                placeholder="Adicione um comentário... (/ para atalho de resposta rápida)"
                className="min-h-[80px] resize-none pr-10"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendComment()
                  }
                }}
              />
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-primary"
                    >
                      <Zap className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    {mensagensProntas.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        Nenhuma mensagem encontrada
                      </div>
                    ) : (
                      mensagensProntas.map((msg) => (
                        <DropdownMenuItem
                          key={msg.id}
                          onClick={() => {
                            setNewComment((prev) => (prev ? `${prev} ${msg.texto}` : msg.texto))
                          }}
                        >
                          {msg.texto}
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <Button
              className="h-auto shrink-0"
              disabled={!newComment.trim() || loading}
              onClick={handleSendComment}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
