import { useEffect, useState } from 'react'
import {
  FileText,
  MessageSquare,
  SplitSquareHorizontal,
  Users,
  Filter,
  Clock,
  Eye,
} from 'lucide-react'
import { PostPreviewDialog } from '@/components/PostPreviewDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getActivities, getCompanyUsers } from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'

const TYPE_ICONS: Record<string, any> = {
  post: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  comentario: { icon: MessageSquare, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  teste: { icon: SplitSquareHorizontal, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  equipe: { icon: Users, color: 'text-green-500', bg: 'bg-green-500/10' },
  aprovacao: { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  default: { icon: FileText, color: 'text-gray-500', bg: 'bg-gray-500/10' },
}

const POST_TYPES = [
  'post_criado',
  'post_editado',
  'post_agendado',
  'post_publicado',
  'aprovacao_solicitada',
  'post_aprovado',
  'post_rejeitado',
]

const getCategory = (tipo: string) => {
  if (tipo.includes('post') && !tipo.includes('aprovado') && !tipo.includes('rejeitado'))
    return 'post'
  if (tipo.includes('comentario')) return 'comentario'
  if (tipo.includes('teste')) return 'teste'
  if (tipo.includes('membro')) return 'equipe'
  if (tipo.includes('aprov')) return 'aprovacao'
  return 'default'
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])

  const [userFilter, setUserFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')

  const [previewPostId, setPreviewPostId] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const loadData = async () => {
    try {
      const [actsData, usersData] = await Promise.all([getActivities(), getCompanyUsers()])
      setActivities(actsData)
      setUsers(usersData)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('atividades', loadData)

  const filtered = activities.filter((a) => {
    if (userFilter !== 'all' && a.usuario_id !== userFilter) return false
    if (typeFilter !== 'all' && getCategory(a.tipo) !== typeFilter) return false

    if (timeFilter !== 'all') {
      const date = new Date(a.created)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      if (timeFilter === '24h' && diff > 24 * 60 * 60 * 1000) return false
      if (timeFilter === '7d' && diff > 7 * 24 * 60 * 60 * 1000) return false
      if (timeFilter === '30d' && diff > 30 * 24 * 60 * 60 * 1000) return false
    }

    return true
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Histórico de Atividades</h2>
          <p className="text-muted-foreground">Acompanhe tudo o que acontece no workspace.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" /> Filtros
            </CardTitle>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="post">Posts</SelectItem>
                  <SelectItem value="comentario">Comentários</SelectItem>
                  <SelectItem value="aprovacao">Aprovações</SelectItem>
                  <SelectItem value="teste">Testes A/B</SelectItem>
                </SelectContent>
              </Select>

              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Membro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos membros</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo o período</SelectItem>
                  <SelectItem value="24h">Últimas 24h</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative border-l-2 border-muted ml-4 md:ml-6 space-y-8 py-4">
            {filtered.length === 0 ? (
              <div className="pl-6 text-center py-10 text-muted-foreground">
                Nenhuma atividade encontrada com estes filtros.
              </div>
            ) : (
              filtered.map((act) => {
                const cat = getCategory(act.tipo)
                const styling = TYPE_ICONS[cat] || TYPE_ICONS.default
                const Icon = styling.icon
                const user = act.expand?.usuario_id

                return (
                  <div key={act.id} className="relative pl-8 md:pl-10 animate-fade-in-up">
                    <div
                      className={`absolute -left-[17px] md:-left-[19px] top-1 p-2 rounded-full border bg-background ${styling.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex gap-4">
                          <Avatar className="h-10 w-10 border">
                            <AvatarImage src={user?.avatar} />
                            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{user?.name}</span>
                              <Badge
                                variant="secondary"
                                className="text-[10px] capitalize h-4 py-0"
                              >
                                {user?.role}
                              </Badge>
                            </div>
                            <p className="text-sm mt-1">{act.descricao}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant="outline"
                                className={`text-[10px] uppercase tracking-wider ${styling.color} ${styling.bg} border-transparent`}
                              >
                                {cat}
                              </Badge>
                              {POST_TYPES.includes(act.tipo) && act.referencia_id && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="h-5 px-2 text-[10px]"
                                  onClick={() => {
                                    setPreviewPostId(act.referencia_id)
                                    setPreviewOpen(true)
                                  }}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Ver post
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                          {new Date(act.created).toLocaleString('pt-BR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      <PostPreviewDialog postId={previewPostId} open={previewOpen} onOpenChange={setPreviewOpen} />
    </div>
  )
}
