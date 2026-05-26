import pb from '@/lib/pocketbase/client'

export interface SponsoredMetricItem {
  metric_name: string
  value: number
  trend: 'subindo' | 'descendo' | 'estável' | string
  trend_percentage: number
}

export interface SponsoredMetric {
  id: string
  empresa_id: string
  site_id?: string
  site_name: string
  site_url?: string
  metrics: SponsoredMetricItem[]
  created: string
  updated: string
}

export const getSponsoredMetrics = () => {
  return pb.collection('sponsored_metrics').getFullList<SponsoredMetric>({
    sort: '-created',
  })
}
