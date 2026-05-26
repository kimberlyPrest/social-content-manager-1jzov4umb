import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import type { SponsoredMetric } from '@/services/sponsored_metrics'
import { MetricCard } from './MetricCard'

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

  return (
    <div className="space-y-8 mt-8">
      {filteredMetrics.map((site) => (
        <div key={site.id} className="space-y-4">
          <h3 className="text-xl font-bold tracking-tight border-b pb-2">{site.site_name}</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {site.metrics.map((metric, idx) => (
              <MetricCard key={idx} metric={metric} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
