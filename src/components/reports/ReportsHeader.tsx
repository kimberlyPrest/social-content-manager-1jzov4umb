import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { exportCSV, exportPDF, ReportData } from '@/services/reports'

interface ReportsHeaderProps {
  data: ReportData[]
  period: string
}

export function ReportsHeader({ data }: ReportsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-full print:hidden">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-slate-800">Relatórios e Análises</h1>
        </div>
        <p className="text-slate-500 md:ml-10">Acompanhe o desempenho de suas publicações</p>
      </div>
      <div className="flex items-center gap-2 w-full md:w-auto print:hidden">
        <Button variant="outline" className="flex-1 md:flex-none" onClick={() => exportCSV(data)}>
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
        <Button
          className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700"
          onClick={exportPDF}
        >
          <FileText className="w-4 h-4 mr-2" /> Exportar PDF
        </Button>
      </div>
    </div>
  )
}
