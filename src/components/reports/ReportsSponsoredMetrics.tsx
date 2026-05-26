import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import type { SponsoredMetric } from '@/services/sponsored_metrics'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

export function ReportsSponsoredMetrics({
  metrics,
  loading,
  siteNameFilter,
}: {
  metrics: SponsoredMetric[]
  loading: boolean
  siteNameFilter?: string
}) {
  const filteredMetrics = siteNameFilter
    ? metrics.filter((m) => m.site_name.toLowerCase() === siteNameFilter.toLowerCase())
    : metrics

  if (loading) {
    return (
      <div className="space-y-4 mt-8">
        <h3 className="text-xl font-bold tracking-tight">
          {siteNameFilter || 'Métricas Externas'}
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (filteredMetrics.length === 0) {
    return (
      <div className="space-y-4 mt-8">
        <h3 className="text-xl font-bold tracking-tight">
          {siteNameFilter || 'Métricas Externas'}
        </h3>
        <Card className="border-dashed shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground">
              Nenhuma métrica recebida via webhook para {siteNameFilter || 'esta categoria'} ainda.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatValue = (val: string) => {
    const num = Number(val)
    if (isNaN(num)) return val
    return new Intl.NumberFormat('pt-BR').format(num)
  }

  return (
    <div className="space-y-8 mt-8">
      {filteredMetrics.map((site) => (
        <div key={site.id} className="space-y-4">
          <h3 className="text-xl font-bold tracking-tight border-b pb-2">{site.site_name}</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {site.metrics.map((metric: any, idx: number) => {
              const isUp = metric.trend === 'subindo'
              const isDown = metric.trend === 'descendo'
              const isStable = metric.trend === 'estável' || (!isUp && !isDown)

              return (
                <Card key={idx} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        {metric.metric_name || metric.label}
                      </h4>
                    </div>
                    <div className="flex items-baseline justify-between mt-2">
                      <div className="text-2xl font-bold">{formatValue(metric.value)}</div>
                      <div className="flex items-center text-xs font-medium">
                        {isUp && (
                          <span className="flex items-center text-emerald-600 dark:text-emerald-500">
                            <ArrowUpRight className="mr-1 h-4 w-4" />
                            {metric.trend_percentage || metric.percentage}%
                          </span>
                        )}
                        {isDown && (
                          <span className="flex items-center text-red-600 dark:text-red-500">
                            <ArrowDownRight className="mr-1 h-4 w-4" />
                            {metric.trend_percentage || metric.percentage}%
                          </span>
                        )}
                        {isStable && (
                          <span className="flex items-center text-slate-500">
                            <Minus className="mr-1 h-4 w-4" />
                            {metric.trend_percentage || metric.percentage || '0'}%
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
