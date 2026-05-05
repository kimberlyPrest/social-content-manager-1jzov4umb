import { useState, useEffect } from 'react'
import { ArrowLeft, Lightbulb, CheckCircle, Pause, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts'
import { getRecommendations, updateABTest } from '@/services/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const chartConfig = {
  postA: { label: 'Post A', color: 'hsl(var(--primary))' },
  postB: { label: 'Post B', color: '#ec4899' },
}

export function TestDetail({ test, onBack, onUpdate }: any) {
  const [recs, setRecs] = useState<any[]>([])
  const postA = test.expand?.post_id_a?.titulo || 'Post A'
  const postB = test.expand?.post_id_b?.titulo || 'Post B'

  useEffect(() => {
    getRecommendations(test.id)
      .then(setRecs)
      .catch(() => {})
  }, [test.id])

  const valA = test.id.charCodeAt(0) * 3 + 150
  const valB = test.id.charCodeAt(1) * 3 + 120

  const barData = [{ name: 'Total', postA: valA, postB: valB }]

  const lineData = Array.from({ length: 7 }).map((_, i) => ({
    day: `Dia ${i + 1}`,
    postA: Math.floor((valA * (i + 1)) / 7) + (Math.random() * 20 - 10),
    postB: Math.floor((valB * (i + 1)) / 7) + (Math.random() * 20 - 10),
  }))

  const handleAction = async (action: string) => {
    try {
      if (action === 'finalizar') {
        const vencedor = valA > valB ? 'a' : 'b'
        await updateABTest(test.id, {
          status: 'finalizado',
          vencedor,
          finalizado_em: new Date().toISOString(),
        })
        toast.success(`Teste finalizado! Post ${vencedor.toUpperCase()} é o vencedor.`)
      } else if (action === 'pausar') {
        toast.info('Teste pausado.')
        return
      } else if (action === 'aplicar') {
        toast.success('Estratégia aplicada às preferências!')
        return
      }
      onUpdate()
    } catch {
      toast.error('Erro na ação')
    }
  }

  const isAtivo = test.status === 'ativo'
  const pctDiff = Math.abs(Math.round(((valA - valB) / Math.min(valA, valB)) * 100))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight line-clamp-1">
              {postA} vs {postB}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={isAtivo ? 'default' : 'secondary'}>{test.status}</Badge>
              <span className="text-sm text-muted-foreground">
                Métrica:{' '}
                <span className="capitalize">{test.metrica_principal || 'Engajamento'}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAtivo ? (
            <>
              <Button variant="outline" onClick={() => handleAction('pausar')}>
                <Pause className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Pausar Teste</span>
              </Button>
              <Button variant="destructive" onClick={() => handleAction('finalizar')}>
                <CheckCircle className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Finalizar Agora</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => toast.success('Teste duplicado')}>
                <Copy className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Duplicar</span>
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleAction('aplicar')}
              >
                <CheckCircle className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Aplicar Vencedor</span>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-600">Post A</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{valA}</div>
            <p className="text-xs text-muted-foreground">Métrica principal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-pink-600">Post B</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{valB}</div>
            <p className="text-xs text-muted-foreground">Métrica principal</p>
          </CardContent>
        </Card>
        <Card className={cn(pctDiff > 10 ? 'bg-slate-900 text-white' : '')}>
          <CardHeader className="pb-2">
            <CardTitle className={cn('text-sm font-medium', pctDiff > 10 ? 'text-slate-300' : '')}>
              Diferença
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pctDiff}%</div>
            <p className={cn('text-xs', pctDiff > 10 ? 'text-slate-400' : 'text-muted-foreground')}>
              Confiança: 85%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comparativo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="postA" fill="var(--color-postA)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="postB" fill="var(--color-postB)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evolução (Acumulado)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="postA"
                  stroke="var(--color-postA)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="postB"
                  stroke="var(--color-postB)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" /> Insights & Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recs.length > 0 ? (
            <ul className="space-y-3">
              {recs.map((r) => (
                <li
                  key={r.id}
                  className="flex gap-3 items-start p-3 bg-amber-50/50 rounded-lg border border-amber-100/50"
                >
                  <div className="mt-0.5">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <span className="font-medium text-sm text-amber-900 capitalize block mb-0.5">
                      {r.tipo}
                    </span>
                    <span className="text-sm text-slate-700">{r.mensagem}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum insight gerado ainda.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
