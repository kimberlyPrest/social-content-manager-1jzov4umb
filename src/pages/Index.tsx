import { useEffect, useState, useRef } from 'react'
import {
  Heart,
  Megaphone,
  Pencil,
  Trash2,
  Plus,
  FileText,
  RefreshCcw,
  Loader2,
  AlertCircle,
  Eye,
  MessageCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { getDashboardData, syncMetrics, deletePost } from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'

const statusColors: Record<string, string> = {
  rascunho: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent',
  agendado: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-transparent',
  publicado: 'bg-green-100 text-green-700 hover:bg-green-200 border-transparent',
  falhou: 'bg-red-100 text-red-700 hover:bg-red-200 border-transparent',
  deletado: 'bg-gray-100 text-gray-500 border-transparent',
}

export default function Index() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [days, setDays] = useState('7')
  const [data, setData] = useState<any>(null)
  const { toast } = useToast()

  const notifiedPosts = useRef(new Set<string>())

  const loadData = async () => {
    try {
      const res = await getDashboardData(parseInt(days))
      setData(res)
      setError(false)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    loadData()
  }, [days])

  useRealtime('metrics_posts', () => loadData())
  useRealtime('posts', () => loadData())

  useEffect(() => {
    if (!data) return

    data.metrics.forEach((m: any) => {
      const post = m.expand?.post_id
      if (!post) return

      const key = post.id
      if (m.curtidas >= 100 && !notifiedPosts.current.has(`${key}-high-perf`)) {
        toast({
          title: 'Post com excelente desempenho!',
          description: `O post "${post.titulo}" atingiu ${m.curtidas} curtidas.`,
        })
        notifiedPosts.current.add(`${key}-high-perf`)
      }
      if (m.alcance > 1000 && !notifiedPosts.current.has(`${key}-reach`)) {
        toast({
          title: 'Alcance excelente!',
          description: `O post "${post.titulo}" alcançou mais de 1000 pessoas.`,
        })
        notifiedPosts.current.add(`${key}-reach`)
      }
    })
  }, [data, toast])

  const handleDelete = async (id: string) => {
    try {
      await deletePost(id)
      toast({ title: 'Post deletado', description: 'O post foi removido com sucesso.' })
      loadData()
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao deletar post.', variant: 'destructive' })
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      await syncMetrics()
      toast({ title: 'Sucesso', description: 'Métricas atualizadas com sucesso!' })
      await loadData()
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar métricas. Verifique as conexões.',
        variant: 'destructive',
      })
    } finally {
      setSyncing(false)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <p className="text-red-500 font-medium">Erro ao carregar dashboard. Tente novamente.</p>
        <Button onClick={loadData}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Tentar novamente
        </Button>
      </div>
    )
  }

  const alerts =
    data?.posts.filter((post: any) => {
      if (post.status !== 'publicado') return false
      const hoursSincePub =
        (new Date().getTime() - new Date(post.publicado_em || post.created).getTime()) /
        (1000 * 60 * 60)
      const metric = data.metrics.find((m: any) => m.post_id === post.id)
      return hoursSincePub >= 24 && (metric?.curtidas || 0) === 0
    }) || []

  const publishedCount = data?.posts.filter((p: any) => p.status === 'publicado').length || 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Visão geral do desempenho e atividades.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSync} disabled={syncing}>
            {syncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="mr-2 h-4 w-4" />
            )}
            {syncing ? 'Atualizando...' : 'Atualizar métricas agora'}
          </Button>
        </div>
      </div>

      {alerts.map((post: any) => (
        <Alert variant="destructive" key={post.id}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Post com baixo engajamento</AlertTitle>
          <AlertDescription>
            O post "{post.titulo}" foi publicado há mais de 24 horas e ainda não recebeu curtidas.
          </AlertDescription>
        </Alert>
      ))}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Total de Curtidas',
            val: data?.stats.curtidas || 0,
            icon: Heart,
            color: 'text-pink-500',
            bg: 'bg-pink-50',
          },
          {
            title: 'Total de Comentários',
            val: data?.stats.comentarios || 0,
            icon: MessageCircle,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
          },
          {
            title: 'Alcance Total',
            val: data?.stats.alcance || 0,
            icon: Megaphone,
            color: 'text-purple-500',
            bg: 'bg-purple-50',
          },
          {
            title: 'Impressões Totais',
            val: data?.stats.impressoes || 0,
            icon: Eye,
            color: 'text-green-500',
            bg: 'bg-green-50',
          },
        ].map((card, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-full ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20 mb-1" />
              ) : (
                <div className="text-2xl font-bold">{card.val.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Distribuição por Rede Social</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : !data?.distData || data.distData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Métricas não disponíveis
              </div>
            ) : (
              <ChartContainer config={{}} className="h-[250px] w-full">
                <BarChart
                  data={data.distData}
                  layout="vertical"
                  margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'transparent' }}
                    content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {data.distData.map((entry: any, index: number) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Evolução de Engajamento ({days} dias)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : !data?.perfData || data.perfData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Métricas não disponíveis
              </div>
            ) : (
              <ChartContainer
                config={{ engajamento: { label: 'Engajamento', color: '#3b82f6' } }}
                className="h-[250px] w-full"
              >
                <LineChart
                  data={data.perfData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={8} />
                  <YAxis axisLine={false} tickLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="engajamento"
                    stroke="var(--color-engajamento)"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2 border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Postagens Recentes</CardTitle>
            {!loading && (
              <Button size="sm" asChild>
                <Link to="/posts/new">
                  <Plus className="mr-2 h-4 w-4" /> Criar Post
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : data?.posts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Nenhum post criado ainda</p>
                <Button asChild>
                  <Link to="/posts/new">Criar primeiro post</Link>
                </Button>
              </div>
            ) : publishedCount === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Nenhum post publicado ainda</p>
                <Button asChild>
                  <Link to="/posts/new">Agendar Publicação</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Título</TableHead>
                    <TableHead>Criador</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right pr-6">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.posts.slice(0, 5).map((post: any) => (
                    <TableRow key={post.id}>
                      <TableCell
                        className="pl-6 font-medium max-w-[200px] truncate"
                        title={post.titulo}
                      >
                        {post.titulo}
                      </TableCell>
                      <TableCell>{post.expand?.criador_id?.name || 'Desconhecido'}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[post.status] || ''}>{post.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(post.created).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            to={`/posts/${post.id}/edit`}
                            onClick={() =>
                              console.log(
                                `[Bug Scanner] Action: Clicou em Editar, PostID: ${post.id}, Timestamp: ${new Date().toISOString()}`,
                              )
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita e removerá o post permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600 text-white"
                                onClick={() => handleDelete(post.id)}
                              >
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Sua Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {user ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.foto_url} />
                  <AvatarFallback className="bg-primary/10 text-primary uppercase">
                    {user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">Logado agora</p>
                </div>
                <Badge className="ml-auto bg-purple-100 text-purple-700 hover:bg-purple-100 border-transparent capitalize">
                  {user.role}
                </Badge>
              </div>
            ) : (
              <Skeleton className="h-10 w-full" />
            )}
            <Button className="w-full mt-2" variant="outline" asChild>
              <Link to="/team">Gerenciar equipe</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
