import { FileText, Heart, Megaphone, PieChart } from 'lucide-react'
import { ReportData } from '@/services/reports'
import { Card, CardContent } from '@/components/ui/card'

export function ReportsMetrics({ data }: { data: ReportData[] }) {
  const posts = data.length
  const engajamento = data.reduce((acc, d) => acc + d.curtidas + d.comentarios, 0)
  const alcance = data.reduce((acc, d) => acc + d.alcance, 0)
  const taxa = alcance > 0 ? ((engajamento / alcance) * 100).toFixed(1) : '0.0'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 break-inside-avoid">
      <MetricCard
        title="Total Posts"
        value={posts}
        icon={FileText}
        sub="No período selecionado"
        color="text-blue-500"
        bg="bg-blue-100"
      />
      <MetricCard
        title="Engajamento Total"
        value={engajamento}
        icon={Heart}
        sub="Curtidas + comentários"
        color="text-pink-500"
        bg="bg-pink-100"
      />
      <MetricCard
        title="Alcance Total"
        value={alcance}
        icon={Megaphone}
        sub="Pessoas alcançadas"
        color="text-purple-500"
        bg="bg-purple-100"
      />
      <MetricCard
        title="Taxa de Engajamento"
        value={`${taxa}%`}
        icon={PieChart}
        sub="Engajamento / Alcance"
        color="text-emerald-500"
        bg="bg-emerald-100"
      />
    </div>
  )
}

function MetricCard({ title, value, icon: Icon, sub, color, bg }: any) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-4 rounded-full ${bg} ${color}`}>
          <Icon className="w-8 h-8" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
          <p className="text-xs text-slate-400 mt-1">{sub}</p>
        </div>
      </CardContent>
    </Card>
  )
}
