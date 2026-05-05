import { useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const chartConfig = {
  alcance: {
    label: 'Alcance',
    color: 'hsl(var(--primary))',
  },
  impressoes: {
    label: 'Impressões',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

export function DashboardChart() {
  // Mock data for the chart as we don't have historical series in the schema, just totals per post
  const data = useMemo(() => {
    const arr = []
    const now = new Date()
    for (let i = 30; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      arr.push({
        date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        alcance: Math.floor(Math.random() * 5000) + 1000,
        impressoes: Math.floor(Math.random() * 8000) + 2000,
      })
    }
    return arr
  }, [])

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="fillAlcance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-alcance)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-alcance)" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="fillImpressoes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-impressoes)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-impressoes)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Area
          type="monotone"
          dataKey="impressoes"
          stroke="var(--color-impressoes)"
          fillOpacity={1}
          fill="url(#fillImpressoes)"
        />
        <Area
          type="monotone"
          dataKey="alcance"
          stroke="var(--color-alcance)"
          fillOpacity={1}
          fill="url(#fillAlcance)"
        />
      </AreaChart>
    </ChartContainer>
  )
}
