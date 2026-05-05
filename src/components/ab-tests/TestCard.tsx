import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, BarChart2 } from 'lucide-react'

export function TestCard({ test, onClick }: { test: any; onClick: () => void }) {
  const postA = test.expand?.post_id_a?.titulo || 'Post A'
  const postB = test.expand?.post_id_b?.titulo || 'Post B'

  const calculateDaysLeft = () => {
    if (!test.finalizado_em || test.status === 'finalizado') return 0
    const diff = new Date(test.finalizado_em).getTime() - new Date().getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)))
  }

  const daysLeft = calculateDaysLeft()

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow border-slate-200 h-full flex flex-col"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-base line-clamp-2 leading-tight">
            {postA} <span className="text-muted-foreground font-normal mx-1">vs</span> {postB}
          </CardTitle>
          <Badge variant={test.status === 'ativo' ? 'default' : 'secondary'} className="shrink-0">
            {test.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="mt-auto pt-2">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BarChart2 className="w-4 h-4" />
            <span className="capitalize">{test.metrica_principal || 'Engajamento'}</span>
          </div>
          {test.status === 'ativo' && daysLeft > 0 && (
            <div className="flex items-center gap-1 text-indigo-600">
              <Calendar className="w-4 h-4" />
              <span>{daysLeft} dias restantes</span>
            </div>
          )}
          {test.status === 'finalizado' && test.vencedor && (
            <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-0">
              Vencedor: {test.vencedor.toUpperCase()}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
