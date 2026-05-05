import { useEffect, useState } from 'react'
import { Eye, Heart, MessageCircle, Share2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getDashboardStats, getPosts, getABTests } from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'
import { DashboardChart } from '@/components/DashboardChart'

export default function Index() {
  const [stats, setStats] = useState({
    curtidas: 0,
    comentarios: 0,
    compartilhamentos: 0,
    alcance: 0,
  })
  const [recentPosts, setRecentPosts] = useState<any[]>([])
  const [tests, setTests] = useState<any[]>([])

  const loadData = async () => {
    try {
      const [s, p, t] = await Promise.all([getDashboardStats(), getPosts(5), getABTests()])
      setStats(s)
      setRecentPosts(p.items)
      setTests(t)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('metrics_posts', loadData)
  useRealtime('posts', loadData)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Bem-vindo ao Supremo Aroma Manager.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Curtidas</CardTitle>
            <Heart className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.curtidas.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comentários</CardTitle>
            <MessageCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.comentarios.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compartilhamentos</CardTitle>
            <Share2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.compartilhamentos.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alcance Total</CardTitle>
            <Eye className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.alcance.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Desempenho Geral (30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardChart />
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Postagens Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum post recente
                </p>
              ) : (
                recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1 overflow-hidden">
                      <p className="text-sm font-medium leading-none truncate pr-4">
                        {post.titulo}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.created).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
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
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {tests.length > 0 && (
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Testes A/B Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {tests
                .filter((t) => t.status === 'ativo')
                .map((test) => (
                  <div
                    key={test.id}
                    className="p-4 border rounded-lg bg-slate-50 flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-medium text-sm">
                        Teste: {test.expand?.post_id_a?.titulo} vs {test.expand?.post_id_b?.titulo}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">Em andamento...</p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-indigo-50 text-indigo-700 border-indigo-200"
                    >
                      Ver Resultados
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
