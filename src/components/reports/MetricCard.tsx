import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function MetricCard({ metric }: { metric: any }) {
  const label = metric.label || metric.metric_name || ''
  const val = metric.value
  const trend = metric.trend || 'estável'
  const percentage = metric.percentage || metric.trend_percentage || '0'

  const isUp = trend === 'up' || trend === 'subindo'
  const isDown = trend === 'down' || trend === 'descendo'

  let displayValue = val
  if (typeof val === 'number') {
    const lowerLabel = label.toLowerCase()
    if (
      lowerLabel.includes('lucro') ||
      lowerLabel.includes('investimento') ||
      lowerLabel.includes('cpc')
    ) {
      displayValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        val,
      )
    } else if (lowerLabel.includes('roas')) {
      displayValue = `${val}x`
    } else {
      displayValue = val.toLocaleString('pt-BR')
    }
  }

  return (
    <Card className="shadow-subtle hover:shadow-elevation transition-all duration-300">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{displayValue}</div>
        <div className="flex items-center gap-1 mt-1 text-xs">
          {isUp ? (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 hover:bg-transparent font-medium border-none text-green-700 bg-green-100"
            >
              📈 {percentage}
              {String(percentage).includes('%') ? '' : '%'}
            </Badge>
          ) : isDown ? (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 hover:bg-transparent font-medium border-none text-red-700 bg-red-100"
            >
              📉 {percentage}
              {String(percentage).includes('%') ? '' : '%'}
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 text-slate-600 bg-slate-100 hover:bg-transparent font-medium border-none"
            >
              - {percentage}
              {String(percentage).includes('%') ? '' : '%'}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
