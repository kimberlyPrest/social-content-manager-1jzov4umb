import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReportData } from '@/services/reports'
import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { format, subDays, parseISO, isAfter, startOfDay } from 'date-fns'
import { cn } from '@/lib/utils'

type MetricHistory = {
  date: string
  curtidas: number
  comentarios: number
  compartilhamentos: number
  alcance: number
  rede_social: string
}

const chartConfig = {
  curtidas: { label: 'Curtidas', color: 'hsl(var(--primary))' },
  comentarios: { label: 'Comentários', color: '#10b981' },
  compartilhamentos: { label: 'Compartilhamentos', color: '#f59e0b' },
  alcance: { label: 'Alcance', color: '#6366f1' },
}

export function PostPerformanceModal({
  isOpen,
  onClose,
  report,
}: {
  isOpen: boolean
  onClose: () => void
  report: ReportData | null
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [rawData, setRawData] = useState<MetricHistory[]>([])

  const [period, setPeriod] = useState('30')
  const [platform, setPlatform] = useState('all')
  const [activeMetric, setActiveMetric] =
    useState<keyof Omit<MetricHistory, 'date' | 'rede_social'>>('curtidas')

  const generateMockHistory = (post: ReportData, days: number): MetricHistory[] => {
    const history: MetricHistory[] = []
    const end = new Date()

    let cLikes = Math.max(0, post.curtidas - days * 5)
    let cComms = Math.max(0, post.comentarios - days * 2)
    let cShares = Math.max(0, post.compartilhamentos - days)
    let cReach = Math.max(0, post.alcance - days * 50)

    for (let i = days; i >= 0; i--) {
      const d = subDays(end, i)
      if (i === 0) {
        history.push({
          date: d.toISOString(),
          curtidas: post.curtidas,
          comentarios: post.comentarios,
          compartilhamentos: post.compartilhamentos,
          alcance: post.alcance,
          rede_social: post.rede,
        })
      } else {
        cLikes += Math.floor(Math.random() * ((post.curtidas - cLikes) / i || 1))
        cComms += Math.floor(Math.random() * ((post.comentarios - cComms) / i || 1))
        cShares += Math.floor(Math.random() * ((post.compartilhamentos - cShares) / i || 1))
        cReach += Math.floor(Math.random() * ((post.alcance - cReach) / i || 1))

        history.push({
          date: d.toISOString(),
          curtidas: cLikes,
          comentarios: cComms,
          compartilhamentos: cShares,
          alcance: cReach,
          rede_social: post.rede,
        })
      }
    }
    return history
  }

  useEffect(() => {
    if (!isOpen || !report) return

    setPlatform('all')
    setPeriod('30')
    setActiveMetric('curtidas')

    const loadData = async () => {
      if (!report.post_id && !report.id.startsWith('m')) return

      setLoading(true)
      setError(false)
      try {
        if (report.post_id && !report.id.startsWith('m')) {
          const metrics = await pb.collection('metrics_posts').getFullList({
            filter: `post_id = "${report.post_id}"`,
            sort: 'updated',
          })

          if (metrics.length > 0) {
            setRawData(
              metrics.map((m) => ({
                date: m.atualizado_em || m.updated,
                curtidas: m.curtidas || 0,
                comentarios: m.comentarios || 0,
                compartilhamentos: m.compartilhamentos || 0,
                alcance: m.alcance || 0,
                rede_social: (m.rede_social || 'facebook').toLowerCase(),
              })),
            )
          } else {
            setRawData(generateMockHistory(report, 90))
          }
        } else {
          setRawData(generateMockHistory(report, 90))
        }
      } catch (err) {
        console.error(err)
        if (report.id.startsWith('m')) {
          setRawData(generateMockHistory(report, 90))
        } else {
          setError(true)
          toast.error('Erro ao carregar desempenho')
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isOpen, report])

  const filteredData = useMemo(() => {
    const startDate = startOfDay(subDays(new Date(), parseInt(period)))
    return rawData.filter((d) => {
      const dDate = parseISO(d.date)
      const isAfterStart = isAfter(dDate, startDate) || dDate.getTime() === startDate.getTime()
      const isSamePlatform = platform === 'all' || d.rede_social === platform
      return isAfterStart && isSamePlatform
    })
  }, [rawData, period, platform])

  const platforms = Array.from(new Set(rawData.map((d) => d.rede_social)))

  const chartData = useMemo(() => {
    const map = new Map<string, MetricHistory>()
    filteredData.forEach((d) => {
      const day = d.date.split('T')[0]
      if (!map.has(day)) {
        map.set(day, { ...d, date: day })
      } else {
        const existing = map.get(day)!
        existing.curtidas += d.curtidas
        existing.comentarios += d.comentarios
        existing.compartilhamentos += d.compartilhamentos
        existing.alcance += d.alcance
      }
    })
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredData])

  const aggregatedLatest = chartData[chartData.length - 1]

  const engRate =
    aggregatedLatest && aggregatedLatest.alcance > 0
      ? (
          ((aggregatedLatest.curtidas +
            aggregatedLatest.comentarios +
            aggregatedLatest.compartilhamentos) /
            aggregatedLatest.alcance) *
          100
        ).toFixed(2)
      : '0.00'

  const metricsCards = [
    { key: 'curtidas', label: 'Curtidas' },
    { key: 'comentarios', label: 'Comentários' },
    { key: 'compartilhamentos', label: 'Compartilhamentos' },
    { key: 'alcance', label: 'Alcance' },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col p-6">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl">Desempenho do Post</DialogTitle>
          <DialogDescription className="line-clamp-2 text-sm">{report?.titulo}</DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] text-red-500">
            <p>Erro ao carregar desempenho</p>
          </div>
        ) : loading ? (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-[300px] text-muted-foreground">
            Nenhuma métrica disponível
          </div>
        ) : (
          <div className="flex flex-col gap-6 py-2">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-lg border">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-[140px] bg-white">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                  </SelectContent>
                </Select>

                {platforms.length > 1 && (
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="w-[140px] bg-white">
                      <SelectValue placeholder="Rede Social" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as redes</SelectItem>
                      {platforms.map((p) => (
                        <SelectItem key={p} value={p} className="capitalize">
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="flex flex-col items-end w-full sm:w-auto bg-white px-4 py-2 rounded-md border shadow-sm">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Taxa de Engajamento
                </span>
                <span className="text-xl font-bold text-primary">{engRate}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metricsCards.map((m) => (
                <Card
                  key={m.key}
                  className={cn(
                    'cursor-pointer transition-all hover:border-primary/50 shadow-sm',
                    activeMetric === m.key
                      ? 'border-primary ring-1 ring-primary/20 bg-primary/5'
                      : '',
                  )}
                  onClick={() => setActiveMetric(m.key as any)}
                >
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-xs text-muted-foreground font-medium">
                      {m.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="text-2xl font-bold">
                      {aggregatedLatest?.[m.key as keyof typeof aggregatedLatest] || 0}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="border rounded-xl p-4 bg-white shadow-sm">
              <div className="mb-4">
                <h4 className="font-semibold text-slate-800 text-sm">
                  Evolução: {chartConfig[activeMetric].label}
                </h4>
              </div>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => {
                      try {
                        return format(parseISO(v), 'dd/MM')
                      } catch {
                        return v
                      }
                    }}
                    minTickGap={20}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dx={-10}
                    width={40}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(v) => {
                          try {
                            return format(parseISO(v), 'dd/MM/yyyy')
                          } catch {
                            return v
                          }
                        }}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey={activeMetric}
                    stroke={chartConfig[activeMetric].color}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: chartConfig[activeMetric].color }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
