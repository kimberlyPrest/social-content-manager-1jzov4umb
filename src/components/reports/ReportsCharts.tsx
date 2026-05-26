import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReportData } from '@/services/reports'
import { format, parseISO } from 'date-fns'

export function ReportsCharts({ data }: { data: ReportData[] }) {
  if (data.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border mt-6">
        Sem dados para o período selecionado
      </div>
    )
  }

  const overTimeMap = data.reduce(
    (acc, d) => {
      const date = d.data.split('T')[0]
      if (!acc[date]) acc[date] = { date, curtidas: 0, comentarios: 0, alcance: 0 }
      acc[date].curtidas += d.curtidas
      acc[date].comentarios += d.comentarios
      acc[date].alcance += d.alcance
      return acc
    },
    {} as Record<string, any>,
  )

  const overTimeData = Object.values(overTimeMap)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({ ...d, dateFormated: format(parseISO(d.date), 'dd/MM') }))

  const networkMap = data.reduce(
    (acc, d) => {
      if (!acc[d.rede]) acc[d.rede] = 0
      acc[d.rede] += 1
      return acc
    },
    {} as Record<string, number>,
  )

  const networkColors: Record<string, string> = {
    facebook: '#1877F2',
    instagram: '#E4405F',
    linkedin: '#0A66C2',
    tiktok: '#000000',
    blog: '#8b5cf6', // purple-500
  }

  const blogVsSocial = data.reduce(
    (acc, d) => {
      const type = d.rede === 'blog' || d.isBlog ? 'Blog' : 'Redes Sociais'
      if (!acc[type]) acc[type] = { type, alcance: 0, engajamento: 0 }
      acc[type].alcance += d.alcance
      acc[type].engajamento += d.curtidas + d.comentarios + d.compartilhamentos
      return acc
    },
    {} as Record<string, any>,
  )
  const blogVsSocialData = Object.values(blogVsSocial)
  const networkData = Object.entries(networkMap).map(([net, count]) => ({
    network: net,
    count,
    fill: networkColors[net] || '#ccc',
  }))

  const topPosts = [...data].sort((a, b) => b.curtidas - a.curtidas).slice(0, 5)
  const topPostsData = topPosts.map((p) => ({
    title: p.titulo.length > 15 ? p.titulo.substring(0, 15) + '...' : p.titulo,
    fullTitle: p.titulo,
    curtidas: p.curtidas,
    fill: networkColors[p.rede] || '#ccc',
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 break-inside-avoid">
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Desempenho ao longo do tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              curtidas: { label: 'Curtidas', color: '#3b82f6' },
              comentarios: { label: 'Comentários', color: '#ec4899' },
              alcance: { label: 'Alcance', color: '#a855f7' },
            }}
            className="h-[300px] w-full"
          >
            <AreaChart data={overTimeData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="dateFormated" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="curtidas"
                stroke="var(--color-curtidas)"
                fill="var(--color-curtidas)"
                fillOpacity={0.2}
              />
              <Area
                type="monotone"
                dataKey="comentarios"
                stroke="var(--color-comentarios)"
                fill="var(--color-comentarios)"
                fillOpacity={0.2}
              />
              <Area
                type="monotone"
                dataKey="alcance"
                stroke="var(--color-alcance)"
                fill="var(--color-alcance)"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="break-inside-avoid">
        <CardHeader>
          <CardTitle>Posts por Rede Social</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ count: { label: 'Posts', color: '#6366f1' } }}
            className="h-[300px] w-full"
          >
            <BarChart
              data={networkData}
              layout="vertical"
              margin={{ left: 0, right: 20, top: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis
                dataKey="network"
                type="category"
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
                width={80}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {networkData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="break-inside-avoid">
        <CardHeader>
          <CardTitle>Top 5 Posts (Curtidas)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ curtidas: { label: 'Curtidas', color: '#f59e0b' } }}
            className="h-[300px] w-full"
          >
            <BarChart data={topPostsData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="title"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="curtidas" radius={[4, 4, 0, 0]}>
                {topPostsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="break-inside-avoid lg:col-span-2">
        <CardHeader>
          <CardTitle>Blog vs Redes Sociais</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              alcance: { label: 'Alcance', color: '#a855f7' },
              engajamento: { label: 'Engajamento', color: '#3b82f6' },
            }}
            className="h-[300px] w-full"
          >
            <BarChart data={blogVsSocialData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="type" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="alcance" fill="var(--color-alcance)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="engajamento" fill="var(--color-engajamento)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
