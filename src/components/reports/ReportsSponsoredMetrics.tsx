import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { SponsoredMetric } from '@/services/sponsored_metrics'

export function ReportsSponsoredMetrics({
  metrics,
  loading,
}: {
  metrics: SponsoredMetric[]
  loading: boolean
}) {
  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-xl font-bold tracking-tight">Social Patrocinado</h3>
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : metrics.length === 0 ? (
        <Card className="border-dashed shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground mb-4">Sem dados de tráfego pago</p>
            <Button variant="outline" asChild>
              <Link to="/integracoes">Configurar Integração</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {metrics.map((site) => (
            <Card key={site.id} className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  {site.site_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {site.metrics.map((metric, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{metric.metric_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {metric.metric_name.toLowerCase().includes('lucro') ||
                        metric.metric_name.toLowerCase().includes('investimento')
                          ? new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(metric.value)
                          : metric.metric_name.toLowerCase().includes('roas')
                            ? `${metric.value}x`
                            : metric.value.toLocaleString('pt-BR')}
                      </span>
                      {metric.trend && metric.trend !== 'estável' && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[10px] px-1.5 py-0 hover:bg-transparent font-medium border-none',
                            metric.trend === 'subindo'
                              ? 'text-green-700 bg-green-100'
                              : 'text-red-700 bg-red-100',
                          )}
                        >
                          {metric.trend === 'subindo' ? '📈' : '📉'} {metric.trend_percentage}%
                        </Badge>
                      )}
                      {metric.trend === 'estável' && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 text-slate-600 bg-slate-100 hover:bg-transparent font-medium border-none"
                        >
                          - {metric.trend_percentage}%
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
