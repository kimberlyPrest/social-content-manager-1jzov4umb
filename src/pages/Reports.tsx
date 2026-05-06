import { useState, useEffect } from 'react'
import { ReportsHeader } from '@/components/reports/ReportsHeader'
import { ReportsFilters } from '@/components/reports/ReportsFilters'
import { ReportsMetrics } from '@/components/reports/ReportsMetrics'
import { ReportsCharts } from '@/components/reports/ReportsCharts'
import { ReportsTable } from '@/components/reports/ReportsTable'
import { fetchReportsData, ReportData } from '@/services/reports'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

export default function Reports() {
  const [period, setPeriod] = useState('30')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [networks, setNetworks] = useState(['facebook', 'instagram', 'linkedin', 'tiktok'])
  const [data, setData] = useState<ReportData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        let start = new Date()
        let end = new Date()
        if (period === 'custom') {
          start = customStart ? new Date(customStart) : new Date(0)
          end = customEnd ? new Date(customEnd) : new Date()
          end.setHours(23, 59, 59, 999)
        } else {
          start.setDate(start.getDate() - parseInt(period))
        }
        const res = await fetchReportsData(start, end, networks)
        setData(res)
        toast.success('Relatórios carregados com sucesso')
      } catch (err) {
        toast.error('Erro ao carregar relatórios. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    const timeout = setTimeout(loadData, 300)
    return () => clearTimeout(timeout)
  }, [period, customStart, customEnd, networks])

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <ReportsHeader data={data} period={period} />
      <ReportsFilters
        period={period}
        setPeriod={setPeriod}
        customStart={customStart}
        setCustomStart={setCustomStart}
        customEnd={customEnd}
        setCustomEnd={setCustomEnd}
        networks={networks}
        setNetworks={setNetworks}
      />

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : data.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed rounded-xl bg-muted/10 mt-6">
          <h3 className="text-lg font-medium text-slate-700 mb-1">Sem dados disponíveis</h3>
          <p className="text-slate-500">
            Nenhuma métrica foi encontrada para o período e redes selecionadas.
          </p>
        </div>
      ) : (
        <>
          <ReportsMetrics data={data} />
          <ReportsCharts data={data} />
          <ReportsTable data={data} />
        </>
      )}
    </div>
  )
}
