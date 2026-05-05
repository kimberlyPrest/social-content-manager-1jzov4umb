import { useEffect, useState } from 'react'
import {
  Calendar,
  CheckCircle2,
  Heart,
  Megaphone,
  Pencil,
  Trash2,
  Plus,
  FileText,
  RefreshCcw,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
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

const distData = [
  { name: 'Facebook', value: 12, fill: '#1877F2' },
  { name: 'Instagram', value: 18, fill: '#E4405F' },
  { name: 'LinkedIn', value: 8, fill: '#0A66C2' },
  { name: 'TikTok', value: 15, fill: '#000000' },
]

const perfData = [
  { day: 'Seg', engajamento: 45 },
  { day: 'Ter', engajamento: 52 },
  { day: 'Qua', engajamento: 38 },
  { day: 'Qui', engajamento: 61 },
  { day: 'Sex', engajamento: 55 },
  { day: 'Sab', engajamento: 48 },
  { day: 'Dom', engajamento: 72 },
]

const initialPosts = [
  {
    id: 1,
    title: 'Novo perfume Flor de Lótus',
    network: 'Instagram',
    status: 'Publicado',
    date: '15/04/2026',
  },
  {
    id: 2,
    title: 'Promoção Black Friday',
    network: 'Facebook',
    status: 'Agendado',
    date: '20/04/2026',
  },
  {
    id: 3,
    title: 'Dica de combinação de fragrâncias',
    network: 'LinkedIn',
    status: 'Publicado',
    date: '14/04/2026',
  },
  {
    id: 4,
    title: 'Unboxing Supremo Aroma',
    network: 'TikTok',
    status: 'Rascunho',
    date: '18/04/2026',
  },
  {
    id: 5,
    title: 'Entrevista com perfumista',
    network: 'Instagram',
    status: 'Publicado',
    date: '13/04/2026',
  },
]

const team = [
  { name: 'Ana Silva', role: 'Admin', lastAccess: 'Hoje às 14:30', initials: 'AS' },
  { name: 'Carlos Oliveira', role: 'Criador', lastAccess: 'Ontem às 10:15', initials: 'CO' },
  { name: 'Mariana Santos', role: 'Analista', lastAccess: '2 dias atrás', initials: 'MS' },
]

const statusColors: Record<string, string> = {
  Rascunho: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent',
  Agendado: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-transparent',
  Publicado: 'bg-green-100 text-green-700 hover:bg-green-200 border-transparent',
  Falhou: 'bg-red-100 text-red-700 hover:bg-red-200 border-transparent',
}

const roleColors: Record<string, string> = {
  Admin: 'bg-purple-100 text-purple-700 border-transparent',
  Criador: 'bg-blue-100 text-blue-700 border-transparent',
  Analista: 'bg-orange-100 text-orange-700 border-transparent',
}

export default function Index() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [posts, setPosts] = useState(initialPosts)
  const { toast } = useToast()

  const loadData = () => {
    setLoading(true)
    setError(false)
    setTimeout(() => {
      // Simulate a successful fetch
      setLoading(false)
      toast({ title: 'Sucesso', description: 'Dashboard atualizado com sucesso' })
    }, 1500)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = (id: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
    toast({ title: 'Post deletado', description: 'O post foi removido com sucesso.' })
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral do desempenho e atividades.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Total Agendados',
            subtitle: 'Próximos 7 dias',
            val: '12',
            icon: Calendar,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
          },
          {
            title: 'Total Publicados',
            subtitle: 'Este mês',
            val: '45',
            icon: CheckCircle2,
            color: 'text-green-500',
            bg: 'bg-green-50',
          },
          {
            title: 'Engajamento Total',
            subtitle: 'Últimos 7 dias',
            val: '1.250',
            icon: Heart,
            color: 'text-pink-500',
            bg: 'bg-pink-50',
          },
          {
            title: 'Alcance Total',
            subtitle: 'Últimos 7 dias',
            val: '45.000',
            icon: Megaphone,
            color: 'text-purple-500',
            bg: 'bg-purple-50',
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
                <div className="text-2xl font-bold">{card.val}</div>
              )}
              {loading ? (
                <Skeleton className="h-3 w-24" />
              ) : (
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
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
            ) : (
              <ChartContainer config={{}} className="h-[250px] w-full">
                <BarChart
                  data={distData}
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
                    {distData.map((entry, index) => (
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
            <CardTitle>Desempenho de Engajamento (7 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <ChartContainer
                config={{ engajamento: { label: 'Engajamento', color: '#3b82f6' } }}
                className="h-[250px] w-full"
              >
                <LineChart data={perfData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Nenhum post criado ainda</p>
                <Button asChild>
                  <Link to="/posts/new">Criar primeiro post</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Título</TableHead>
                    <TableHead>Rede Social</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right pr-6">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="pl-6 font-medium">{post.title}</TableCell>
                      <TableCell>{post.network}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[post.status]}>{post.status}</Badge>
                      </TableCell>
                      <TableCell>{post.date}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/posts/${post.id}/edit`}>
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
            <CardTitle>Equipe Ativa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))
            ) : (
              <>
                {team.map((member) => (
                  <div key={member.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.lastAccess}</p>
                      </div>
                    </div>
                    <Badge className={roleColors[member.role]} variant="outline">
                      {member.role}
                    </Badge>
                  </div>
                ))}
                <Button className="w-full mt-2" variant="outline" asChild>
                  <Link to="/team">Gerenciar equipe</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
